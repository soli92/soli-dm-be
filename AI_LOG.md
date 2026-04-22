---

# AI Log — soli-dm-be

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

Backend **TypeScript** / **Express** per **Soli Dungeon Master**: campagne, personaggi, dadi, wiki D&D (anche cache SRD su Supabase), integrazione **dnd5eapi**, deploy su **Render**, test **Vitest** + supertest, CORS multi-origine e preview Vercel.

**Stack AI usato (inferito)**: assistenza IDE/LLM (commit numerosi “Add/fix” in sequenza su Render/TypeScript); **nessun merge `cursor/`** esplicito nella history estratta — confidenza **media**.

**Periodo di sviluppo**: 2026-04-02 (`971746d` Initial commit) → 2026-04-09 (`8b447ad` fix characters Postgres NOT NULL).

**Numero di commit**: 57

---

## Fasi di sviluppo (inferite dal history)

### Fase 1 — Init TypeScript e API D&D (campagne, personaggi, dadi, wiki)

**Timeframe**: `971746d` → `bd5f516` / `b7bccac` (server principale documentato).

**Cosa è stato fatto**: package/tsconfig, gitignore, env example, Express+CORS+Supabase, CRUD campagne/personaggi, API dadi, classi/razze/deità, regole, README.

**Evidenza di AI-assist** (inferita):

- Raffica di commit “feat: add D&D X API endpoint” con elenchi numerici (12 classi, 12 razze, 20 divinità) — tipico output strutturato da assistente o da template.

**Decisioni architetturali notevoli**:

- **Express** monolite con route modulari.
- **Supabase** come client dati.

**Prompt chiave usati**: > [TODO da compilare manualmente]

**Lezioni apprese**: > [TODO da compilare manualmente]

### Fase 2 — Deploy Render: build TypeScript, CommonJS, yaml iterativo

**Timeframe**: `e12ebf7` Dockerfile Railway → `24f978b` rimozione render.yaml non supportato da dashboard.

**Cosa è stato fatto**: Procfile, `heroku-postbuild`, script build, spostamento type definitions in `dependencies`, passaggio a **commonjs** (`bfc7710`), semplificazione postinstall (`e31b175`).

**Evidenza di AI-assist** (inferita):

- Molti commit di trial-and-error su **Render** (tipico quando si pair-programma con AI su log di build).

**Decisioni architetturali notevoli**:

- **CommonJS** per compatibilità runtime Render (`bfc7710`).
- Uso di `scripts/start.cjs` e risalita path a `dist/server.js` (`4482f2e`, `6b8623c`).

**Prompt chiave usati**: > [TODO da compilare manualmente]

**Lezioni apprese**: > [TODO da compilare manualmente]

### Fase 3 — AGENTS, test harness, CORS, wiki cache, tipologiche

**Timeframe**: `1d07835` AGENTS.md → `8b447ad` fix schema personaggi.

**Cosa è stato fatto**: documentazione per agenti futuri, Vitest/supertest, mock Supabase, integrazione wiki e cache SRD, fix **cors** callback (`e0efe26`), tipologiche dominio, allineamento colonne `name` / `character_name`.

**Evidenza di AI-assist** (inferita):

- `AGENTS.md` orientato a “agenti futuri” suggerisce workflow AI-aware.
- Fix CORS con riferimento preciso a `cors@2.x` (`e0efe26`) — nota da engineer o assistito.

**Decisioni architetturali notevoli**:

- **CORS_ALLOW_VERCEL_PREVIEW** e normalizzazione `CORS_ORIGIN` (`8ec0c88`, `785ccaf`).
- Test di smoke API (`4f56270`).

**Prompt chiave usati**: > [TODO da compilare manualmente]

**Lezioni apprese**: > [TODO da compilare manualmente]

---

## Pattern ricorrenti identificati

- **Ciclo deploy**: commit ripetuti su `render.yaml` / `package.json` / `build` fino a configurazione stabile.
- **docs/chore/test** in triade quando si consolida una feature.
- **Messaggi bilingue** (IT/EN) a seconda del contesto (infra vs API).

---

## Tecnologie e scelte di stack

- **Framework**: Node.js, Express, TypeScript (compilato a `dist/`)
- **DB / auth**: Supabase client; vincoli Postgres documentati nei fix
- **API esterne**: dnd5eapi, wiki SRD
- **Deploy**: Render (`render.yaml`, blueprint), storico Railway/Docker
- **LLM integration**: nessuna nel runtime di gioco

## Problemi tecnici risolti (inferiti)

1. **Output TypeScript directory**: `20ed69b`, `12db9f5`.
2. **File duplicato index/server**: `7157a20`.
3. **CORS deny callback**: `e0efe26` (riferimento esplicito `cors@2.x`).
4. **Build su start se `dist` manca**: `572f1b7`.
5. **NOT NULL Postgres su personaggi**: `8b447ad`.

---

## Appendice — Commit notevoli (estratto da `git log --oneline`)

- `8b447ad` fix(characters): allinea name e character_name (Postgres NOT NULL)
- `2b609b1` feat(wiki): cache SRD su Supabase e sync da dnd5eapi
- `e0efe26` fix(cors): restore Error on deny — callback(null,false) falls through in cors@2.x
- `572f1b7` fix(render): build on start se dist manca (RENDER) + render.yaml npm ci
- `6b8623c` fix(start): risolve dist/server.js risalendo fino alla root del pacchetto
- `1d07835` 📝 Aggiungi AGENTS.md — Status backend deployment & context per agenti futuri
- `bfc7710` fix: cambia module system a commonjs per compatibilità Render
- `ff0f793` feat: add characters API routes (CRUD)
- `2703976` feat: add campaigns API routes (CRUD)
- `971746d` Initial commit

---

## Punti aperti / note per il futuro

> [TODO da compilare manualmente: performance wiki, rate limit API esterne, backup dati campagne]

---

> **Nota metodologica**: questo file è stato generato retroattivamente analizzando la history del repo. Le sezioni con `> [TODO da compilare manualmente]` richiedono la memoria del developer e non possono essere inferite dalla sola analisi automatica. Integra progressivamente con annotazioni manuali mentre lavori alle prossime fasi del progetto.

---
