import { Request, Response, NextFunction } from "express";

/**
 * Se SOLI_DM_API_KEY è valorizzata, richiede header `x-soli-dm-api-key` o
 * `Authorization: Bearer <key>`. Se la variabile è vuota, il middleware non applica alcun controllo (dev).
 */
export function requireApiKeyWhenConfigured(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const configured = process.env.SOLI_DM_API_KEY?.trim();
  if (!configured) {
    next();
    return;
  }

  const header =
    (req.headers["x-soli-dm-api-key"] as string | undefined)?.trim() ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7).trim()
      : "");

  if (header !== configured) {
    res.status(401).json({ error: "Unauthorized: invalid or missing API key" });
    return;
  }

  next();
}
