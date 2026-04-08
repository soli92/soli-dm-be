import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "./createApp";

describe("HTTP (createApp)", () => {
  const prevKey = process.env.SOLI_DM_API_KEY;
  const prevCors = process.env.CORS_ORIGIN;
  const prevVercelPreview = process.env.CORS_ALLOW_VERCEL_PREVIEW;

  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (prevKey === undefined) delete process.env.SOLI_DM_API_KEY;
    else process.env.SOLI_DM_API_KEY = prevKey;
    if (prevCors === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = prevCors;
    if (prevVercelPreview === undefined)
      delete process.env.CORS_ALLOW_VERCEL_PREVIEW;
    else process.env.CORS_ALLOW_VERCEL_PREVIEW = prevVercelPreview;
  });

  it("GET /health returns ok without API key", async () => {
    delete process.env.SOLI_DM_API_KEY;
    const app = createApp();
    const res = await request(app).get("/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });

  it("GET /api/classes returns wiki data when no API key configured", async () => {
    delete process.env.SOLI_DM_API_KEY;
    const app = createApp();
    const res = await request(app).get("/api/classes").expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("GET /api/classes returns 401 when API key missing but required", async () => {
    process.env.SOLI_DM_API_KEY = "test-key-123";
    const app = createApp();
    await request(app).get("/api/classes").expect(401);
  });

  it("GET /api/classes succeeds with x-soli-dm-api-key", async () => {
    process.env.SOLI_DM_API_KEY = "test-key-123";
    const app = createApp();
    const res = await request(app)
      .get("/api/classes")
      .set("x-soli-dm-api-key", "test-key-123")
      .expect(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/rules/ability-scores/list is not shadowed by /:category", async () => {
    delete process.env.SOLI_DM_API_KEY;
    const app = createApp();
    const res = await request(app).get("/api/rules/ability-scores/list").expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("POST /api/dice/roll validates notation", async () => {
    delete process.env.SOLI_DM_API_KEY;
    const app = createApp();
    await request(app)
      .post("/api/dice/roll")
      .send({})
      .expect(400);
    const ok = await request(app)
      .post("/api/dice/roll")
      .send({ notation: "2d6" })
      .expect(200);
    expect(ok.body.data.rolls).toHaveLength(2);
    expect(ok.body.data.total).toBeGreaterThanOrEqual(2);
    expect(ok.body.data.total).toBeLessThanOrEqual(12);
  });

  it("OPTIONS preflight /api/campaigns consente origine in CORS_ORIGIN", async () => {
    delete process.env.SOLI_DM_API_KEY;
    process.env.CORS_ORIGIN = "https://soli-dm-fe.vercel.app";
    process.env.CORS_ALLOW_VERCEL_PREVIEW = "true";
    const app = createApp();
    const res = await request(app)
      .options("/api/campaigns")
      .set("Origin", "https://soli-dm-fe.vercel.app")
      .set("Access-Control-Request-Method", "GET");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://soli-dm-fe.vercel.app"
    );
  });

  it("OPTIONS preflight non richiede API key (anche se SOLI_DM_API_KEY attiva)", async () => {
    process.env.SOLI_DM_API_KEY = "test-key-123";
    process.env.CORS_ORIGIN = "https://soli-dm-fe.vercel.app";
    const app = createApp();
    const res = await request(app)
      .options("/api/campaigns")
      .set("Origin", "https://soli-dm-fe.vercel.app")
      .set("Access-Control-Request-Method", "GET");
    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe(
      "https://soli-dm-fe.vercel.app"
    );
  });
});
