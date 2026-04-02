# AGENTS.md — Soli Dungeon Master Backend

**Ultimo aggiornamento:** 2026-04-02 15:40 UTC  
**Status:** 🔴 **BUILD FALLITO — In Risoluzione**

---

## 📊 **STATO PROGETTO**

| Componente | Status | Details |
|-----------|--------|---------|
| **Build** | 🔴 Fallito | TypeScript path mismatch (Render issue) |
| **Deploy** | 🔴 Non Live | Render: `/opt/render/project/src/dist/` path error |
| **URL** | ❌ N/A | Pending fix |
| **Database** | ⏳ Pending | Supabase tables da creare |
| **API Routes** | ✅ Struttura | 6 route files pronti (campaigns, characters, classes, deities, dice, races, rules) |

---

## 🏗️ **STACK TECNOLOGICO**

```
Backend:
  - Runtime: Node.js 20+ (TypeScript)
  - Framework: Express.js 4.18
  - Language: TypeScript 5.3
  - Database: Supabase (PostgreSQL)
  - ORM: (pending — supabase-js client o Prisma)
  - Auth: Supabase Auth + Google OAuth
  - CORS: Configurato per Vercel FE
  - Logging: Pino 8.17 + pino-pretty
  - Deploy: Render.com (free tier)

Dependencies:
  ✅ express 4.18.2
  ✅ @supabase/supabase-js 2.40.0
  ✅ cors 2.8.5
  ✅ dotenv 16.3.1
  ✅ pino 8.17.2, pino-pretty 10.3.1

DevDependencies:
  ✅ @types/express 4.17.21
  ✅ @types/cors 2.8.17
  ✅ @types/node 20.10.5
  ✅ typescript 5.3.3
  ✅ tsx 4.7.0
```

---

## 📁 **STRUTTURA PROGETTO**

```
soli-dm-be/
├── src/
│   ├── server.ts           # Express app + routes setup
│   ├── routes/
│   │   ├── campaigns.ts     # POST/GET/PUT/DELETE campaigns
│   │   ├── characters.ts    # Character management
│   │   ├── classes.ts       # D&D classes reference
│   │   ├── deities.ts       # Deities reference
│   │   ├── dice.ts          # Dice roller + history
│   │   ├── races.ts         # D&D races reference
│   │   └── rules.ts         # Rules lookup
│   ├── middleware/
│   │   ├── auth.ts          # Supabase JWT verification
│   │   └── cors.ts          # CORS setup
│   └── utils/
│       ├── db.ts            # Supabase client instance
│       └── logger.ts        # Pino logger config
├── dist/                   # Compiled JavaScript (generated)
├── .env.local              # Local env vars (git-ignored)
├── .env.example            # Template env vars
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies + build scripts
├── render.yaml             # Render deployment config (REMOVED)
├── README.md               # User documentation
└── AGENTS.md               # This file
```

---

## 🚀 **DEPLOYMENT STATUS**

### Render (Staging/Production)
```
❌ Build Status: FAILED
🔴 Error: Cannot find module '/opt/render/project/src/dist/server.js'
📊 Root Cause: TypeScript path resolution mismatch
```

**Timeline errori:**
1. **Attempt 1:** `@radix-ui/react-slot` — dipendenza FE sbagliata
2. **Attempt 2:** `dist/` path not found — build non eseguito
3. **Attempt 3:** `npm run build` added to postinstall — TypeScript missing @types
4. **Attempt 4:** @types aggiunte ma path ancora sbagliato `/src/dist/`
5. **Current:** Rimozione `.render.yaml`, aggiornamento `tsconfig.json`

---

## 🔧 **FIX IN APPLICAZIONE**

### Problem Analysis
```
Expected path: /opt/render/project/dist/server.js
Actual path:   /opt/render/project/src/dist/server.js
                                      ^^^
Render sta aggiungendo /src/ nel path
```

