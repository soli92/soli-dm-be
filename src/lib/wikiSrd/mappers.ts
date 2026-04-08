import type { WikiClassDTO } from "../../data/wikiClassesStatic";
import type { WikiRaceDTO } from "../../data/wikiRacesStatic";

const ABILITY_FULL: Record<string, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

function abilityFull(index: string | undefined): string {
  if (!index) return "Unknown";
  return ABILITY_FULL[index.toLowerCase()] ?? index.toUpperCase();
}

type ApiRef = { index?: string; name?: string };
type ApiProf = { index?: string; name?: string };
type ApiSave = { index?: string; name?: string };
type ApiSubclass = { name?: string };
type ApiSpellcasting = {
  spellcasting_ability?: ApiRef;
};
type ApiPrereq = { ability_score?: ApiRef; minimum_score?: number };
type ApiMultiClass = {
  prerequisites?: ApiPrereq[];
};
type ApiAbilityBonus = {
  ability_score?: ApiRef;
  bonus?: number;
};
type ApiTrait = { name?: string };
type ApiLanguage = { name?: string };

export type Dnd5eClassPayload = {
  index?: string;
  name?: string;
  hit_die?: number;
  proficiencies?: ApiProf[];
  saving_throws?: ApiSave[];
  subclasses?: ApiSubclass[];
  spellcasting?: ApiSpellcasting;
  multi_classing?: ApiMultiClass;
  _soli?: { feature_names?: string[] };
};

export type Dnd5eRacePayload = {
  index?: string;
  name?: string;
  speed?: number;
  ability_bonuses?: ApiAbilityBonus[];
  ability_bonus_options?: { choose?: number; from?: unknown };
  age?: string;
  alignment?: string;
  size?: string;
  languages?: ApiLanguage[];
  traits?: ApiTrait[];
  language_desc?: string;
};

function classPrimaryAbility(p: Dnd5eClassPayload): string {
  const idx = p.spellcasting?.spellcasting_ability?.index;
  if (idx) return abilityFull(idx);
  const pre = p.multi_classing?.prerequisites;
  if (pre?.length) {
    return pre.map((x) => abilityFull(x.ability_score?.index)).join(" and ");
  }
  const st = p.saving_throws ?? [];
  return st.map((x) => abilityFull(x.index)).join(" and ");
}

function splitArmorWeapons(profs: ApiProf[]): { armor: string; weapons: string } {
  const list = (profs ?? []).filter(
    (x) => x.index && !String(x.index).startsWith("saving-throw")
  );
  const armorNames = list
    .filter(
      (x) =>
        /armor|shield/i.test(x.name ?? "") || String(x.index).includes("armor") || x.index === "shields"
    )
    .map((x) => x.name ?? x.index ?? "");
  const weaponNames = list
    .filter(
      (x) =>
        !/armor|shield/i.test(x.name ?? "") &&
        !String(x.index).includes("armor") &&
        x.index !== "shields"
    )
    .map((x) => x.name ?? x.index ?? "");
  return {
    armor: armorNames.length ? armorNames.join(", ") : "—",
    weapons: weaponNames.length ? weaponNames.join(", ") : "—",
  };
}

export function mapDndClassPayload(p: Dnd5eClassPayload): WikiClassDTO {
  const name = p.name ?? p.index ?? "Unknown";
  const hitDie = typeof p.hit_die === "number" ? p.hit_die : 8;
  const subs = (p.subclasses ?? []).map((s) => s.name).filter(Boolean);
  const description = `${name} (D&D 5e SRD). ${subs.length ? `Subclasses include: ${subs.join(", ")}.` : ""} Data source: dnd5eapi.co.`.trim();
  const { armor, weapons } = splitArmorWeapons(p.proficiencies ?? []);
  const saving = (p.saving_throws ?? []).map((s) => abilityFull(s.index));
  const features = p._soli?.feature_names?.length
    ? p._soli.feature_names
    : subs.length
      ? [`Subclass choice: ${subs[0]}`]
      : ["See SRD for class progression"];

  return {
    name,
    description,
    hit_die: `d${hitDie}`,
    primary_ability: classPrimaryAbility(p),
    saving_throws: saving,
    armor_proficiency: armor,
    weapon_proficiency: weapons,
    features,
  };
}

function mapAbilityScores(p: Dnd5eRacePayload): Record<string, number> {
  const bonuses = p.ability_bonuses ?? [];
  if (bonuses.length >= 5 && bonuses.every((b) => b.bonus === 1)) {
    return { "All Ability Scores": 1 };
  }
  const out: Record<string, number> = {};
  for (const row of bonuses) {
    const idx = row.ability_score?.index;
    const bonus = row.bonus;
    if (!idx || typeof bonus !== "number") continue;
    out[abilityFull(idx)] = bonus;
  }
  const choose = p.ability_bonus_options?.choose;
  if (choose === 2) {
    out["Any Two Other Ability Scores"] = 1;
  } else if (choose && choose > 0) {
    out[`Player choice (${choose} abilities, see SRD)`] = 1;
  }
  return out;
}

export function mapDndRacePayload(p: Dnd5eRacePayload): WikiRaceDTO {
  const name = p.name ?? p.index ?? "Unknown";
  const speed = typeof p.speed === "number" ? `${p.speed} ft` : "30 ft";
  const languages = (p.languages ?? []).map((l) => l.name).filter(Boolean) as string[];
  const traits = (p.traits ?? []).map((t) => t.name).filter(Boolean) as string[];
  const description =
    [p.age, p.alignment].filter(Boolean).join(" ") ||
    `${name} (D&D 5e SRD). See Player's Handbook / SRD for full lore.`;

  return {
    name,
    description,
    ability_scores: mapAbilityScores(p),
    size: p.size ?? "Medium",
    speed,
    languages: languages.length ? languages : ["Common"],
    traits: traits.length ? traits : ["—"],
  };
}
