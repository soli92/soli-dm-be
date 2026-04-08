import { describe, it, expect, afterEach } from "vitest";
import {
  parseCorsOriginList,
  normalizeCorsOrigin,
  isVercelPreviewOriginAllowed,
  buildCorsOptions,
} from "./corsConfig";

describe("corsConfig", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it("parseCorsOriginList splitta per virgola", () => {
    process.env.CORS_ORIGIN = "https://a.app, https://b.app ";
    expect(parseCorsOriginList()).toEqual(["https://a.app", "https://b.app"]);
  });

  it("parseCorsOriginList normalizza slash finali e path", () => {
    process.env.CORS_ORIGIN = "https://fe.vercel.app/,https://x.app/path";
    expect(parseCorsOriginList()).toEqual([
      "https://fe.vercel.app",
      "https://x.app",
    ]);
  });

  it("normalizeCorsOrigin gestisce stringhe non URL", () => {
    expect(normalizeCorsOrigin("https://z.app/")).toBe("https://z.app");
  });

  it("isVercelPreviewOriginAllowed rispetta il flag e il sottostringa host", () => {
    delete process.env.CORS_ALLOW_VERCEL_PREVIEW;
    expect(
      isVercelPreviewOriginAllowed(
        "https://soli-dm-abc-soli92s-projects.vercel.app"
      )
    ).toBe(false);

    process.env.CORS_ALLOW_VERCEL_PREVIEW = "true";
    expect(
      isVercelPreviewOriginAllowed(
        "https://soli-dm-abc-soli92s-projects.vercel.app"
      )
    ).toBe(true);
    expect(isVercelPreviewOriginAllowed("https://evil.vercel.app")).toBe(false);
    expect(isVercelPreviewOriginAllowed("http://soli-dm-x.vercel.app")).toBe(
      false
    );
  });

  it("buildCorsOptions senza CORS_ORIGIN usa origin true", () => {
    delete process.env.CORS_ORIGIN;
    const o = buildCorsOptions();
    expect(o.origin).toBe(true);
    expect(o.credentials).toBe(true);
  });

  it("buildCorsOptions accetta origine browser se env ha slash finale", async () => {
    process.env.CORS_ORIGIN = "https://prod.example.com/";
    const o = buildCorsOptions();
    const fn = o.origin as (
      origin: string | undefined,
      cb: (err: Error | null, ok?: boolean) => void
    ) => void;
    await new Promise<void>((resolve) => {
      fn("https://prod.example.com", (err, ok) => {
        expect(err).toBeNull();
        expect(ok).toBe(true);
        resolve();
      });
    });
  });

  it("buildCorsOptions con lista chiama callback per origine consentita", async () => {
    process.env.CORS_ORIGIN = "https://prod.example.com";
    const o = buildCorsOptions();
    expect(typeof o.origin).toBe("function");
    const fn = o.origin as (
      origin: string | undefined,
      cb: (err: Error | null, ok?: boolean) => void
    ) => void;
    await new Promise<void>((resolve, reject) => {
      fn("https://prod.example.com", (err, ok) => {
        expect(err).toBeNull();
        expect(ok).toBe(true);
        resolve();
      });
    });
    await new Promise<void>((resolve) => {
      fn("https://other.com", (err) => {
        expect(err).toBeInstanceOf(Error);
        resolve();
      });
    });
  });

  it("preview Vercel ammessa con flag se non in lista statica", async () => {
    process.env.CORS_ORIGIN = "https://soli-dm-fe.vercel.app";
    process.env.CORS_ALLOW_VERCEL_PREVIEW = "true";
    const o = buildCorsOptions();
    const fn = o.origin as (
      origin: string | undefined,
      cb: (err: Error | null, ok?: boolean) => void
    ) => void;
    await new Promise<void>((resolve) => {
      fn("https://soli-dm-ib658hn6v-soli92s-projects.vercel.app", (err, ok) => {
        expect(err).toBeNull();
        expect(ok).toBe(true);
        resolve();
      });
    });
  });
});
