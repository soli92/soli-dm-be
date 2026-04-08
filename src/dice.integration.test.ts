import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "./createApp";
import { mockDb, dbList, dbOk, dbErr } from "./test/registerSupabaseMock";
import { useSilencedHttpLogs } from "./test/integrationHarness";

describe("Dice API + Supabase (mock globale)", () => {
  useSilencedHttpLogs();

  const prevKey = process.env.SOLI_DM_API_KEY;

  beforeEach(() => {
    delete process.env.SOLI_DM_API_KEY;
  });

  afterEach(() => {
    if (prevKey === undefined) delete process.env.SOLI_DM_API_KEY;
    else process.env.SOLI_DM_API_KEY = prevKey;
  });

  const app = () => createApp();

  const rollRow = {
    id: "55555555-5555-5555-5555-555555555555",
    campaign_id: "11111111-1111-1111-1111-111111111111",
    character_id: null,
    notation: "2d6",
    result_total: 7,
    result_rolls: [3, 4],
    created_at: "2024-01-03T00:00:00Z",
  };

  describe("POST /api/dice/roll", () => {
    it("con campaign_id attende insert e risponde 200", async () => {
      mockDb.enqueue(dbOk(null));
      const res = await request(app())
        .post("/api/dice/roll")
        .send({
          notation: "1d20",
          campaign_id: "11111111-1111-1111-1111-111111111111",
        })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rolls).toHaveLength(1);
    });

    it("insert fallito → 400", async () => {
      mockDb.enqueue(dbErr("rls violation"));
      const res = await request(app())
        .post("/api/dice/roll")
        .send({
          notation: "1d4",
          campaign_id: "11111111-1111-1111-1111-111111111111",
        })
        .expect(400);
      expect(res.body.error).toMatch(/rls violation/i);
    });
  });

  describe("GET /api/dice/history", () => {
    it("200 con lista lanci", async () => {
      mockDb.setFallback(dbList([rollRow]));
      const res = await request(app())
        .get("/api/dice/history")
        .query({ campaign_id: rollRow.campaign_id })
        .expect(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].notation).toBe("2d6");
    });

    it("500 se Supabase errore", async () => {
      mockDb.setFallback(dbErr("timeout"));
      const res = await request(app())
        .get("/api/dice/history")
        .query({ campaign_id: rollRow.campaign_id })
        .expect(500);
      expect(res.body.error).toMatch(/timeout/);
    });
  });

  describe("GET /api/dice/history/:id", () => {
    it("200 singolo lancio", async () => {
      mockDb.setFallback(dbOk(rollRow));
      const res = await request(app())
        .get(`/api/dice/history/${rollRow.id}`)
        .expect(200);
      expect(res.body.data.result_total).toBe(7);
    });

    it("404 senza riga", async () => {
      mockDb.setFallback(dbOk(null));
      await request(app())
        .get("/api/dice/history/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
        .expect(404);
    });
  });
});
