ALTER TABLE events ADD COLUMN IF NOT EXISTS platform_approved BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS platform_requested BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS platform_requested_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_events_platform_requested ON events(platform_requested) WHERE platform_requested = true;
