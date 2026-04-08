const DEFAULT_BASE = "https://www.dnd5eapi.co/api/2014";

export function getDnd5eApiBase(): string {
  const raw = process.env.SOLI_DND5E_API_BASE?.trim();
  if (!raw) return DEFAULT_BASE;
  return raw.replace(/\/$/, "");
}

export async function fetchDnd5eJson<T>(path: string): Promise<T> {
  const base = getDnd5eApiBase();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`dnd5eapi ${res.status} ${url}`);
  }
  return res.json() as Promise<T>;
}

export type Dnd5eListResult = {
  index: string;
  name: string;
  url: string;
};

export type Dnd5eListResponse = {
  count: number;
  results: Dnd5eListResult[];
};
