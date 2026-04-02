import { describe, it, expect } from "vitest";
import { rollDiceNotation } from "./diceRoll";

describe("rollDiceNotation", () => {
  it("parses 2d6 and uses rng deterministically", () => {
    let i = 0;
    const seq = [0, 0.99, 0.5, 0.5];
    const rng = () => seq[i++ % seq.length];
    const r = rollDiceNotation("2d6", rng);
    expect(r.notation).toBe("2d6");
    expect(r.rolls).toHaveLength(2);
    expect(r.rolls[0]).toBe(1);
    expect(r.rolls[1]).toBe(6);
    expect(r.total).toBe(7);
  });

  it("accepts uppercase and trims", () => {
    const r = rollDiceNotation(" 1D20 ", () => 0);
    expect(r.rolls).toEqual([1]);
    expect(r.total).toBe(1);
  });

  it("rejects invalid notation", () => {
    expect(() => rollDiceNotation("1d20+5")).toThrow(/Invalid dice notation/);
    expect(() => rollDiceNotation("d6")).toThrow(/Invalid dice notation/);
  });

  it("rejects non-positive counts", () => {
    expect(() => rollDiceNotation("0d6")).toThrow(/positive/);
    expect(() => rollDiceNotation("1d0")).toThrow(/positive/);
  });

  it("rejects too many dice or sides", () => {
    expect(() => rollDiceNotation("101d6")).toThrow(/Maximum 100 dice/);
    expect(() => rollDiceNotation("1d1001")).toThrow(/Maximum 1000 sides/);
  });
});
