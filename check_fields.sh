#!/bin/bash
# Run from formassist-ai/ directory
source backend/venv/bin/activate
python3 - << 'PYEOF'
import pypdf

forms = [
    ("i765",  "frontend/public/forms/immigration/i765.pdf"),
    ("i9",    "frontend/public/forms/immigration/i9.pdf"),
    ("i130",  "frontend/public/forms/immigration/i130.pdf"),
    ("i485",  "frontend/public/forms/immigration/i485.pdf"),
    ("n400",  "frontend/public/forms/immigration/n400.pdf"),
    ("w9",    "frontend/public/forms/tax/w9.pdf"),
    ("w4",    "frontend/public/forms/tax/w4.pdf"),
    ("1040",  "frontend/public/forms/tax/1040.pdf"),
    ("ds11",  "frontend/public/forms/passport/ds11.pdf"),
    ("ds82",  "frontend/public/forms/passport/ds82.pdf"),
    ("ss5",   "frontend/public/forms/social-security/ss5.pdf"),
]

for form_id, path in forms:
    try:
        r = pypdf.PdfReader(path)
        fields = r.get_fields()
        if fields:
            names = [k for k in fields.keys() if not any(x in k for x in ['pageSet','#subform','PDF417','BarCode'])]
            print(f"\n=== {form_id} ({len(fields)} total, {len(names)} named) ===")
            for n in names[:40]:
                print(f"  {n}")
        else:
            print(f"\n=== {form_id}: NO FIELDS (scanned) ===")
    except Exception as e:
        print(f"\n=== {form_id}: ERROR {e} ===")
PYEOF