import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { notifyContentPublished } from '../services/notifications.js';
import { env } from '../config/env.js';

const router = Router();

const ACTIVE_FILTER = `
  AND (a.starts_at IS NULL OR a.starts_at <= NOW())
  AND (a.expires_at IS NULL OR a.expires_at > NOW())
`;

function parseOptionalDate(value) {
  if (value === null || value === undefined || value === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function maybeNotifyAnnouncement(churchId, title, content, startsAt) {
  const start = startsAt ? new Date(startsAt) : new Date();
  if (start > new Date()) return;

  const church = await query('SELECT slug FROM churches WHERE id = $1', [churchId]);
  notifyContentPublished(churchId, 'announcement', {
    title,
    body: content,
    url: `${env.frontendUrl}/church/${church.rows[0]?.slug}`,
  }).catch(console.error);
}

router.get('/approved', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT a.*, c.name as church_name, c.slug as church_slug
       FROM announcements a
       JOIN churches c ON c.id = a.church_id
       WHERE a.is_approved = true AND c.is_active = true
       ${ACTIVE_FILTER}
       ORDER BY a.starts_at DESC NULLS LAST, a.published_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/church/:churchId', async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    const approvedOnly = req.query.approved !== 'false';

    const result = await query(
      approvedOnly
        ? `SELECT * FROM announcements
           WHERE church_id = $1 AND is_approved = true
           AND (starts_at IS NULL OR starts_at <= NOW())
           AND (expires_at IS NULL OR expires_at > NOW())
           ORDER BY starts_at DESC NULLS LAST, published_at DESC`
        : `SELECT * FROM announcements WHERE church_id = $1
           ORDER BY starts_at DESC NULLS LAST, published_at DESC`,
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
    body('content').optional().trim(),
    body('image').optional().trim(),
    body('starts_at').optional().isISO8601(),
    body('expires_at').optional({ nullable: true }).isISO8601(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { church_id, title, content, image, starts_at, expires_at } = req.body;

      if (req.user.role === 'church_admin' && req.user.church_id !== church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const startsAt = parseOptionalDate(starts_at) || new Date().toISOString();
      const expiresAt = parseOptionalDate(expires_at);

      if (expiresAt && new Date(expiresAt) <= new Date(startsAt)) {
        return res.status(400).json({ error: 'Expiry must be after start date' });
      }

      const result = await query(
        `INSERT INTO announcements (church_id, title, content, image, is_approved, starts_at, expires_at)
         VALUES ($1, $2, $3, $4, true, $5, $6) RETURNING *`,
        [church_id, title, content || null, image || null, startsAt, expiresAt]
      );

      await maybeNotifyAnnouncement(church_id, title, content, startsAt);

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
    body('content').optional().trim(),
    body('image').optional().trim(),
    body('starts_at').optional().isISO8601(),
    body('expires_at').optional({ nullable: true }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const existing = await query('SELECT * FROM announcements WHERE id = $1', [id]);
      if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });

      if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { title, content, image, starts_at, expires_at } = req.body;
      const row = existing.rows[0];

      const nextStartsAt = starts_at !== undefined ? parseOptionalDate(starts_at) : row.starts_at;
      const nextExpiresAt = expires_at !== undefined ? parseOptionalDate(expires_at) : row.expires_at;

      if (nextExpiresAt && nextStartsAt && new Date(nextExpiresAt) <= new Date(nextStartsAt)) {
        return res.status(400).json({ error: 'Expiry must be after start date' });
      }

      const result = await query(
        `UPDATE announcements SET
          title = COALESCE($1, title),
          content = COALESCE($2, content),
          image = COALESCE($3, image),
          starts_at = COALESCE($4, starts_at),
          expires_at = $5,
          updated_at = NOW()
         WHERE id = $6 RETURNING *`,
        [title, content, image, nextStartsAt, nextExpiresAt, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id/approve', authMiddleware, roleMiddleware('super_admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { is_approved = true } = req.body;
    const result = await query(
      'UPDATE announcements SET is_approved = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [is_approved, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const row = result.rows[0];
    if (is_approved) {
      await maybeNotifyAnnouncement(row.church_id, row.title, row.content, row.starts_at);
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await query('SELECT church_id FROM announcements WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    await query('DELETE FROM announcements WHERE id = $1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
