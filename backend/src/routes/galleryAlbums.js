import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { reconcileUsage } from '../services/storageQuota.js';
import { notifyContentPublished } from '../services/notifications.js';
import { env } from '../config/env.js';

const router = Router();

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const albumSelect = `
  SELECT a.*,
    COUNT(g.id) FILTER (WHERE g.is_approved = true)::int AS photo_count
  FROM gallery_albums a
  LEFT JOIN gallery_images g ON g.album_id = a.id
`;

router.get('/church/:churchId/meta/filters', async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    const result = await query(
      `SELECT DISTINCT year FROM gallery_albums
       WHERE church_id = $1 AND year IS NOT NULL AND is_approved = true
       ORDER BY year DESC`,
      [churchId]
    );
    res.json({ years: result.rows.map((r) => r.year) });
  } catch (err) {
    next(err);
  }
});

router.get('/church/:churchId/:slug', async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    const { slug } = req.params;
    const approvedOnly = req.query.approved !== 'false';

    const albumResult = await query(
      approvedOnly
        ? `${albumSelect} WHERE a.church_id = $1 AND a.slug = $2 AND a.is_approved = true GROUP BY a.id`
        : `${albumSelect} WHERE a.church_id = $1 AND a.slug = $2 GROUP BY a.id`,
      [churchId, slug]
    );

    if (albumResult.rows.length === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const album = albumResult.rows[0];
    const imagesResult = await query(
      approvedOnly
        ? `SELECT * FROM gallery_images WHERE album_id = $1 AND is_approved = true ORDER BY sort_order, created_at DESC`
        : `SELECT * FROM gallery_images WHERE album_id = $1 ORDER BY sort_order, created_at DESC`,
      [album.id]
    );

    res.json({ ...album, images: imagesResult.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/church/:churchId', async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    const { year, q, featured } = req.query;
    const approvedOnly = req.query.approved !== 'false';

    const conditions = ['a.church_id = $1'];
    const params = [churchId];
    let paramIndex = 2;

    if (approvedOnly) {
      conditions.push('a.is_approved = true');
    }
    if (year) {
      conditions.push(`a.year = $${paramIndex}`);
      params.push(parseInt(year, 10));
      paramIndex++;
    }
    if (q && q.trim()) {
      conditions.push(`a.title ILIKE $${paramIndex}`);
      params.push(`%${q.trim()}%`);
      paramIndex++;
    }
    if (featured === 'true') {
      conditions.push('a.is_featured = true');
    }

    const result = await query(
      `${albumSelect} WHERE ${conditions.join(' AND ')} GROUP BY a.id
       ORDER BY a.is_featured DESC, a.featured_order ASC, a.year DESC NULLS LAST, a.title ASC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  [
    body('church_id').isInt(),
    body('title').trim().notEmpty(),
    body('year').optional().isInt({ min: 1900, max: 2100 }),
    body('cover_image_url').optional().trim(),
    body('linked_event_id').optional().isInt(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { church_id, title, year, cover_image_url, linked_event_id } = req.body;

      if (req.user.role === 'church_admin' && req.user.church_id !== church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const slug = slugify(title);

      const result = await query(
        `INSERT INTO gallery_albums (church_id, title, slug, year, cover_image_url, linked_event_id, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
        [church_id, title, slug, year || null, cover_image_url || null, linked_event_id || null]
      );

      const row = result.rows[0];
      const church = await query('SELECT slug FROM churches WHERE id = $1', [church_id]);
      notifyContentPublished(church_id, 'gallery', {
        title: row.title,
        body: null,
        url: `${env.frontendUrl}/church/${church.rows[0]?.slug}/gallery/${row.slug}`,
      }).catch(console.error);

      res.status(201).json(row);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'An album with this name already exists' });
      }
      next(err);
    }
  }
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await query('SELECT church_id FROM gallery_albums WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });

      if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const {
        title, year, cover_image_url, is_featured, featured_order,
        is_default_landing, linked_event_id,
      } = req.body;

      if (is_default_landing === true) {
        await query(
          'UPDATE gallery_albums SET is_default_landing = false WHERE church_id = $1 AND id != $2',
          [existing.rows[0].church_id, id]
        );
      }

      const slug = title ? slugify(title) : undefined;

      const result = await query(
        `UPDATE gallery_albums SET
          title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          year = COALESCE($3, year),
          cover_image_url = COALESCE($4, cover_image_url),
          is_featured = COALESCE($5, is_featured),
          featured_order = COALESCE($6, featured_order),
          is_default_landing = COALESCE($7, is_default_landing),
          linked_event_id = COALESCE($8, linked_event_id),
          updated_at = NOW()
         WHERE id = $9 RETURNING *`,
        [title, slug, year, cover_image_url, is_featured, featured_order, is_default_landing, linked_event_id, id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'An album with this name already exists' });
      }
      next(err);
    }
  }
);

router.patch('/:id/approve', authMiddleware, roleMiddleware('super_admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { is_approved = true } = req.body;
    const result = await query(
      'UPDATE gallery_albums SET is_approved = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [is_approved, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const row = result.rows[0];
    if (is_approved) {
      const church = await query('SELECT slug FROM churches WHERE id = $1', [row.church_id]);
      notifyContentPublished(row.church_id, 'gallery', {
        title: row.title,
        body: null,
        url: `${env.frontendUrl}/church/${church.rows[0]?.slug}/gallery/${row.slug}`,
      }).catch(console.error);
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await query('SELECT church_id FROM gallery_albums WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await query('DELETE FROM gallery_albums WHERE id = $1', [id]);
    await reconcileUsage(existing.rows[0].church_id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
