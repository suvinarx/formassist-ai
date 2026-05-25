from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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
import os
import json
import uuid
import textwrap

load_dotenv(override=True)

app = FastAPI(title="FormAssist AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://formassist-ai.vercel.app",
    ],
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


def load_forms():
    with open(FORMS_PATH, "r") as file:
        return json.load(file)


def call_openai(system_prompt, user_prompt, temperature=0.2):
    if not client:
        return None
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=temperature
    )
    return response.choices[0].message.content


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
        content = call_openai(
            "You recommend forms from a provided catalog. Return valid JSON only.",
            prompt
        )
        # Strip markdown code fences if present
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return json.loads(content.strip())

    # Fallback
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
                    "reason": "You may need a new resident driver license if moving to Washington."
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


@app.post("/api/smart-fill")
def smart_fill(request: SmartFillRequest):
    """Auto-fill a form directly from the situation description + user profile."""
    forms = load_forms()
    selected_form = next((f for f in forms if f["form_id"] == request.form_id), None)

    if not selected_form:
        return {"error": "Form not found"}

    questions = selected_form.get("questions", [])

    if client:
        prompt = f"""
You are FormAssist AI. The user has described their situation and you must extract
and infer answers for every field in the form below.

User name: {request.user_name}
User email: {request.user_email}
Situation: {request.situation}

Form to fill:
{json.dumps(selected_form, indent=2)}

Rules:
- Use the question "id" as the JSON key
- Pre-fill name fields from the user's name: {request.user_name}
- Pre-fill email from: {request.user_email}
- Extract addresses, dates, and other details from the situation text
- For single_choice fields, pick the most appropriate option from the provided options list
- If a value genuinely cannot be determined, return an empty string
- Do NOT invent sensitive data like SSN, payment info, or government IDs
- Return valid JSON only, no markdown, no explanation

Example output format:
{{"first_name": "Jane", "last_name": "Smith", "email": "jane@example.com", "old_city": "San Jose", ...}}
"""
        content = call_openai(
            "Extract structured form answers from user situation. Return valid JSON only, no markdown.",
            prompt,
            temperature=0.1
        )
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return {"answers": json.loads(content.strip()), "form": selected_form}

    # Fallback: pre-fill what we know from the profile
    name_parts = request.user_name.strip().split(" ", 1)
    answers = {}
    for q in questions:
        if q["id"] == "first_name":
            answers[q["id"]] = name_parts[0] if name_parts else ""
        elif q["id"] == "last_name":
            answers[q["id"]] = name_parts[1] if len(name_parts) > 1 else ""
        elif q["id"] == "email":
            answers[q["id"]] = request.user_email
        else:
            answers[q["id"]] = ""

    return {"answers": answers, "form": selected_form}


@app.post("/api/ai-fill")
def ai_fill(request: AiFillRequest):
    forms = load_forms()
    selected_form = next((f for f in forms if f["form_id"] == request.form_id), None)

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

