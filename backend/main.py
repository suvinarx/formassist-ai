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
from pdf_filler import generate_filled_pdf
from pdf_field_maps import get_field_map


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
    filename = f"{request.form_id}_{uuid.uuid4().hex[:8]}.pdf"
    out_path = PDF_DIR / filename
    method = generate_filled_pdf(
        form_id=request.form_id,
        form_name=request.form_name,
        agency=request.agency,
        answers=request.answers,
        questions=request.questions,
        output_path=out_path,
    )
    print(f"[generate-pdf] {method} -> {filename}")
    return {"download_url": f"/api/download/{filename}", "method": method}


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