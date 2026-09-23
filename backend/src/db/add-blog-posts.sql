CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  church_id INTEGER NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'Devotional',
  author_name VARCHAR(255),
  author_avatar TEXT,
  author_bio TEXT,
  read_time_minutes INTEGER,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (church_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_church_id ON blog_posts(church_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

INSERT INTO church_sections (church_id, section_key, enabled)
SELECT id, 'blog', true FROM churches
ON CONFLICT (church_id, section_key) DO NOTHING;
