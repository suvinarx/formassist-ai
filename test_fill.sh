#!/bin/bash
source backend/venv/bin/activate
cd backend
python3 - << 'PYEOF'
import sys; sys.path.insert(0,'.')
from pdf_filler import generate_filled_pdf
from pathlib import Path

answers = {
    "last_name": "Sahai", "first_name": "Aryan", "middle_name": "",
    "dob": "2000-03-07", "country_of_birth": "India",
    "country_of_citizenship": "India", "ssn": "",
    "alien_number": "A123456789",
    "address": "123 Main Street", "city": "Seattle",
    "state": "WA", "zip": "98101",
    "phone": "206-555-1234", "email": "aryan@example.com",
    "eligibility_category": "(c)(9)",
}
questions = [
    {"id":"last_name","label":"Family name","required":True},
    {"id":"first_name","label":"Given name","required":True},
    {"id":"dob","label":"Date of birth","required":True},
    {"id":"country_of_birth","label":"Country of birth","required":True},
    {"id":"country_of_citizenship","label":"Country of citizenship","required":True},
    {"id":"alien_number","label":"Alien number","required":False},
    {"id":"address","label":"Address","required":True},
    {"id":"city","label":"City","required":True},
    {"id":"state","label":"State","required":True},
    {"id":"zip","label":"ZIP","required":True},
    {"id":"phone","label":"Phone","required":False},
    {"id":"email","label":"Email","required":False},
    {"id":"eligibility_category","label":"Eligibility category","required":True},
]
out = Path("/tmp/i765_test.pdf")
method = generate_filled_pdf("i765","Form I-765","USCIS", answers, questions, out)
print(f"\nMethod: {method}")
print(f"Size: {out.stat().st_size} bytes")
print(f"\nOpen to verify: open /tmp/i765_test.pdf")
PYEOF