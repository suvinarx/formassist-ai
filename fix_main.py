import re, sys

path = 'backend/main.py'
content = open(path).read()

old_func = re.search(
    r'@app\.post\("/api/generate-pdf"\)\ndef generate_pdf.*?(?=\n@app\.)',
    content, re.DOTALL
)
if not old_func:
    print("ERROR: Could not find generate_pdf function")
    sys.exit(1)

new_func = '@app.post("/api/generate-pdf")\ndef generate_pdf(request: PdfRequest):\n    filename = f"{request.form_id}_{uuid.uuid4().hex[:8]}.pdf"\n    out_path = PDF_DIR / filename\n    method = generate_filled_pdf(\n        form_id=request.form_id,\n        form_name=request.form_name,\n        agency=request.agency,\n        answers=request.answers,\n        questions=request.questions,\n        output_path=out_path,\n    )\n    print(f"[generate-pdf] {method} -> {filename}")\n    return {"download_url": f"/api/download/{filename}", "method": method}\n\n'

content = content.replace(old_func.group(), new_func)
open(path, 'w').write(content)
print("Fixed generate_pdf function")

remaining = [l for l in content.split('\n') 
             if any(x in l for x in ['OVERLAY_AVAILABLE','try_acroform','official_path','get_pdf_path','overlay_data','get_coordinates'])]
if remaining:
    print("WARNING - still has old references:")
    for l in remaining: print(f"  {l.strip()}")
else:
    print("Clean - no old references")