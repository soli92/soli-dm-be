/**
 * Tipologiche di dominio (default e insiemi per validazione futura).
 * Allineare elenchi al frontend `soli-dm-fe/lib/tipologiche/dnd.ts` quando si cambiano i valori
 * (es. `PLAYBOOK_CLASS_NAMES` per i form personaggio, oltre alle 12 `SRD_CLASS_NAMES`).
 */

export const DND_ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
] as const;

export type DndAlignment = (typeof DND_ALIGNMENTS)[number];

export const DEFAULT_CHARACTER_ALIGNMENT: DndAlignment = "Neutral";

export const CAMPAIGN_STATUSES = ["active", "paused", "completed", "archived"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const DEFAULT_CAMPAIGN_STATUS: CampaignStatus = "active";

export const CHARACTER_STATUSES = ["active", "inactive", "dead"] as const;
export type CharacterStatus = (typeof CHARACTER_STATUSES)[number];

export const DEFAULT_CHARACTER_STATUS: CharacterStatus = "active";

export function isKnownAlignment(value: string): value is DndAlignment {
  return (DND_ALIGNMENTS as readonly string[]).includes(value);
}
