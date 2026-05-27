#!/bin/bash
# Run from formassist-ai/ — tests the EXACT code path the server uses
source backend/venv/bin/activate
cd backend
python3 - << 'PYEOF'
import sys, os
sys.path.insert(0, '.')

print("=== ENVIRONMENT CHECK ===")
print(f"Python: {sys.version}")
print(f"CWD: {os.getcwd()}")

import pdf_filler, pdf_field_maps
print(f"pdf_filler location: {pdf_filler.__file__}")
print(f"pdf_field_maps location: {pdf_field_maps.__file__}")

# Check which version of pdf_filler is loaded
has_exact = hasattr(pdf_filler, '_fill_fields_exact')
has_annot = hasattr(pdf_filler, '_get_full_field_name')
print(f"Has _fill_fields_exact: {has_exact}")
print(f"Has _get_full_field_name: {has_annot}")
print(f"Version: {'NEW (annotation walker)' if has_annot else 'OLD (fuzzy match)'}")

print("\n=== FIELD MAP CHECK ===")
m = pdf_field_maps.get_field_map("i765")
if m:
    print(f"I-765 map has {len(m)} fields")
    print(f"last_name -> {m.get('last_name')}")
else:
    print("NO I-765 MAP FOUND")

print("\n=== LIVE FILL TEST ===")
from pathlib import Path
answers = {"last_name":"Sahai","first_name":"Aryan","dob":"2000-03-07",
           "country_of_birth":"India","country_of_citizenship":"India",
           "address":"123 Main St","city":"Seattle","state":"WA","zip":"98101"}
questions = [{"id":"last_name","label":"Family name","required":True},
             {"id":"first_name","label":"Given name","required":True},
             {"id":"dob","label":"DOB","required":True},
             {"id":"address","label":"Address","required":True},
             {"id":"city","label":"City","required":True},
             {"id":"state","label":"State","required":True},
             {"id":"zip","label":"ZIP","required":True}]

out = Path("/tmp/debug_i765.pdf")
method = pdf_filler.generate_filled_pdf("i765","Form I-765","USCIS",answers,questions,out)
print(f"Method: {method}")
print(f"Size: {out.stat().st_size} bytes")
print(f"\nRun: open /tmp/debug_i765.pdf")
PYEOF