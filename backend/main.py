from fastapi import FastAPI, UploadFile, File, Form as FastAPIForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from dotenv import load_dotenv
from openai import OpenAI
import os, json, uuid

load_dotenv(override=True)

app = FastAPI(title="FormAssist AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://formassist-ai.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL   = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
client         = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

BASE_DIR   = Path(__file__).parent
FORMS_PATH = BASE_DIR / "forms.json"
PDF_DIR    = BASE_DIR / "generated_pdfs"
PDF_DIR.mkdir(exist_ok=True)

# Import overlay helpers
try:
    from pdf_overlay import get_pdf_path_for_form, overlay_data_on_pdf, try_acroform_fill
    from form_coordinates import get_coordinates
    OVERLAY_AVAILABLE = True
except ImportError as e:
    print(f"Overlay not available: {e}")
    OVERLAY_AVAILABLE = False


# ── Request models ────────────────────────────────────────────────────────────
class LeadRequest(BaseModel):
    first_name: str
    email: str
    situation: str
    consent: bool

class SmartFillRequest(BaseModel):
    form_id: str
    situation: str
    user_name: str
    user_email: str

class AiFillRequest(BaseModel):
    form_id: str
    user_details: str

class PdfRequest(BaseModel):
    form_id: str
    form_name: str
    agency: str
    answers: dict
    questions: list


# ── Helpers ───────────────────────────────────────────────────────────────────
def load_forms():
    with open(FORMS_PATH) as f:
        return json.load(f)

def call_openai(system_prompt, user_prompt, temperature=0.2):
    if not client:
        return None
    resp = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[{"role":"system","content":system_prompt},{"role":"user","content":user_prompt}],
        temperature=temperature
    )
    return resp.choices[0].message.content

def clean_json(content: str) -> str:
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return content.strip()


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "FormAssist AI backend is running"}


@app.post("/api/analyze-situation")
def analyze_situation(request: LeadRequest):
    forms = load_forms()
    if client:
        catalog = json.dumps(forms, indent=2)
        prompt = f"""You are FormAssist AI. Recommend the best forms from this catalog.
User name: {request.first_name}
User email: {request.email}
Situation: {request.situation}
Form catalog:
{catalog}
Return JSON only:
{{"recommended_forms":[{{"form_id":"...","form_name":"...","confidence":"high|medium|low","reason":"..."}}]}}"""
        content = call_openai("Recommend forms from catalog. Return valid JSON only.", prompt)
        return json.loads(clean_json(content))

    text = request.situation.lower()
    if "move" in text or "address" in text:
        return {"recommended_forms":[{"form_id":"usps_change_of_address_helper","form_name":"USPS Change of Address","confidence":"high","reason":"You are moving."}]}
    return {"recommended_forms":[]}


@app.get("/api/forms/{form_id}")
def get_form(form_id: str):
    forms = load_forms()
    for form in forms:
        if form["form_id"] == form_id:
            return form
    return {"error": "Form not found"}


@app.post("/api/smart-fill")
def smart_fill(request: SmartFillRequest):
    forms = load_forms()
    selected = next((f for f in forms if f["form_id"] == request.form_id), None)
    if not selected:
        return {"error": "Form not found"}
    questions = selected.get("questions", [])
    if client:
        prompt = f"""Fill this form from the user's situation.
User name: {request.user_name}
User email: {request.user_email}
Situation: {request.situation}
Form:
{json.dumps(selected, indent=2)}
Rules: Use question id as key. Pre-fill name from {request.user_name}, email from {request.user_email}.
Extract addresses/dates from situation. For single_choice pick from options list.
Empty string if unknown. Do NOT invent SSN/payment/ID. Return JSON only."""
        content = call_openai("Extract form answers. Return JSON only, no markdown.", prompt, 0.1)
        return {"answers": json.loads(clean_json(content)), "form": selected}

    name_parts = request.user_name.strip().split(" ", 1)
    answers = {}
    for q in questions:
        if q["id"] == "first_name": answers[q["id"]] = name_parts[0]
        elif q["id"] == "last_name": answers[q["id"]] = name_parts[1] if len(name_parts) > 1 else ""
        elif q["id"] == "email": answers[q["id"]] = request.user_email
        else: answers[q["id"]] = ""
    return {"answers": answers, "form": selected}


@app.post("/api/ai-fill")
def ai_fill(request: AiFillRequest):
    forms = load_forms()
    selected = next((f for f in forms if f["form_id"] == request.form_id), None)
    if not selected:
        return {"error": "Form not found"}
    questions = selected.get("questions", [])
    if client:
        prompt = f"""Extract answers from the user's text for this form.
Form:
{json.dumps(selected, indent=2)}
User's text / document:
{request.user_details[:4000]}
Return JSON only. Use question id as key. Empty string if unknown. Don't invent sensitive data."""
        content = call_openai("Extract form answers. Return JSON only.", prompt, 0.1)
        return {"answers": json.loads(clean_json(content))}
    return {"answers": {q["id"]: "" for q in questions}}


