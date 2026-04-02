import { Router, Request, Response } from "express";

const router = Router();

// D&D 5e Deities (Forgotten Realms pantheon)
const dndDeities = [
  {
    name: "Abadar",
    alignment: "Lawful Neutral",
    domain: "Trade, Wealth",
    description: "God of commerce, banking, and wealth",
    holy_symbol: "Golden key",
    typical_worshippers: "Merchants, bankers, traders",
  },
  {
    name: "Amaunator",
    alignment: "Lawful Neutral",
    domain: "Sun, Order",
    description: "God of the sun and law (also called Ao)",
    holy_symbol: "Radiant sun",
    typical_worshippers: "Clerics, paladins, lawful folk",
  },
  {
    name: "Ares",
    alignment: "Chaotic Evil",
    domain: "War, Strength",
    description: "God of war and battle",
    holy_symbol: "Spear and shield",
    typical_worshippers: "Warriors, soldiers, barbarians",
  },
  {
    name: "Artemis",
    alignment: "Neutral Good",
    domain: "Hunt, Moon",
    description: "Goddess of the hunt and the moon",
    holy_symbol: "Bow and arrows",
    typical_worshippers: "Rangers, hunters, archers",
  },
  {
    name: "Athena",
    alignment: "Lawful Good",
    domain: "Wisdom, War",
    description: "Goddess of wisdom, warfare, and crafts",
    holy_symbol: "Owl on a shield",
    typical_worshippers: "Scholars, warriors, craftspeople",
  },
  {
    name: "Auril",
    alignment: "Neutral Evil",
    domain: "Winter, Frost",
    description: "Goddess of winter, cold, and frost",
    holy_symbol: "Snowflake",
    typical_worshippers: "Frost giants, ice mages",
  },
  {
    name: "Bane",
    alignment: "Lawful Evil",
    domain: "Tyranny, Conflict",
    description: "God of tyranny, conflict, and strife",
    holy_symbol: "Upright hand with gauntlet",
    typical_worshippers: "Tyrants, war-mongers, evil paladins",
  },
  {
    name: "Bhaal",
    alignment: "Chaotic Evil",
    domain: "Murder, Death",
    description: "God of murder and assassination (dead god)",
    holy_symbol: "Skull cloven in half",
    typical_worshippers: "Assassins, murderers (cult following)",
  },
  {
    name: "Corellon",
    alignment: "Chaotic Good",
    domain: "Elves, Magic",
    description: "Creator of the elves and patron of magic",
    holy_symbol: "Eight-pointed star",
    typical_worshippers: "Elves, mages, bards",
  },
  {
    name: "Cyric",
    alignment: "Chaotic Evil",
    domain: "Trickery, Chaos",
    description: "God of lies, deception, and chaos",
    holy_symbol: "White hand on black field",
    typical_worshippers: "Rogues, liars, tricksters",
  },
  {
    name: "Helm",
    alignment: "Lawful Neutral",
    domain: "Protection, Duty",
    description: "God of protection and duty",
    holy_symbol: "Staring eye",
    typical_worshippers: "Guardians, defenders, paladins",
  },
  {
    name: "Lathander",
    alignment: "Neutral Good",
    domain: "Dawn, Renewal",
    description: "God of dawn, spring, birth, and renewal",
    holy_symbol: "Road traveling into sunrise",
    typical_worshippers: "Travelers, adventurers, healers",
  },
  {
    name: "Lolth",
    alignment: "Chaotic Evil",
    domain: "Spiders, Chaos",
    description: "Goddess of spiders and drow, demon princess",
    holy_symbol: "Spider",
    typical_worshippers: "Drow, spider cultists",
  },
  {
    name: "Moradin",
    alignment: "Lawful Good",
    domain: "Dwarves, Creation",
    description: "Creator of dwarves, god of forge and mining",
    holy_symbol: "Hammer and anvil",
    typical_worshippers: ["Dwarves", "Blacksmiths", "Miners"],
  },
  {
    name: "Myrkul",
    alignment: "Neutral Evil",
    domain: "Death, Undead",
    description: "God of death and undead",
    holy_symbol: "Skull in a grasping skeletal hand",
    typical_worshippers: "Necromancers, gravediggers, undead",
  },
  {
    name: "Mystra",
    alignment: "Neutral Good",
    domain: "Magic, Knowledge",
    description: "Goddess of magic and the Weave",
    holy_symbol: "Star within circle",
    typical_worshippers: "Wizards, sorcerers, magic users",
  },
  {
    name: "Oghma",
    alignment: "Neutral",
    domain: "Knowledge, Invention",
    description: "God of knowledge, invention, and inspiration",
    holy_symbol: "Quill",
    typical_worshippers: "Scholars, bards, inventors",
  },
  {
    name: "Selûne",
    alignment: "Chaotic Good",
    domain: "Moon, Stars",
    description: "Goddess of the moon and stars",
    holy_symbol: "Crescent moon",
    typical_worshippers: "Travelers, sailors, seekers",
  },
  {
    name: "Shar",
    alignment: "Neutral Evil",
    domain: "Shadow, Secrets",
    description: "Goddess of shadow, secrets, and loss",
    holy_symbol: "Black circle with white center",
    typical_worshippers: "Assassins, shadow mages, infiltrators",
  },
  {
    name: "Silvanus",
    alignment: "Neutral",
    domain: "Nature, Wild",
    description: "God of nature, wild places, and druids",
    holy_symbol: "Oak tree",
    typical_worshippers: "Druids, rangers, woodspeople",
  },
];

/**
 * GET /api/deities
 * Lista tutte le divinità D&D
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: dndDeities,
      count: dndDeities.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/deities/filter/alignment/:alignment
 * Filtra le divinità per allineamento (prima di /:name)
 */
router.get("/filter/alignment/:alignment", async (req: Request, res: Response) => {
  try {
    const { alignment } = req.params;
    const filtered = dndDeities.filter(
      (d) => d.alignment.toLowerCase() === alignment.toLowerCase()
    );

    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/deities/:name
 * Ottieni dettagli di una divinità specifica
 */
router.get("/:name", async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const deityData = dndDeities.find(
      (d) => d.name.toLowerCase() === name.toLowerCase()
    );

    if (!deityData) {
      return res.status(404).json({ error: "Deity not found" });
    }

    res.json({ success: true, data: deityData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
