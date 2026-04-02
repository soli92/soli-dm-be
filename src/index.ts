import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface Campaign {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Character {
  id: string;
  campaign_id: string;
  name: string;
  class: string;
  race: string;
  level: number;
  created_at: string;
}

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// ===== CAMPAIGNS =====
app.get("/api/campaigns", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/campaigns", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const { data, error } = await supabase
      .from("campaigns")
      .insert([
        {
          name,
          description: description || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/api/campaigns/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Campaign not found" });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.patch("/api/campaigns/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from("campaigns")
      .update({
        name,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Campaign not found" });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/api/campaigns/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===== CHARACTERS =====
app.get("/api/campaigns/:campaignId/characters", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post("/api/campaigns/:campaignId/characters", async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { name, class: charClass, race, level = 1 } = req.body;

    if (!name || !charClass || !race) {
      return res
        .status(400)
        .json({ error: "Name, class, and race are required" });
    }

    const { data, error } = await supabase
      .from("characters")
      .insert([
        {
          campaign_id: campaignId,
          name,
          class: charClass,
          race,
          level,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.patch("/api/characters/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, class: charClass, race, level } = req.body;

    const { data, error } = await supabase
      .from("characters")
      .update({
        name,
        class: charClass,
        race,
        level,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Character not found" });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete("/api/characters/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from("characters")
      .delete()
      .eq("id", id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===== D&D WIKI ENDPOINTS =====
// Per semplicità, questi fetch dai dati salvati o da cache
app.get("/api/wiki/classes", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("dnd_classes")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/api/wiki/races", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("dnd_races")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/api/wiki/deities", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("dnd_deities")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ===== DICE ROLLS (stateless) =====
app.post("/api/dice/roll", (req, res) => {
  try {
    const { dice_notation } = req.body; // e.g., "1d20", "2d6+3"

    if (!dice_notation) {
      return res.status(400).json({ error: "dice_notation is required" });
    }

    const result = rollDice(dice_notation);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// Dice roller utility
function rollDice(notation: string) {
  const regex = /^(\d+)d(\d+)(?:\+(\d+))?$/;
  const match = notation.toLowerCase().match(regex);

  if (!match) {
    throw new Error("Invalid dice notation (e.g. 1d20, 2d6+3)");
  }

  const [, numDiceStr, numSidesStr, modifierStr] = match;
  const numDice = parseInt(numDiceStr);
  const numSides = parseInt(numSidesStr);
  const modifier = modifierStr ? parseInt(modifierStr) : 0;

  const rolls: number[] = [];
  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * numSides) + 1);
  }

  const subtotal = rolls.reduce((a, b) => a + b, 0);
  const total = subtotal + modifier;

  return {
    notation,
    rolls,
    subtotal,
    modifier,
    total,
  };
}

// Start server
app.listen(PORT, () => {
  console.log(
    `🎲 Soli DM Backend listening on http://localhost:${PORT} [${NODE_ENV}]`
  );
});
