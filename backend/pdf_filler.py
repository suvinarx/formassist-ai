"""
PDF Filler — uses pypdf's low-level field writing for exact field matching.
"""
import io
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.styles import ParagraphStyle

import pdfrw
import pypdf
from pypdf.generic import NameObject, create_string_object, BooleanObject


BASE_DIR = Path(__file__).parent.parent
FORMS_DIR = BASE_DIR / "frontend" / "public" / "forms"

FORM_PDFS = {
    "w9": FORMS_DIR / "tax/w9.pdf",
    "w4": FORMS_DIR / "tax/w4.pdf",
    "w2": FORMS_DIR / "tax/w2.pdf",
    "1040": FORMS_DIR / "tax/1040.pdf",
    "1040x": FORMS_DIR / "tax/1040x.pdf",
    "1040es": FORMS_DIR / "tax/1040es.pdf",
    "1040s1": FORMS_DIR / "tax/1040s1.pdf",
    "1040s2": FORMS_DIR / "tax/1040s2.pdf",
    "1040sr": FORMS_DIR / "tax/1040sr.pdf",
    "1065": FORMS_DIR / "tax/1065.pdf",
    "1095a": FORMS_DIR / "tax/1095a.pdf",
    "1095b": FORMS_DIR / "tax/1095b.pdf",
    "1095c": FORMS_DIR / "tax/1095c.pdf",
    "1096": FORMS_DIR / "tax/1096.pdf",
    "1099div": FORMS_DIR / "tax/1099div.pdf",
    "1099g": FORMS_DIR / "tax/1099g.pdf",
    "1099int": FORMS_DIR / "tax/1099int.pdf",
    "1099misc": FORMS_DIR / "tax/1099misc.pdf",
    "1099nec": FORMS_DIR / "tax/1099nec.pdf",
    "1099r": FORMS_DIR / "tax/1099r.pdf",
    "1120": FORMS_DIR / "tax/1120.pdf",
    "1120s": FORMS_DIR / "tax/1120s.pdf",
    "2210": FORMS_DIR / "tax/2210.pdf",
    "2290": FORMS_DIR / "tax/2290.pdf",
    "2441": FORMS_DIR / "tax/2441.pdf",
    "3800": FORMS_DIR / "tax/3800.pdf",
    "4506": FORMS_DIR / "tax/4506.pdf",
    "4506t": FORMS_DIR / "tax/4506t.pdf",
    "4868": FORMS_DIR / "tax/4868.pdf",
    "5329": FORMS_DIR / "tax/5329.pdf",
    "5695": FORMS_DIR / "tax/5695.pdf",
    "6251": FORMS_DIR / "tax/6251.pdf",
    "706": FORMS_DIR / "tax/706.pdf",
    "709": FORMS_DIR / "tax/709.pdf",
    "720": FORMS_DIR / "tax/720.pdf",
    "8606": FORMS_DIR / "tax/8606.pdf",
    "8822": FORMS_DIR / "tax/8822.pdf",
    "8822b": FORMS_DIR / "tax/8822b.pdf",
    "8829": FORMS_DIR / "tax/8829.pdf",
    "8889": FORMS_DIR / "tax/8889.pdf",
    "8949": FORMS_DIR / "tax/8949.pdf",
    "8960": FORMS_DIR / "tax/8960.pdf",
    "8962": FORMS_DIR / "tax/8962.pdf",
    "940": FORMS_DIR / "tax/940.pdf",
    "941": FORMS_DIR / "tax/941.pdf",
    "944": FORMS_DIR / "tax/944.pdf",
    "schedA": FORMS_DIR / "tax/schedA.pdf",
    "schedB": FORMS_DIR / "tax/schedB.pdf",
    "schedC": FORMS_DIR / "tax/schedC.pdf",
    "schedD": FORMS_DIR / "tax/schedD.pdf",
    "schedE": FORMS_DIR / "tax/schedE.pdf",
    "schedF": FORMS_DIR / "tax/schedF.pdf",
    "ss4": FORMS_DIR / "tax/ss4.pdf",
    "w7": FORMS_DIR / "tax/w7.pdf",
    "w8ben": FORMS_DIR / "tax/w8ben.pdf",

    "i9": FORMS_DIR / "immigration/i9.pdf",
    "i20": FORMS_DIR / "immigration/i20.pdf",
    "i90": FORMS_DIR / "immigration/i90.pdf",
    "i129f": FORMS_DIR / "immigration/i129f.pdf",
    "i130": FORMS_DIR / "immigration/i130.pdf",
    "i131": FORMS_DIR / "immigration/i131.pdf",
    "i140": FORMS_DIR / "immigration/i140.pdf",
    "i485": FORMS_DIR / "immigration/i485.pdf",
    "i539": FORMS_DIR / "immigration/i539.pdf",
    "i589": FORMS_DIR / "immigration/i589.pdf",
    "i601": FORMS_DIR / "immigration/i601.pdf",
    "i612": FORMS_DIR / "immigration/i612.pdf",
    "i693": FORMS_DIR / "immigration/i693.pdf",
    "i751": FORMS_DIR / "immigration/i751.pdf",
    "i765": FORMS_DIR / "immigration/i765.pdf",
    "i821d": FORMS_DIR / "immigration/i821d.pdf",
    "i864": FORMS_DIR / "immigration/i864.pdf",
    "i918": FORMS_DIR / "immigration/i918.pdf",
    "n400": FORMS_DIR / "immigration/n400.pdf",
    "n600": FORMS_DIR / "immigration/n600.pdf",

    "ds11": FORMS_DIR / "passport/ds11.pdf",
    "ds64": FORMS_DIR / "passport/ds64.pdf",
    "ds3053": FORMS_DIR / "passport/ds3053.pdf",

    # ds82, ds5504, ss5, ssa44, ssa827, ssa3368, va530, ps3575 PDFs not in this build — data_only fallback
    "wh380e": FORMS_DIR / "employment/wh380e.pdf",
    "wh380f": FORMS_DIR / "employment/wh380f.pdf",
    "wh381": FORMS_DIR / "employment/wh381.pdf",
    "wh382": FORMS_DIR / "employment/wh382.pdf",
    "wh384": FORMS_DIR / "employment/wh384.pdf",
    "wh385": FORMS_DIR / "employment/wh385.pdf",
    "wh385v": FORMS_DIR / "employment/wh385v.pdf",

    "va526ez": FORMS_DIR / "veterans/va526ez.pdf",
    "va1990": FORMS_DIR / "veterans/va1990.pdf",
    "va4142": FORMS_DIR / "veterans/va4142.pdf",

    "irs_8822": FORMS_DIR / "tax/8822.pdf",
    "ps1508": FORMS_DIR / "moving/ps1508.pdf",
}