@app.post("/api/generate-pdf")
def generate_pdf(request: PdfRequest):
    pdf_id    = str(uuid.uuid4())
    pdf_name  = f"{request.form_id}_{pdf_id}.pdf"
    pdf_path  = PDF_DIR / pdf_name

    # ── Try overlay onto official form first ──────────────────────────────
    if OVERLAY_AVAILABLE:
        official_path = get_pdf_path_for_form(request.form_id, {})
        if official_path:
            coords = get_coordinates(request.form_id)

            # 1. Try AcroForm fill (for PDFs that have fillable fields)
            if try_acroform_fill(official_path, request.answers, request.questions, pdf_path):
                return {"message": "PDF generated (form fill)", "download_url": f"/api/download/{pdf_name}"}

            # 2. Try coordinate overlay
            if coords:
                success = overlay_data_on_pdf(
                    official_path,
                    request.answers,
                    request.questions,
                    coords,
                    pdf_path,
                    request.form_name,
                    request.agency,
                )
                if success:
                    return {"message": "PDF generated (overlay)", "download_url": f"/api/download/{pdf_name}"}

            # 3. No coordinates yet — append a clean data sheet after the official form
            _append_data_to_official(official_path, request, pdf_path)
            return {"message": "PDF generated (form + data sheet)", "download_url": f"/api/download/{pdf_name}"}

    # ── Fallback: formatted summary PDF ───────────────────────────────────
    _generate_summary_pdf(request, pdf_path)
    return {"message": "PDF generated (summary)", "download_url": f"/api/download/{pdf_name}"}


def _append_data_to_official(official_path: Path, request: PdfRequest, output_path: Path):
    """Combine official form PDF + a clean filled-data appendix."""
    import pdfrw
    import io
    from reportlab.pdfgen import canvas as rl_canvas

    # Build the data appendix as a reportlab PDF in memory
    buf = io.BytesIO()
    _generate_summary_pdf(request, buf)
    buf.seek(0)

    # Merge: official form pages first, then our data sheet
    writer = pdfrw.PdfWriter()
    official = pdfrw.PdfReader(str(official_path))
    for page in official.pages:
        writer.addpage(page)

    data_sheet = pdfrw.PdfReader(buf)
    for page in data_sheet.pages:
        writer.addpage(page)

    writer.write(str(output_path))