### Root Cause
- `.render.yaml` non viene riconosciuto da Render
- Render usa impostazioni da Dashboard, non da file
- `package.json` `type: "module"` + ESM compilation mismatch

### Solution Applied (2026-04-02 15:40)
1. ✅ Rimosso `.render.yaml` (non serve)
2. ✅ Aggiornato `tsconfig.json`:
   - `"module": "commonjs"` (non ESM)
   - `"outDir": "./dist"`
   - `"rootDir": "./src"`
3. ✅ Aggiornato `package.json`:
   - Rimosso `"type": "module"`
   - Build script: `tsc --outDir dist`
   - Start script: `node dist/server.js`
   - Spostati `@types/*` in `dependencies` (necessari per compilazione TS)

### Next Step
- ⏳ Aspettare Render redeploy (auto-trigger da commit)
- 📋 Verificare nuovi log (`/opt/render/project/dist/` dovrebbe essere corretto)
- 🚀 Se ancora fallisce: switchare a **Railway** (alternativa più affidabile)

---

## 📋 **CHECKLIST — FEATURE IN IMPLEMENTAZIONE**

### ✅ **Setup Base**
- [x] Express.js scaffolding
- [x] TypeScript configuration
- [x] 6 route files strutturati
- [x] Pino logging setup
- [x] CORS middleware
- [x] Environment variables template

### 🔧 **In Progresso (Deployment)**
- [ ] Render build fix (path resolution)
- [ ] Render deployment live
- [ ] Health check endpoint (`GET /health`)
- [ ] Environment variables su Render dashboard

### ⏳ **Autenticazione (Pending)**
- [ ] Supabase JWT middleware
- [ ] Google OAuth token verification
- [ ] User session management
- [ ] Protected route middleware

### ⏳ **Database (Pending)**
- [ ] Supabase tables creation (SQL migrations)
- [ ] Campaigns table schema
- [ ] Characters table schema
- [ ] User profiles table
- [ ] Relationships & indexes

### ⏳ **API Endpoints (Pending)**

