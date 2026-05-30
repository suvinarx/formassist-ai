from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
import os, json, uuid

load_dotenv(override=True)

app = FastAPI(title="DocuLyft")
app.add_middleware(CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"])

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL   = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

BASE_DIR   = Path(__file__).parent
FORMS_PATH = BASE_DIR / "forms.json"
PDF_DIR    = BASE_DIR / "generated_pdfs"
PDF_DIR.mkdir(exist_ok=True)

from pdf_filler import generate_filled_pdf

# ── Models ────────────────────────────────────────────────────────────────────
class SituationRequest(BaseModel):
    first_name: str; email: str; situation: str; consent: bool

class AiFillRequest(BaseModel):
    form_id: str; user_details: str

class PdfRequest(BaseModel):
    form_id: str; form_name: str; agency: str
    answers: dict; questions: list

class SmartFillRequest(BaseModel):
    form_id: str; situation: str
    user_name: str = ""; user_email: str = ""

# ── Helpers ───────────────────────────────────────────────────────────────────
def load_forms():
    with open(FORMS_PATH) as f: return json.load(f)

def call_ai(system, user, temp=0.1):
    if not client: return None
    r = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[{"role":"system","content":system},{"role":"user","content":user}],
        temperature=temp)
    return r.choices[0].message.content

def parse_json(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"): text = text[4:]
    return json.loads(text.strip())

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root(): return {"status": "ok"}

@app.post("/api/analyze-situation")
def analyze(req: SituationRequest):
    forms = load_forms()
    if client:
        content = call_ai(
            "You recommend government forms. Return valid JSON only.",
            f"Situation: {req.situation}\n\nForms available:\n{json.dumps([{'form_id':f['form_id'],'form_name':f['form_name']} for f in forms])}\n\n"
            f"Return: {{\"recommended_forms\":[{{\"form_id\":\"...\",\"form_name\":\"...\",\"confidence\":\"high|medium|low\",\"reason\":\"...\"}}]}}")
        return parse_json(content)
    t = req.situation.lower()
    if any(w in t for w in ["move","moving","address"]):
        return {"recommended_forms":[{"form_id":"usps_change_of_address_helper","form_name":"USPS Change of Address","confidence":"high","reason":"You are moving."}]}
    if any(w in t for w in ["w9","w-9","taxpayer id","freelance","contractor"]):
        return {"recommended_forms":[{"form_id":"w9","form_name":"Form W-9","confidence":"high","reason":"W-9 is required for contractor/freelance work."}]}
    if any(w in t for w in ["1040","tax return","income tax","file taxes"]):
        return {"recommended_forms":[{"form_id":"1040","form_name":"Form 1040","confidence":"high","reason":"1040 is the standard individual income tax return."}]}
    if any(w in t for w in ["passport","travel","ds-11","ds11"]):
        return {"recommended_forms":[{"form_id":"ds64","form_name":"DS-64 Report of Lost/Stolen Passport","confidence":"medium","reason":"DS-64 is for reporting a lost or stolen passport."}]}
    return {"recommended_forms":[]}

@app.get("/api/forms/{form_id}")
def get_form(form_id: str):
    for f in load_forms():
        if f["form_id"] == form_id: return f
    return {"error": "Form not found", "questions": []}

@app.post("/api/ai-fill")
def ai_fill(req: AiFillRequest):
    forms = load_forms()
    form = next((f for f in forms if f["form_id"] == req.form_id), None)
    if not form: return {"error": "Form not found", "answers": {}}
    questions = form.get("questions", [])
    if not client: return {"answers": {q["id"]: "" for q in questions}}
    q_list = json.dumps([{"id":q["id"],"label":q["label"]} for q in questions])
    content = call_ai(
        "Extract form answers from a document. Return JSON only with field id as key. Empty string if unknown. Never invent SSN or payment data.",
        f"Form questions:\n{q_list}\n\nUser document text:\n{req.user_details[:4000]}\n\nReturn only: {{\"field_id\": \"value\", ...}}")
    try:
        return {"answers": parse_json(content)}
    except:
        return {"answers": {q["id"]: "" for q in questions}}

# FIX: Added /api/smart-fill endpoint (was missing — caused 404 in App.jsx chooseForm())
@app.post("/api/smart-fill")
def smart_fill(req: SmartFillRequest):
    """
    Called by App.jsx when user picks a recommended form.
    Combines form lookup + AI pre-fill from the situation text.
    """
    forms = load_forms()
    form = next((f for f in forms if f["form_id"] == req.form_id), None)
    if not form:
        return {"error": f"Form '{req.form_id}' not found", "form": None, "answers": {}}

    questions = form.get("questions", [])

    # Build hint text from situation + user name/email
    hint_parts = [f"Situation: {req.situation}"]
    if req.user_name:
        hint_parts.append(f"User name: {req.user_name}")
    if req.user_email:
        hint_parts.append(f"User email: {req.user_email}")
    hint_text = "\n".join(hint_parts)

    answers = {q["id"]: "" for q in questions}

    if client:
        q_list = json.dumps([{"id": q["id"], "label": q["label"]} for q in questions])
        content = call_ai(
            "Extract form field values from user-provided text. Return JSON only with field id as key and extracted value as value. Empty string if not found. Never invent SSN, alien numbers, or payment data.",
            f"Form: {form['form_name']}\nQuestions:\n{q_list}\n\nUser text:\n{hint_text[:4000]}\n\nReturn only: {{\"field_id\": \"value\", ...}}")
        try:
            answers = parse_json(content)
        except:
            pass
    else:
        # Basic fallback: populate name/email fields from user_name/user_email
        for q in questions:
            qid = q["id"].lower()
            if req.user_name and any(k in qid for k in ["full_name","full_legal_name","name","first_name"]):
                parts = req.user_name.split()
                if "first" in qid and parts:
                    answers[q["id"]] = parts[0]
                elif "last" in qid and len(parts) > 1:
                    answers[q["id"]] = parts[-1]
                elif "full" in qid or qid == "name":
                    answers[q["id"]] = req.user_name
            if req.user_email and any(k in qid for k in ["email"]):
                answers[q["id"]] = req.user_email

    return {"form": form, "answers": answers}

@app.post("/api/generate-pdf")
def generate_pdf(req: PdfRequest):
    try:
        filename = f"{req.form_id}_{uuid.uuid4().hex[:8]}.pdf"
        out_path = PDF_DIR / filename
        method = generate_filled_pdf(
            form_id=req.form_id,
            form_name=req.form_name,
            agency=req.agency,
            answers=req.answers,
            questions=req.questions,
            output_path=out_path,
        )
        print(f"[generate-pdf] {method} -> {filename}")
        return {"download_url": f"/api/download/{filename}", "method": method}
    except Exception as e:
        import traceback
        print(f"[generate-pdf] ERROR for {req.form_id}: {e}")
        traceback.print_exc()
        return {"error": f"PDF generation failed: {str(e)}"}

@app.get("/api/download/{filename}")
def download(filename: str):
    p = PDF_DIR / filename
    if not p.exists(): return Response(status_code=404)
    return FileResponse(str(p), media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}",
                 "Access-Control-Allow-Origin": "*"})

@app.get("/api/preview/{filename}")
def preview(filename: str):
    p = PDF_DIR / filename
    if not p.exists(): return Response(status_code=404)
    data = p.read_bytes()
    return Response(content=data, media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}",
                 "Access-Control-Allow-Origin": "*",
                 "Cache-Control": "no-store"})