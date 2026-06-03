#!/usr/bin/env node
/**
 * indexnow.mjs — Pings Bing and Yandex via IndexNow after deployment
 * 
 * Run after deploy: node indexnow.mjs
 * Or add to your CI/CD pipeline post-deploy step.
 * 
 * Setup:
 * 1. Generate a key at https://www.bing.com/indexnow
 * 2. Save a file at frontend/public/<your-key>.txt with just the key as content
 * 3. Set INDEXNOW_KEY environment variable in Vercel dashboard
 */

const KEY      = process.env.INDEXNOW_KEY || "YOUR_INDEXNOW_KEY_HERE";
const BASE_URL = "https://www.doculyft.com";

const URLS = [
  "/",
  "/find-form",
  "/about",
  "/security",
  "/privacy",
  "/terms",
  // Categories
  "/category/tax",
  "/category/immigration",
  "/category/passport",
  "/category/benefits",
  "/category/healthcare",
  "/category/employment",
  "/category/veterans",
  "/category/moving",
  // Top forms
  "/form/w9",
  "/form/w4",
  "/form/w2",
  "/form/1040",
  "/form/1040x",
  "/form/1040es",
  "/form/1099nec",
  "/form/1099misc",
  "/form/4506t",
  "/form/8822",
  "/form/4868",
  "/form/schedA",
  "/form/schedC",
  "/form/i9",
  "/form/i130",
  "/form/i485",
  "/form/i765",
  "/form/n400",
  "/form/i864",
  "/form/i90",
  "/form/ds11",
  "/form/ds64",
  "/form/va526ez",
  "/form/va1990",
  "/form/va4142",
  "/form/ssa44",
  "/form/usps_change_of_address_helper",
  "/form/wh380e",
  "/form/wh381",
];

async function pingIndexNow() {
  const body = {
    host: "www.doculyft.com",
    key: KEY,
    keyLocation: `${BASE_URL}/${KEY}.txt`,
    urlList: URLS.map(u => `${BASE_URL}${u}`),
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
      });
      console.log(`${endpoint} → ${res.status} ${res.statusText}`);
    } catch (e) {
      console.error(`${endpoint} → ERROR: ${e.message}`);
    }
  }
}

pingIndexNow();