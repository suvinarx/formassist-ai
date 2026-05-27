#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  FormAssist AI — Official Government Form Downloader
#  Run this from your formassist-ai/ root directory:
#    bash download_forms.sh
#
#  All forms come from official .gov sources (IRS, USCIS, SSA etc.)
#  They are public domain and free to host and display.
#  Downloads into: frontend/public/forms/<category>/
# ═══════════════════════════════════════════════════════════════════

set -e
DEST="frontend/public/forms"
mkdir -p "$DEST"/{tax,immigration,passport,social-security,healthcare,veterans,employment,moving,legal}

ok=0; fail=0

get() {
  local url="$1" out="$2"
  if curl -sfL --max-time 30 \
       -A "Mozilla/5.0 (compatible; FormAssistBot/1.0)" \
       "$url" -o "$out"; then
    # Verify it's actually a PDF (starts with %PDF)
    if file "$out" 2>/dev/null | grep -q "PDF\|pdf"; then
      echo "  ✓ $(basename $out)"
      ok=$((ok+1))
    else
      rm -f "$out"
      echo "  ✗ $(basename $out) — not a PDF (URL may have changed)"
      fail=$((fail+1))
    fi
  else
    echo "  ✗ $(basename $out) — download failed"
    fail=$((fail+1))
  fi
}

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  FormAssist AI — Government Form Downloader"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── IRS TAX FORMS ─────────────────────────────────────────────────
echo "📋 IRS Tax Forms"
get "https://www.irs.gov/pub/irs-pdf/fw9.pdf"      "$DEST/tax/w9.pdf"
get "https://www.irs.gov/pub/irs-pdf/fw4.pdf"      "$DEST/tax/w4.pdf"
get "https://www.irs.gov/pub/irs-pdf/fw2.pdf"      "$DEST/tax/w2.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040.pdf"    "$DEST/tax/1040.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040x.pdf"   "$DEST/tax/1040x.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040es.pdf"  "$DEST/tax/1040es.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040s1.pdf"  "$DEST/tax/1040s1.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040s2.pdf"  "$DEST/tax/1040s2.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040sr.pdf"  "$DEST/tax/1040sr.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1099nec.pdf" "$DEST/tax/1099nec.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1099msc.pdf" "$DEST/tax/1099misc.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1099int.pdf" "$DEST/tax/1099int.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1099div.pdf" "$DEST/tax/1099div.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1099r.pdf"   "$DEST/tax/1099r.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1099g.pdf"   "$DEST/tax/1099g.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1096.pdf"    "$DEST/tax/1096.pdf"
get "https://www.irs.gov/pub/irs-pdf/f4506t.pdf"   "$DEST/tax/4506t.pdf"
get "https://www.irs.gov/pub/irs-pdf/f4506.pdf"    "$DEST/tax/4506.pdf"
get "https://www.irs.gov/pub/irs-pdf/f8822.pdf"    "$DEST/tax/8822.pdf"
get "https://www.irs.gov/pub/irs-pdf/f8822b.pdf"   "$DEST/tax/8822b.pdf"
get "https://www.irs.gov/pub/irs-pdf/f8962.pdf"    "$DEST/tax/8962.pdf"
get "https://www.irs.gov/pub/irs-pdf/f8889.pdf"    "$DEST/tax/8889.pdf"
get "https://www.irs.gov/pub/irs-pdf/f8949.pdf"    "$DEST/tax/8949.pdf"
get "https://www.irs.gov/pub/irs-pdf/f8960.pdf"    "$DEST/tax/8960.pdf"
get "https://www.irs.gov/pub/irs-pdf/f5695.pdf"    "$DEST/tax/5695.pdf"
get "https://www.irs.gov/pub/irs-pdf/f5329.pdf"    "$DEST/tax/5329.pdf"
get "https://www.irs.gov/pub/irs-pdf/f941.pdf"     "$DEST/tax/941.pdf"
get "https://www.irs.gov/pub/irs-pdf/f944.pdf"     "$DEST/tax/944.pdf"
get "https://www.irs.gov/pub/irs-pdf/f940.pdf"     "$DEST/tax/940.pdf"
get "https://www.irs.gov/pub/irs-pdf/f4868.pdf"    "$DEST/tax/4868.pdf"
get "https://www.irs.gov/pub/irs-pdf/f2210.pdf"    "$DEST/tax/2210.pdf"
get "https://www.irs.gov/pub/irs-pdf/f2441.pdf"    "$DEST/tax/2441.pdf"
get "https://www.irs.gov/pub/irs-pdf/f3800.pdf"    "$DEST/tax/3800.pdf"
get "https://www.irs.gov/pub/irs-pdf/fss4.pdf"     "$DEST/tax/ss4.pdf"
get "https://www.irs.gov/pub/irs-pdf/fw7.pdf"      "$DEST/tax/w7.pdf"
get "https://www.irs.gov/pub/irs-pdf/fw8ben.pdf"   "$DEST/tax/w8ben.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1095a.pdf"   "$DEST/tax/1095a.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1095b.pdf"   "$DEST/tax/1095b.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1095c.pdf"   "$DEST/tax/1095c.pdf"
get "https://www.irs.gov/pub/irs-pdf/f6251.pdf"    "$DEST/tax/6251.pdf"
get "https://www.irs.gov/pub/irs-pdf/f8606.pdf"    "$DEST/tax/8606.pdf"
get "https://www.irs.gov/pub/irs-pdf/f8829.pdf"    "$DEST/tax/8829.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040sa.pdf"  "$DEST/tax/schedA.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040sb.pdf"  "$DEST/tax/schedB.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040sc.pdf"  "$DEST/tax/schedC.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040sd.pdf"  "$DEST/tax/schedD.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040sse.pdf" "$DEST/tax/schedE.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1040ssf.pdf" "$DEST/tax/schedF.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1120.pdf"    "$DEST/tax/1120.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1120s.pdf"   "$DEST/tax/1120s.pdf"
get "https://www.irs.gov/pub/irs-pdf/f1065.pdf"    "$DEST/tax/1065.pdf"
get "https://www.irs.gov/pub/irs-pdf/f709.pdf"     "$DEST/tax/709.pdf"
get "https://www.irs.gov/pub/irs-pdf/f706.pdf"     "$DEST/tax/706.pdf"
get "https://www.irs.gov/pub/irs-pdf/f2290.pdf"    "$DEST/tax/2290.pdf"
get "https://www.irs.gov/pub/irs-pdf/f720.pdf"     "$DEST/tax/720.pdf"

