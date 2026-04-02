import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { requireApiKeyWhenConfigured } from "./middleware/apiKey";
import campaignsRouter from "./routes/campaigns";
import charactersRouter from "./routes/characters";
import diceRouter from "./routes/dice";
import classesRouter from "./routes/classes";
import racesRouter from "./routes/races";
import deitiesRouter from "./routes/deities";
import rulesRouter from "./routes/rules";

/**
 * App Express senza `listen` — usata da `server.ts` e dai test.
 */
export function createApp(): Express {
  const app: Express = express();

  const corsOrigin = process.env.CORS_ORIGIN?.trim();

  app.use(
    cors(
      corsOrigin
        ? { origin: corsOrigin, credentials: true }
        : { origin: true, credentials: true }
    )
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use(requireApiKeyWhenConfigured);

  app.use("/api/campaigns", campaignsRouter);
  app.use("/api/characters", charactersRouter);
  app.use("/api/dice", diceRouter);
  app.use("/api/classes", classesRouter);
  app.use("/api/races", racesRouter);
  app.use("/api/deities", deitiesRouter);
  app.use("/api/rules", rulesRouter);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
  });

  app.use(
    (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      console.error("Error:", err);
      const message = err instanceof Error ? err.message : "Internal server error";
      const status =
        err && typeof err === "object" && "status" in err
          ? Number((err as { status?: number }).status) || 500
          : 500;
      res.status(status).json({
        error: message,
      });
    }
  );

  return app;
}
