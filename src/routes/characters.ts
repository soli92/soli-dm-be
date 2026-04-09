import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import {
  DEFAULT_CHARACTER_ALIGNMENT,
  DEFAULT_CHARACTER_STATUS,
} from "../lib/tipologiche";

const router = Router();

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

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
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

    res.json({ success: true, data });
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

    if (!campaign_id || !character_name || !class_name || !race) {
      return res.status(400).json({
        error:
          "campaign_id, character_name, class_name, and race are required",
      });
    }

    const { data, error } = await supabase
      .from("characters")
      .insert([
        {
          campaign_id,
          player_name: player_name || null,
          character_name,
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

    res.status(201).json({ success: true, data: data?.[0] });
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
    const updates = req.body;

    const { data, error } = await supabase
      .from("characters")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data?.length) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json({ success: true, data: data[0] });
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