echo ""
echo "🌐 USCIS Immigration Forms"
get "https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf"         "$DEST/immigration/i9.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-90.pdf"        "$DEST/immigration/i90.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-130.pdf"       "$DEST/immigration/i130.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-131.pdf"       "$DEST/immigration/i131.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-485.pdf"       "$DEST/immigration/i485.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-765.pdf"       "$DEST/immigration/i765.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-864.pdf"       "$DEST/immigration/i864.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-821d.pdf"      "$DEST/immigration/i821d.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/n-400.pdf"       "$DEST/immigration/n400.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/n-600.pdf"       "$DEST/immigration/n600.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-140.pdf"       "$DEST/immigration/i140.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-589.pdf"       "$DEST/immigration/i589.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-693.pdf"       "$DEST/immigration/i693.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-751.pdf"       "$DEST/immigration/i751.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-539.pdf"       "$DEST/immigration/i539.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-129f.pdf"      "$DEST/immigration/i129f.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-20.pdf"        "$DEST/immigration/i20.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-918.pdf"       "$DEST/immigration/i918.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-601.pdf"       "$DEST/immigration/i601.pdf"
get "https://www.uscis.gov/sites/default/files/document/forms/i-612.pdf"       "$DEST/immigration/i612.pdf"

echo ""
echo "🛂 State Dept Passport Forms"
get "https://eforms.state.gov/Forms/ds11.pdf"    "$DEST/passport/ds11.pdf"
get "https://eforms.state.gov/Forms/ds82.pdf"    "$DEST/passport/ds82.pdf"
get "https://eforms.state.gov/Forms/ds64.pdf"    "$DEST/passport/ds64.pdf"
get "https://eforms.state.gov/Forms/ds5504.pdf"  "$DEST/passport/ds5504.pdf"
get "https://eforms.state.gov/Forms/ds3053.pdf"  "$DEST/passport/ds3053.pdf"

