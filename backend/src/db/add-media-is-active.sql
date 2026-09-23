-- Allow church admins to hide media without deleting it
ALTER TABLE media ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

UPDATE media SET is_active = true WHERE is_active IS NULL;

CREATE INDEX IF NOT EXISTS idx_media_active ON media(is_active);
