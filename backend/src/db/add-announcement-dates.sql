ALTER TABLE announcements ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

UPDATE announcements
SET starts_at = COALESCE(published_at, created_at, NOW())
WHERE starts_at IS NULL;

ALTER TABLE announcements ALTER COLUMN starts_at SET DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_announcements_starts_at ON announcements(starts_at);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);
