#!/usr/bin/env node
/**
 * Verifica CORS reale (preflight OPTIONS) contro un'istanza pubblica.
 *
 * Uso:
 *   npm run smoke:cors
 *   SMOKE_API_URL=https://... SMOKE_ORIGIN=https://... npm run smoke:cors
 *
 * Fallisce se manca Access-Control-Allow-Origin uguale all'origine richiesta
 * (tipico quando su Render CORS_ORIGIN non coincide col frontend).
 */

const api = (
  process.env.SMOKE_API_URL || "https://soli-dm-be.onrender.com"
).replace(/\/$/, "");
const origin = process.env.SMOKE_ORIGIN || "https://soli-dm-fe.vercel.app";

function fail(msg) {
  console.error("smoke:cors FAIL:", msg);
  process.exit(1);
}

const pre = await fetch(`${api}/api/campaigns`, {
  method: "OPTIONS",
  headers: {
    Origin: origin,
    "Access-Control-Request-Method": "GET",
    "Access-Control-Request-Headers": "content-type",
  },
});

const acao = pre.headers.get("access-control-allow-origin");
const acc = pre.headers.get("access-control-allow-credentials");

if (acao !== origin) {
  let body = "";
  try {
    body = (await pre.text()).slice(0, 200);
  } catch {
    /* ignore */
  }
  fail(
    `OPTIONS /api/campaigns status=${pre.status}, access-control-allow-origin=${JSON.stringify(acao)} (atteso esattamente ${origin}). ` +
      `Su Render imposta CORS_ORIGIN=${origin} (senza virgolette) e opz. CORS_ALLOW_VERCEL_PREVIEW=true. Body: ${body || "(vuoto)"}`
  );
}

if (acc !== "true") {
  fail(
    `access-control-allow-credentials atteso "true", ricevuto ${JSON.stringify(acc)}`
  );
}

const health = await fetch(`${api}/health`);
if (!health.ok) {
  fail(`GET /health → ${health.status}`);
}

console.log(
  "smoke:cors OK —",
  "OPTIONS",
  pre.status,
  "ACAO=",
  acao,
  "credentials=",
  acc
);
