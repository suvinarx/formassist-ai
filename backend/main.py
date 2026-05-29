from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv
from openai import OpenAI
import os, json, uuid

load_dotenv(override=True)

app = FastAPI(title="FormAssist AI")
app.add_middleware(CORSMiddleware,
    allow_origins=[
        "https://www.doculyft.com",
        "https://doculyft.com",
        "https://doculyft.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
