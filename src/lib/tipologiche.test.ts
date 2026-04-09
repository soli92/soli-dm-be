import { describe, it, expect } from "vitest";
import {
  isKnownAlignment,
  DND_ALIGNMENTS,
  DEFAULT_CHARACTER_ALIGNMENT,
  DEFAULT_CAMPAIGN_STATUS,
  DEFAULT_CHARACTER_STATUS,
  CAMPAIGN_STATUSES,
  CHARACTER_STATUSES,
} from "./tipologiche";

describe("tipologiche", () => {
  it("isKnownAlignment accetta valori PHB", () => {
    expect(isKnownAlignment("Neutral")).toBe(true);
    expect(isKnownAlignment("Lawful Good")).toBe(true);
  });

  it("isKnownAlignment rifiuta stringhe arbitrarie", () => {
    expect(isKnownAlignment("Chaotic Stupid")).toBe(false);
    expect(isKnownAlignment("")).toBe(false);
  });

  it("DND_ALIGNMENTS ha 9 voci (allineare a soli-dm-fe lib/tipologiche/dnd.ts)", () => {
    expect(DND_ALIGNMENTS.length).toBe(9);
  });

  it("default personaggio: Neutral + active", () => {
    expect(DEFAULT_CHARACTER_ALIGNMENT).toBe("Neutral");
    expect(DEFAULT_CHARACTER_STATUS).toBe("active");
    expect(CHARACTER_STATUSES).toContain(DEFAULT_CHARACTER_STATUS);
  });

  it("default campagna: active", () => {
    expect(DEFAULT_CAMPAIGN_STATUS).toBe("active");
    expect(CAMPAIGN_STATUSES).toContain(DEFAULT_CAMPAIGN_STATUS);
  });
});