Return JSON only. Use the question id as the key.
If a value is unknown, return an empty string.
Do not invent sensitive information.
"""
        content = call_openai(
            "Extract structured form answers. Return valid JSON only.",
            prompt,
            temperature=0.1
        )
        content = content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return {"answers": json.loads(content.strip())}

    answers = {q["id"]: "" for q in questions}
    return {"answers": answers}


@app.post("/api/generate-pdf")
def generate_pdf(request: PdfRequest):
    pdf_id = str(uuid.uuid4())
    pdf_path = PDF_DIR / f"{request.form_id}_{pdf_id}.pdf"

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Normal"],
        fontSize=22,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#111827"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica",
        textColor=colors.HexColor("#6b7280"),
        spaceAfter=2,
    )
    section_header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Normal"],
        fontSize=13,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#111827"),
        spaceBefore=18,
        spaceAfter=8,
    )
    field_label_style = ParagraphStyle(
        "FieldLabel",
        parent=styles["Normal"],
        fontSize=9,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#6b7280"),
        spaceAfter=2,
    )
    field_value_style = ParagraphStyle(
        "FieldValue",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica",
        textColor=colors.HexColor("#111827"),
        spaceAfter=10,
    )
    field_empty_style = ParagraphStyle(
        "FieldEmpty",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica",
        textColor=colors.HexColor("#9ca3af"),
        spaceAfter=10,
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontSize=9,
        fontName="Helvetica",
        textColor=colors.HexColor("#6b7280"),
        spaceAfter=4,
        leading=14,
    )
    warning_style = ParagraphStyle(
        "Warning",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#92400e"),
        spaceAfter=4,
    )

    story = []

    # ── Header ──────────────────────────────────────────────────────────────
    story.append(Paragraph("FormAssist AI", title_style))
    story.append(Paragraph("Helper Packet — Not an official submission", subtitle_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#111827")))
    story.append(Spacer(1, 8))

    # Form name + agency
    meta_data = [
        ["Form", request.form_name],
        ["Agency", request.agency],
        ["Status", "Helper packet — review and submit through official channel"],
    ]
    meta_table = Table(meta_data, colWidths=[1.2 * inch, 5.8 * inch])
    meta_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#6b7280")),
        ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#111827")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb")))

    # ── Warning box ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 12))
    warning_data = [[
        Paragraph("⚠  Important", warning_style),
        Paragraph(
            "This packet was prepared by FormAssist AI and is NOT an official form submission. "
            "Review all fields carefully, add any missing or sensitive information by hand, "
            "sign where required, and submit through the official agency channel.",
            disclaimer_style
        )
    ]]
    warning_table = Table(warning_data, colWidths=[1.1 * inch, 5.9 * inch])
    warning_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fffbeb")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#fcd34d")),
        ("ROUNDEDCORNERS", [6]),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(warning_table)
    story.append(Spacer(1, 16))

    # ── Form fields ──────────────────────────────────────────────────────────
    story.append(Paragraph("Prepared Information", section_header_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb")))
    story.append(Spacer(1, 10))

    # Build a 2-column grid of fields
    questions_list = request.questions
    answers = request.answers

    # Group fields into rows of 2
    field_rows = []
    i = 0
    while i < len(questions_list):
        q = questions_list[i]
        qid = q["id"]
        label = q["label"]
        value = answers.get(qid, "")
        required = q.get("required", False)

        label_text = label + (" *" if required else "")
        value_text = str(value) if value else "— not provided —"
        value_style = field_value_style if value else field_empty_style

        cell = [
            Paragraph(label_text.upper(), field_label_style),
            Paragraph(value_text, value_style),
        ]

        # Wide fields (addresses, descriptions) get full width
        wide_ids = ["old_street", "new_street", "old_unit", "new_unit", "situation", "description"]
        if qid in wide_ids or i == len(questions_list) - 1 and len(questions_list) % 2 == 1:
            field_rows.append([cell, [Paragraph("", field_label_style)]])
            i += 1
        elif i + 1 < len(questions_list):
            q2 = questions_list[i + 1]
            qid2 = q2["id"]
            label2 = q2["label"]
            value2 = answers.get(qid2, "")
            required2 = q2.get("required", False)
            label2_text = label2 + (" *" if required2 else "")
            value2_text = str(value2) if value2 else "— not provided —"
            value2_style = field_value_style if value2 else field_empty_style
            cell2 = [
                Paragraph(label2_text.upper(), field_label_style),
                Paragraph(value2_text, value2_style),
            ]
            field_rows.append([cell, cell2])
            i += 2
        else:
            field_rows.append([cell, [Paragraph("", field_label_style)]])
            i += 1

    for row in field_rows:
        t = Table(
            [[row[0], row[1]]],
            colWidths=[3.5 * inch, 3.5 * inch],
        )
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 16),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
        ]))
        story.append(t)

    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb")))

    # ── Next steps ───────────────────────────────────────────────────────────
    story.append(Paragraph("Next Steps", section_header_style))
    steps = [
        "Review every field above and correct any errors.",
        "Fill in any fields marked '— not provided —' by hand.",
        "Complete identity verification directly with the official agency.",
        "Do NOT submit payment information through FormAssist AI.",
        "Add your handwritten signature where required.",
        "Submit through the official agency website, by mail, or at their office.",
    ]
    for idx, step in enumerate(steps, 1):
        story.append(Paragraph(f"{idx}.  {step}", disclaimer_style))

    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb")))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Disclaimer: FormAssist AI helps prepare information based on your answers. "
        "It does not provide legal advice and does not submit official government forms. "
        "Always verify information with the relevant agency before submitting.",
        disclaimer_style
    ))

    doc.build(story)

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
