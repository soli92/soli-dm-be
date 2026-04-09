import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "./createApp";
import { mockDb, dbList, dbOk, dbErr } from "./test/registerSupabaseMock";
import { useSilencedHttpLogs } from "./test/integrationHarness";

describe("Campaigns & characters API (Supabase mocked globally)", () => {
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
    name: "Bruenor",
    character_name: "Bruenor",
    class_name: "Fighter",
    race: "Dwarf",
    level: 3,
    player_name: "Bob",
    experience: 0,
    alignment: "Lawful Good",
    background: "Soldier",
    stats: {
      strength: 16,
      dexterity: 12,
      constitution: 14,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    status: "active",
    created_at: "2024-01-02T00:00:00Z",
  };

  describe("GET /api/campaigns", () => {
    it("200 con lista e count", async () => {
      mockDb.setFallback(dbList([sampleCampaign]));
      const res = await request(app()).get("/api/campaigns").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].name).toBe("Phandelver");
    });

    it("500 se Supabase restituisce error", async () => {
      mockDb.setFallback(dbErr("connection refused"));
      const res = await request(app()).get("/api/campaigns").expect(500);
      expect(res.body.error).toMatch(/connection refused/);
    });
  });

  describe("GET /api/campaigns/:id", () => {
    it("200 singola campagna", async () => {
      mockDb.setFallback(dbOk(sampleCampaign));
      const res = await request(app())
        .get(`/api/campaigns/${sampleCampaign.id}`)
        .expect(200);
      expect(res.body.data.dm_name).toBe("Alice");
    });

    it("404 se data null senza error", async () => {
      mockDb.setFallback(dbOk(null));
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
      mockDb.setFallback(dbList([created]));
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
      mockDb.setFallback(dbList([updated]));
      const res = await request(app())
        .put(`/api/campaigns/${sampleCampaign.id}`)
        .send({ name: "Renamed" })
        .expect(200);
      expect(res.body.data.name).toBe("Renamed");
    });

    it("404 se nessuna riga", async () => {
      mockDb.setFallback(dbList([]));
      await request(app())
        .put(`/api/campaigns/${sampleCampaign.id}`)
        .send({ name: "X" })
        .expect(404);
    });
  });

  describe("DELETE /api/campaigns/:id", () => {
    it("200 messaggio cancellazione", async () => {
      mockDb.setFallback(dbOk(null));
      const res = await request(app())
        .delete(`/api/campaigns/${sampleCampaign.id}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/deleted/i);
    });
  });

  describe("GET /api/characters", () => {
    it("200 lista", async () => {
      mockDb.setFallback(dbList([sampleCharacter]));
      const res = await request(app()).get("/api/characters").expect(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].character_name).toBe("Bruenor");
    });

    it("accetta query campaign_id", async () => {
      mockDb.setFallback(dbList([sampleCharacter]));
      const res = await request(app())
        .get("/api/characters")
        .query({ campaign_id: sampleCampaign.id })
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it("espone character_name se il DB restituisce solo name (normalizzazione API)", async () => {
      const rowDbOnlyName = {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        campaign_id: sampleCampaign.id,
        name: "LegacyNome",
        class_name: "Bard",
        race: "Elf",
        level: 1,
      };
      mockDb.setFallback(dbList([rowDbOnlyName]));
      const res = await request(app()).get("/api/characters").expect(200);
      expect(res.body.data[0].character_name).toBe("LegacyNome");
      expect(res.body.data[0].name).toBe("LegacyNome");
    });
  });

  describe("GET /api/characters/:id", () => {
    it("200 dettaglio", async () => {
      mockDb.setFallback(dbOk(sampleCharacter));
      const res = await request(app())
        .get(`/api/characters/${sampleCharacter.id}`)
        .expect(200);
      expect(res.body.data.race).toBe("Dwarf");
    });

    it("404 personaggio assente", async () => {
      mockDb.setFallback(dbOk(null));
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
        name: "Catti",
        character_name: "Catti",
        class_name: "Rogue",
        race: "Halfling",
      };
      mockDb.setFallback(dbList([created]));
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
      expect(res.body.data.name).toBe("Catti");
      expect(res.body.data.character_name).toBe("Catti");
    });
  });

  describe("PUT /api/characters/:id", () => {
    it("200 update", async () => {
      const updated = { ...sampleCharacter, level: 5 };
      mockDb.setFallback(dbList([updated]));
      const res = await request(app())
        .put(`/api/characters/${sampleCharacter.id}`)
        .send({ level: 5 })
        .expect(200);
      expect(res.body.data.level).toBe(5);
    });

    it("404", async () => {
      mockDb.setFallback(dbList([]));
      await request(app())
        .put(`/api/characters/${sampleCharacter.id}`)
        .send({ level: 1 })
        .expect(404);
    });
  });

  describe("DELETE /api/characters/:id", () => {
    it("200", async () => {
      mockDb.setFallback(dbOk(null));
      const res = await request(app())
        .delete(`/api/characters/${sampleCharacter.id}`)
        .expect(200);
      expect(res.body.message).toMatch(/deleted/i);
    });
  });

  describe("SOLI_DM_API_KEY con Supabase mock", () => {
    it("401 senza header su GET /api/campaigns", async () => {
      process.env.SOLI_DM_API_KEY = "secret";
      await request(app()).get("/api/campaigns").expect(401);
    });

    it("200 con header", async () => {
      process.env.SOLI_DM_API_KEY = "secret";
      mockDb.setFallback(dbList([sampleCampaign]));
      await request(app())
        .get("/api/campaigns")
        .set("x-soli-dm-api-key", "secret")
        .expect(200);
    });
  });
});
