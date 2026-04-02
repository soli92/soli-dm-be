import { Router, Request, Response } from "express";

const router = Router();

// D&D 5e Core Rules
const dndRules = {
  ability_scores: {
    title: "Ability Scores",
    description: "Six abilities define what your character can do",
    abilities: [
      {
        name: "Strength",
        abbreviation: "STR",
        description:
          "Measuring bodily power. Used for melee attacks, carrying, and climbing.",
        checks: ["Attack rolls", "Grapple checks", "Climb checks"],
      },
      {
        name: "Dexterity",
        abbreviation: "DEX",
        description:
          "Measuring agility and balance. Used for AC, initiative, and ranged attacks.",
        checks: ["Initiative", "Acrobatics", "Sleight of Hand"],
      },
      {
        name: "Constitution",
        abbreviation: "CON",
        description: "Measuring endurance. Determines hit points and concentration saves.",
        checks: ["Concentration saves", "Physical endurance"],
      },
      {
        name: "Intelligence",
        abbreviation: "INT",
        description: "Measuring reasoning and memory. Used for knowledge checks.",
        checks: ["Arcana", "History", "Investigation", "Nature", "Religion"],
      },
      {
        name: "Wisdom",
        abbreviation: "WIS",
        description:
          "Measuring awareness and insight. Used for perception and saves against charm/fear.",
        checks: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"],
      },
      {
        name: "Charisma",
        abbreviation: "CHA",
        description:
          "Measuring force of personality. Used for persuasion and spellcasting.",
        checks: ["Deception", "Intimidation", "Performance", "Persuasion"],
      },
    ],
  },

  combat: {
    title: "Combat",
    description: "Rules for fighting in D&D",
    key_mechanics: [
      {
        name: "Initiative",
        description:
          "Roll 1d20 + Dexterity modifier to determine turn order in combat",
      },
      {
        name: "Attack Roll",
        description:
          "Roll 1d20 + proficiency bonus + ability modifier. Compare to opponent's AC.",
      },
      {
        name: "Damage Roll",
        description:
          "Roll damage die + ability modifier. Different weapons deal different damage.",
      },
      {
        name: "Armor Class (AC)",
        description:
          "Number representing how hard it is to hit. 10 + DEX mod is baseline for no armor.",
      },
      {
        name: "Hit Points (HP)",
        description:
          "Represent how much damage you can take. Determined by class hit die + CON modifier.",
      },
      {
        name: "Death Saves",
        description:
          "When HP reaches 0, roll 1d20. 10+ is success, under 10 is failure. 3 failures = death.",
      },
      {
        name: "Action Economy",
        description:
          "On your turn: 1 Action, 1 Bonus Action, 1 Reaction, Movement (30 ft typical)",
      },
    ],
  },

  saving_throws: {
    title: "Saving Throws",
    description: "Rolling to resist harmful effects",
    mechanics: [
      {
        name: "Strength Save",
        description: "Used to resist effects that move or harm your physical body",
      },
      {
        name: "Dexterity Save",
        description: "Used to avoid area attacks like fireballs or falling objects",
      },
      {
        name: "Constitution Save",
        description: "Used to resist poison, disease, and other body-based effects",
      },
      {
        name: "Intelligence Save",
        description: "Used to resist mind-altering illusions and mental attacks",
      },
      {
        name: "Wisdom Save",
        description:
          "Used to resist charm, fear, and enchantment. Also for concentration checks",
      },
      {
        name: "Charisma Save",
        description: "Used to resist persuasion and domination effects",
      },
    ],
  },

  skill_checks: {
    title: "Skill Checks",
    description: "Rolling to accomplish specific tasks",
    dc_table: [
      { dc: 5, difficulty: "Very Easy" },
      { dc: 10, difficulty: "Easy" },
      { dc: 15, difficulty: "Moderate" },
      { dc: 20, difficulty: "Hard" },
      { dc: 25, difficulty: "Very Hard" },
      { dc: 30, difficulty: "Nearly Impossible" },
    ],
  },

  resting: {
    title: "Resting",
    description: "How characters recover during adventures",
    short_rest: {
      duration: "1 hour",
      benefits: [
        "Recover some hit points (spend Hit Dice)",
        "Regain certain class abilities",
        "Some spells can be regained",
      ],
    },
    long_rest: {
      duration: "8 hours",
      benefits: [
        "Recover all hit points",
        "Regain all Hit Dice (up to half your level, rounded up)",
        "Regain all spells and abilities that restore on long rest",
        "Requirements: uninterrupted rest, no heavy armor, light activity only",
      ],
    },
  },

  multiclassing: {
    title: "Multiclassing",
    description: "Advancing multiple classes",
    requirements:
      "Ability score minimum: 13 in each class's primary ability score",
    benefits: [
      "Gain features and spells from multiple classes",
      "Flexible character builds",
      "Combine abilities in creative ways",
    ],
  },
};

/**
 * GET /api/rules
 * Lista tutte le categorie di regole
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const categories = Object.keys(dndRules).map((key) => ({
      id: key,
      title: dndRules[key as keyof typeof dndRules].title,
      description: dndRules[key as keyof typeof dndRules].description,
    }));

    res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/rules/:category
 * Ottieni le regole di una categoria specifica
 */
router.get("/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const ruleData = dndRules[category as keyof typeof dndRules];

    if (!ruleData) {
      return res.status(404).json({ error: "Rule category not found" });
    }

    res.json({ success: true, data: ruleData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/rules/ability-scores/list
 * Lista tutte le ability scores
 */
router.get("/ability-scores/list", async (req: Request, res: Response) => {
  try {
    const abilities = dndRules.ability_scores.abilities;
    res.json({
      success: true,
      data: abilities,
      count: abilities.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
