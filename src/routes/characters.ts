import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_CHARACTER_ALIGNMENT,
  DEFAULT_CHARACTER_STATUS,
} from "../lib/tipologiche";

const router = Router();

type CharacterRow = Record<string, unknown>;

/**
 * In Postgres/Supabase spesso esiste `name` NOT NULL; il client API usa `character_name`.
 * Allineiamo entrambe in scrittura e nelle risposte JSON.
 */
function displayNameFromRow(row: CharacterRow): string {
  const cn = row.character_name;
  const n = row.name;
  if (typeof cn === "string" && cn.trim() !== "") return cn.trim();
  if (typeof n === "string" && n.trim() !== "") return n.trim();
  return "";
}

function normalizeCharacter(row: CharacterRow | null | undefined): CharacterRow {
  if (row == null || typeof row !== "object") return {};
  const display = displayNameFromRow(row);
  if (!display) return { ...row };
  return { ...row, character_name: display, name: display };
}

/**
 * GET /api/characters
 * Lista tutti i personaggi
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { campaign_id } = req.query;

    let query = supabase.from("characters").select("*");

    if (campaign_id) {
      query = query.eq("campaign_id", campaign_id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    const rows = (data || []) as CharacterRow[];
    res.json({
      success: true,
      data: rows.map((r) => normalizeCharacter(r)),
      count: rows.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/characters/:id
 * Ottieni un personaggio specifico
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json({ success: true, data: normalizeCharacter(data as CharacterRow) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/characters
 * Crea un nuovo personaggio
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      campaign_id,
      player_name,
      character_name,
      class_name,
      race,
      level,
      experience,
      alignment,
      background,
      stats,
    } = req.body;

    const trimmedName = String(character_name).trim();

    if (!campaign_id || !trimmedName || !class_name || !race) {
      return res.status(400).json({
        error:
          "Servono campagna (campaign_id), nome personaggio, classe e razza.",
      });
    }

    const { data, error } = await supabase
      .from("characters")
      .insert([
        {
          campaign_id,
          player_name: player_name || null,
          /** Colonna `name` richiesta da molti schema Postgres NOT NULL */
          name: trimmedName,
          character_name: trimmedName,
          class_name,
          race,
          level: level || 1,
          experience: experience || 0,
          alignment: alignment || DEFAULT_CHARACTER_ALIGNMENT,
          background: background || null,
          stats: stats || {
            strength: 10,
            dexterity: 10,
            constitution: 10,
            intelligence: 10,
            wisdom: 10,
            charisma: 10,
          },
          status: DEFAULT_CHARACTER_STATUS,
        },
      ])
      .select();

    if (error) throw error;

    const created = data?.[0] as CharacterRow | undefined;
    res.status(201).json({
      success: true,
      data: created ? normalizeCharacter(created) : created,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/characters/:id
 * Aggiorna un personaggio
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Record<string, unknown> = { ...req.body };

    if (updates.character_name != null) {
      const t = String(updates.character_name).trim();
      updates.character_name = t;
      updates.name = t;
    } else if (updates.name != null) {
      const t = String(updates.name).trim();
      updates.name = t;
      updates.character_name = t;
    }

    const { data, error } = await supabase
      .from("characters")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data?.length) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json({
      success: true,
      data: normalizeCharacter(data[0] as CharacterRow),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/characters/:id
 * Elimina un personaggio
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("characters")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "Character deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
