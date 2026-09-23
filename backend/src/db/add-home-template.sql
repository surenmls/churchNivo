ALTER TABLE churches ADD COLUMN IF NOT EXISTS home_template VARCHAR(20) DEFAULT 'classic';

UPDATE churches SET home_template = 'classic' WHERE home_template IS NULL;

ALTER TABLE churches ALTER COLUMN home_template SET DEFAULT 'classic';
