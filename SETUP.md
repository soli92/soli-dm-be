# 🎲 Soli-DM Backend — Guida Setup Completa

Questa guida spiega come configurare il **Backend API** per lo sviluppo locale e il deploy su **Render**. Per checklist comandi, test e regole per modifiche al codice vedi anche **`AGENTS.md`** nella root del repository.

---

## 📋 Indice

1. [Prerequisiti](#1-prerequisiti)
2. [Setup Locale](#2-setup-locale)
3. [Configurazione Supabase](#3-configurazione-supabase)
4. [Render Deploy](#4-render-deploy)
5. [Verifica Health Check](#5-verifica-health-check)

---

## 1. Prerequisiti

- **Node.js 20+** — [Scarica qui](https://nodejs.org/)
- **npm 9+** — Incluso in Node.js
- **Supabase Account** — [Registrati qui](https://supabase.com/)
- **Render Account** — [Registrati qui](https://render.com/) (per deploy)

---

## 2. Setup Locale

### 2.1 Clone e installa dipendenze

```bash
# Clone il repository
git clone https://github.com/soli92/soli-dm-be.git
cd soli-dm-be

# Installa dipendenze
npm install

# Verifica che Node.js sia corretto
node --version  # Dovrebbe essere 20+
npm --version   # Dovrebbe essere 9+
```

### 2.2 Configura `.env`

```bash
# Copia il file di esempio
cp .env.example .env

# Modifica .env con i tuoi valori
nano .env  # o usa il tuo editor preferito
```

Compila il file `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Supabase (vedi step 3 sotto)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# CORS — URL del frontend
CORS_ORIGIN=http://localhost:3000

# JWT Secret — genera un valore casuale:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-here
```

### 2.3 Avvia il server in development

```bash
npm run dev

# Output atteso:
# ✅ Server running on http://localhost:5000
# ✅ Supabase connected
```

Verifica che il server funzioni:

```bash
curl http://localhost:5000/health
# Risposta: {"status":"ok"}
```

### Test automatici (opzionale, senza DB reale per i test base)

```bash
npm test
```

Vitest carica `vitest.setup.ts` con URL/chiave Supabase fittizi così i moduli si inizializzano; i test coprono dadi, API key e alcune route HTTP (wiki + dadi).

---

## 3. Configurazione Supabase

### 3.1 Ottieni le credenziali Supabase

Se non l'hai già fatto nel frontend setup:

1. Vai a https://supabase.com/dashboard
2. Apri il progetto **soli-dm**
3. **Settings** → **API**
4. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Key** → `SUPABASE_SERVICE_KEY` (⚠️ PRIVATO!)

### 3.2 Verifica le tabelle nel database

Il backend assume che queste tabelle esistano in Supabase:

```sql
-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  dm_name VARCHAR(255),
  world_setting VARCHAR(255),
  level_range VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  map_center_lat FLOAT,
  map_center_lng FLOAT,
  map_zoom INT DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Characters
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  player_name VARCHAR(255),
  character_name VARCHAR(255) NOT NULL,
  class_name VARCHAR(50),
  race VARCHAR(50),
  level INT DEFAULT 1,
  alignment VARCHAR(50),
  background TEXT,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- D&D Classes
CREATE TABLE dnd_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  hit_dice VARCHAR(10),
  primary_ability VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- D&D Races
CREATE TABLE dnd_races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  ability_bonuses JSONB,
  size VARCHAR(50),
  speed INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- D&D Deities
CREATE TABLE dnd_deities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  alignment VARCHAR(50),
  description TEXT,
  domains JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- D&D Rules
CREATE TABLE dnd_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dice Rolls History
CREATE TABLE dice_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  notation VARCHAR(20),
  result_total INT,
  result_rolls INT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

Se le tabelle non esistono, creale manualmente su Supabase:
1. Supabase Dashboard → **SQL Editor**
2. Clicca **"New Query"**
3. Incolla il SQL sopra
4. Clicca **Run**

---

## 4. Render Deploy

### 4.1 Crea un servizio su Render

1. Vai a https://dashboard.render.com/
2. Clicca **"New +"** → **"Web Service"**
3. **Connect repository**: Seleziona `soli92/soli-dm-be`
4. **Name**: `soli-dm-be`
5. **Runtime**: Node (versione **20.x** consigliata; il [`render.yaml`](./render.yaml) in repo imposta `NODE_VERSION` se usi **Blueprint** da Git)
6. **Root Directory**: **lascia vuoto** (deve essere la cartella che contiene `package.json`, **non** `src`). Se imposti `src`, `npm start` cercherà `dist/` nel posto sbagliato e vedrai errori tipo `Cannot find module '.../src/dist/server.js'`.
7. **Build Command**: `npm install && npm run build` — obbligatorio: **`tsc`** genera `dist/` (cartella in `.gitignore`, non presente nel clone).
8. **Start Command**: `npm start` — esegue [`scripts/start.cjs`](./scripts/start.cjs), che punta a `dist/server.js` dalla root del pacchetto e imposta il `cwd` corretto per `dotenv`.
9. **Branch**: `main`
10. Clicca **"Create Web Service"**

**Blueprint:** puoi collegare il repo usando il file [`render.yaml`](./render.yaml) così build/start e `NODE_VERSION` restano allineati al codice.

### 4.2 Configura Environment Variables

Nel Render Dashboard:

1. Servizio **soli-dm-be** → **Environment**
2. Clicca **"Add Environment Variable"** per ogni variabile:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=(dalla Supabase)
NODE_ENV=production
CORS_ORIGIN=https://tuo-frontend.example.com
SOLI_DM_API_KEY=(opzionale, chiave condivisa per /api)
```

**Note:**

- **`PORT`**: Render in genere imposta da sola la variabile `PORT` ascoltata dal processo. Aggiungi `PORT=5000` solo se sai che non sovrascrive il binding richiesto dalla piattaforma; in dubbio, lascia che sia Render a gestirla.
- Le variabili `JWT_SECRET`, `LOG_LEVEL`, `RATE_LIMIT_*` nel vecchio esempio non sono tutte usate dall’API attuale: configura solo ciò che è documentato in **`.env.example`** e in **`README.md`**.

3. Render **automaticamente riavvia** il servizio

### 4.3 Verifica il deploy

Aspetta 2-3 minuti che il build finisca.

Poi testa:

```bash
curl https://soli-dm-be.onrender.com/health
# Risposta attesa: {"status":"ok"}

# Testa un endpoint API
curl https://soli-dm-be.onrender.com/api/classes
# Dovrebbe tornare la lista di classi D&D
```

---

## 5. Verifica Health Check

### 5.1 Locale

```bash
curl http://localhost:5000/health
```

Risposta attesa:
```json
{"status":"ok"}
```

### 5.2 Produzione (Render)

```bash
curl https://soli-dm-be.onrender.com/health
```

Stessa risposta.

---

## 📊 Comandi Utili

```bash
# Development — auto reload
npm run dev

# Type checking
npm run type-check

# Build per production
npm run build

# Avvia il build compilato
npm start

# Test (quando configurati)
npm test

# Lint
npm run lint  # (se configurato)
```

---

## 🚨 Troubleshooting

### **Errore: "SUPABASE_URL is not defined"**
→ Le env vars non sono configurate
→ Soluzione: Verifica `.env` locale o le env vars su Render

### **Errore: "Connection timeout to Supabase"**
→ Supabase è offline o l'URL è sbagliato
→ Soluzione: Verifica su https://status.supabase.com/

### **Errore: "Service unavailable" (HTTP 503)**
→ Il servizio Render è in sleep (free tier sleep dopo 15 min inattività)
→ Soluzione: Aspetta 1-2 minuti che si riavvii

### **Errore: "CORS error" dal frontend**
→ `CORS_ORIGIN` non è configurato correttamente
→ Soluzione: Verifica che sia l'URL completo di Vercel FE

### **Errore: "Invalid JWT"**
→ `JWT_SECRET` è diverso tra deploy locali e produttivi
→ Soluzione: Usa lo stesso `JWT_SECRET` ovunque

---

## 📚 API Endpoints Disponibili

Vedi [README.md](./README.md) per la documentazione completa degli endpoint.

Quick reference:

```bash
# Campagne
GET    /api/campaigns
POST   /api/campaigns
GET    /api/campaigns/:id
PUT    /api/campaigns/:id
DELETE /api/campaigns/:id

# Personaggi
GET    /api/characters
POST   /api/characters
GET    /api/characters/:id
PUT    /api/characters/:id
DELETE /api/characters/:id

# Dadi
POST   /api/dice/roll
GET    /api/dice/history

# Wiki D&D
GET    /api/classes
GET    /api/races
GET    /api/deities
GET    /api/rules

# Docs
GET    /api-docs  # Swagger UI
```

---

## ✅ Checklist Setup

- [ ] Node.js 18+ installato
- [ ] Dipendenze installate (`npm install`)
- [ ] `.env` configurato con Supabase credentials
- [ ] Server avvia senza errori (`npm run dev`)
- [ ] Health check funziona (`curl /health`)
- [ ] Supabase tabelle create
- [ ] Render servizio creato
- [ ] Env vars su Render configurate
- [ ] Render deploy completato
- [ ] Health check funziona su Render

---

🎲 **Backend è pronto!** ✨
