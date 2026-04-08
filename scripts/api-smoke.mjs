#!/usr/bin/env node
/**
 * Giro rapido su endpoint pubblici (produzione o staging).
 * Uso: SMOKE_API_URL=https://soli-dm-be.onrender.com npm run smoke:api
 * Opzionale: SMOKE_API_KEY se il backend richiede SOLI_DM_API_KEY
 */

const base = (process.env.SMOKE_API_URL || "").replace(/\/$/, "");
const apiKey = process.env.SMOKE_API_KEY?.trim();

if (!base) {
  console.error("smoke:api: imposta SMOKE_API_URL (es. https://soli-dm-be.onrender.com)");
  process.exit(1);
}

const headers = {};
if (apiKey) {
  headers["x-soli-dm-api-key"] = apiKey;
}

function fail(msg) {
  console.error("smoke:api FAIL:", msg);
  process.exit(1);
}

async function get(path, check) {
  const url = `${base}${path}`;
  const res = await fetch(url, { headers });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    fail(`${path}: risposta non JSON (${res.status}) ${text.slice(0, 120)}`);
  }
  if (!res.ok) {
    fail(`${path}: HTTP ${res.status} ${text.slice(0, 200)}`);
  }
  if (check) {
    const err = check(body, res);
    if (err) fail(`${path}: ${err}`);
  }
  return body;
}

console.log("smoke:api →", base);

await get("/health", (b) => (b.status === "ok" ? null : "expected status ok"));

await get("/api/classes", (b) =>
  !b.success || !Array.isArray(b.data) || b.data.length !== 12
    ? "classes: expected 12 items"
    : null
);

await get("/api/classes/Fighter", (b) =>
  b.data?.name !== "Fighter" ? "class detail" : null
);

await get("/api/races", (b) =>
  !b.success || b.data?.length !== 12 ? "races: expected 12" : null
);

await get("/api/races/Elf", (b) => (b.data?.name !== "Elf" ? "race Elf" : null));

await get("/api/deities", (b) =>
  !b.success || b.count < 18 ? "deities list" : null
);

await get("/api/deities/Mystra", (b) =>
  b.data?.name !== "Mystra" ? "deity Mystra" : null
);

await get("/api/deities/filter/alignment/lawful%20evil", (b) =>
  !b.success || !Array.isArray(b.data) ? "deity filter" : null
);

await get("/api/rules", (b) =>
  !b.success || b.count !== 6 ? "rules categories: expected 6" : null
);

await get("/api/rules/ability-scores/list", (b) =>
  !b.success || b.data?.length !== 6 ? "ability list: expected 6" : null
);

await get("/api/rules/combat", (b) =>
  b.data?.title !== "Combat" ? "rules combat" : null
);

const roll = await fetch(`${base}/api/dice/roll`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...headers,
  },
  body: JSON.stringify({ notation: "2d6" }),
});
const rollBody = await roll.json();
if (!roll.ok) {
  fail(`/api/dice/roll: ${roll.status} ${JSON.stringify(rollBody)}`);
}
if (!rollBody.success || !rollBody.data?.rolls?.length) {
  fail("dice roll shape");
}

const multi = await fetch(`${base}/api/dice/roll-multiple`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...headers,
  },
  body: JSON.stringify({ rolls: ["1d4", "1d4"] }),
});
const multiBody = await multi.json();
if (!multi.ok) {
  fail(`/api/dice/roll-multiple: ${multi.status}`);
}
if (!multiBody.success || multiBody.count !== 2) {
  fail("roll-multiple shape");
}

console.log("smoke:api OK — health, wiki (classes, races, deities, rules), dice");
