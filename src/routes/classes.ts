import { Router, Request, Response } from "express";
import { wikiClassesStatic } from "../data/wikiClassesStatic";
import { getWikiClassFromDb, listWikiClassesFromDb } from "../lib/wikiSrd/readFromSupabase";

const router = Router();

/**
 * GET /api/classes
 * Lista classi: da `wiki_srd_cache` se popolata, altrimenti fallback statico.
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const fromDb = await listWikiClassesFromDb();
    const data = fromDb?.length ? fromDb : wikiClassesStatic;
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
 * GET /api/classes/:name
 */
router.get("/:name", async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const fromDb = await getWikiClassFromDb(name);
    const classData =
      fromDb ??
      wikiClassesStatic.find((c) => c.name.toLowerCase() === name.toLowerCase());

    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }

    res.json({ success: true, data: classData });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    res.status(500).json({ error: message });
  }
});

export default router;
