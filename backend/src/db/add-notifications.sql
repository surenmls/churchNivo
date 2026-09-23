CREATE TABLE IF NOT EXISTS church_subscribers (
  id SERIAL PRIMARY KEY,
  church_id INTEGER NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  status VARCHAR(20) DEFAULT 'active',
  source VARCHAR(20) DEFAULT 'self',
  email_opt_in BOOLEAN DEFAULT true,
  sms_opt_in BOOLEAN DEFAULT false,
  push_opt_in BOOLEAN DEFAULT false,
  notify_events BOOLEAN DEFAULT true,
  notify_announcements BOOLEAN DEFAULT true,
  notify_media BOOLEAN DEFAULT true,
  notify_gallery BOOLEAN DEFAULT true,
  invite_token VARCHAR(64),
  unsubscribe_token VARCHAR(64) NOT NULL,
  sms_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, email)
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  church_id INTEGER NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  subscriber_id INTEGER REFERENCES church_subscribers(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS church_notification_settings (
  church_id INTEGER PRIMARY KEY REFERENCES churches(id) ON DELETE CASCADE,
  notify_on_announcement BOOLEAN DEFAULT true,
  notify_on_media BOOLEAN DEFAULT true,
  notify_on_gallery BOOLEAN DEFAULT true,
  event_reminder_24h BOOLEAN DEFAULT true,
  event_reminder_1h BOOLEAN DEFAULT true,
  weekly_digest_enabled BOOLEAN DEFAULT true,
  weekly_digest_day INTEGER DEFAULT 4,
  last_weekly_digest_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_log (
  id SERIAL PRIMARY KEY,
  church_id INTEGER NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  subscriber_id INTEGER REFERENCES church_subscribers(id) ON DELETE SET NULL,
  channel VARCHAR(20) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'sent',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_reminder_log (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  reminder_type VARCHAR(10) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_subscribers_church_id ON church_subscribers(church_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON church_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_church_id ON push_subscriptions(church_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_church_id ON notification_log(church_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

INSERT INTO church_notification_settings (church_id)
SELECT id FROM churches
ON CONFLICT (church_id) DO NOTHING;
