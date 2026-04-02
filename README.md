# 🎲 Soli Dungeon Master — Backend

API REST Node.js/Express per gestire campagne D&D, personaggi, wiki e simulatore di dadi.

## Stack

- **Node.js 22+** (TypeScript)
- **Express** — API REST
- **Supabase** — Database PostgreSQL
- **Cors** — Cross-Origin Resource Sharing

## Installazione

```bash
npm install
```

## Variabili d'ambiente

Copia `.env.example` a `.env` e compila:

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
CORS_ORIGIN=http://localhost:3000
```

## Sviluppo

```bash
npm run dev
```

Server avvia su `http://localhost:3000`

## Build & Start Produzione

```bash
npm run build
npm start
```

## API Endpoints

### Health
- `GET /health` — Status server

### Campagne
- `GET /api/campaigns` — Lista tutte
- `POST /api/campaigns` — Crea nuova
- `GET /api/campaigns/:id` — Dettagli
- `PATCH /api/campaigns/:id` — Aggiorna
- `DELETE /api/campaigns/:id` — Elimina

### Personaggi
- `GET /api/campaigns/:campaignId/characters` — Lista personaggi campagna
- `POST /api/campaigns/:campaignId/characters` — Crea personaggio
- `PATCH /api/characters/:id` — Aggiorna
- `DELETE /api/characters/:id` — Elimina

### Wiki D&D
- `GET /api/wiki/classes` — Liste classi
- `GET /api/wiki/races` — Lista razze
- `GET /api/wiki/deities` — Lista divinità

### Dadi
- `POST /api/dice/roll` — Lancia dadi
  - Body: `{ "dice_notation": "1d20" }` o `"2d6+3"`
  - Response: `{ notation, rolls, subtotal, modifier, total }`

## Database (Supabase)

Tabelle richieste:
- `campaigns` — id, name, description, created_at, updated_at
- `characters` — id, campaign_id, name, class, race, level, created_at
- `dnd_classes` — id, name, description, hit_dice, ...
- `dnd_races` — id, name, description, ability_bonuses, ...
- `dnd_deities` — id, name, alignment, description, ...

Vedi `docs/database-schema.sql` per lo schema completo.

## Deploy

Deploy consigliato: **Railway** o **Render**

```bash
# Railway
railway up
```

## License

MIT © [soli92](https://github.com/soli92)
