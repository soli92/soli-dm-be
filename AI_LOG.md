---

# AI Log — soli-dm-be

Memoria di sviluppo AI-assisted. Annotazioni sui prompt, decisioni e pattern emersi costruendo questo progetto con il supporto di AI.

## Overview del progetto

Backend **TypeScript** / **Express** per **Soli Dungeon Master**: campagne, personaggi, dadi, wiki D&D (anche cache SRD su Supabase), integrazione **dnd5eapi**, deploy su **Render**, test **Vitest** + supertest, CORS multi-origine e preview Vercel.

**Stack AI usato (inferito; aggiornato 2026-04-22)**: assistenza **IDE/LLM probabile** (serie “Add/fix” su Render/TS). `AGENTS.md` orientato a **agenti futuri** (`1d07835`). `.cursor/rules/agents-context.mdc` se presente segue ecosistema soli92. Nessun SDK LLM nel backend DM.

**Periodo di sviluppo**: 2026-04-02 (`971746d` Initial commit) → 2026-04-09 (`8b447ad` fix characters Postgres NOT NULL).

**Numero di commit**: 57

---

## Aggiornamento 2026-04-27 — Soli Prof (RAG) / documentazione

- [soli-prof](https://github.com/soli92/soli-prof) indica questo repo in `CORPUS_REPOS` dove applicabile. Webhook `push` verso `https://soli-prof.vercel.app/api/webhooks/github` (HMAC) per re-ingest. Allineati `AGENTS.md` e riferimenti; i test del repo **non** dipendono.

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

**Prompt chiave usati**

> **Prompt [inferito]**: "Genera API Express TypeScript per campagne, personaggi, dadi, wiki D&D con endpoint numerati (classi, razze, divinità) e README."
> *Evidenza*: raffica `feat: add D&D …` (`ff0f793`…`718275f`), `971746d`–`bd5f516`.

**Lezioni apprese**

- **Monolite Express** con molte route statiche wiki richiede attenzione all’**ordine** dichiarazione route (`AGENTS.md` regole).

### Fase 2 — Deploy Render: build TypeScript, CommonJS, yaml iterativo

**Timeframe**: `e12ebf7` Dockerfile Railway → `24f978b` rimozione render.yaml non supportato da dashboard.

**Cosa è stato fatto**: Procfile, `heroku-postbuild`, script build, spostamento type definitions in `dependencies`, passaggio a **commonjs** (`bfc7710`), semplificazione postinstall (`e31b175`).

**Evidenza di AI-assist** (inferita):

- Molti commit di trial-and-error su **Render** (tipico quando si pair-programma con AI su log di build).

**Decisioni architetturali notevoli**:

- **CommonJS** per compatibilità runtime Render (`bfc7710`).
- Uso di `scripts/start.cjs` e risalita path a `dist/server.js` (`4482f2e`, `6b8623c`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Risolvi build TypeScript su Render: commonjs, postinstall, render.yaml, Procfile, path dist/server.js."
> *Evidenza*: `bfc7710`, `572f1b7`, `6b8623c`, molti commit `fix:` deploy.

**Lezioni apprese**

- **CommonJS** scelto per compatibilità runtime provider rispetto a ESM puro (`bfc7710`).
- **`dist/` in .gitignore** implica build obbligatoria in ogni deploy (`AGENTS.md` Deploy).

### Fase 3 — AGENTS, test harness, CORS, wiki cache, tipologiche

**Timeframe**: `1d07835` AGENTS.md → `8b447ad` fix schema personaggi.

**Cosa è stato fatto**: documentazione per agenti futuri, Vitest/supertest, mock Supabase, integrazione wiki e cache SRD, fix **cors** callback (`e0efe26`), tipologiche dominio, allineamento colonne `name` / `character_name`.

**Evidenza di AI-assist** (inferita):

- `AGENTS.md` orientato a “agenti futuri” suggerisce workflow AI-aware.
- Fix CORS con riferimento preciso a `cors@2.x` (`e0efe26`) — nota da engineer o assistito.

**Decisioni architetturali notevoli**:

- **CORS_ALLOW_VERCEL_PREVIEW** e normalizzazione `CORS_ORIGIN` (`8ec0c88`, `785ccaf`).
- Test di smoke API (`4f56270`).

**Prompt chiave usati**

> **Prompt [inferito]**: "Aggiungi Vitest/supertest, mock Supabase, fix CORS deny callback cors@2.x, cache wiki SRD, tipologiche dominio, allinea colonne personaggi Postgres NOT NULL."
> *Evidenza*: `1d07835`, `e0efe26`, `2b609b1`, `d0529d7`, `8b447ad`.

**Lezioni apprese**

- In **cors@2.x**, `callback(null, false)` non nega correttamente → va lanciato `Error` esplicito (`e0efe26`).
- **Colonne duplicate** `name` / `character_name` richiedono allineamento insert/update per NOT NULL (`8b447ad`).

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

- **grep `TODO|FIXME|HACK|XXX`** in `src/`: nessun match prioritario in questa passata.
- **Schema personaggi**: evoluzioni successive (`class`, `class_name`, `sheet_data` in `AGENTS.md` post-merge upstream) — verificare allineamento con migrazioni Prisma e script `scripts/supabase-alignment.sql`.
- **Debito tecnico inferito**: rate limit verso `dnd5eapi` / sync wiki non quantificato nel log.
- **Debito tecnico inferito**: backup/restore campagne lasciato a provider Postgres (non automatizzato nel repo analizzato).
- **Debito tecnico inferito**: duplicazione storica `render.yaml` add/remove — consolidare una sola fonte di verità deploy.

---

> **Nota metodologica**: completamento 2026-04-22; incrociare con `SETUP.md` per stato Render attuale.

---

## Metodologia compilazione automatica

Completamento autonomo il **22 aprile 2026** analizzando:

- **57+** commit (valore storico in prima stesura; verificare `git rev-list --count HEAD` locale)
- **~10** file (`package.json`, `tsconfig`, `AGENTS.md`, `SETUP.md`, `render.yaml`, `src/createApp.ts`, workflow CI se presenti)
- **0** TODO/FIXME rilevanti in `src/` dal grep workspace

**Punti di minore confidenza:**

- Numero commit esatto se `main` locale diverge da remoto dopo merge `6c4155a`.
- Copertura test wiki/campaigns non quantificata da sola appendice commit.

---

---

## Aggiornamento 2026-05-06 — LLM Wiki context refinement

- Aggiornati `docs/wiki/wiki/index.md` e `docs/wiki/wiki/log.md` per allineare il wiki al contesto reale del repository.
- Snapshot iniziale e pagine top-level resi coerenti con `AGENTS.md`, `README.md` e questo `AI_LOG.md`.
- Nessun ingest di sorgenti effettuato: aggiornamento solo strutturale/documentale.