echo ""
echo "🏛️  Social Security Administration"
get "https://www.ssa.gov/forms/ss-5.pdf"         "$DEST/social-security/ss5.pdf"
get "https://www.ssa.gov/forms/ssa-44.pdf"       "$DEST/social-security/ssa44.pdf"
get "https://www.ssa.gov/forms/ssa-827.pdf"      "$DEST/social-security/ssa827.pdf"
get "https://www.ssa.gov/forms/ssa-1.pdf"        "$DEST/social-security/ssa1.pdf"
get "https://www.ssa.gov/forms/ssa-3368.pdf"     "$DEST/social-security/ssa3368.pdf"
get "https://www.ssa.gov/forms/ssa-454bk.pdf"    "$DEST/social-security/ssa454bk.pdf"
get "https://www.ssa.gov/forms/ssa-7050-f4.pdf"  "$DEST/social-security/ssa7050.pdf"
get "https://www.ssa.gov/forms/ssa-16.pdf"       "$DEST/social-security/ssa16.pdf"
get "https://www.ssa.gov/forms/ssa-10.pdf"       "$DEST/social-security/ssa10.pdf"
get "https://www.ssa.gov/forms/ssa-2.pdf"        "$DEST/social-security/ssa2.pdf"
get "https://www.ssa.gov/forms/ssa-1724.pdf"     "$DEST/social-security/ssa1724.pdf"
get "https://www.ssa.gov/forms/ssa-8.pdf"        "$DEST/social-security/ssa8.pdf"

echo ""
echo "🏥 CMS / Medicare / Healthcare"
get "https://www.cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms40b.pdf"     "$DEST/healthcare/cms40b.pdf"
get "https://www.cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms-l564.pdf"   "$DEST/healthcare/cmsl564.pdf"
get "https://www.cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms10114.pdf"   "$DEST/healthcare/cms10114.pdf"
get "https://www.cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms1490s.pdf"   "$DEST/healthcare/cms1490s.pdf"
get "https://www.cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms20027.pdf"   "$DEST/healthcare/cms20027.pdf"
get "https://www.cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms10182.pdf"   "$DEST/healthcare/cms10182.pdf"
get "https://www.cms.gov/Medicare/CMS-Forms/CMS-Forms/downloads/cms1763.pdf"    "$DEST/healthcare/cms1763.pdf"

echo ""
echo "🎖️  Veterans Affairs"
get "https://www.vba.va.gov/pubs/forms/VBA-21-4142-ARE.pdf"   "$DEST/veterans/va4142.pdf"
get "https://www.vba.va.gov/pubs/forms/VBA-21P-530-ARE.pdf"   "$DEST/veterans/va530.pdf"
get "https://www.vba.va.gov/pubs/forms/VBA-22-1990-ARE.pdf"   "$DEST/veterans/va1990.pdf"
get "https://www.vba.va.gov/pubs/forms/VBA-21-526EZ-ARE.pdf"  "$DEST/veterans/va526ez.pdf"
get "https://www.vba.va.gov/pubs/forms/VBA-21-0781-ARE.pdf"   "$DEST/veterans/va0781.pdf"
get "https://www.vba.va.gov/pubs/forms/VBA-21-4142a-ARE.pdf"  "$DEST/veterans/va4142a.pdf"
get "https://www.vba.va.gov/pubs/forms/VBA-21-686c-ARE.pdf"   "$DEST/veterans/va686c.pdf"

echo ""
echo "📬 USPS"
get "https://about.usps.com/forms/ps3575.pdf"   "$DEST/moving/ps3575.pdf"
get "https://about.usps.com/forms/ps1508.pdf"   "$DEST/moving/ps1508.pdf"

echo ""
echo "💼 Department of Labor / Employment"
get "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-380-E.pdf"  "$DEST/employment/wh380e.pdf"
get "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-380-F.pdf"  "$DEST/employment/wh380f.pdf"
get "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-381.pdf"    "$DEST/employment/wh381.pdf"
get "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-384.pdf"    "$DEST/employment/wh384.pdf"
get "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-385.pdf"    "$DEST/employment/wh385.pdf"
get "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-385-V.pdf"  "$DEST/employment/wh385v.pdf"
get "https://www.dol.gov/sites/dolgov/files/WHD/legacy/files/WH-382.pdf"    "$DEST/employment/wh382.pdf"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Results"
echo "═══════════════════════════════════════════════════════"
echo ""
for dir in "$DEST"/*/; do
  count=$(find "$dir" -name "*.pdf" 2>/dev/null | wc -l | tr -d ' ')
  name=$(basename "$dir")
  printf "  %-20s %3s PDFs\n" "$name" "$count"
done
echo ""
total=$(find "$DEST" -name "*.pdf" | wc -l | tr -d ' ')
echo "  TOTAL: $total PDFs downloaded"
echo ""
echo "  ✅ Serving at: /forms/<category>/<file>.pdf"
echo "  📝 Next step: run npm run build to include them in your deploy"
echo "═══════════════════════════════════════════════════════"