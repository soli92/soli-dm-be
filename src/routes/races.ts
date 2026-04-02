import { Router, Request, Response } from "express";

const router = Router();

// D&D 5e Races data
const dndRaces = [
  {
    name: "Dragonborn",
    description: "Descended from dragons, dragonborn walk proudly through a world that greets them with fearful incomprehension.",
    ability_scores: { Strength: 2, Charisma: 1 },
    size: "Medium",
    speed: "30 ft",
    languages: ["Common", "Draconic"],
    traits: ["Draconic Ancestry", "Breath Weapon", "Damage Resistance"],
  },
  {
    name: "Dwarf",
    description: "Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal.",
    ability_scores: { Constitution: 2, Wisdom: 1 },
    size: "Medium",
    speed: "25 ft",
    languages: ["Common", "Dwarvish"],
    traits: ["Darkvision", "Dwarven Resilience", "Dwarven Combat Training", "Stonecunning"],
  },
  {
    name: "Elf",
    description: "Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.",
    ability_scores: { Dexterity: 2, Intelligence: 1 },
    size: "Medium",
    speed: "30 ft",
    languages: ["Common", "Elvish"],
    traits: ["Darkvision", "Keen Senses", "Fey Ancestry", "Trance"],
  },
  {
    name: "Gnome",
    description: "A gnome's energy and enthusiasm for living shines through every inch of his or her body.",
    ability_scores: { Intelligence: 2, Constitution: 1 },
    size: "Small",
    speed: "25 ft",
    languages: ["Common", "Gnomish"],
    traits: ["Darkvision", "Gnome Cunning"],
  },
  {
    name: "Half-Elf",
    description: "Half-elves' independence and ambition often drive them toward politics and power.",
    ability_scores: { Charisma: 2, "Any Two Other Ability Scores": 1 },
    size: "Medium",
    speed: "30 ft",
    languages: ["Common", "Elvish"],
    traits: ["Darkvision", "Keen Senses", "Fey Ancestry"],
  },
  {
    name: "Half-Orc",
    description: "Half-orcs' grayish pigmentation, sloping foreheads, jutting jaws, prominent teeth, and towering builds make their orcish heritage plain for all to see.",
    ability_scores: { Strength: 2, Constitution: 1 },
    size: "Medium",
    speed: "30 ft",
    languages: ["Common", "Orc"],
    traits: ["Darkvision", "Menacing", "Relentless Endurance"],
  },
  {
    name: "Halfling",
    description: "The diminutive halflings survive in a world full of larger creatures by avoiding notice and, barring that, avoiding offense.",
    ability_scores: { Dexterity: 2, Charisma: 1 },
    size: "Small",
    speed: "25 ft",
    languages: ["Common", "Halfling"],
    traits: ["Lucky", "Brave", "Halfling Nimbleness"],
  },
  {
    name: "Human",
    description: "Humans are the most adaptable and ambitious people among the common races.",
    ability_scores: { "All Ability Scores": 1 },
    size: "Medium",
    speed: "30 ft",
    languages: ["Common"],
    traits: ["Adaptability", "Extra Ability Score Increase"],
  },
  {
    name: "Tiefling",
    description: "To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling.",
    ability_scores: { Charisma: 2, Intelligence: 1 },
    size: "Medium",
    speed: "30 ft",
    languages: ["Common", "Infernal"],
    traits: ["Infernal Legacy", "Infernal Resistance"],
  },
  {
    name: "Asimar",
    description: "Aasimar are human-based planetouched, native outsiders with a touch of the goodness of the Upper Planes.",
    ability_scores: { Charisma: 2, Wisdom: 1 },
    size: "Medium",
    speed: "30 ft",
    languages: ["Common", "Celestial"],
    traits: ["Celestial Legacy", "Celestial Resistance"],
  },
  {
    name: "Genasi",
    description: "Genasi are as varied as their mortal parents but are generally built as they are, roughly humanoid.",
    ability_scores: { Constittion: 2, "Dexterity or Intelligence": 1 },
    size: "Medium",
    speed: "30 ft",
    languages: ["Common", "Primordial"],
    traits: ["Elemental Resistance", "Elemental Affinity"],
  },
  {
    name: "Goliath",
    description: "Goliaths are giant-kin, standing 7 to 8 feet tall and possessing a natural athleticism that is almost superhuman.",
    ability_scores: { Strength: 2, Constitution: 1 },
    size: "Medium",
    speed: "30 ft",
    languages: ["Common", "Giant"],
    traits: ["Stone's Endurance", "Powerful Build"],
  },
];

/**
 * GET /api/races
 * Lista tutte le razze D&D
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: dndRaces,
      count: dndRaces.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/races/:name
 * Ottieni dettagli di una razza specifica
 */
router.get("/:name", async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const raceData = dndRaces.find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );

    if (!raceData) {
      return res.status(404).json({ error: "Race not found" });
    }

    res.json({ success: true, data: raceData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
