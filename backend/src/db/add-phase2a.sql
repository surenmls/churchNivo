CREATE TABLE IF NOT EXISTS gallery_albums (
  id SERIAL PRIMARY KEY,
  church_id INTEGER NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  year INTEGER,
  cover_image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  featured_order INTEGER DEFAULT 0,
  is_default_landing BOOLEAN DEFAULT false,
  linked_event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(church_id, slug)
);

ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS album_id INTEGER REFERENCES gallery_albums(id) ON DELETE CASCADE;
ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS file_size_bytes INTEGER DEFAULT 0;

ALTER TABLE churches ADD COLUMN IF NOT EXISTS gallery_featured_count INTEGER DEFAULT 5;

CREATE INDEX IF NOT EXISTS idx_gallery_albums_church_id ON gallery_albums(church_id);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_approved ON gallery_albums(is_approved);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_year ON gallery_albums(year);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_featured ON gallery_albums(is_featured);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON gallery_images(album_id);