def _get_full_field_name(field_obj) -> str:
    """Walk up /Parent chain to build the full dotted field name."""
    parts = []
    obj = field_obj

    while obj:
        t = obj.get("/T")
        if t:
            parts.append(str(t))
        parent = obj.get("/Parent")
        obj = parent.get_object() if parent else None

    parts.reverse()
    return ".".join(parts)


def _get_inherited_field_type(annot):
    """
    Some PDFs store /FT on the parent field instead of the widget annotation.
    Walk upward until we find it.
    """
    obj = annot

    while obj:
        ft = obj.get("/FT")
        if ft:
            return ft
        parent = obj.get("/Parent")
        obj = parent.get_object() if parent else None

    return None


def _is_checkbox(annot) -> bool:
    return _get_inherited_field_type(annot) == "/Btn"


def _set_checkbox_value(annot, checked=True):
    """
    Correctly checks/unchecks a PDF checkbox by using its real appearance state.
    """
    ap = annot.get("/AP")
    if not ap:
        return False

    normal = ap.get("/N")
    if not normal:
        return False

    normal = normal.get_object()
    on_states = [state for state in normal.keys() if str(state) != "/Off"]

    if not on_states:
        return False

    on_state = NameObject(str(on_states[0]))

    if checked:
        annot.update({
            NameObject("/V"): on_state,
            NameObject("/AS"): on_state,
        })
    else:
        annot.update({
            NameObject("/V"): NameObject("/Off"),
            NameObject("/AS"): NameObject("/Off"),
        })

    return True


