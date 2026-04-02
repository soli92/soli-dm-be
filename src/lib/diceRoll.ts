export type DiceRollOutcome = {
  rolls: number[];
  total: number;
  notation: string;
};

/**
 * Lancio NdX (es. 4d6, 1d20). `rng` deve restituire valori in [0, 1) come `Math.random`.
 */
export function rollDiceNotation(
  notation: string,
  rng: () => number = Math.random
): DiceRollOutcome {
  const trimmed = notation.trim();
  const match = trimmed.match(/^(\d+)d(\d+)$/i);
  if (!match) {
    throw new Error(
      "Invalid dice notation. Use format: NdX (e.g., 4d6, 2d20)"
    );
  }

  const numDice = parseInt(match[1]!, 10);
  const numSides = parseInt(match[2]!, 10);

  if (numDice <= 0 || numSides <= 0) {
    throw new Error("Number of dice and sides must be positive");
  }

  if (numDice > 100) {
    throw new Error("Maximum 100 dice per roll");
  }

  if (numSides > 1000) {
    throw new Error("Maximum 1000 sides per die");
  }

  const rolls: number[] = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(rng() * numSides) + 1);
  }

  const total = rolls.reduce((sum, roll) => sum + roll, 0);

  return { rolls, total, notation: trimmed };
}