def _generate_summary_pdf(request: PdfRequest, dest):
    """Generate a well-formatted data summary PDF (original fallback)."""
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT

    doc = SimpleDocTemplate(dest if isinstance(dest, str) else str(dest) if not hasattr(dest,'write') else dest,
                            pagesize=letter,
                            rightMargin=0.75*inch, leftMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)
    if hasattr(dest,'write'):
        doc = SimpleDocTemplate(dest, pagesize=letter,
                                rightMargin=0.75*inch, leftMargin=0.75*inch,
                                topMargin=0.75*inch, bottomMargin=0.75*inch)

    styles = getSampleStyleSheet()
    title_s = ParagraphStyle("T", parent=styles["Normal"], fontSize=20, fontName="Helvetica-Bold", textColor=colors.HexColor("#0d1f3c"), spaceAfter=4)
    sub_s    = ParagraphStyle("S", parent=styles["Normal"], fontSize=10, fontName="Helvetica", textColor=colors.HexColor("#6b7280"), spaceAfter=2)
    sec_s    = ParagraphStyle("H", parent=styles["Normal"], fontSize=13, fontName="Helvetica-Bold", textColor=colors.HexColor("#0d1f3c"), spaceBefore=16, spaceAfter=6)
    lbl_s    = ParagraphStyle("L", parent=styles["Normal"], fontSize=8,  fontName="Helvetica-Bold", textColor=colors.HexColor("#6b7280"), spaceAfter=2)
    val_s    = ParagraphStyle("V", parent=styles["Normal"], fontSize=11, fontName="Helvetica", textColor=colors.HexColor("#0d1f3c"), spaceAfter=8)
    emp_s    = ParagraphStyle("E", parent=styles["Normal"], fontSize=11, fontName="Helvetica", textColor=colors.HexColor("#9ca3af"), spaceAfter=8)
    dis_s    = ParagraphStyle("D", parent=styles["Normal"], fontSize=8,  fontName="Helvetica", textColor=colors.HexColor("#6b7280"), spaceAfter=4, leading=13)
    warn_s   = ParagraphStyle("W", parent=styles["Normal"], fontSize=9,  fontName="Helvetica-Bold", textColor=colors.HexColor("#92400e"), spaceAfter=4)

    story = []
    story.append(Paragraph("FormAssist AI", title_s))
    story.append(Paragraph("Prepared Data — Not an official submission", sub_s))
    story.append(Spacer(1,6))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0d1f3c")))
    story.append(Spacer(1,8))

    meta = [["Form", request.form_name], ["Agency", request.agency], ["Status", "Helper — review all fields then submit officially"]]
    mt = Table(meta, colWidths=[1.2*inch, 5.8*inch])
    mt.setStyle(TableStyle([
        ("FONTNAME",(0,0),(0,-1),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),10),
        ("TEXTCOLOR",(0,0),(0,-1),colors.HexColor("#6b7280")),
        ("TEXTCOLOR",(1,0),(1,-1),colors.HexColor("#0d1f3c")),
        ("BOTTOMPADDING",(0,0),(-1,-1),4),("VALIGN",(0,0),(-1,-1),"TOP"),
    ]))
    story.append(mt)
    story.append(Spacer(1,12))

    warn_data = [[Paragraph("⚠ Important",warn_s), Paragraph(
        "Review every field. Add any missing or sensitive information by hand. Sign where required. Submit through the official agency.", dis_s)]]
    wt = Table(warn_data, colWidths=[1.1*inch,5.9*inch])
    wt.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#fffbeb")),
        ("BOX",(0,0),(-1,-1),1,colors.HexColor("#fcd34d")),
        ("TOPPADDING",(0,0),(-1,-1),10),("BOTTOMPADDING",(0,0),(-1,-1),10),
        ("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
    ]))
    story.append(wt)
    story.append(Spacer(1,16))
    story.append(Paragraph("Your Filled-In Information", sec_s))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb")))
    story.append(Spacer(1,10))

    questions = request.questions
    answers   = request.answers
    i = 0
    while i < len(questions):
        q = questions[i]
        val = answers.get(q["id"],"")
        lbl_txt = q["label"] + (" *" if q.get("required") else "")
        val_txt = str(val) if val else "— not provided —"
        v_s = val_s if val else emp_s

        wide = q["id"] in ["old_street","new_street","old_unit","new_unit","situation","description","address"]
        if wide or i+1 >= len(questions):
            row = [[Paragraph(lbl_txt.upper(),lbl_s), Paragraph(val_txt,v_s)], [Paragraph("",lbl_s),Paragraph("",val_s)]]
            t = Table([[row[0],row[1]]], colWidths=[3.5*inch,3.5*inch])
            t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),16)]))
            story.append(t)
            i += 1
        else:
            q2 = questions[i+1]
            val2 = answers.get(q2["id"],"")
            lbl2_txt = q2["label"] + (" *" if q2.get("required") else "")
            val2_txt = str(val2) if val2 else "— not provided —"
            v2_s = val_s if val2 else emp_s
            row = [[Paragraph(lbl_txt.upper(),lbl_s), Paragraph(val_txt,v_s)],
                   [Paragraph(lbl2_txt.upper(),lbl_s),Paragraph(val2_txt,v2_s)]]
            t = Table([[row[0],row[1]]], colWidths=[3.5*inch,3.5*inch])
            t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),0),("RIGHTPADDING",(0,0),(-1,-1),16)]))
            story.append(t)
            i += 2

    story.append(Spacer(1,16))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb")))
    story.append(Paragraph("Next Steps", sec_s))
    for idx, step in enumerate([
        "Review every field above and correct any errors.",
        "Fill in any fields marked '— not provided —' by hand.",
        "Complete identity verification directly with the official agency.",
        "Do NOT submit payment information through FormAssist AI.",
        "Add your handwritten signature where required.",
        "Submit through the official agency website, by mail, or at their office.",
    ], 1):
        story.append(Paragraph(f"{idx}.  {step}", dis_s))

    story.append(Spacer(1,12))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb")))
    story.append(Spacer(1,8))
    story.append(Paragraph(
        "Disclaimer: FormAssist AI helps prepare information. It does not provide legal advice and does not submit official forms. Always verify with the relevant agency.", dis_s))
    doc.build(story)


@app.get("/api/download/{filename}")
def download_pdf(filename: str):
    pdf_path = PDF_DIR / filename
    if not pdf_path.exists():
        return {"error": "PDF not found"}
    return FileResponse(path=pdf_path, filename=filename, media_type="application/pdf",
                        headers={"Access-Control-Allow-Origin": "*",
                                 "Content-Disposition": f"inline; filename={filename}"})


@app.get("/api/preview/{filename}")
def preview_pdf(filename: str):
    """Serve PDF with headers that allow iframe embedding."""
    pdf_path = PDF_DIR / filename
    if not pdf_path.exists():
        return Response(status_code=404)
    with open(pdf_path, "rb") as f:
        data = f.read()
    return Response(
        content=data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename={filename}",
            "X-Frame-Options": "SAMEORIGIN",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
        }
    )