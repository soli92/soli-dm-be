# AGENTS.md — Soli Dungeon Master Backend

**Aggiornato:** 2026-04-08

## Progetto

API **Express 4** + **TypeScript**, persistenza **Supabase** (client service role in `src/lib/supabase.ts`). Sorgente: `src/server.ts` (`dotenv` + `listen`). In produzione, dopo `npm run build`, l’entry eseguita è **`dist/server.js`** (CommonJS da `tsc`), avviata tramite **`npm start`** → **`scripts/start.cjs`**: trova la directory con `package.json` (`"name": "soli-dm-be"`). Su **Render** (`RENDER` valorizzato), se `dist/server.js` manca, esegue **una volta** `npm run build` da quella root prima di fallire (mitiga build command / Root Directory errati; preferibile comunque root repo vuota e `npm ci && npm run build` in fase build). L’app HTTP è costruita da **`createApp()`** in `src/createApp.ts` (senza `listen`, usata da **Vitest** / **supertest**).

## Comandi

`npm run dev` · `npm run build` · `npm start` · `npm run type-check` · **`npm test`** · **`npm run test:watch`** · **`npm run smoke:cors`** · **`npm run smoke:api`** (health + wiki + dadi su `SMOKE_API_URL`, opz. `SMOKE_API_KEY`)

Prima di una PR: `npm run type-check`, **`npm test`**, `npm run build`.

## Test

### Struttura (scalabile)

| Layer | Dove | Scopo |
|--------|------|--------|
| **Unit / puro** | `src/lib/*.test.ts`, `src/middleware/*.test.ts` | Logica senza HTTP né DB. |
| **Integrazione HTTP** | `src/*.integration.test.ts` | `supertest` + `createApp()`; route reali. |
| **Smoke produzione** | `npm run smoke:cors`, `npm run smoke:api` | Verifica reale (CORS + endpoint pubblici). |

### Mock Supabase (globale)

- **`vitest.setup.ts`** importa **`src/test/registerSupabaseMock.ts`**: sostituisce `lib/supabase` con un client in-memory (builder thenable + **coda FIFO** + **fallback**).
- Ogni test parte con **`mockDb.reset()`** (già in `beforeEach` nel register).
- Nei test: **`mockDb.setFallback(dbList([...]))`** per una risposta ripetuta; **`mockDb.enqueue(dbOk(...))`** per N query in sequenza (es. insert poi altro).
- Helper: **`dbOk`**, **`dbList`**, **`dbErr`** nello stesso modulo.
- **`src/test/integrationHarness.ts`**: es. **`useSilencedHttpLogs()`** per i `describe` HTTP.

Nuove route che usano Supabase: aggiungere casi in un `*.integration.test.ts` esistente o nuovo file; configurare la coda/fallback prima della richiesta `supertest`.

### File test

- **`src/lib/diceRoll.test.ts`**: notazione `NdX`, limiti, RNG iniettato.
- **`src/middleware/apiKey.test.ts`**: `SOLI_DM_API_KEY`, header `x-soli-dm-api-key` / `Bearer`.
- **`src/lib/corsConfig.test.ts`**: allowlist CORS, preview Vercel, virgolette in env.
- **`src/http.integration.test.ts`**: health, campagne lista vuota (mock default), classi, API key, CORS preflight, `rules/ability-scores/list`, `POST /api/dice/roll`.
- **`src/wiki.integration.test.ts`**: wiki (classi, razze, divinità, regole).
- **`src/api.routes.integration.test.ts`**: 404, `dice/roll-multiple`, `dice/history` senza `campaign_id`, API key su `/api/races`.
- **`src/campaigns-characters.integration.test.ts`**: CRUD campagne e personaggi + errori Supabase + API key.
- **`src/dice.integration.test.ts`**: `POST /roll` con persistenza, `GET /history`, `GET /history/:id`.

I file `*.test.ts` sono **esclusi** da `tsc` (`tsconfig.json` → `exclude`).

## File utili

`README.md` · **`SETUP.md`** (deploy Render passo-passo) · `.env.example` · **`render.yaml`** (Blueprint Render: build, start, `NODE_VERSION`) · **`scripts/start.cjs`** (start produzione) · `src/createApp.ts` · `src/lib/diceRoll.ts` · `src/middleware/apiKey.ts`

## Variabili d’ambiente (sintesi)

| Variabile | Ruolo |
|-----------|--------|
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Client server-side (mai esporre la service key al browser). |
| `CORS_ORIGIN` | Una o più origini (virgola). Se valorizzata, solo quelle + opzionale preview Vercel; se vuota, `origin: true`. Valori tra virgolette in dashboard vengono normalizzati. |
| `CORS_ALLOW_VERCEL_PREVIEW` | `true` / `1` / `yes`: consente anche `https://*.vercel.app` il cui host contiene `CORS_VERCEL_PREVIEW_SUBSTRING` (default `soli-dm`) — utile per deploy preview ≠ `soli-dm-fe.vercel.app`. |
| `SOLI_DM_API_KEY` | Se valorizzata, le route `/api/*` richiedono la chiave (**non** le richieste **OPTIONS**); **`GET /health`** resta pubblico. |
| `PORT` | Default `5000` in locale; su **Render** usa di solito la variabile `PORT` fornita dalla piattaforma (non forzare `5000` negli env se crea conflitti). |

## Regole per l’agente

- Non committare `.env` con segreti reali; usare **`.env.example`** come riferimento.
- Nuove route statiche (wiki): verificare l’**ordine** delle route Express (path fissi prima di `/:param`).
- Logica ripetibile e testabile: preferire moduli in `src/lib/` (es. dadi) con test dedicati.
- Dopo cambi a **start/build/deploy**: aggiornare **`AGENTS.md`**, **`README.md`** (sezione Deployment) e **`SETUP.md`** (§ Render) in modo coerente.

## Deploy (Render e altri)

- **`dist/`** è generato da **`tsc`** ed è in **`.gitignore`**: in produzione serve sempre una fase di **build** sul provider.
- **Build (Render / CI):** `npm install && npm run build` (o `npm ci && npm run build` con lockfile).
- **Start:** `npm start` → esegue **`scripts/start.cjs`**, che carica **`dist/server.js`** dalla **root del repository** (stessa cartella di `package.json`). Non avviare `node dist/server.js` con working directory errata (es. solo `src`).
- **Render — Root Directory:** lasciare **vuota** (root del repo). Se si imposta `src`, i path di `dist/` non coincidono con l’output di `tsc` e compaiono errori tipo `.../src/dist/server.js` mancante.
- **Node:** preferire **20.x** in produzione (`engines` in `package.json`; in `render.yaml` è impostato **`NODE_VERSION`** come riferimento per il Blueprint).
- Variabili: allineare **`CORS_ORIGIN`** al dominio del frontend; stesse chiavi sensate del **`.env.example`** (senza committare segreti).

Dettaglio operativo: **`SETUP.md`** § 4; riepilogo in **`README.md`** § Deployment.
