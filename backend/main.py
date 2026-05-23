from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from dotenv import load_dotenv
from openai import OpenAI
import os
import json
import uuid
import textwrap

load_dotenv(override=True)

app = FastAPI(title="FormAssist AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

BASE_DIR = Path(__file__).parent
FORMS_PATH = BASE_DIR / "forms.json"
PDF_DIR = BASE_DIR / "generated_pdfs"
PDF_DIR.mkdir(exist_ok=True)


class LeadRequest(BaseModel):
    first_name: str
    email: str
    situation: str
    consent: bool


class AiFillRequest(BaseModel):
    form_id: str
    user_details: str


class PdfRequest(BaseModel):
    form_id: str
    answers: dict


def load_forms():
    with open(FORMS_PATH, "r") as file:
        return json.load(file)


@app.get("/")
def home():
    return {"message": "FormAssist AI backend is running"}


@app.post("/api/analyze-situation")
def analyze_situation(request: LeadRequest):
    forms = load_forms()

    if client:
        catalog_text = json.dumps(forms, indent=2)

        prompt = f"""
You are FormAssist AI. Recommend the best forms/actions from this catalog.

User name: {request.first_name}
User email: {request.email}
Situation: {request.situation}

Form catalog:
{catalog_text}

Return JSON only in this format:
{{
  "recommended_forms": [
    {{
      "form_id": "...",
      "form_name": "...",
      "confidence": "high|medium|low",
      "reason": "..."
    }}
  ]
}}
"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You recommend forms from a provided catalog. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        content = response.choices[0].message.content
        return json.loads(content)

    # Fallback logic without OpenAI
    text = request.situation.lower()

    if "move" in text or "moving" in text or "address" in text:
        return {
            "recommended_forms": [
                {
                    "form_id": "usps_change_of_address_helper",
                    "form_name": "USPS Change of Address Helper Packet",
                    "confidence": "high",
                    "reason": "You are moving and may need mail forwarding."
                },
                {
                    "form_id": "ca_dmv_change_of_address_helper",
                    "form_name": "California DMV Change of Address Helper",
                    "confidence": "medium",
                    "reason": "You mentioned moving from or within California."
                },
                {
                    "form_id": "wa_new_resident_driver_license_checklist",
                    "form_name": "Washington New Resident Driver License Checklist",
                    "confidence": "medium",
                    "reason": "You may need a new resident driver license checklist if moving to Washington."
                }
            ]
        }

    return {"recommended_forms": []}


@app.get("/api/forms/{form_id}")
def get_form(form_id: str):
    forms = load_forms()
    for form in forms:
        if form["form_id"] == form_id:
            return form
    return {"error": "Form not found"}


@app.post("/api/ai-fill")
def ai_fill(request: AiFillRequest):
    forms = load_forms()
    selected_form = None

    for form in forms:
        if form["form_id"] == request.form_id:
            selected_form = form
            break

    if not selected_form:
        return {"error": "Form not found"}

    questions = selected_form.get("questions", [])

    if client:
        prompt = f"""
You are FormAssist AI. Extract answers from the user's text for this form.

Form:
{json.dumps(selected_form, indent=2)}

User details:
{request.user_details}

Return JSON only.
Use the question id as the key.
If a value is unknown, return an empty string.
Do not invent sensitive information.
"""

        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Extract structured form answers. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1
        )

        content = response.choices[0].message.content
        return {"answers": json.loads(content)}

    # Fallback empty answers
    answers = {}
    for q in questions:
        answers[q["id"]] = ""

    return {"answers": answers}


@app.post("/api/generate-pdf")
def generate_pdf(request: PdfRequest):
    pdf_id = str(uuid.uuid4())
    pdf_path = PDF_DIR / f"{request.form_id}_{pdf_id}.pdf"

    answers = request.answers

    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    width, height = letter
    x = 72
    y = height - 72

    c.setFont("Helvetica-Bold", 16)
    c.drawString(x, y, "FormAssist AI Helper Packet")
    y -= 30

    c.setFont("Helvetica", 11)

    lines = [
        "This packet was prepared by FormAssist AI.",
        "This is not an official submission.",
        "Please review, print, complete sensitive fields if needed, sign, and submit through the official channel.",
        "",
        f"Selected form/action: {request.form_id}",
        "",
        "Prepared Information:"
    ]

    for key, value in answers.items():
        lines.append(f"{key}: {value}")

    lines.extend([
        "",
        "Manual/Sensitive Steps:",
        "- Complete any identity verification directly with the official agency.",
        "- Do not enter payment information into FormAssist AI.",
        "- Add handwritten signature if required.",
        "- Submit through the official agency website, mail process, or office.",
        "",
        "Disclaimer:",
        "FormAssist AI helps prepare information based on your answers. It does not provide legal advice and does not submit official government forms."
    ])

    for paragraph in lines:
        wrapped = textwrap.wrap(str(paragraph), width=90) if paragraph else [""]
        for line in wrapped:
            c.drawString(x, y, line)
            y -= 16
            if y < 72:
                c.showPage()
                c.setFont("Helvetica", 11)
                y = height - 72

    c.save()

    return {
        "message": "PDF generated",
        "download_url": f"/api/download/{pdf_path.name}"
    }


@app.get("/api/download/{filename}")
def download_pdf(filename: str):
    pdf_path = PDF_DIR / filename

    if not pdf_path.exists():
        return {"error": "PDF not found"}

    return FileResponse(
        path=pdf_path,
        filename=filename,
        media_type="application/pdf"
    )