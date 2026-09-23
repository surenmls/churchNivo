import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const PUBLIC_FILTER = `
  AND e.is_active = true
  AND (e.starts_at IS NULL OR e.starts_at <= NOW())
  AND (e.ends_at IS NULL OR e.ends_at > NOW())
`;

const ORDER_BY = 'COALESCE(event_at, date) ASC';

function parseOptionalDate(value) {
  if (value === null || value === undefined || value === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

router.get('/approved', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT e.*, c.name as church_name, c.slug as church_slug
       FROM events e
       JOIN churches c ON c.id = e.church_id
       WHERE e.is_approved = true AND e.platform_approved = true AND c.is_active = true ${PUBLIC_FILTER}
       ORDER BY ${ORDER_BY}`
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
        ? `SELECT * FROM events
           WHERE church_id = $1 AND is_approved = true AND is_active = true
           AND (starts_at IS NULL OR starts_at <= NOW())
           AND (ends_at IS NULL OR ends_at > NOW())
           ORDER BY ${ORDER_BY}`
        : `SELECT * FROM events WHERE church_id = $1 ORDER BY ${ORDER_BY}`,
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
    body('description').optional().trim(),
    body('event_at').isISO8601(),
    body('date').optional().isISO8601(),
    body('starts_at').optional().isISO8601(),
    body('ends_at').optional({ nullable: true }).isISO8601(),
    body('media_url').optional({ values: 'falsy' }).isURL(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { church_id, title, description, event_at, date, starts_at, ends_at, media_url } = req.body;

      if (req.user.role === 'church_admin' && req.user.church_id !== church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const eventAt = parseOptionalDate(event_at || date);
      const startsAt = parseOptionalDate(starts_at) || new Date().toISOString();
      const endsAt = parseOptionalDate(ends_at);

      const result = await query(
        `INSERT INTO events (church_id, title, description, date, event_at, starts_at, ends_at, media_url, is_approved, is_active)
         VALUES ($1, $2, $3, $4, $4, $5, $6, $7, true, true) RETURNING *`,
        [church_id, title, description || null, eventAt, startsAt, endsAt, media_url || null]
      );

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
    body('description').optional().trim(),
    body('event_at').optional().isISO8601(),
    body('date').optional().isISO8601(),
    body('starts_at').optional().isISO8601(),
    body('ends_at').optional({ nullable: true }),
    body('media_url').optional({ values: 'falsy' }).isURL(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      const existing = await query('SELECT * FROM events WHERE id = $1', [eventId]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const row = existing.rows[0];
      if (req.user.role === 'church_admin' && req.user.church_id !== row.church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { title, description, event_at, date, starts_at, ends_at, media_url } = req.body;
      const nextEventAt =
        event_at !== undefined || date !== undefined
          ? parseOptionalDate(event_at || date)
          : row.event_at || row.date;
      const nextStartsAt = starts_at !== undefined ? parseOptionalDate(starts_at) : row.starts_at;
      const nextEndsAt = ends_at !== undefined ? parseOptionalDate(ends_at) : row.ends_at;

      const result = await query(
        `UPDATE events SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          date = $3,
          event_at = $3,
          starts_at = COALESCE($4, starts_at),
          ends_at = $5,
          media_url = COALESCE($6, media_url),
          updated_at = NOW()
         WHERE id = $7 RETURNING *`,
        [
          title ?? null,
          description ?? null,
          nextEventAt,
          nextStartsAt,
          nextEndsAt,
          media_url ?? null,
          eventId,
        ]
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
      const eventId = parseInt(req.params.id, 10);
      const { is_active } = req.body;

      const existing = await query('SELECT church_id FROM events WHERE id = $1', [eventId]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const result = await query(
        'UPDATE events SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [is_active, eventId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/platform-request',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  async (req, res, next) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      const existing = await query('SELECT * FROM events WHERE id = $1', [eventId]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const row = existing.rows[0];
      if (req.user.role === 'church_admin' && req.user.church_id !== row.church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (!row.is_active || !row.is_approved) {
        return res.status(400).json({ error: 'Event must be published on your church site first' });
      }

      if (row.platform_approved) {
        return res.status(400).json({ error: 'Event is already listed on the main platform' });
      }

      if (row.platform_requested) {
        return res.status(400).json({ error: 'Platform listing already requested' });
      }

      const result = await query(
        `UPDATE events SET platform_requested = true, platform_requested_at = NOW(), updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [eventId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/platform-approve',
  authMiddleware,
  roleMiddleware('super_admin'),
  [body('platform_approved').isBoolean()],
  validate,
  async (req, res, next) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      const { platform_approved } = req.body;

      const result = await query(
        `UPDATE events SET
          platform_approved = $1,
          platform_requested = false,
          updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [platform_approved, eventId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

/** @deprecated Use platform-approve for main site listing */
router.patch(
  '/:id/approve',
  authMiddleware,
  roleMiddleware('super_admin'),
  async (req, res, next) => {
    try {
      const eventId = parseInt(req.params.id, 10);
      const { is_approved = true } = req.body;

      const result = await query(
        'UPDATE events SET is_approved = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [is_approved, eventId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);

    const existing = await query('SELECT church_id FROM events WHERE id = $1', [eventId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query('DELETE FROM events WHERE id = $1', [eventId]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
