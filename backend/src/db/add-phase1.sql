ALTER TABLE churches ADD COLUMN IF NOT EXISTS donation_url TEXT;
ALTER TABLE churches ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE churches ADD COLUMN IF NOT EXISTS denomination VARCHAR(100);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  church_id INTEGER NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  image TEXT,
  is_approved BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id SERIAL PRIMARY KEY,
  church_id INTEGER NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title VARCHAR(255),
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_church_id ON announcements(church_id);
CREATE INDEX IF NOT EXISTS idx_announcements_approved ON announcements(is_approved);
CREATE INDEX IF NOT EXISTS idx_gallery_church_id ON gallery_images(church_id);
CREATE INDEX IF NOT EXISTS idx_gallery_approved ON gallery_images(is_approved);
CREATE INDEX IF NOT EXISTS idx_churches_city ON churches(city);
CREATE INDEX IF NOT EXISTS idx_churches_denomination ON churches(denomination);
