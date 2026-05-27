"""
Exact AcroForm field name mappings derived from check_fields.sh output.
question_id -> exact PDF field name
"""

# ── I-765 Employment Authorization ───────────────────────────────────────────
# Page1: name fields
# Page2: address, SSN, alien number, country
# Page3: DOB, entry info, travel doc
# Page4: applicant signature, phone, email
I765 = {
    "last_name":               "form1[0].Page1[0].Line1a_FamilyName[0]",
    "first_name":              "form1[0].Page1[0].Line1b_GivenName[0]",
    "middle_name":             "form1[0].Page1[0].Line1c_MiddleName[0]",
    # Part 2: Physical address
    "address":                 "form1[0].Page2[0].Pt2Line7_StreetNumberName[0]",
    "apt_number":              "form1[0].Page2[0].Pt2Line7_AptSteFlrNumber[0]",
    "city":                    "form1[0].Page2[0].Pt2Line7_CityOrTown[0]",
    "state":                   "form1[0].Page2[0].Pt2Line7_State[0]",
    "zip":                     "form1[0].Page2[0].Pt2Line7_ZipCode[0]",
    # SSN and alien number
    "ssn":                     "form1[0].Page2[0].Line12b_SSN[0]",
    "alien_number":            "form1[0].Page2[0].Line7_AlienNumber[0]",
    # Country of birth (Page2 = country of citizenship, Page3 = birth)
    "country_of_citizenship":  "form1[0].Page2[0].Line17b_CountryOfBirth[0]",
    "country_of_birth":        "form1[0].Page3[0].Line18c_CountryOfBirth[0]",
    # DOB and entry info on Page3
    "dob":                     "form1[0].Page3[0].Line19_DOB[0]",
    "last_entry_date":         "form1[0].Page3[0].Line21_DateOfLastEntry[0]",
    "last_entry_status":       "form1[0].Page3[0].Line23_StatusLastEntry[0]",
    "current_status":          "form1[0].Page3[0].Line24_CurrentStatus[0]",
    # Contact (Page4)
    "phone":                   "form1[0].Page4[0].Pt3Line3_DaytimePhoneNumber1[0]",
    "email":                   "form1[0].Page4[0].Pt3Line5_Email[0]",
    # Eligibility category code
    "eligibility_category":    "form1[0].Page2[0].Line8_ElisAccountNumber[0]",
    # Prior EAD
    "prior_ead_number":        "form1[0].Page2[0].Line17a_CountryOfBirth[0]",  # best available
}

# ── W-9 ──────────────────────────────────────────────────────────────────────
# f1_01=Name, f1_02=Business name
# f1_05=Exemption payee code, f1_06=FATCA code
# f1_07=Street address, f1_08=City/state/zip
# f1_09=Account numbers, f1_10=Requester name/addr
# f1_11,f1_12,f1_13 = SSN parts (XXX-XX-XXXX split by dashes)
# f1_14,f1_15 = EIN parts
W9 = {
    "full_legal_name":            "topmostSubform[0].Page1[0].f1_01[0]",
    "business_name":              "topmostSubform[0].Page1[0].f1_02[0]",
    "exemption_payee_code":       "topmostSubform[0].Page1[0].f1_05[0]",
    "exemption_fatca_code":       "topmostSubform[0].Page1[0].f1_06[0]",
    "address":                    "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_07[0]",
    "city_state_zip":             "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_08[0]",
    "account_numbers":            "topmostSubform[0].Page1[0].f1_09[0]",
    "requester_name_address":     "topmostSubform[0].Page1[0].f1_10[0]",
    # SSN — we put the whole thing in the first box
    "tin_ssn":                    "topmostSubform[0].Page1[0].f1_11[0]",
    # EIN
    "tin_ein":                    "topmostSubform[0].Page1[0].f1_14[0]",
}

