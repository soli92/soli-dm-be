import { Router, Request, Response } from "express";
import { wikiRacesStatic } from "../data/wikiRacesStatic";
import { getWikiRaceFromDb, listWikiRacesFromDb } from "../lib/wikiSrd/readFromSupabase";

const router = Router();

/**
 * GET /api/races
 * Lista razze: da `wiki_srd_cache` se popolata, altrimenti fallback statico.
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const fromDb = await listWikiRacesFromDb();
    const data = fromDb?.length ? fromDb : wikiRacesStatic;
    res.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/races/:name
 */
router.get("/:name", async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const fromDb = await getWikiRaceFromDb(name);
    const raceData =
      fromDb ??
      wikiRacesStatic.find((r) => r.name.toLowerCase() === name.toLowerCase());

    if (!raceData) {
      return res.status(404).json({ error: "Race not found" });
    }

    res.json({ success: true, data: raceData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    res.status(500).json({ error: message });
  }
});

export default router;
