import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import request from "supertest";
import { createApp } from "./createApp";

/**
 * Route wiki: classi/razze usano Supabase `wiki_srd_cache` se popolata; con mock vuoto → fallback statico.
 * Divinità e regole restano statiche in routes.
 */
describe("Wiki API (integration)", () => {
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

  describe("GET /api/classes", () => {
    it("restituisce 12 classi con shape attesa", async () => {
      const res = await request(app()).get("/api/classes").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(12);
      expect(res.body.data).toHaveLength(12);
      const barbarian = res.body.data.find((c: { name: string }) => c.name === "Barbarian");
      expect(barbarian).toMatchObject({
        name: "Barbarian",
        hit_die: "d12",
        primary_ability: "Strength",
      });
      expect(Array.isArray(barbarian.saving_throws)).toBe(true);
      expect(Array.isArray(barbarian.features)).toBe(true);
    });
  });

  describe("GET /api/classes/:name", () => {
    it("risolve case-insensitive e restituisce Wizard", async () => {
      const res = await request(app()).get("/api/classes/wIzArD").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Wizard");
      expect(res.body.data.hit_die).toBe("d6");
    });

    it("404 per classe sconosciuta", async () => {
      const res = await request(app()).get("/api/classes/Artificer").expect(404);
      expect(res.body.error).toMatch(/not found/i);
    });
  });

  describe("GET /api/races", () => {
    it("restituisce 12 razze con campi chiave", async () => {
      const res = await request(app()).get("/api/races").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(12);
      const human = res.body.data.find((r: { name: string }) => r.name === "Human");
      expect(human).toMatchObject({
        name: "Human",
        size: "Medium",
      });
      expect(human.ability_scores).toBeDefined();
      expect(Array.isArray(human.languages)).toBe(true);
      expect(Array.isArray(human.traits)).toBe(true);
    });
  });

  describe("GET /api/races/:name", () => {
    it("Half-Elf case-insensitive", async () => {
      const res = await request(app()).get("/api/races/half-elf").expect(200);
      expect(res.body.data.name).toBe("Half-Elf");
      expect(res.body.data.speed).toMatch(/30/);
    });

    it("404 razza sconosciuta", async () => {
      await request(app()).get("/api/races/Dragon").expect(404);
    });
  });

  describe("GET /api/deities", () => {
    it("lista completa con count coerente", async () => {
      const res = await request(app()).get("/api/deities").expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(res.body.data.length);
      expect(res.body.count).toBeGreaterThanOrEqual(18);
      const mystra = res.body.data.find((d: { name: string }) => d.name === "Mystra");
      expect(mystra).toMatchObject({
        alignment: "Neutral Good",
        domain: "Magic, Knowledge",
      });
      expect(typeof mystra.holy_symbol).toBe("string");
    });
  });

  describe("GET /api/deities/filter/alignment/:alignment", () => {
    it("filtra Lawful Evil (Bane)", async () => {
      const res = await request(app())
        .get("/api/deities/filter/alignment/lawful%20evil")
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every((d: { alignment: string }) => d.alignment === "Lawful Evil")).toBe(
        true
      );
      expect(res.body.data.some((d: { name: string }) => d.name === "Bane")).toBe(true);
    });

    it("filtra Neutral Good (più divinità)", async () => {
      const res = await request(app())
        .get("/api/deities/filter/alignment/neutral%20good")
        .expect(200);
      expect(res.body.count).toBeGreaterThanOrEqual(2);
      expect(res.body.data.some((d: { name: string }) => d.name === "Lathander")).toBe(true);
    });

    it("nessun match → lista vuota", async () => {
      const res = await request(app())
        .get("/api/deities/filter/alignment/xyz-nonexistent")
        .expect(200);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /api/deities/:name", () => {
    it("non collide con /filter/… (route order)", async () => {
      const res = await request(app()).get("/api/deities/Helm").expect(200);
      expect(res.body.data.name).toBe("Helm");
      expect(res.body.data.domain).toContain("Protection");
    });

    it("404 divinità sconosciuta", async () => {
      await request(app()).get("/api/deities/Zarathustra").expect(404);
    });
  });

  describe("GET /api/rules", () => {
    it("elenca categorie con id e title", async () => {
      const res = await request(app()).get("/api/rules").expect(200);
      expect(res.body.success).toBe(true);
      const ids = res.body.data.map((c: { id: string }) => c.id);
      expect(ids).toEqual(
        expect.arrayContaining([
          "ability_scores",
          "combat",
          "saving_throws",
          "skill_checks",
          "resting",
          "multiclassing",
        ])
      );
      expect(res.body.count).toBe(6);
      const combat = res.body.data.find((c: { id: string }) => c.id === "combat");
      expect(combat.title).toBe("Combat");
      expect(combat.description).toBeTruthy();
    });
  });

  describe("GET /api/rules/ability-scores/list", () => {
    it("restituisce 6 ability con STR e checks", async () => {
      const res = await request(app()).get("/api/rules/ability-scores/list").expect(200);
      expect(res.body.count).toBe(6);
      const str = res.body.data.find((a: { abbreviation: string }) => a.abbreviation === "STR");
      expect(str.name).toBe("Strength");
      expect(Array.isArray(str.checks)).toBe(true);
      expect(str.checks.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/rules/:category", () => {
    it("combat include key_mechanics con Initiative", async () => {
      const res = await request(app()).get("/api/rules/combat").expect(200);
      expect(res.body.data.title).toBe("Combat");
      expect(res.body.data.key_mechanics).toBeDefined();
      const init = res.body.data.key_mechanics.find(
        (m: { name: string }) => m.name === "Initiative"
      );
      expect(init?.description).toMatch(/Dexterity/i);
    });

    it("skill_checks include dc_table 5–30", async () => {
      const res = await request(app()).get("/api/rules/skill_checks").expect(200);
      const dcs = res.body.data.dc_table.map((row: { dc: number }) => row.dc);
      expect(Math.min(...dcs)).toBe(5);
      expect(Math.max(...dcs)).toBe(30);
    });

    it("resting include short_rest e long_rest", async () => {
      const res = await request(app()).get("/api/rules/resting").expect(200);
      expect(res.body.data.short_rest.duration).toMatch(/1 hour/i);
      expect(res.body.data.long_rest.benefits.length).toBeGreaterThan(0);
    });

    it("404 categoria sconosciuta", async () => {
      await request(app()).get("/api/rules/spellcasting").expect(404);
    });
  });
});
