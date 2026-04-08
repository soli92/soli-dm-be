import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "./createApp";

/**
 * Altre route HTTP (non wiki): health già in http.integration, qui dice aggiuntivi e 404.
 */
describe("API routes (integration)", () => {
  const prevKey = process.env.SOLI_DM_API_KEY;

  beforeEach(() => {
    delete process.env.SOLI_DM_API_KEY;
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (prevKey === undefined) delete process.env.SOLI_DM_API_KEY;
    else process.env.SOLI_DM_API_KEY = prevKey;
  });

  const app = () => createApp();

  it("GET route sconosciuta → 404 JSON", async () => {
    const res = await request(app()).get("/api/nonexistent-route").expect(404);
    expect(res.body.error).toBeDefined();
  });

  describe("POST /api/dice/roll-multiple", () => {
    it("accetta più notazioni e calcola total_sum", async () => {
      const res = await request(app())
        .post("/api/dice/roll-multiple")
        .send({ rolls: ["1d4", "1d6"] })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total_sum).toBe(res.body.data[0].total + res.body.data[1].total);
    });

    it("400 se rolls vuoto o non array", async () => {
      await request(app()).post("/api/dice/roll-multiple").send({ rolls: [] }).expect(400);
      await request(app()).post("/api/dice/roll-multiple").send({}).expect(400);
    });
  });

  describe("GET /api/dice/history", () => {
    it("400 senza campaign_id", async () => {
      const res = await request(app()).get("/api/dice/history").expect(400);
      expect(res.body.error).toMatch(/campaign_id/i);
    });
  });

  describe("SOLI_DM_API_KEY", () => {
    it("blocca GET /api/races senza header", async () => {
      process.env.SOLI_DM_API_KEY = "k";
      const blocked = await request(app()).get("/api/races").expect(401);
      expect(blocked.body.error).toMatch(/Unauthorized/i);
    });

    it("consente wiki con header corretto", async () => {
      process.env.SOLI_DM_API_KEY = "k";
      await request(app()).get("/api/races").set("x-soli-dm-api-key", "k").expect(200);
    });
  });
});