def _fill_fields_exact(pdf_path: Path, field_values: dict, output_path: Path) -> bool:
    """
    Writes values into exact AcroForm field names.
    Text fields get /V only.
    Checkbox fields get /V and /AS using their real on-state.
    """
    try:
        reader = pypdf.PdfReader(str(pdf_path))
        writer = pypdf.PdfWriter()
        writer.append(reader)

        # Help PDF viewers regenerate field appearances.
        if "/AcroForm" in writer._root_object:
            writer._root_object["/AcroForm"].update({
                NameObject("/NeedAppearances"): BooleanObject(True)
            })

        filled = 0

        for page in writer.pages:
            if "/Annots" not in page:
                continue

            for annot_ref in page["/Annots"]:
                annot = annot_ref.get_object()

                if annot.get("/Type") != "/Annot":
                    continue

                if annot.get("/Subtype") != "/Widget":
                    continue

                full_name = _get_full_field_name(annot)

                if full_name not in field_values:
                    continue

                val = str(field_values[full_name]).strip()

                if not val:
                    continue

                if _is_checkbox(annot):
                    checked = val.lower() not in ["", "false", "no", "0", "off"]
                    if _set_checkbox_value(annot, checked=checked):
                        filled += 1
                else:
                    # Do NOT set /AS for text fields. That caused write_to_stream errors.
                    annot.update({
                        NameObject("/V"): create_string_object(val),
                    })
                    filled += 1

        if filled == 0:
            return False

        with open(output_path, "wb") as f:
            writer.write(f)

        print(f"[pdf_filler] Filled {filled} fields exactly")
        return True

    except Exception as e:
        print(f"[pdf_filler] Exact fill error: {e}")
        return False


def generate_filled_pdf(form_id, form_name, agency, answers, questions, output_path):
    """Main entry. Always produces a usable PDF."""
    from pdf_field_maps import get_field_map

    official = FORM_PDFS.get(form_id)
    field_map = get_field_map(form_id)

    # ── Tier 1: Exact field map ────────────────────────────────────────────
    if official and official.exists() and field_map:
        values = {}

        # Regular field mappings: answer_id -> exact PDF field name
        for q_id, pdf_field in field_map.items():
            val = str(answers.get(q_id, "")).strip()
            if val:
                values[pdf_field] = val

        # Special handling for W-4 checkboxes
        if form_id == "w4":
            try:
                from pdf_field_maps import W4_FILING_STATUS

                filing_status = str(answers.get("filing_status", "")).strip()
                if filing_status in W4_FILING_STATUS:
                    values[W4_FILING_STATUS[filing_status]] = "Yes"
            except Exception as e:
                print(f"[pdf_filler] W4 filing status mapping skipped: {e}")

            try:
                from pdf_field_maps import W4_STEP2_CHECKBOX

                multiple_jobs_method = str(
                    answers.get("multiple_jobs_method", "")
                ).strip()

                if multiple_jobs_method in W4_STEP2_CHECKBOX:
                    values[W4_STEP2_CHECKBOX[multiple_jobs_method]] = "Yes"
            except Exception as e:
                print(f"[pdf_filler] W4 Step 2 checkbox mapping skipped: {e}")

        if values:
            ok = _fill_fields_exact(official, values, output_path)
            if ok:
                print(f"[pdf_filler] EXACT: {form_id} → {output_path.name}")
                return "exact"

    # ── Tier 2: Official PDF + data appendix ──────────────────────────────
    if official and official.exists():
        try:
            _official_plus_appendix(
                official,
                form_name,
                agency,
                answers,
                questions,
                output_path,
            )
            print(f"[pdf_filler] APPENDIX: {form_id} → {output_path.name}")
            return "official+appendix"
        except Exception as e:
            print(f"[pdf_filler] Appendix error: {e}")

    # ── Tier 3: Data-only ─────────────────────────────────────────────────
    _formatted_data_pdf(form_name, agency, answers, questions, output_path)
    print(f"[pdf_filler] DATA ONLY: {form_id} → {output_path.name}")
    return "data_only"


