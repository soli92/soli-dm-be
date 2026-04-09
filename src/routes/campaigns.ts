import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { DEFAULT_CAMPAIGN_STATUS } from "../lib/tipologiche";

const router = Router();

/**
 * GET /api/campaigns
 * Lista tutte le campagne
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

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
 * GET /api/campaigns/:id
 * Ottieni una campagna specifica
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json({ success: true, data: campaign });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/campaigns
 * Crea una nuova campagna
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description, dm_name, world_setting, level_range } = req.body;

    if (!name || !dm_name) {
      return res
        .status(400)
        .json({ error: "name and dm_name are required" });
    }

    const { data, error } = await supabase
      .from("campaigns")
      .insert([
        {
          name,
          description: description || null,
          dm_name,
          world_setting: world_setting || null,
          level_range: level_range || "1-20",
          status: DEFAULT_CAMPAIGN_STATUS,
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
 * PUT /api/campaigns/:id
 * Aggiorna una campagna
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data?.length) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json({ success: true, data: data[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/campaigns/:id
 * Elimina una campagna
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true, message: "Campaign deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
