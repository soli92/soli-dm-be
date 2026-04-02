import { Router, Request, Response } from "express";
import { supabase } from "../server";

const router = Router();

// D&D 5e Classes data (hardcoded for quick access)
const dndClasses = [
  {
    name: "Barbarian",
    description: "A fierce warrior of incredible toughness, relying on primal power.",
    hit_die: "d12",
    primary_ability: "Strength",
    saving_throws: ["Strength", "Constitution"],
    armor_proficiency: "Light and medium armor, shields",
    weapon_proficiency: "Simple and martial weapons",
    features: ["Rage", "Unarmored Defense", "Reckless Attack", "Danger Sense"],
  },
  {
    name: "Bard",
    description: "An inspiring magician whose power echoes the music of creation itself.",
    hit_die: "d8",
    primary_ability: "Charisma",
    saving_throws: ["Dexterity", "Charisma"],
    armor_proficiency: "Light armor",
    weapon_proficiency: "Simple weapons, hand crossbows, longswords, rapiers, shortswords",
    features: ["Spellcasting", "Bardic Inspiration", "Jack of All Trades", "Song of Rest"],
  },
  {
    name: "Cleric",
    description: "A priestly champion who wields divine magic in service of a higher power.",
    hit_die: "d8",
    primary_ability: "Wisdom",
    saving_throws: ["Wisdom", "Charisma"],
    armor_proficiency: "Light and medium armor, shields",
    weapon_proficiency: "Simple weapons",
    features: ["Spellcasting", "Channel Divinity", "Divine Domain", "Destroy Undead"],
  },
  {
    name: "Druid",
    description: "A priest of the Old Faith, wielding the powers of nature and adopting animal forms.",
    hit_die: "d8",
    primary_ability: "Wisdom",
    saving_throws: ["Intelligence", "Wisdom"],
    armor_proficiency: "Light and medium armor (non-metal), shields (non-metal)",
    weapon_proficiency: "Simple melee weapons",
    features: ["Spellcasting", "Druidic", "Wild Shape", "Timeless Body"],
  },
  {
    name: "Fighter",
    description: "A master of weaponry and the martial arts, seeking glory in battle.",
    hit_die: "d10",
    primary_ability: "Strength or Dexterity",
    saving_throws: ["Strength", "Constitution"],
    armor_proficiency: "All armor, shields",
    weapon_proficiency: "Simple and martial weapons",
    features: ["Fighting Style", "Second Wind", "Action Surge", "Extra Attack"],
  },
  {
    name: "Monk",
    description: "A master of martial arts, harnessing the power of the body in pursuit of physical and spiritual perfection.",
    hit_die: "d8",
    primary_ability: "Dexterity and Wisdom",
    saving_throws: ["Strength", "Dexterity"],
    armor_proficiency: "None",
    weapon_proficiency: "Simple melee weapons, shortswords",
    features: ["Unarmored Defense", "Martial Arts", "Ki", "Unarmored Movement"],
  },
  {
    name: "Paladin",
    description: "A holy warrior bound by oath to fight the forces of evil.",
    hit_die: "d10",
    primary_ability: "Strength and Charisma",
    saving_throws: ["Wisdom", "Charisma"],
    armor_proficiency: "All armor, shields",
    weapon_proficiency: "Simple and martial weapons",
    features: ["Divine Sense", "Lay on Hands", "Fighting Style", "Spellcasting"],
  },
  {
    name: "Ranger",
    description: "A guardian and hunter of the wilderness, seeking to protect others in wild places.",
    hit_die: "d10",
    primary_ability: "Dexterity and Wisdom",
    saving_throws: ["Strength", "Dexterity"],
    armor_proficiency: "Light and medium armor, shields",
    weapon_proficiency: "Simple and martial weapons",
    features: ["Favored Enemy", "Drakewarden", "Spellcasting", "Hunter's Mark"],
  },
  {
    name: "Rogue",
    description: "A scoundrel who uses stealth and trickery to overcome obstacles and enemies.",
    hit_die: "d8",
    primary_ability: "Dexterity",
    saving_throws: ["Dexterity", "Intelligence"],
    armor_proficiency: "Light armor",
    weapon_proficiency: "Simple weapons, hand crossbows, longswords, rapiers, shortswords",
    features: ["Expertise", "Sneak Attack", "Cunning Action", "Roguish Archetype"],
  },
  {
    name: "Sorcerer",
    description: "A spellcaster who has innate magical ability due to some influence in their lineage.",
    hit_die: "d6",
    primary_ability: "Charisma",
    saving_throws: ["Intelligence", "Wisdom"],
    armor_proficiency: "None",
    weapon_proficiency: "Daggers, darts, slings, quarterstaffs, light crossbows",
    features: ["Spellcasting", "Sorcerous Origin", "Font of Magic", "Metamagic"],
  },
  {
    name: "Warlock",
    description: "A wielder of magic that is derived from a bargain with an otherworldly being.",
    hit_die: "d8",
    primary_ability: "Charisma",
    saving_throws: ["Wisdom"],
    armor_proficiency: "Light armor",
    weapon_proficiency: "Simple weapons",
    features: ["Spellcasting", "Pact Magic", "Eldritch Invocations", "Pact Boon"],
  },
  {
    name: "Wizard",
    description: "A scholarly magic-user capable of manipulating the structures of reality.",
    hit_die: "d6",
    primary_ability: "Intelligence",
    saving_throws: ["Intelligence", "Wisdom"],
    armor_proficiency: "None",
    weapon_proficiency: "Daggers, darts, slings, quarterstaffs, light crossbows",
    features: ["Spellcasting", "Arcane Recovery", "Arcane Tradition", "Spell Mastery"],
  },
];

/**
 * GET /api/classes
 * Lista tutte le classi D&D
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: dndClasses,
      count: dndClasses.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/classes/:name
 * Ottieni dettagli di una classe specifica
 */
router.get("/:name", async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const classData = dndClasses.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json({ success: true, data: classData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
