import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { notifyContentPublished } from '../services/notifications.js';
import { env } from '../config/env.js';

const router = Router();

router.get('/approved', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT m.*, c.name as church_name, c.slug as church_slug
       FROM media m
       JOIN churches c ON c.id = m.church_id
       WHERE m.is_approved = true AND m.is_active = true AND c.is_active = true
       ORDER BY m.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/church/:id', async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.id, 10);
    const approvedOnly = req.query.approved !== 'false';

    const result = await query(
      approvedOnly
        ? `SELECT * FROM media
           WHERE church_id = $1 AND is_approved = true AND is_active = true
           ORDER BY created_at DESC`
        : 'SELECT * FROM media WHERE church_id = $1 ORDER BY created_at DESC',
      [churchId]
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
    body('url').isURL(),
    body('type').optional().isIn(['video', 'audio', 'link', 'document']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { church_id, title, url, type } = req.body;

      if (req.user.role === 'church_admin' && req.user.church_id !== church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const result = await query(
        `INSERT INTO media (church_id, title, url, type, is_approved, is_active)
         VALUES ($1, $2, $3, $4, true, true) RETURNING *`,
        [church_id, title, url, type || 'link']
      );

      const church = await query('SELECT slug FROM churches WHERE id = $1', [church_id]);
      notifyContentPublished(church_id, 'media', {
        title,
        body: null,
        url: `${env.frontendUrl}/church/${church.rows[0]?.slug}/media`,
      }).catch(console.error);

      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  [
    body('title').optional().trim().notEmpty(),
    body('url').optional().isURL(),
    body('type').optional().isIn(['video', 'audio', 'link', 'document']),
    body('is_active').optional().isBoolean(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const mediaId = parseInt(req.params.id, 10);
      const existing = await query('SELECT * FROM media WHERE id = $1', [mediaId]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }

      const row = existing.rows[0];
      if (req.user.role === 'church_admin' && req.user.church_id !== row.church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { title, url, type, is_active } = req.body;
      const result = await query(
        `UPDATE media SET
          title = COALESCE($1, title),
          url = COALESCE($2, url),
          type = COALESCE($3, type),
          is_active = COALESCE($4, is_active),
          updated_at = NOW()
         WHERE id = $5 RETURNING *`,
        [title ?? null, url ?? null, type ?? null, is_active ?? null, mediaId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/active',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  [body('is_active').isBoolean()],
  validate,
  async (req, res, next) => {
    try {
      const mediaId = parseInt(req.params.id, 10);
      const { is_active } = req.body;

      const existing = await query('SELECT church_id FROM media WHERE id = $1', [mediaId]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }

      if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const result = await query(
        'UPDATE media SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [is_active, mediaId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/approve',
  authMiddleware,
  roleMiddleware('super_admin'),
  async (req, res, next) => {
    try {
      const mediaId = parseInt(req.params.id, 10);
      const { is_approved = true } = req.body;

      const result = await query(
        'UPDATE media SET is_approved = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [is_approved, mediaId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Media not found' });
      }

      const row = result.rows[0];
      if (is_approved) {
        const church = await query('SELECT slug FROM churches WHERE id = $1', [row.church_id]);
        notifyContentPublished(row.church_id, 'media', {
          title: row.title,
          body: null,
          url: `${env.frontendUrl}/church/${church.rows[0]?.slug}/media`,
        }).catch(console.error);
      }

      res.json(row);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const mediaId = parseInt(req.params.id, 10);

    const existing = await query('SELECT church_id FROM media WHERE id = $1', [mediaId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }

    if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query('DELETE FROM media WHERE id = $1', [mediaId]);
    res.json({ message: 'Media deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
