/**
 * useSEO — sets <title>, <meta>, <link rel="canonical">, and JSON-LD <script>
 * for every page. Call once per page component.
 *
 * Usage:
 *   useSEO({ title, description, canonical, schema })
 */

const BASE_URL = "https://www.doculyft.com";
const DEFAULT_DESC =
  "DocuLyft fills U.S. government forms for you using AI. Describe your situation, review the pre-filled PDF, and submit through official channels. Free to use.";
const DEFAULT_OG_IMG = `${BASE_URL}/og-image.png`;

export function useSEO({ title, description, canonical, schema, ogType = "website" } = {}) {
  const fullTitle = title ? `${title} | DocuLyft` : "Fill Government Forms Online — AI Form Filler | DocuLyft";
  const desc = description || DEFAULT_DESC;
  const canon = canonical ? `${BASE_URL}${canonical}` : null;

  // ── <title> ────────────────────────────────────────────────────────────
  document.title = fullTitle;

  // ── helper: upsert <meta> ──────────────────────────────────────────────
  function setMeta(attr, attrVal, content) {
    let el = document.querySelector(`meta[${attr}="${attrVal}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, attrVal);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  // ── helper: upsert <link> ──────────────────────────────────────────────
  function setLink(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  }

  // ── helper: upsert JSON-LD ─────────────────────────────────────────────
  function setSchema(data) {
    const id = "doculyft-jsonld";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  // ── Standard meta ─────────────────────────────────────────────────────
  setMeta("name", "description", desc);
  setMeta("name", "robots", "index, follow");

  // ── Open Graph ─────────────────────────────────────────────────────────
  setMeta("property", "og:title",       fullTitle);
  setMeta("property", "og:description", desc);
  setMeta("property", "og:type",        ogType);
  setMeta("property", "og:image",       DEFAULT_OG_IMG);
  setMeta("property", "og:image:width", "1200");
  setMeta("property", "og:image:height","630");
  setMeta("property", "og:site_name",   "DocuLyft");
  if (canon) setMeta("property", "og:url", canon);

  // ── Twitter Card ───────────────────────────────────────────────────────
  setMeta("name", "twitter:card",        "summary_large_image");
  setMeta("name", "twitter:title",       fullTitle);
  setMeta("name", "twitter:description", desc);
  setMeta("name", "twitter:image",       DEFAULT_OG_IMG);

  // ── Canonical ─────────────────────────────────────────────────────────
  if (canon) setLink("canonical", canon);

  // ── JSON-LD ────────────────────────────────────────────────────────────
  if (schema) {
    setSchema(schema);
  }
}

// ── Pre-built schema helpers ───────────────────────────────────────────────

export const SITE_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://www.doculyft.com/#app",
      "name": "DocuLyft",
      "url": "https://www.doculyft.com",
      "description":
        "AI-powered U.S. government form filling service. Fill W-9, I-485, DS-11, Form 1040, and 24+ official government forms with AI pre-fill. Free helper packets, no SSN required.",
      "applicationCategory": "DocumentManagement",
      "operatingSystem": "Web Browser",
      "browserRequirements": "Requires JavaScript",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free AI-assisted form filling"
      },
      "featureList": [
        "AI pre-fills form fields from plain-English description",
        "28+ official U.S. government forms",
        "Download filled PDF instantly",
        "No SSN or payment required for pre-fill",
        "IRS, USCIS, State Department, SSA, VA, USPS forms"
      ]
    },
    {
      "@type": "Organization",
      "@id": "https://www.doculyft.com/#org",
      "name": "DocuLyft",
      "url": "https://www.doculyft.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.doculyft.com/favicon.svg"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@doculyft.com"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://www.doculyft.com/#website",
      "url": "https://www.doculyft.com",
      "name": "DocuLyft",
      "description": "AI-powered government form filling",
      "publisher": { "@id": "https://www.doculyft.com/#org" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.doculyft.com/?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ]
};

export function formSchema(form) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `https://www.doculyft.com/form/${form.form_id}`,
        "name": `Fill ${form.short_name} Online — AI Pre-Fill`,
        "description": form.description,
        "url": `https://www.doculyft.com/form/${form.form_id}`,
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home",       "item": "https://www.doculyft.com/" },
            { "@type": "ListItem", "position": 2, "name": form.category_label || form.category, "item": `https://www.doculyft.com/category/${form.category}` },
            { "@type": "ListItem", "position": 3, "name": form.short_name }
          ]
        }
      },
      {
        "@type": "HowTo",
        "name": `How to Fill ${form.short_name} (${form.form_name})`,
        "description": `Step-by-step guide to filling ${form.short_name} with AI assistance on DocuLyft.`,
        "totalTime": "PT5M",
        "tool": { "@type": "HowToTool", "name": "DocuLyft AI Form Filler" },
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Open the form",
            "text": `Navigate to the ${form.short_name} page on DocuLyft and click "Fill out with AI".`
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Provide your information",
            "text": "Upload a document or type your details. The AI reads your input and pre-fills every field it can."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Review pre-filled fields",
            "text": "Check each pre-filled field against the official form shown on the right. Edit any errors and add sensitive info like SSN by hand."
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Download your PDF",
            "text": "Click 'Generate filled PDF'. Download and submit through the official agency channel — DocuLyft never submits on your behalf."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What is ${form.short_name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${form.form_name}. ${form.description}`
            }
          },
          {
            "@type": "Question",
            "name": `Who needs to fill out ${form.short_name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `${form.short_name} is issued by ${form.agency}. ${form.description} Use DocuLyft to pre-fill the form with AI and download a filled PDF for review.`
            }
          },
          {
            "@type": "Question",
            "name": "Is DocuLyft free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. DocuLyft is free. You can fill, review, and download your form as a PDF at no cost. DocuLyft never submits forms on your behalf."
            }
          },
          {
            "@type": "Question",
            "name": "Does DocuLyft store my SSN or personal data?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. DocuLyft never asks for, stores, or transmits your Social Security Number, EIN, payment details, or government ID. Sensitive fields are filled by you directly on the downloaded PDF."
            }
          }
        ]
      }
    ]
  };
}

export function categorySchema(category, forms) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.label} Forms — Fill Online with AI`,
    "description": category.description,
    "url": `https://www.doculyft.com/category/${category.id}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home",   "item": "https://www.doculyft.com/" },
        { "@type": "ListItem", "position": 2, "name": category.label }
      ]
    },
    "hasPart": forms.map(f => ({
      "@type": "WebPage",
      "name": f.short_name,
      "url": `https://www.doculyft.com/form/${f.form_id}`
    }))
  };
}