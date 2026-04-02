# 🎲 Soli Dungeon Master - Backend API

Soli-DM è un'applicazione completa di supporto per giocatori e Dungeon Master di **Dungeons & Dragons 5e**. 

Questo repository contiene il **Backend API** costruito con **Node.js + Express + TypeScript + Supabase**.

---

## 📋 Caratteristiche

- **🎯 Gestione Campagne** — Crea, gestisci, elimina campagne D&D
- **👤 Gestione Personaggi** — Censisci i tuoi personaggi con stats, classe, razza e background
- **🎲 Simulatore Dadi** — Lancia dadi in tempo reale (d4, d6, d8, d10, d12, d20, etc.)
- **📚 Wiki D&D** — Accesso completo alle informazioni di D&D 5e:
  - 12 Classi (Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard)
  - 12 Razze (Dragonborn, Dwarf, Elf, Gnome, Half-Elf, Half-Orc, Halfling, Human, Tiefling, Asimar, Genasi, Goliath)
  - 20+ Divinità (Forgotten Realms pantheon)
  - Regole core (Ability Scores, Combat, Saving Throws, Resting, Multiclassing)

---

## 🚀 Quick Start

### Prerequisiti

- **Node.js 20+**
- **npm** o **yarn**
- **Supabase** account (gratuito su https://supabase.com)

### Installazione

```bash
# Clone il repository
git clone https://github.com/soli92/soli-dm-be.git
cd soli-dm-be

# Installa dipendenze
npm install

# Copia .env.example a .env e configura le variabili
cp .env.example .env
# Modifica .env con le tue credenziali Supabase
```

### Configurazione Supabase

1. Crea un nuovo progetto su [Supabase](https://supabase.com)
2. Copia `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` dal dashboard
3. Incolla i valori nel tuo `.env`
4. Esegui la migration del database (vedi sotto)

### Avvia il server

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Il server sarà disponibile su `http://localhost:5000`

---

## 📡 API Endpoints

### Health Check
```
GET /health
```
Verifica che il server sia online. **Non richiede API key** anche se `SOLI_DM_API_KEY` è attiva.

### Sicurezza opzionale

- **`CORS_ORIGIN`**: se impostata, CORS accetta solo quell’origine; altrimenti in sviluppo viene accettata la richiesta in arrivo (`origin: true`).
- **`SOLI_DM_API_KEY`**: se impostata, tutte le route sotto `/api/*` richiedono header `x-soli-dm-api-key` o `Authorization: Bearer <chiave>`. Utile in produzione davanti a un frontend che condivide la chiave (meglio: BFF che aggiunge l’header lato server).

---

### 🎯 Campagne

```
GET    /api/campaigns              # Lista tutte le campagne
GET    /api/campaigns/:id          # Ottieni una campagna
POST   /api/campaigns              # Crea una campagna
PUT    /api/campaigns/:id          # Aggiorna una campagna
DELETE /api/campaigns/:id          # Elimina una campagna
```

**Esempio - Crea una campagna:**
```bash
curl -X POST http://localhost:5000/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Lost Mines of Phandelver",
    "description": "A classic adventure for beginners",
    "dm_name": "Game Master",
    "world_setting": "Forgotten Realms",
    "level_range": "1-5"
  }'
```

---

### 👤 Personaggi

```
GET    /api/characters                 # Lista tutti i personaggi
GET    /api/characters/:id             # Ottieni un personaggio
GET    /api/characters?campaign_id=id  # Lista personaggi di una campagna
POST   /api/characters                 # Crea un personaggio
PUT    /api/characters/:id             # Aggiorna un personaggio
DELETE /api/characters/:id             # Elimina un personaggio
```

**Esempio - Crea un personaggio:**
```bash
curl -X POST http://localhost:5000/api/characters \
  -H "Content-Type: application/json" \
  -d '{
    "campaign_id": "uuid-della-campagna",
    "player_name": "Alice",
    "character_name": "Ragnar Ironhammer",
    "class_name": "Fighter",
    "race": "Dwarf",
    "level": 1,
    "alignment": "Lawful Good",
    "background": "Soldier",
    "stats": {
      "strength": 16,
      "dexterity": 12,
      "constitution": 14,
      "intelligence": 10,
      "wisdom": 13,
      "charisma": 11
    }
  }'
```

---

### 🎲 Dadi (Dice Roller)

```
POST /api/dice/roll                # Lancia un dado (o più dadi)
POST /api/dice/roll-multiple       # Lancia più serie di dadi
GET  /api/dice/history             # Storico dei lanci
GET  /api/dice/history/:id         # Ottieni un lancio specifico
```

**Formato notazione dadi:** `NdX` dove N = numero dadi, X = numero facce
- `4d6` = 4 dadi a 6 facce
- `1d20` = 1 dado a 20 facce
- `2d10` = 2 dadi a 10 facce

**Esempio - Lancia 4d6:**
```bash
curl -X POST http://localhost:5000/api/dice/roll \
  -H "Content-Type: application/json" \
  -d '{
    "notation": "4d6",
    "campaign_id": "uuid-della-campagna",
    "character_id": "uuid-del-personaggio"
  }'

# Risposta:
{
  "success": true,
  "data": {
    "notation": "4d6",
    "rolls": [3, 5, 2, 6],
    "total": 16
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Esempio - Lancia più dadi:**
```bash
curl -X POST http://localhost:5000/api/dice/roll-multiple \
  -H "Content-Type: application/json" \
  -d '{
    "rolls": ["4d6", "1d20", "2d8"],
    "campaign_id": "uuid-della-campagna"
  }'
```

**Esempio - Storico dei lanci:**
```bash
curl "http://localhost:5000/api/dice/history?campaign_id=uuid&limit=20"
```

---

### 📚 Wiki D&D

#### Classi
```
GET /api/classes           # Lista tutte le classi
GET /api/classes/:name     # Ottieni una classe (es. "Barbarian")
```

**Esempio:**
```bash
curl http://localhost:5000/api/classes
curl http://localhost:5000/api/classes/Fighter
```

#### Razze
```
GET /api/races             # Lista tutte le razze
GET /api/races/:name       # Ottieni una razza (es. "Dwarf")
```

**Esempio:**
```bash
curl http://localhost:5000/api/races
curl http://localhost:5000/api/races/Elf
```

#### Divinità
```
GET /api/deities                           # Lista tutte le divinità
GET /api/deities/:name                     # Ottieni una divinità
GET /api/deities/filter/alignment/:align   # Filtra per allineamento
```

**Esempio:**
```bash
curl http://localhost:5000/api/deities
curl http://localhost:5000/api/deities/Moradin
curl http://localhost:5000/api/deities/filter/alignment/Lawful%20Good
```

#### Regole
```
GET /api/rules                      # Lista categorie di regole
GET /api/rules/:category            # Ottieni una categoria (es. "ability_scores")
GET /api/rules/ability-scores/list  # Lista tutte le ability scores
```

**Esempio:**
```bash
curl http://localhost:5000/api/rules
curl http://localhost:5000/api/rules/combat
curl http://localhost:5000/api/rules/ability_scores
```

---

## 🗄️ Database Schema

Il database Supabase contiene le seguenti tabelle:

### `campaigns`
```sql
id          UUID (PK)
name        VARCHAR(255)
description TEXT
dm_name     VARCHAR(255)
world_setting VARCHAR(255)
level_range VARCHAR(50)
status      VARCHAR(50) default 'active'
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### `characters`
```sql
id            UUID (PK)
campaign_id   UUID (FK → campaigns)
player_name   VARCHAR(255)
character_name VARCHAR(255)
class_name    VARCHAR(50)
race          VARCHAR(50)
level         INTEGER (1-20)
experience    INTEGER
alignment     VARCHAR(50)
background    TEXT
stats         JSONB (strength, dexterity, etc.)
status        VARCHAR(50)
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### `dice_rolls`
```sql
id            UUID (PK)
campaign_id   UUID (FK → campaigns)
character_id  UUID (FK → characters, nullable)
notation      VARCHAR(20) (e.g., "4d6")
result_total  INTEGER
result_rolls  INTEGER[] (array of individual rolls)
created_at    TIMESTAMP
```

---

## 🛠️ Sviluppo

### Comandi principali

```bash
# Development server (auto-reload)
npm run dev

# Test automatici (Vitest: unit + HTTP su createApp)
npm test
npm run test:watch

# TypeScript type check
npm run type-check

# Build per production
npm run build

# Avvia il build prodotto
npm start
```

### Struttura directory

```
scripts/
└── start.cjs          # Entry produzione dopo build: cwd + require dist/server.js
src/
├── server.ts          # Entry sorgente: dotenv + listen (usa createApp)
├── createApp.ts       # Fabbrica Express (middleware + route, senza listen — usata anche dai test)
├── lib/
│   ├── supabase.ts    # Client Supabase (service role)
│   └── diceRoll.ts    # Logica pura notazione NdX (testata)
├── middleware/
│   └── apiKey.ts      # API key opzionale su /api
├── routes/
│   ├── campaigns.ts   # Campaign CRUD
│   ├── characters.ts  # Character CRUD
│   ├── dice.ts        # Dice roller
│   ├── classes.ts     # D&D classes wiki
│   ├── races.ts       # D&D races wiki
│   ├── deities.ts     # D&D deities wiki
│   └── rules.ts       # D&D core rules
dist/                  # Generato da `npm run build` (gitignored)
render.yaml            # Opzionale: Blueprint Render (build, start, NODE_VERSION)
```

File di test Vitest: `src/lib/diceRoll.test.ts`, `src/middleware/apiKey.test.ts`, `src/http.integration.test.ts`; setup env in `vitest.setup.ts`. Deploy dettagliato: **`SETUP.md`**.

---

## 🚢 Deployment

### Railway

```bash
# Connetti la repo a Railway
# Build: npm install && npm run build
# Start: npm start
# Imposta le variabili d'ambiente (come .env.example):
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
CORS_ORIGIN=...
# PORT di solito assegnata dal provider

# Deploy automatico da GitHub
```

### Render

- **Root Directory**: lascia vuoto (root del repository, la cartella dove c’è `package.json`). Non impostare `src`: altrimenti `dist/` non coincide con l’output di `tsc` e lo start fallisce.
- **Build Command**: `npm install && npm run build` (serve `tsc` per generare `dist/`; `dist/` è in `.gitignore` e non va committato).
- **Start Command**: `npm start` (usa `scripts/start.cjs`, che punta sempre a `dist/server.js` dalla root del pacchetto).

Se nel log compare un path tipo `.../src/dist/server.js`, la Root Directory del servizio è quasi sempre sbagliata oppure la build non è stata eseguita.

Il file [`render.yaml`](./render.yaml) in repo riflette questa configurazione (Node 20 consigliato tramite `NODE_VERSION`).

---

## 🔐 Sicurezza

- **Supabase Row Level Security (RLS)**: Configura le policy nelle impostazioni Supabase
- **CORS**: Configura `CORS_ORIGIN` nel `.env` per il tuo dominio frontend
- **Service role**: `SUPABASE_SERVICE_KEY` **solo** sul server (mai nel browser)
- **API opzionale**: con `SOLI_DM_API_KEY` attiva, le richieste a `/api/*` richiedono header `x-soli-dm-api-key` o `Authorization: Bearer` (salvo `GET /health`)

---

## 📝 Roadmap

- [ ] Autenticazione (JWT + Supabase Auth)
- [ ] Spell database completo
- [ ] Monster/NPC compendium
- [ ] Initiative tracker in real-time (WebSocket)
- [ ] Integrazione con OGL API (Open Game License)
- [ ] Export/Import campagne (JSON)

---

## 🤝 Contribuire

Apri una issue o una PR su GitHub. Per setup locale e deploy vedi **[SETUP.md](./SETUP.md)**; per contesto rapido per assistenti AI vedi **[AGENTS.md](./AGENTS.md)**.

---

## 📄 Licenza

MIT © [soli92](https://github.com/soli92)

---

## 🎯 Link Utili

- **Frontend**: [soli92/soli-dm-fe](https://github.com/soli92/soli-dm-fe)
- **D&D 5e Official SRD**: https://dnd5e.wikidot.com/
- **Forgotten Realms Wiki**: https://forgottenrealms.fandom.com/

---

## 📧 Contatti

Domande? Apri un issue su GitHub o contattami su [Twitter/X](https://twitter.com/soli92)

🎲 **Buone avventure!**
