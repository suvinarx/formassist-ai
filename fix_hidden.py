#!/usr/bin/env python3
"""
Run this from your formassist-ai/ directory:
  python3 fix_hidden.py

It directly edits your local formsData.js to hide all forms except w9.
"""
import re, os, sys

path = "frontend/src/data/formsData.js"

if not os.path.exists(path):
    print(f"ERROR: {path} not found. Run from formassist-ai/ directory.")
    sys.exit(1)

content = open(path).read()
original = content

# First remove ALL existing hidden:true flags to start fresh
content = content.replace(',hidden:true,', ',')
content = content.replace(',hidden:false,', ',')

# Now get all form_ids
all_ids = re.findall(r'form_id:"([^"]+)"', content)
print(f"Found {len(all_ids)} forms")

# Hide everything except w9
count = 0
for fid in all_ids:
    if fid == 'w9':
        continue
    old = f'form_id:"{fid}",'
    new = f'form_id:"{fid}",hidden:true,'
    if old in content:
        content = content.replace(old, new)
        count += 1

# Verify
hidden  = re.findall(r'form_id:"([^"]+)",hidden:true', content)
visible = [f for f in re.findall(r'form_id:"([^"]+)"', content) if f not in hidden]
print(f"Hidden: {len(hidden)}, Visible: {visible}")

if visible == ['w9']:
    open(path, 'w').write(content)
    print(f"\n✓ Fixed! Only w9 is visible now.")
    print("Run: bash run.sh")
else:
    print(f"\nERROR: unexpected visible forms: {visible}")