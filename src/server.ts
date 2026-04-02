import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
export const supabase = createClient(supabaseUrl, supabaseKey);

// Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
import campaignsRouter from "./routes/campaigns";
import charactersRouter from "./routes/characters";
import diceRouter from "./routes/dice";
import classesRouter from "./routes/classes";
import racesRouter from "./routes/races";
import deitiesRouter from "./routes/deities";
import rulesRouter from "./routes/rules";

app.use("/api/campaigns", campaignsRouter);
app.use("/api/characters", charactersRouter);
app.use("/api/dice", diceRouter);
app.use("/api/classes", classesRouter);
app.use("/api/races", racesRouter);
app.use("/api/deities", deitiesRouter);
app.use("/api/rules", rulesRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🎲 Soli-DM API running on http://localhost:${PORT}`);
  console.log(`📚 Health check: GET http://localhost:${PORT}/health`);
});

export default app;
