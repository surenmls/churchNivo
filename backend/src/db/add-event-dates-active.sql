ALTER TABLE events ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
UPDATE events SET is_active = true WHERE is_active IS NULL;
-- Church-admin events no longer require super-admin approval
UPDATE events SET is_approved = true WHERE is_approved = false;
