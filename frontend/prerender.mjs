/**
 * prerender.mjs — Static Site Generation for DocuLyft
 *
 * Runs after `vite build`. For every visible form and category page,
 * reads the built index.html and injects full SEO metadata (title, meta
 * description, canonical, og tags, JSON-LD schema) directly into the HTML
 * so Googlebot sees real content even without executing JavaScript.
 *
 * This does NOT replace React hydration — the React app still boots and
 * takes over client-side. It only ensures the initial HTML response is
 * meaningful to crawlers.
 *
 * Usage: node prerender.mjs  (called automatically by `npm run build`)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST      = path.join(__dirname, "dist");
const BASE_URL  = "https://www.doculyft.com";

// ── Load form data ──────────────────────────────────────────────────────────
// Parse forms directly from formsData.js (extract VISIBLE set + FORMS array)
const formsDataRaw = fs.readFileSync(
  path.join(__dirname, "src/data/formsData.js"), "utf8"
);

// Extract VISIBLE set
const visMatch = formsDataRaw.match(/const VISIBLE = new Set\(\[([\s\S]*?)\]\)/);
const visIds = new Set((visMatch?.[1] || "").match(/"([^"]+)"/g)?.map(s => s.replace(/"/g,"")));

// Extract form metadata: form_id, short_name, form_name, description, agency, category
const formEntries = [];
const formRegex = /form_id:\s*"([^"]+)"[\s\S]*?short_name:\s*"([^"]+)"[\s\S]*?form_name:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]+)"[\s\S]*?agency:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"/g;
let m;
while ((m = formRegex.exec(formsDataRaw)) !== null) {
  const [, form_id, short_name, form_name, description, agency, category] = m;
  if (visIds.has(form_id)) {
    formEntries.push({ form_id, short_name, form_name, description, agency, category });
  }
}

// Deduplicate
const seen = new Set();
const forms = formEntries.filter(f => { if (seen.has(f.form_id)) return false; seen.add(f.form_id); return true; });

// Category labels
const CATEGORY_LABELS = {
  tax: "Tax Forms", immigration: "Immigration Forms", passport: "Passport & Travel",
  benefits: "Benefits & Social Security", healthcare: "Healthcare & Medicare",
  employment: "Employment Forms", veterans: "Veterans Affairs",
  moving: "Moving & Address Change", vehicle: "Motor Vehicle", legal: "Legal Forms",
};

const CATEGORY_DESCS = {
  tax: "Fill IRS tax forms online with AI. W-9, Form 1040, W-4, 1099-NEC, Schedule A, Schedule C and more. Free, no SSN required.",
  immigration: "Fill USCIS immigration forms with AI. I-485, I-130, I-765, N-400, I-864, I-9 and more. Free pre-fill, download PDF.",
  passport: "Fill U.S. passport forms with AI. DS-11 new passport application, DS-64 lost passport. Download pre-filled PDF instantly.",
  benefits: "Fill Social Security and benefits forms with AI. SSA-44 Medicare income appeal and more. Free, no SSN required.",
  healthcare: "Fill Medicare and healthcare forms with AI. CMS-40B and more. Free AI pre-fill, download PDF.",
  employment: "Fill FMLA and employment forms with AI. WH-380-E, WH-381 and more. Free pre-fill.",
  veterans: "Fill VA forms with AI. VA 21-526EZ disability, VA 22-1990 GI Bill, VA 21-4142 authorization. Free, download PDF.",
  moving: "Fill USPS change of address form online with AI. PS Form 3575. Free, download PDF instantly.",
  vehicle: "Fill motor vehicle transfer forms with AI. Free pre-fill, download PDF.",
  legal: "Fill legal forms with AI. Free pre-fill, download PDF.",
};

console.log(`\n🚀 DocuLyft Prerender — ${forms.length} form pages + ${Object.keys(CATEGORY_LABELS).length} category pages\n`);

// ── Read base HTML ──────────────────────────────────────────────────────────
const baseHtml = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

// ── Helper: inject meta into HTML ──────────────────────────────────────────
function buildHtml({ title, description, canonical, schema, ogType = "website" }) {
  const fullTitle = `${title} | DocuLyft`;
  const ogUrl     = `${BASE_URL}${canonical}`;
  const ogImage   = `${BASE_URL}/og-image.png`;

  const metaBlock = `
    <title>${fullTitle}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${ogUrl}" />

    <meta property="og:type"         content="${ogType}" />
    <meta property="og:site_name"    content="DocuLyft" />
    <meta property="og:title"        content="${fullTitle}" />
    <meta property="og:description"  content="${description}" />
    <meta property="og:url"          content="${ogUrl}" />
    <meta property="og:image"        content="${ogImage}" />
    <meta property="og:image:width"  content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:title"       content="${fullTitle}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image"       content="${ogImage}" />

    ${schema ? `<script type="application/ld+json">${JSON.stringify(schema)}</script>` : ""}`;

  // Replace existing title + inject before </head>
  return baseHtml
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/<meta name="description"[^>]*>/, "")
    .replace("</head>", `${metaBlock}\n  </head>`);
}

function writeFile(urlPath, html) {
  // /form/w9  →  dist/form/w9/index.html
  const dir = path.join(DIST, urlPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

// ── 1. Form pages ───────────────────────────────────────────────────────────
for (const form of forms) {
  const catLabel = CATEGORY_LABELS[form.category] || form.category;
  const title    = `Fill ${form.short_name} Online Free — AI Pre-Fill`;
  const desc     = `${form.form_name}. ${form.description} Fill with AI on DocuLyft — free. Review the pre-filled PDF and submit through ${form.agency}'s official channel. No SSN required.`;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/form/${form.form_id}`,
        "name": title,
        "description": form.description,
        "url": `${BASE_URL}/form/${form.form_id}`,
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
            { "@type": "ListItem", "position": 2, "name": catLabel, "item": `${BASE_URL}/category/${form.category}` },
            { "@type": "ListItem", "position": 3, "name": form.short_name }
          ]
        }
      },
      {
        "@type": "HowTo",
        "name": `How to Fill ${form.short_name} (${form.form_name})`,
        "description": `AI-assisted guide to filling ${form.short_name} on DocuLyft. Free, takes under 5 minutes.`,
        "totalTime": "PT5M",
        "tool": { "@type": "HowToTool", "name": "DocuLyft AI Form Filler" },
        "step": [
          { "@type": "HowToStep", "position": 1, "name": "Open the form", "text": `Go to the ${form.short_name} page on DocuLyft and click "Fill out with AI".` },
          { "@type": "HowToStep", "position": 2, "name": "Describe your situation or upload a document", "text": "Type your details in plain English or upload an existing document. AI pre-fills every field it can." },
          { "@type": "HowToStep", "position": 3, "name": "Review all pre-filled fields", "text": "Check each field against the official form. Edit errors. Add sensitive info like SSN by hand." },
          { "@type": "HowToStep", "position": 4, "name": "Download and submit", "text": `Click "Generate filled PDF". Download and submit through ${form.agency}'s official channel.` }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is ${form.short_name}?`,
            "acceptedAnswer": { "@type": "Answer", "text": `${form.form_name}. ${form.description}` }
          },
          {
            "@type": "Question",
            "name": `Who needs to fill out ${form.short_name}?`,
            "acceptedAnswer": { "@type": "Answer", "text": `${form.short_name} is issued by ${form.agency}. ${form.description} Use DocuLyft to pre-fill it with AI for free.` }
          },
          {
            "@type": "Question",
            "name": "Is DocuLyft free?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. DocuLyft is completely free. Fill, review, and download your PDF at no cost." }
          },
          {
            "@type": "Question",
            "name": "Does DocuLyft store my SSN?",
            "acceptedAnswer": { "@type": "Answer", "text": "No. DocuLyft never asks for, stores, or transmits your Social Security Number or government ID numbers." }
          }
        ]
      }
    ]
  };

  const html = buildHtml({ title, description: desc, canonical: `/form/${form.form_id}`, schema, ogType: "article" });
  writeFile(`form/${form.form_id}`, html);
  process.stdout.write(`  ✓ /form/${form.form_id}\n`);
}

// ── 2. Category pages ────────────────────────────────────────────────────────
for (const [catId, catLabel] of Object.entries(CATEGORY_LABELS)) {
  const desc  = CATEGORY_DESCS[catId] || `Fill ${catLabel} online with AI. Free helper PDFs from official .gov sources. | DocuLyft`;
  const title = `${catLabel} — Fill Online Free with AI`;
  const catForms = forms.filter(f => f.category === catId);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${catLabel} — AI Form Filler`,
    "description": desc,
    "url": `${BASE_URL}/category/${catId}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": BASE_URL },
        { "@type": "ListItem", "position": 2, "name": catLabel }
      ]
    },
    "hasPart": catForms.map(f => ({
      "@type": "WebPage",
      "name": f.short_name,
      "description": f.description,
      "url": `${BASE_URL}/form/${f.form_id}`
    }))
  };

  const html = buildHtml({ title, description: desc, canonical: `/category/${catId}`, schema });
  writeFile(`category/${catId}`, html);
  process.stdout.write(`  ✓ /category/${catId}\n`);
}

// ── 3. Static pages ──────────────────────────────────────────────────────────
const staticPages = [
  {
    path: "find-form",
    title: "Find the Right Government Form — AI Form Finder",
    description: "Describe your situation in plain English and DocuLyft's AI identifies the right government forms for you. Free, instant, no SSN required.",
  },
  {
    path: "about",
    title: "About DocuLyft — AI Government Form Filler",
    description: "DocuLyft makes U.S. government forms accessible to everyone. Free AI pre-fill for IRS, USCIS, SSA, State Dept, VA and USPS forms.",
  },
  {
    path: "security",
    title: "Security & Privacy — How DocuLyft Protects Your Data",
    description: "DocuLyft never stores SSNs, payment data, or government IDs. All data encrypted in transit. Learn how we protect your information.",
  },
  {
    path: "privacy",
    title: "Privacy Policy",
    description: "DocuLyft Privacy Policy — how we handle your data, what we collect, and your GDPR/CCPA rights.",
  },
  {
    path: "terms",
    title: "Terms of Service",
    description: "DocuLyft Terms of Service — acceptable use, disclaimers, and your rights when using our AI form-filling service.",
  },
];

for (const page of staticPages) {
  const html = buildHtml({ title: page.title, description: page.description, canonical: `/${page.path}` });
  writeFile(page.path, html);
  process.stdout.write(`  ✓ /${page.path}\n`);
}

// ── 4. Homepage schema injection ─────────────────────────────────────────────
const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      "name": "DocuLyft",
      "url": BASE_URL,
      "description": "AI-powered U.S. government form filling. Free, no SSN required.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": `${BASE_URL}/find-form?q={search_term_string}` },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#org`,
      "name": "DocuLyft",
      "url": BASE_URL,
      "logo": { "@type": "ImageObject", "url": `${BASE_URL}/og-image.png` },
      "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "email": "support@doculyft.com" }
    },
    {
      "@type": "WebApplication",
      "@id": `${BASE_URL}/#app`,
      "name": "DocuLyft",
      "url": BASE_URL,
      "applicationCategory": "DocumentManagement",
      "operatingSystem": "Web Browser",
      "description": "AI-powered U.S. government form filling service. Fill W-9, I-485, Form 1040, DS-11, and 24+ official government forms with AI pre-fill.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "featureList": [
        "AI pre-fills form fields from plain-English description",
        "28+ official U.S. government forms from IRS, USCIS, SSA, State Dept, VA, USPS",
        "Download filled PDF instantly",
        "No SSN or payment required"
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Does DocuLyft officially submit forms on my behalf?",
          "acceptedAnswer": { "@type": "Answer", "text": "No. DocuLyft prepares a helper packet — a pre-filled PDF you review, complete, and submit yourself through the official agency channel." }
        },
        {
          "@type": "Question",
          "name": "What information does DocuLyft collect?",
          "acceptedAnswer": { "@type": "Answer", "text": "We only collect the situational details you type in. We never ask for your Social Security Number, payment card details, government ID, or signature." }
        },
        {
          "@type": "Question",
          "name": "Is DocuLyft free to use?",
          "acceptedAnswer": { "@type": "Answer", "text": "Yes. DocuLyft is completely free. Fill, review, and download your form PDF at no cost." }
        },
        {
          "@type": "Question",
          "name": "How accurate is the AI pre-fill?",
          "acceptedAnswer": { "@type": "Answer", "text": "The AI extracts information directly from your situation description and is highly accurate for standard details like names, addresses, and dates. Always review every field before submitting." }
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to Fill a Government Form with DocuLyft",
      "description": "Step-by-step guide to filling any U.S. government form using DocuLyft's AI.",
      "totalTime": "PT5M",
      "step": [
        { "@type": "HowToStep", "position": 1, "name": "Describe your situation", "text": "Type what you need in plain English — no legal jargon. Or browse 28 official forms by category." },
        { "@type": "HowToStep", "position": 2, "name": "AI fills the form", "text": "Our AI reads your description and pre-fills every field it can from your details." },
        { "@type": "HowToStep", "position": 3, "name": "Review every field", "text": "Check the pre-filled form. Edit anything incorrect. Add sensitive info like SSN by hand." },
        { "@type": "HowToStep", "position": 4, "name": "Download and submit officially", "text": "Download your packet as a PDF. Submit through the official agency channel — we never submit for you." }
      ]
    }
  ]
};

// Inject schema into homepage index.html
const homepageHtml = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const homepageWithSchema = homepageHtml.replace(
  "</head>",
  `  <script type="application/ld+json">${JSON.stringify(homepageSchema)}</script>\n  </head>`
);
fs.writeFileSync(path.join(DIST, "index.html"), homepageWithSchema);
console.log("  ✓ / (homepage schema injected)");

console.log(`\n✅ Prerender complete — ${forms.length + Object.keys(CATEGORY_LABELS).length + staticPages.length + 1} pages\n`);