def _official_plus_appendix(official_pdf, form_name, agency, answers, questions, output_path):
    buf = io.BytesIO()
    _formatted_data_pdf(form_name, agency, answers, questions, buf)
    buf.seek(0)

    writer = pdfrw.PdfWriter()

    for page in pdfrw.PdfReader(str(official_pdf)).pages:
        writer.addpage(page)

    for page in pdfrw.PdfReader(buf).pages:
        writer.addpage(page)

    writer.write(str(output_path))


def _formatted_data_pdf(form_name, agency, answers, questions, dest):
    doc = SimpleDocTemplate(
        str(dest) if hasattr(dest, "__fspath__") else dest,
        pagesize=letter,
        rightMargin=0.85 * inch,
        leftMargin=0.85 * inch,
        topMargin=0.85 * inch,
        bottomMargin=0.85 * inch,
    )

    NAVY = colors.HexColor("#0d1f3c")
    GRAY = colors.HexColor("#6b7280")
    LGRAY = colors.HexColor("#9ca3af")
    AMBER = colors.HexColor("#92400e")
    AMBBG = colors.HexColor("#fffbeb")
    AMBBRD = colors.HexColor("#fcd34d")

    title_s = ParagraphStyle(
        "T",
        fontSize=22,
        fontName="Helvetica-Bold",
        textColor=NAVY,
        spaceAfter=2,
    )
    sub_s = ParagraphStyle(
        "S",
        fontSize=10,
        fontName="Helvetica",
        textColor=GRAY,
        spaceAfter=4,
    )
    h2_s = ParagraphStyle(
        "H2",
        fontSize=14,
        fontName="Helvetica-Bold",
        textColor=NAVY,
        spaceBefore=20,
        spaceAfter=8,
    )
    lbl_s = ParagraphStyle(
        "L",
        fontSize=8,
        fontName="Helvetica-Bold",
        textColor=GRAY,
        spaceAfter=1,
        leading=10,
    )
    val_s = ParagraphStyle(
        "V",
        fontSize=12,
        fontName="Helvetica",
        textColor=NAVY,
        spaceAfter=12,
        leading=16,
    )
    emp_s = ParagraphStyle(
        "E",
        fontSize=12,
        fontName="Helvetica",
        textColor=LGRAY,
        spaceAfter=12,
        leading=16,
    )
    note_s = ParagraphStyle(
        "N",
        fontSize=8,
        fontName="Helvetica",
        textColor=GRAY,
        leading=13,
    )
    warn_s = ParagraphStyle(
        "W",
        fontSize=9,
        fontName="Helvetica-Bold",
        textColor=AMBER,
    )
    step_s = ParagraphStyle(
        "ST",
        fontSize=9,
        fontName="Helvetica",
        textColor=GRAY,
        leading=14,
        spaceAfter=3,
    )

    story = []
    story.append(Paragraph("DocuLyft", title_s))
    story.append(Paragraph("Prepared Data — Not an official submission", sub_s))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=2, color=NAVY))
    story.append(Spacer(1, 10))

    meta = Table(
        [
            ["Form", form_name],
            ["Agency", agency],
            [
                "Status",
                "Review all fields, add sensitive info by hand, sign and submit officially",
            ],
        ],
        colWidths=[1.1 * inch, 5.8 * inch],
    )
    meta.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("TEXTCOLOR", (0, 0), (0, -1), GRAY),
                ("TEXTCOLOR", (1, 0), (1, -1), NAVY),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(meta)
    story.append(Spacer(1, 14))

    wt = Table(
        [
            [
                Paragraph("⚠ Important", warn_s),
                Paragraph(
                    "Review every field. Add sensitive info (SSN, alien numbers, signatures) by hand. "
                    "Sign where required. Submit only through the official agency.",
                    note_s,
                ),
            ]
        ],
        colWidths=[0.9 * inch, 6.0 * inch],
    )
    wt.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), AMBBG),
                ("BOX", (0, 0), (-1, -1), 1, AMBBRD),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(wt)
    story.append(Spacer(1, 18))

    story.append(Paragraph("Your Filled-In Information", h2_s))
    story.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=colors.HexColor("#e5e7eb"),
        )
    )
    story.append(Spacer(1, 12))

    # Filter out note/instruction fields before building the grid
    display_questions = [q for q in questions if not q.get("is_note")]

    i = 0
    while i < len(display_questions):
        q1 = display_questions[i]
        v1 = str(answers.get(q1["id"], "")).strip()

        wide = any(
            k in q1["id"]
            for k in [
                "address",
                "description",
                "street",
                "condition",
                "disabilities",
                "explanation",
                "persecution",
                "history",
                "education",
                "situation",
            ]
        )

        if wide or i + 1 >= len(display_questions):
            story.append(
                KeepTogether(
                    [
                        Paragraph(
                            q1["label"].upper()
                            + ("  *" if q1.get("required") else ""),
                            lbl_s,
                        ),
                        Paragraph(
                            v1 if v1 else "— not provided —",
                            val_s if v1 else emp_s,
                        ),
                    ]
                )
            )
            i += 1
        else:
            q2 = display_questions[i + 1]
            v2 = str(answers.get(q2["id"], "")).strip()

            t = Table(
                [
                    [
                        Paragraph(
                            q1["label"].upper()
                            + ("  *" if q1.get("required") else ""),
                            lbl_s,
                        ),
                        Paragraph(
                            q2["label"].upper()
                            + ("  *" if q2.get("required") else ""),
                            lbl_s,
                        ),
                    ],
                    [
                        Paragraph(
                            v1 if v1 else "— not provided —",
                            val_s if v1 else emp_s,
                        ),
                        Paragraph(
                            v2 if v2 else "— not provided —",
                            val_s if v2 else emp_s,
                        ),
                    ],
                ],
                colWidths=[3.4 * inch, 3.4 * inch],
            )
            t.setStyle(
                TableStyle(
                    [
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 0),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 16),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                        ("TOPPADDING", (0, 0), (-1, -1), 0),
                    ]
                )
            )
            story.append(t)
            i += 2

    story.append(Spacer(1, 18))
    story.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=colors.HexColor("#e5e7eb"),
        )
    )

    story.append(Paragraph("Next Steps", h2_s))

    for idx, step in enumerate(
        [
            f"The official {form_name} pages are included before this sheet.",
            "Review every field and correct any errors.",
            "Add sensitive information (SSN, alien number, passport, signatures) by hand.",
            "Sign and date where required.",
            f"Submit through {agency}'s official website, by mail, or in person.",
        ],
        1,
    ):
        story.append(Paragraph(f"{idx}.  {step}", step_s))

    story.append(Spacer(1, 14))
    story.append(
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=colors.HexColor("#e5e7eb"),
        )
    )
    story.append(Spacer(1, 8))
    story.append(
        Paragraph(
            "Disclaimer: DocuLyft prepares information only. It does not provide legal advice "
            "and does not submit forms on your behalf. Always verify with the relevant agency.",
            note_s,
        )
    )

    doc.build(story)