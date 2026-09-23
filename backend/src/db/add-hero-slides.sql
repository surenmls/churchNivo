ALTER TABLE churches ADD COLUMN IF NOT EXISTS hero_slides JSONB DEFAULT '[]'::jsonb;
