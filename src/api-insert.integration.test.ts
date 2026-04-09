import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "./createApp";
import { mockDb, dbList } from "./test/registerSupabaseMock";
import { useSilencedHttpLogs } from "./test/integrationHarness";

/**
 * Inserimenti esercitati come il client: HTTP POST verso /api/* (Supabase mockato).
 */
describe("Inserimenti via API HTTP (supertest)", () => {
  useSilencedHttpLogs();

  const prevKey = process.env.SOLI_DM_API_KEY;

  beforeEach(() => {
    delete process.env.SOLI_DM_API_KEY;
  });

  afterEach(() => {
    if (prevKey === undefined) delete process.env.SOLI_DM_API_KEY;
    else process.env.SOLI_DM_API_KEY = prevKey;
  });

  const app = createApp();

  describe("POST /api/campaigns", () => {
    it("201 inserimento minimo (name + dm_name)", async () => {
      const row = {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        name: "Solo nome",
        description: null,
        dm_name: "Mario",
        world_setting: null,
        level_range: "1-20",
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
      };
      mockDb.setFallback(dbList([row]));

      const res = await request(app)
        .post("/api/campaigns")
        .set("Content-Type", "application/json")
        .send({ name: "Solo nome", dm_name: "Mario" })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        id: row.id,
        name: "Solo nome",
        dm_name: "Mario",
      });
    });

    it("201 inserimento completo", async () => {
      const row = {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        name: "Curse of Strahd",
        description: "Horror gothic",
        dm_name: "Luigi",
        world_setting: "Barovia",
        level_range: "1-10",
        status: "active",
        created_at: "2026-01-02T00:00:00Z",
      };
      mockDb.setFallback(dbList([row]));

      const res = await request(app)
        .post("/api/campaigns")
        .send({
          name: "Curse of Strahd",
          dm_name: "Luigi",
          description: "Horror gothic",
          world_setting: "Barovia",
          level_range: "1-10",
        })
        .expect(201);

      expect(res.body.data.level_range).toBe("1-10");
      expect(res.body.data.world_setting).toBe("Barovia");
    });
  });

  describe("POST /api/characters", () => {
    const campaignId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

    it("201 inserimento minimo (campaign_id + nome + classe + razza)", async () => {
      const row = {
        id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        campaign_id: campaignId,
        character_name: "Aragorn",
        class_name: "Ranger",
        race: "Human",
        level: 1,
        experience: 0,
        alignment: "Neutral",
        background: null,
        player_name: null,
        stats: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        status: "active",
        created_at: "2026-01-03T00:00:00Z",
      };
      mockDb.setFallback(dbList([row]));

      const res = await request(app)
        .post("/api/characters")
        .send({
          campaign_id: campaignId,
          character_name: "Aragorn",
          class_name: "Ranger",
          race: "Human",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        character_name: "Aragorn",
        class_name: "Ranger",
        campaign_id: campaignId,
      });
    });

    it("201 inserimento con livello, giocatore, allineamento", async () => {
      const row = {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        campaign_id: campaignId,
        character_name: "Gandalf",
        class_name: "Wizard",
        race: "Human",
        level: 5,
        experience: 100,
        alignment: "Lawful Good",
        background: "Sage",
        player_name: "Ian",
        stats: {
          strength: 10,
          dexterity: 12,
          constitution: 14,
          intelligence: 18,
          wisdom: 16,
          charisma: 15,
        },
        status: "active",
        created_at: "2026-01-04T00:00:00Z",
      };
      mockDb.setFallback(dbList([row]));

      const res = await request(app)
        .post("/api/characters")
        .send({
          campaign_id: campaignId,
          character_name: "Gandalf",
          class_name: "Wizard",
          race: "Human",
          level: 5,
          experience: 100,
          alignment: "Lawful Good",
          background: "Sage",
          player_name: "Ian",
        })
        .expect(201);

      expect(res.body.data.level).toBe(5);
      expect(res.body.data.player_name).toBe("Ian");
      expect(res.body.data.alignment).toBe("Lawful Good");
    });

    it("400 se manca la razza (solo campaign_id + nome + classe)", async () => {
      await request(app)
        .post("/api/characters")
        .send({
          campaign_id: campaignId,
          character_name: "Incomplete",
          class_name: "Bard",
        })
        .expect(400);
    });
  });

  describe("Flusso due POST in sequenza (campagna → personaggio)", () => {
    it("usa l'id campagna dalla risposta per il secondo inserimento", async () => {
      const camp = {
        id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
        name: "One Shot",
        description: null,
        dm_name: "DM",
        world_setting: null,
        level_range: "1-4",
        status: "active",
        created_at: "2026-01-05T00:00:00Z",
      };
      const char = {
        id: "99999999-9999-9999-9999-999999999999",
        campaign_id: camp.id,
        character_name: "PC1",
        class_name: "Fighter",
        race: "Dwarf",
        level: 1,
        experience: 0,
        alignment: "Neutral",
        background: null,
        player_name: null,
        stats: {
          strength: 16,
          dexterity: 10,
          constitution: 14,
          intelligence: 8,
          wisdom: 10,
          charisma: 8,
        },
        status: "active",
        created_at: "2026-01-05T00:01:00Z",
      };

      mockDb.enqueue(dbList([camp]), dbList([char]));

      const resCamp = await request(app)
        .post("/api/campaigns")
        .send({ name: "One Shot", dm_name: "DM", level_range: "1-4" })
        .expect(201);

      const cid = resCamp.body.data.id as string;
      expect(cid).toBe(camp.id);

      const resChar = await request(app)
        .post("/api/characters")
        .send({
          campaign_id: cid,
          character_name: "PC1",
          class_name: "Fighter",
          race: "Dwarf",
        })
        .expect(201);

      expect(resChar.body.data.campaign_id).toBe(cid);
      expect(resChar.body.data.character_name).toBe("PC1");
    });
  });
});
