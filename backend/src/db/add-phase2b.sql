ALTER TABLE churches ADD COLUMN IF NOT EXISTS plan_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE churches ADD COLUMN IF NOT EXISTS max_photos INTEGER DEFAULT 50;
ALTER TABLE churches ADD COLUMN IF NOT EXISTS max_storage_bytes BIGINT DEFAULT 104857600;
ALTER TABLE churches ADD COLUMN IF NOT EXISTS storage_used_bytes BIGINT DEFAULT 0;
ALTER TABLE churches ADD COLUMN IF NOT EXISTS photo_count INTEGER DEFAULT 0;

-- Backfill usage from existing gallery images
UPDATE churches c SET
  photo_count = sub.cnt,
  storage_used_bytes = sub.total_bytes
FROM (
  SELECT church_id,
    COUNT(*)::int AS cnt,
    COALESCE(SUM(file_size_bytes), 0)::bigint AS total_bytes
  FROM gallery_images
  GROUP BY church_id
) sub
WHERE c.id = sub.church_id;
