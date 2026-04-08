import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";

/**
 * Mock Supabase client: builder thenable condiviso per tutte le query del file.
 * `setSupabaseResponse` imposta il prossimo `{ data, error }` risolto da await sulla catena.
 */
const supabaseTest = vi.hoisted(() => {
  let response: { data: unknown; error: unknown } = {
    data: [],
    error: null,
  };

  function createBuilder(): Record<string, unknown> {
    const b: Record<string, unknown> = {};
    const chain = () => b;
    b.select = chain;
    b.insert = chain;
    b.update = chain;
    b.delete = chain;
    b.eq = chain;
    b.order = chain;
    b.limit = chain;
    b.single = () => Promise.resolve(response);
    b.then = (onFulfilled: (value: unknown) => unknown) =>
      Promise.resolve(response).then(onFulfilled);
    return b;
  }

  return {
    setResponse(next: { data: unknown; error: unknown }) {
      response = next;
    },
    supabase: {
      from(_table: string) {
        return createBuilder();
      },
    },
  };
});

vi.mock("./lib/supabase", () => ({
  supabase: supabaseTest.supabase,
}));

import { createApp } from "./createApp";

describe("Campaigns & characters API (Supabase mocked)", () => {
  const prevKey = process.env.SOLI_DM_API_KEY;

  beforeEach(() => {
    delete process.env.SOLI_DM_API_KEY;
    supabaseTest.setResponse({ data: [], error: null });
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (prevKey === undefined) delete process.env.SOLI_DM_API_KEY;
    else process.env.SOLI_DM_API_KEY = prevKey;
  });

  const app = () => createApp();

  const sampleCampaign = {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Phandelver",
    description: "Classic",
    dm_name: "Alice",
    world_setting: "Faerûn",
    level_range: "1-5",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
  };

  const sampleCharacter = {
    id: "22222222-2222-2222-2222-222222222222",
    campaign_id: sampleCampaign.id,
    character_name: "Bruenor",
    class_name: "Fighter",
    race: "Dwarf",
    level: 3,
    player_name: "Bob",
    experience: 0,
    alignment: "Lawful Good",
    background: "Soldier",
    stats: { strength: 16, dexterity: 12, constitution: 14, intelligence: 10, wisdom: 12, charisma: 8 },
    status: "active",
    created_at: "2024-01-02T00:00:00Z",
  };

  describe("GET /api/campaigns", () => {
    it("200 con lista e count", async () => {
      supabaseTest.setResponse({ data: [sampleCampaign], error: null });
      const res = await request(app()).get("/api/campaigns").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe("Phandelver");
    });

    it("500 se Supabase restituisce error", async () => {
      supabaseTest.setResponse({ data: null, error: { message: "connection refused" } });
      const res = await request(app()).get("/api/campaigns").expect(500);
      expect(res.body.error).toMatch(/connection refused/);
    });
  });

  describe("GET /api/campaigns/:id", () => {
    it("200 singola campagna", async () => {
      supabaseTest.setResponse({ data: sampleCampaign, error: null });
      const res = await request(app())
        .get(`/api/campaigns/${sampleCampaign.id}`)
        .expect(200);
      expect(res.body.data.dm_name).toBe("Alice");
    });

    it("404 se data null senza error", async () => {
      supabaseTest.setResponse({ data: null, error: null });
      const res = await request(app())
        .get("/api/campaigns/99999999-9999-9999-9999-999999999999")
        .expect(404);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  describe("POST /api/campaigns", () => {
    it("400 senza name o dm_name", async () => {
      await request(app()).post("/api/campaigns").send({ name: "X" }).expect(400);
      await request(app()).post("/api/campaigns").send({ dm_name: "Y" }).expect(400);
    });

    it("201 e corpo creato", async () => {
      const created = {
        ...sampleCampaign,
        id: "33333333-3333-3333-3333-333333333333",
        name: "New",
        description: "Desc",
        world_setting: "World",
        level_range: "1-10",
      };
      supabaseTest.setResponse({ data: [created], error: null });
      const res = await request(app())
        .post("/api/campaigns")
        .send({
          name: "New",
          dm_name: "DM",
          description: "Desc",
          world_setting: "World",
          level_range: "1-10",
        })
        .expect(201);
      expect(res.body.data.name).toBe("New");
      expect(res.body.data.level_range).toBe("1-10");
    });
  });

  describe("PUT /api/campaigns/:id", () => {
    it("200 aggiornamento", async () => {
      const updated = { ...sampleCampaign, name: "Renamed" };
      supabaseTest.setResponse({ data: [updated], error: null });
      const res = await request(app())
        .put(`/api/campaigns/${sampleCampaign.id}`)
        .send({ name: "Renamed" })
        .expect(200);
      expect(res.body.data.name).toBe("Renamed");
    });

    it("404 se nessuna riga", async () => {
      supabaseTest.setResponse({ data: [], error: null });
      await request(app())
        .put(`/api/campaigns/${sampleCampaign.id}`)
        .send({ name: "X" })
        .expect(404);
    });
  });

  describe("DELETE /api/campaigns/:id", () => {
    it("200 messaggio cancellazione", async () => {
      supabaseTest.setResponse({ data: null, error: null });
      const res = await request(app())
        .delete(`/api/campaigns/${sampleCampaign.id}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/deleted/i);
    });
  });

  describe("GET /api/characters", () => {
    it("200 lista", async () => {
      supabaseTest.setResponse({ data: [sampleCharacter], error: null });
      const res = await request(app()).get("/api/characters").expect(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].character_name).toBe("Bruenor");
    });

    it("accetta query campaign_id (filtro lato mock non verificato)", async () => {
      supabaseTest.setResponse({ data: [sampleCharacter], error: null });
      const res = await request(app())
        .get("/api/characters")
        .query({ campaign_id: sampleCampaign.id })
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /api/characters/:id", () => {
    it("200 dettaglio", async () => {
      supabaseTest.setResponse({ data: sampleCharacter, error: null });
      const res = await request(app())
        .get(`/api/characters/${sampleCharacter.id}`)
        .expect(200);
      expect(res.body.data.race).toBe("Dwarf");
    });

    it("404 personaggio assente", async () => {
      supabaseTest.setResponse({ data: null, error: null });
      await request(app())
        .get("/api/characters/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
        .expect(404);
    });
  });

  describe("POST /api/characters", () => {
    it("400 campi obbligatori mancanti", async () => {
      await request(app())
        .post("/api/characters")
        .send({ campaign_id: sampleCampaign.id, character_name: "X" })
        .expect(400);
    });

    it("201 creazione con default stats", async () => {
      const created = {
        ...sampleCharacter,
        id: "44444444-4444-4444-4444-444444444444",
        character_name: "Catti",
        class_name: "Rogue",
        race: "Halfling",
      };
      supabaseTest.setResponse({ data: [created], error: null });
      const res = await request(app())
        .post("/api/characters")
        .send({
          campaign_id: sampleCampaign.id,
          character_name: "Catti",
          class_name: "Rogue",
          race: "Halfling",
        })
        .expect(201);
      expect(res.body.data.class_name).toBe("Rogue");
    });
  });

  describe("PUT /api/characters/:id", () => {
    it("200 update", async () => {
      const updated = { ...sampleCharacter, level: 5 };
      supabaseTest.setResponse({ data: [updated], error: null });
      const res = await request(app())
        .put(`/api/characters/${sampleCharacter.id}`)
        .send({ level: 5 })
        .expect(200);
      expect(res.body.data.level).toBe(5);
    });

    it("404", async () => {
      supabaseTest.setResponse({ data: [], error: null });
      await request(app())
        .put(`/api/characters/${sampleCharacter.id}`)
        .send({ level: 1 })
        .expect(404);
    });
  });

  describe("DELETE /api/characters/:id", () => {
    it("200", async () => {
      supabaseTest.setResponse({ data: null, error: null });
      const res = await request(app())
        .delete(`/api/characters/${sampleCharacter.id}`)
        .expect(200);
      expect(res.body.message).toMatch(/deleted/i);
    });
  });

  describe("SOLI_DM_API_KEY con Supabase mock", () => {
    it("401 senza header su GET /api/campaigns", async () => {
      process.env.SOLI_DM_API_KEY = "secret";
      supabaseTest.setResponse({ data: [], error: null });
      await request(app()).get("/api/campaigns").expect(401);
    });

    it("200 con header", async () => {
      process.env.SOLI_DM_API_KEY = "secret";
      supabaseTest.setResponse({ data: [sampleCampaign], error: null });
      await request(app())
        .get("/api/campaigns")
        .set("x-soli-dm-api-key", "secret")
        .expect(200);
    });
  });
});
