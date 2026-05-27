#!/bin/bash
# Run from formassist-ai/ — dumps every field for key forms
source backend/venv/bin/activate
python3 - << 'PYEOF'
import pypdf

def dump(form_id, path):
    try:
        r = pypdf.PdfReader(path)
        fields = r.get_fields()
        if not fields:
            print(f"\n=== {form_id}: NO FIELDS ==="); return
        print(f"\n=== {form_id} ({len(fields)} fields) ===")
        for k in fields.keys():
            skip = ['pageSet','#subform','PDF417','BarCode','topmostSubform[0]\n','form1[0]\n']
            if k.strip() in ['form1[0]','topmostSubform[0]']: continue
            print(f"  {repr(k)}")
    except Exception as e:
        print(f"\n=== {form_id}: ERROR {e} ===")

dump("i765_ALL",  "frontend/public/forms/immigration/i765.pdf")
dump("w9_ALL",    "frontend/public/forms/tax/w9.pdf")
dump("w4_ALL",    "frontend/public/forms/tax/w4.pdf")
dump("1040_ALL",  "frontend/public/forms/tax/1040.pdf")
PYEOF