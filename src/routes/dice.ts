import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { rollDiceNotation } from "../lib/diceRoll";

const router = Router();

/**
 * POST /api/dice/roll
 * Lancia uno o più dadi
 * Body: { notation: "4d6", character_id?: "uuid", campaign_id?: "uuid" }
 */
router.post("/roll", async (req: Request, res: Response) => {
  try {
    const { notation, character_id, campaign_id } = req.body;

    if (!notation) {
      return res
        .status(400)
        .json({ error: "notation is required (e.g., 4d6, 2d20)" });
    }

    const result = rollDiceNotation(notation);

    // Salva il roll nel database (opzionale)
    if (campaign_id) {
      const { error: insertError } = await supabase.from("dice_rolls").insert([
        {
          campaign_id,
          character_id: character_id || null,
          dice_notation: notation,
          result_total: result.total,
          result_rolls: result.rolls,
        },
      ]);
      if (insertError) throw insertError;
    }

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/dice/roll-multiple
 * Lancia più serie di dadi contemporaneamente
 * Body: { rolls: ["4d6", "2d20"], campaign_id?: "uuid" }
 */
router.post("/roll-multiple", async (req: Request, res: Response) => {
  try {
    const { rolls: notations, campaign_id } = req.body;

    if (!Array.isArray(notations) || notations.length === 0) {
      return res
        .status(400)
        .json({ error: "rolls must be a non-empty array" });
    }

    const results = notations.map((notation: string) =>
      rollDiceNotation(notation)
    );
    const totalSum = results.reduce((sum, r) => sum + r.total, 0);

    res.json({
      success: true,
      data: results,
      total_sum: totalSum,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/dice/history
 * Ottieni la storia dei lanci per una campagna
 */
router.get("/history", async (req: Request, res: Response) => {
  try {
    const { campaign_id, character_id, limit } = req.query;

    if (!campaign_id) {
      return res.status(400).json({ error: "campaign_id is required" });
    }

    let query = supabase
      .from("dice_rolls")
      .select("*")
      .eq("campaign_id", campaign_id);

    if (character_id) {
      query = query.eq("character_id", character_id);
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(parseInt(limit as string) || 50);

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
 * GET /api/dice/history/:id
 * Ottieni un lancio specifico
 */
router.get("/history/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("dice_rolls")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Dice roll not found" });
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
