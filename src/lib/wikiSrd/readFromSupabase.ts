import { supabase } from "../supabase";
import { mapDndClassPayload, mapDndRacePayload } from "./mappers";
import type { Dnd5eClassPayload, Dnd5eRacePayload } from "./mappers";
import type { WikiClassDTO } from "../../data/wikiClassesStatic";
import type { WikiRaceDTO } from "../../data/wikiRacesStatic";

export function normalizeWikiSlug(raw: string): string {
  try {
    return decodeURIComponent(raw).trim().toLowerCase().replace(/\s+/g, "-");
  } catch {
    return raw.trim().toLowerCase().replace(/\s+/g, "-");
  }
}

type CacheRow = { index_slug: string; name: string; payload: unknown };

export async function listWikiClassesFromDb(): Promise<WikiClassDTO[] | null> {
  const { data, error } = await supabase
    .from("wiki_srd_cache")
    .select("index_slug, name, payload")
    .eq("resource_type", "class")
    .order("name", { ascending: true });

  if (error) {
    console.warn("[wiki_srd] list classes:", error.message);
    return null;
  }
  if (!data?.length) return null;

  return (data as CacheRow[]).map((row) =>
    mapDndClassPayload(row.payload as Dnd5eClassPayload)
  );
}

export async function getWikiClassFromDb(
  nameParam: string
): Promise<WikiClassDTO | null> {
  const slug = normalizeWikiSlug(nameParam);
  const { data, error } = await supabase
    .from("wiki_srd_cache")
    .select("payload")
    .eq("resource_type", "class")
    .eq("index_slug", slug)
    .maybeSingle();

  if (error) {
    console.warn("[wiki_srd] get class:", error.message);
    return null;
  }
  if (!data?.payload) return null;
  return mapDndClassPayload(data.payload as Dnd5eClassPayload);
}

export async function listWikiRacesFromDb(): Promise<WikiRaceDTO[] | null> {
  const { data, error } = await supabase
    .from("wiki_srd_cache")
    .select("index_slug, name, payload")
    .eq("resource_type", "race")
    .order("name", { ascending: true });

  if (error) {
    console.warn("[wiki_srd] list races:", error.message);
    return null;
  }
  if (!data?.length) return null;

  return (data as CacheRow[]).map((row) =>
    mapDndRacePayload(row.payload as Dnd5eRacePayload)
  );
}

export async function getWikiRaceFromDb(
  nameParam: string
): Promise<WikiRaceDTO | null> {
  const slug = normalizeWikiSlug(nameParam);
  const { data, error } = await supabase
    .from("wiki_srd_cache")
    .select("payload")
    .eq("resource_type", "race")
    .eq("index_slug", slug)
    .maybeSingle();

  if (error) {
    console.warn("[wiki_srd] get race:", error.message);
    return null;
  }
  if (!data?.payload) return null;
  return mapDndRacePayload(data.payload as Dnd5eRacePayload);
}
