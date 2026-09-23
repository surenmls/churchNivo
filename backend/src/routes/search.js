import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ churches: [], events: [], media: [], announcements: [] });
    }

    const pattern = `%${q}%`;

    const [churches, events, media, announcements] = await Promise.all([
      query(
        `SELECT id, name, slug, logo, tagline, city, denomination, description
         FROM churches WHERE is_active = true AND (
           name ILIKE $1 OR tagline ILIKE $1 OR description ILIKE $1 OR city ILIKE $1 OR denomination ILIKE $1
         ) ORDER BY name LIMIT 10`,
        [pattern]
      ),
      query(
        `SELECT e.*, c.name as church_name, c.slug as church_slug
         FROM events e JOIN churches c ON c.id = e.church_id
         WHERE e.is_approved = true AND e.platform_approved = true AND e.is_active = true AND c.is_active = true
         AND (e.starts_at IS NULL OR e.starts_at <= NOW())
         AND (e.ends_at IS NULL OR e.ends_at > NOW())
         AND (e.title ILIKE $1 OR e.description ILIKE $1)
         ORDER BY COALESCE(e.event_at, e.date) ASC LIMIT 10`,
        [pattern]
      ),
      query(
        `SELECT m.*, c.name as church_name, c.slug as church_slug
         FROM media m JOIN churches c ON c.id = m.church_id
         WHERE m.is_approved = true AND m.is_active = true AND c.is_active = true AND m.title ILIKE $1
         ORDER BY m.created_at DESC LIMIT 10`,
        [pattern]
      ),
      query(
        `SELECT a.*, c.name as church_name, c.slug as church_slug
         FROM announcements a JOIN churches c ON c.id = a.church_id
         WHERE a.is_approved = true AND c.is_active = true
         AND (a.starts_at IS NULL OR a.starts_at <= NOW())
         AND (a.expires_at IS NULL OR a.expires_at > NOW())
         AND (a.title ILIKE $1 OR a.content ILIKE $1)
         ORDER BY a.starts_at DESC NULLS LAST, a.published_at DESC LIMIT 10`,
        [pattern]
      ),
    ]);

    res.json({
      churches: churches.rows,
      events: events.rows,
      media: media.rows,
      announcements: announcements.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
