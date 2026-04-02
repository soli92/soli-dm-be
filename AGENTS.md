# AGENTS.md — Soli Dungeon Master Backend

**Aggiornato:** 2026-04-02

## Progetto

API **Express 4** + **TypeScript**, persistenza **Supabase** (client service role in `src/lib/supabase.ts`). Entry di produzione: `src/server.ts` (`dotenv` + `listen`). L’app HTTP è costruita da **`createApp()`** in `src/createApp.ts` (stesso stack senza `listen`, usato da **Vitest** / **supertest**).

## Comandi

`npm run dev` · `npm run build` · `npm start` · `npm run type-check` · **`npm test`** · **`npm run test:watch`**

Prima di una PR: `npm run type-check`, **`npm test`**, `npm run build`.

## Test

- **Vitest** (`vitest.config.ts`), setup env fittizi in **`vitest.setup.ts`** (`SUPABASE_URL` / `SUPABASE_SERVICE_KEY`) così `@supabase/supabase-js` si inizializza al caricamento delle route senza progetto reale.
- **`src/lib/diceRoll.test.ts`**: notazione `NdX`, limiti, RNG iniettato.
- **`src/middleware/apiKey.test.ts`**: `SOLI_DM_API_KEY` opzionale, header `x-soli-dm-api-key` / `Bearer`.
- **`src/http.integration.test.ts`**: `GET /health`, `GET /api/classes`, API key, ordine route `GET /api/rules/ability-scores/list`, `POST /api/dice/roll`.

I file `*.test.ts` sono **esclusi** da `tsc` (`tsconfig.json` → `exclude`).

## File utili

`README.md` · `.env.example` · `src/createApp.ts` · `src/lib/diceRoll.ts` · `src/middleware/apiKey.ts`

## Variabili d’ambiente (sintesi)

| Variabile | Ruolo |
|-----------|--------|
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Client server-side (mai esporre la service key al browser). |
| `CORS_ORIGIN` | Se valorizzata, CORS solo quell’origine; altrimenti `origin: true`. |
| `SOLI_DM_API_KEY` | Se valorizzata, tutte le route `/api/*` richiedono la chiave; **`GET /health`** resta pubblico. |
| `PORT` | Default `5000`. |

## Regole per l’agente

- Non committare `.env` con segreti reali.
- Nuove route statiche (wiki): verificare l’**ordine** delle route Express (path fissi prima di `/:param`).
- Logica ripetibile e testabile: preferire moduli in `src/lib/` (es. dadi) con test dedicati.

## Deploy (Render / altri)

- **Build:** `npm run build` → output in `dist/`.
- **Start:** `npm start` → `node dist/server.js`.
- Impostare le stesse env del `.env.example` sul provider; allineare `CORS_ORIGIN` al dominio del frontend.