# ── W-4 ──────────────────────────────────────────────────────────────────────
# Step1a: f1_01=first+middle, f1_02=last, f1_03=address, f1_04=city/state/zip
# f1_05=SSN
# Filing status: c1_1[0]=Single/MFS, c1_1[1]=MFJ, c1_1[2]=HOH
# Step3: f1_06=qualifying children amt, f1_07=other dependents amt
# f1_08=other income, f1_09=deductions, f1_10=extra withholding
# Employer section: f1_11=employer name+addr, f1_12=first date, f1_13=EIN
W4 = {
    "first_name_middle":          "topmostSubform[0].Page1[0].Step1a[0].f1_01[0]",
    "last_name":                  "topmostSubform[0].Page1[0].Step1a[0].f1_02[0]",
    "address":                    "topmostSubform[0].Page1[0].Step1a[0].f1_03[0]",
    "city_state_zip":             "topmostSubform[0].Page1[0].Step1a[0].f1_04[0]",
    "ssn":                        "topmostSubform[0].Page1[0].f1_05[0]",
    "dependents_amount":          "topmostSubform[0].Page1[0].Step3_ReadOrder[0].f1_06[0]",
    "other_income":               "topmostSubform[0].Page1[0].f1_08[0]",
    "deductions":                 "topmostSubform[0].Page1[0].f1_09[0]",
    "extra_withholding":          "topmostSubform[0].Page1[0].f1_10[0]",
    "employer_name":              "topmostSubform[0].Page1[0].f1_11[0]",
    "first_date_of_employment":   "topmostSubform[0].Page1[0].f1_12[0]",
    "employer_ein":               "topmostSubform[0].Page1[0].f1_13[0]",
}
# Filing status checkbox mapping
W4_FILING_STATUS = {
    "Single or Married filing separately":                   "topmostSubform[0].Page1[0].c1_1[0]",
    "Married filing jointly or Qualifying surviving spouse": "topmostSubform[0].Page1[0].c1_1[1]",
    "Head of household":                                     "topmostSubform[0].Page1[0].c1_1[2]",
}

# ── Form 1040 ─────────────────────────────────────────────────────────────────
# Page1:
#   f1_01=your first+middle, f1_02=your last, f1_03=your SSN
#   f1_04=spouse first+middle, f1_05=spouse last, f1_06=spouse SSN
#   Address: f1_20=street, f1_21=apt, f1_22=city, f1_23=state, f1_24=zip, f1_25=foreign country
#   f1_47=wages/salaries (line 1a), f1_48=tax-exempt interest, f1_49=taxable interest
#   f1_50=qualified divs, f1_51=ordinary divs
#   f1_52=IRA distributions, f1_53=taxable IRA
#   f1_54=pensions, f1_55=taxable pensions
#   f1_56=SS benefits, f1_57=taxable SS
# Page2:
#   f2_01=federal tax withheld (line 25a)
#   f2_22=SSN (second occurrence for signature section)
F1040 = {
    "first_name":               "topmostSubform[0].Page1[0].f1_01[0]",
    "last_name":                "topmostSubform[0].Page1[0].f1_02[0]",
    "ssn":                      "topmostSubform[0].Page1[0].f1_03[0]",
    "spouse_first_name":        "topmostSubform[0].Page1[0].f1_04[0]",
    "spouse_last_name":         "topmostSubform[0].Page1[0].f1_05[0]",
    "spouse_ssn":               "topmostSubform[0].Page1[0].f1_06[0]",
    "home_address":             "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_20[0]",
    "apt_no":                   "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_21[0]",
    "city_town":                "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_22[0]",
    "state":                    "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_23[0]",
    "zip":                      "topmostSubform[0].Page1[0].Address_ReadOrder[0].f1_24[0]",
    "wages_salaries":           "topmostSubform[0].Page1[0].f1_47[0]",
    "taxable_interest":         "topmostSubform[0].Page1[0].f1_49[0]",
    "ordinary_dividends":       "topmostSubform[0].Page1[0].f1_51[0]",
    "qualified_dividends":      "topmostSubform[0].Page1[0].f1_50[0]",
    "ira_distributions":        "topmostSubform[0].Page1[0].f1_53[0]",
    "pensions_annuities":       "topmostSubform[0].Page1[0].f1_55[0]",
    "social_security":          "topmostSubform[0].Page1[0].f1_57[0]",
    "capital_gain_loss":        "topmostSubform[0].Page1[0].f1_58[0]",
    "federal_tax_withheld":     "topmostSubform[0].Page2[0].f2_01[0]",
    "routing_number":           "topmostSubform[0].Page2[0].RoutingNo[0].f2_32[0]",
    "account_number":           "topmostSubform[0].Page2[0].AccountNo[0].f2_33[0]",
}

# ── I-9 Employment Eligibility ────────────────────────────────────────────────
I9 = {
    "last_name":            "Last Name Family Name from Section 1",
    "first_name":           "First Name Given Name from Section 1",
    "middle_initial":       "Middle initial if any from Section 1",
    "other_last_names":     "Employee Other Last Names Used (if any)",
}

# ── Master lookup ─────────────────────────────────────────────────────────────
FORM_FIELD_MAPS = {
    "i765": I765,
    "w9":   W9,
    "w4":   W4,
    "1040": F1040,
    "i9":   I9,
}

def get_field_map(form_id):
    return FORM_FIELD_MAPS.get(form_id)