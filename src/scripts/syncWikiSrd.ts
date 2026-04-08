/**
 * Sincronizza classi, razze e sezioni regole SRD da dnd5eapi.co → tabella Supabase `wiki_srd_cache`.
 *
 * Uso: `npm run sync:wiki-srd` (richiede .env con SUPABASE_URL e SUPABASE_SERVICE_KEY).
 * Opzionale: SOLI_DND5E_API_BASE (default https://www.dnd5eapi.co/api/2014).
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { fetchDnd5eJson, type Dnd5eListResponse } from "../lib/wikiSrd/dnd5eApi";
import type { Dnd5eClassPayload } from "../lib/wikiSrd/mappers";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type LevelPayload = { features?: { name?: string }[] };

async function collectClassFeatureNames(classIndex: string): Promise<string[]> {
  const names = new Set<string>();
  for (const lvl of [1, 2, 3]) {
    try {
      const level = await fetchDnd5eJson<LevelPayload>(
        `/classes/${classIndex}/levels/${lvl}`
      );
      for (const f of level.features ?? []) {
        if (f.name) names.add(f.name);
      }
    } catch {
      /* livello assente per alcune classi */
    }
    await sleep(50);
  }
  return [...names];
}

async function syncClasses(): Promise<number> {
  const supabase = getSupabase();
  const list = await fetchDnd5eJson<Dnd5eListResponse>("/classes");
  let n = 0;
  for (const item of list.results) {
    const detail = await fetchDnd5eJson<Dnd5eClassPayload>(
      `/classes/${item.index}`
    );
    const feature_names = await collectClassFeatureNames(item.index);
    const payload = {
      ...detail,
      _soli: {
        feature_names,
        synced_at: new Date().toISOString(),
      },
    };
    n++;
    await sleep(80);
    const { error } = await supabase.from("wiki_srd_cache").upsert(
      {
        resource_type: "class",
        index_slug: detail.index ?? item.index,
        name: detail.name ?? item.name,
        payload,
        source: "dnd5eapi",
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "resource_type,index_slug" }
    );
    if (error) throw new Error(`class ${item.index}: ${error.message}`);
  }
  return n;
}

async function syncRaces(): Promise<number> {
  const supabase = getSupabase();
  const list = await fetchDnd5eJson<Dnd5eListResponse>("/races");
  let n = 0;
  for (const item of list.results) {
    const detail = await fetchDnd5eJson<Record<string, unknown>>(
      `/races/${item.index}`
    );
    const payload = {
      ...detail,
      _soli: { synced_at: new Date().toISOString() },
    };
    n++;
    await sleep(80);
    const { error } = await supabase.from("wiki_srd_cache").upsert(
      {
        resource_type: "race",
        index_slug: String(detail.index ?? item.index),
        name: String(detail.name ?? item.name),
        payload,
        source: "dnd5eapi",
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "resource_type,index_slug" }
    );
    if (error) throw new Error(`race ${item.index}: ${error.message}`);
  }
  return n;
}

type RuleSectionRow = {
  index: string;
  name: string;
  desc?: string;
  url?: string;
  updated_at?: string;
};

async function syncRuleSections(): Promise<number> {
  const supabase = getSupabase();
  const list = await fetchDnd5eJson<Dnd5eListResponse>("/rule-sections");
  let n = 0;
  for (const item of list.results) {
    const detail = await fetchDnd5eJson<RuleSectionRow>(
      `/rule-sections/${item.index}`
    );
    const payload = {
      ...detail,
      _soli: { synced_at: new Date().toISOString() },
    };
    n++;
    await sleep(60);
    const { error } = await supabase.from("wiki_srd_cache").upsert(
      {
        resource_type: "rule_section",
        index_slug: detail.index,
        name: detail.name,
        payload,
        source: "dnd5eapi",
        fetched_at: new Date().toISOString(),
      },
      { onConflict: "resource_type,index_slug" }
    );
    if (error) throw new Error(`rule-section ${item.index}: ${error.message}`);
  }
  return n;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_KEY?.trim();
  if (!url || !key) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_KEY sono obbligatori per il sync.");
  }
  return createClient(url, key);
}

async function main() {
  console.log("[sync-wiki-srd] Avvio (dnd5eapi → wiki_srd_cache)…");
  const classes = await syncClasses();
  console.log(`[sync-wiki-srd] Classi: ${classes}`);
  const races = await syncRaces();
  console.log(`[sync-wiki-srd] Razze: ${races}`);
  const rules = await syncRuleSections();
  console.log(`[sync-wiki-srd] Sezioni regole: ${rules}`);
  console.log("[sync-wiki-srd] Completato.");
}

main().catch((e) => {
  console.error("[sync-wiki-srd] Errore:", e);
  process.exit(1);
});
