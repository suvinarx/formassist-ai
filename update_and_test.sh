#!/bin/bash
# Run from formassist-ai/ directory
# This script replaces the backend files and tests the fill

echo "=== Checking current pdf_filler version ==="
grep -c "_get_full_field_name\|_fill_fields_exact" backend/pdf_filler.py 2>/dev/null && echo "✓ NEW version detected" || echo "✗ OLD version — need to replace"

echo ""
echo "=== Testing W-9 fill ==="
source backend/venv/bin/activate
cd backend
python3 - << 'PYEOF'
import sys, traceback
sys.path.insert(0, '.')

# Test that imports work
try:
    from pdf_filler import generate_filled_pdf
    from pdf_field_maps import get_field_map
    print("✓ Imports OK")
except Exception as e:
    print(f"✗ Import error: {e}")
    traceback.print_exc()
    sys.exit(1)

# Check field map exists for W-9
m = get_field_map("w9")
print(f"✓ W-9 field map: {len(m)} fields" if m else "✗ W-9 map missing")

m = get_field_map("i765")
print(f"✓ I-765 field map: {len(m)} fields" if m else "✗ I-765 map missing")

# Test actual fill
from pathlib import Path
answers = {
    "full_legal_name": "Aryan Sahai",
    "business_name": "",
    "address": "123 Main St",
    "city_state_zip": "Seattle, WA 98101",
    "tin_ssn": "",
    "tin_ein": "",
}
questions = [
    {"id":"full_legal_name","label":"Full legal name","required":True},
    {"id":"business_name","label":"Business name","required":False},
    {"id":"address","label":"Address","required":True},
    {"id":"city_state_zip","label":"City state zip","required":True},
]
out = Path("/tmp/w9_test.pdf")
method = generate_filled_pdf("w9", "Form W-9", "IRS", answers, questions, out)
print(f"✓ W-9 method: {method}, size: {out.stat().st_size} bytes")
if method == "exact":
    print("✓✓ EXACT FILL WORKING — data goes into real form fields")
else:
    print(f"⚠ Using fallback: {method}")
print("")
print("Open to check: open /tmp/w9_test.pdf")
PYEOF