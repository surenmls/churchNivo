ALTER TABLE events ADD COLUMN IF NOT EXISTS event_at TIMESTAMPTZ;
ALTER TABLE events ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ;

-- Legacy `date` column stored the occurrence datetime
UPDATE events SET event_at = date WHERE event_at IS NULL AND date IS NOT NULL;
UPDATE events SET starts_at = COALESCE(created_at, event_at, NOW()) WHERE starts_at IS NULL;

ALTER TABLE events ALTER COLUMN starts_at SET DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_events_event_at ON events(event_at);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
