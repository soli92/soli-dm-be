import type { CorsOptions } from "cors";

/** Normalizza un'origine per il confronto (slash finali, path accidentali in env). */
export function normalizeCorsOrigin(value: string): string {
  const t = value.trim();
  if (!t) return t;
  try {
    return new URL(t).origin;
  } catch {
    return t.replace(/\/+$/, "");
  }
}

/** Origini esplicite da CORS_ORIGIN (virgola = più URL). */
export function parseCorsOriginList(): string[] {
  return (
    process.env.CORS_ORIGIN?.split(",")
      .map((s) => normalizeCorsOrigin(s))
      .filter(Boolean) ?? []
  );
}

/**
 * Preview Vercel (es. soli-dm-xxx-soli92s-projects.vercel.app) ≠ dominio produzione.
 * Con CORS_ALLOW_VERCEL_PREVIEW=true accettiamo https su *.vercel.app il cui host contiene
 * CORS_VERCEL_PREVIEW_SUBSTRING (default: soli-dm).
 */
export function isVercelPreviewOriginAllowed(origin: string): boolean {
  const flag = process.env.CORS_ALLOW_VERCEL_PREVIEW?.trim().toLowerCase();
  if (flag !== "true" && flag !== "1" && flag !== "yes") {
    return false;
  }
  try {
    const u = new URL(origin);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (!host.endsWith(".vercel.app")) return false;
    const needle = (
      process.env.CORS_VERCEL_PREVIEW_SUBSTRING || "soli-dm"
    ).toLowerCase();
    return host.includes(needle);
  } catch {
    return false;
  }
}

/**
 * Opzioni CORS: senza CORS_ORIGIN → consenti qualsiasi origine (sviluppo).
 * Con CORS_ORIGIN → allowlist + opzionale preview Vercel.
 */
export function buildCorsOptions(): CorsOptions {
  const staticList = parseCorsOriginList();

  if (staticList.length === 0) {
    return { origin: true, credentials: true };
  }

  return {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      const normalized = normalizeCorsOrigin(origin);
      if (staticList.includes(normalized)) {
        callback(null, true);
        return;
      }
      if (isVercelPreviewOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  };
}
