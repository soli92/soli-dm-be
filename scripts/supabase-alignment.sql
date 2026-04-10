-- Allineamento schema Supabase (public) per soli-dm-be / soli-dm-fe.
-- Esegui in Supabase → SQL Editor. Controlla le colonne esistenti prima dei blocchi opzionali.

-- ---------------------------------------------------------------------------
-- 1) Personaggi: scheda estesa (tab UI: sottoclasse, armamenti, sessioni, …)
-- ---------------------------------------------------------------------------
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS sheet_data JSONB DEFAULT '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- 2) Personaggi: campi usati dall’API (se mancano nello schema legacy)
-- ---------------------------------------------------------------------------
ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;

ALTER TABLE public.characters
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- ---------------------------------------------------------------------------
-- 3) Personaggi: colonna name (NOT NULL) se esiste solo character_name
-- ---------------------------------------------------------------------------
-- ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS name VARCHAR(255);
-- UPDATE public.characters SET name = character_name WHERE name IS NULL OR trim(name) = '';
-- ALTER TABLE public.characters ALTER COLUMN name SET NOT NULL;

-- ---------------------------------------------------------------------------
-- 4) dice_rolls: il backend persiste dice_notation (non notation)
--    Scegli in base alle colonne presenti (vedi information_schema).
-- ---------------------------------------------------------------------------
-- 4a) Solo `notation`, senza `dice_notation`:
-- ALTER TABLE public.dice_rolls ADD COLUMN IF NOT EXISTS dice_notation VARCHAR(20);
-- UPDATE public.dice_rolls
--   SET dice_notation = COALESCE(NULLIF(trim(notation), ''), '?')
--   WHERE dice_notation IS NULL;
-- ALTER TABLE public.dice_rolls ALTER COLUMN dice_notation SET NOT NULL;

-- 4b) Entrambe le colonne, dice_notation NULL:
-- UPDATE public.dice_rolls SET dice_notation = notation
--   WHERE dice_notation IS NULL AND notation IS NOT NULL;

-- Verifica colonne:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name IN ('characters', 'dice_rolls')
-- ORDER BY table_name, ordinal_position;