**Campaigns:**
- [ ] `POST /api/campaigns` — Create campaign
- [ ] `GET /api/campaigns` — List all (optional: user's)
- [ ] `GET /api/campaigns/:id` — Get detail
- [ ] `PUT /api/campaigns/:id` — Update
- [ ] `DELETE /api/campaigns/:id` — Delete

**Characters:**
- [ ] `POST /api/characters` — Create character
- [ ] `GET /api/characters?campaign_id=:id` — List by campaign
- [ ] `GET /api/characters/:id` — Get detail
- [ ] `PUT /api/characters/:id` — Update
- [ ] `DELETE /api/characters/:id` — Delete

**Reference Data:**
- [ ] `GET /api/classes` — All D&D classes
- [ ] `GET /api/races` — All D&D races
- [ ] `GET /api/deities` — All deities
- [ ] `GET /api/rules` — Rules search/lookup

**Dice:**
- [ ] `POST /api/dice/roll` — Roll dice (d4-d20, multiple)
- [ ] `GET /api/dice/history?campaign_id=:id` — Roll history

---

## 🔌 **VARIABILI D'AMBIENTE**

### `.env.local` (Development)
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
CORS_ORIGIN=http://localhost:3000
```

### Render Environment Variables (Production)
```env
PORT=5000 (auto-set by Render)
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
CORS_ORIGIN=https://soli-dm-fe.vercel.app,https://soli-dm-*.vercel.app
```

**Come impostare su Render Dashboard:**
1. https://dashboard.render.com → soli-dm-be → Environment
2. Aggiungi le variabili (POST request da agente o manualmente)
3. Redeploy after adding

---

## 🧪 **COMANDI LOCALI**

```bash
# Development
npm run dev
# Apre http://localhost:3001
# Hot-reload con tsx

# Build
npm run build
# Compila TypeScript in ./dist

# Production
npm start
# Esegue node dist/server.js

# Type checking
npm run type-check
# Verifica TypeScript senza emit

# Local Render simulation
PORT=5000 npm start
```

---

## 🐛 **ISSUE NOTI**

### Issue 1: Render path mismatch
**Status:** 🔧 In Progresso  
**Error:** `Cannot find module '/opt/render/project/src/dist/server.js'`  
**Root Cause:** ESM module resolution mismatch  
**Fix Applied:** CommonJS config + tsconfig update  
**Expected Fix Time:** 2-5 minuti (prossimo redeploy Render)

### Issue 2: TypeScript @types missing
**Status:** ✅ Risolto  
**Error:** `Could not find a declaration file for module 'express'`  
**Cause:** @types nelle devDependencies, non disponibili in build  
**Fix:** Spostati @types in dependencies

### Issue 3: postinstall loop
**Status:** ✅ Risolto  
**Cause:** `postinstall: npm run build` causa loop se build fallisce  
**Fix:** Rimosso postinstall, build run on demand

---

## 🔗 **LINK RISORSE**

| Risorsa | URL |
|---------|-----|
| **Backend Repo** | https://github.com/soli92/soli-dm-be |
| **Frontend Repo** | https://github.com/soli92/soli-dm-fe |
| **Render Dashboard** | https://dashboard.render.com → soli-dm-be |
| **Supabase Dashboard** | https://supabase.com/dashboard/projects |
| **Express Docs** | https://expressjs.com/ |
| **TypeScript Docs** | https://www.typescriptlang.org/docs/ |
| **Render Docs** | https://render.com/docs |

---

## 👥 **PROSSIMI AGENT / LLM — CONTEXT**

### Per agenti futuri che lavorano su questa repo:

1. **Leggere prima:** `README.md` (user-facing guide)
2. **Poi:** Questo file (`AGENTS.md`) per lo stato interno
3. **Current Status:** Build in fix (Render TypeScript path issue)
4. **Stack:** Express.js + TypeScript + Supabase + Node.js 20+
5. **Deploy:** Render.com (free tier, fallback: Railway)
6. **Priority:**
   - ✅ Fix Render build & deployment
   - ⏳ Setup Supabase tables (SQL migrations)
   - ⏳ Implement authentication middleware
   - ⏳ Build campaign/character CRUD endpoints
   - ⏳ Implement dice roller & history

### Comandi rapidi:
```bash
npm run dev          # Development con hot-reload
npm run build        # Pre-deploy TypeScript check
npm run type-check   # Verify types only
git push origin main # Auto-trigger Render redeploy
```

### Se Render continua a fallire:
```bash
# Switch a Railway (alternativa affidabile):
deploy_to_railway repo=soli92/soli-dm-be project_name=soli-dm-be
```

---

## 📝 **NOTE SVILUPPO**

- **Database:** Usare Supabase @supabase/supabase-js client (già configurato). Non aggiungere ORM pesanti (Prisma, TypeORM) se non necessario.
- **Routes:** Tutti i file di route sono pronti in `src/routes/`. Aggiungere logica di business dentro ogni file.
- **Middleware:** CORS e auth middleware sono in `src/middleware/`. Agganciarli in `server.ts` prima delle routes.
- **Logging:** Pino è configurato. Usare `logger.info()`, `logger.error()` etc. Non usare `console.log()`.
- **Deployment:** Solo Render per ora (fallback Railway). Non toccare il build script di Render Dashboard unless absolutely necessary.
- **CORS:** È configurato per Vercel FE (`https://soli-dm-*.vercel.app`). Se serving da un'altra origine, aggiornare `CORS_ORIGIN` env var.

---

**Ultimo update:** 2026-04-02 15:40 UTC  
**Agente:** Soli (autonomo)  
**Commit:** Questo file creato come parte del fix deployment  
**Next Action:** Monitor Render redeploy logs
