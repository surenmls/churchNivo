import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { releaseUnusedMedia } from '../services/mediaCleanup.js';

const router = Router();

router.get('/church/:churchId', async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    const result = await query(
      'SELECT id, church_id, name, title, photo, bio, sort_order FROM pastors WHERE church_id = $1 ORDER BY sort_order, name',
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
    body('name').trim().notEmpty(),
    body('title').optional().trim(),
    body('photo').optional().trim(),
    body('bio').optional().trim(),
    body('sort_order').optional().isInt(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { church_id, name, title, photo, bio, sort_order } = req.body;

      if (req.user.role === 'church_admin' && req.user.church_id !== church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const result = await query(
        `INSERT INTO pastors (church_id, name, title, photo, bio, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [church_id, name, title || 'Lead Pastor', photo || null, bio || null, sort_order || 0]
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
    body('name').optional().trim().notEmpty(),
    body('title').optional().trim(),
    body('photo').optional().trim(),
    body('bio').optional().trim(),
    body('sort_order').optional().isInt(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const pastorId = parseInt(req.params.id, 10);
      const existing = await query('SELECT * FROM pastors WHERE id = $1', [pastorId]);

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Pastor not found' });
      }

      const churchId = existing.rows[0].church_id;
      if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const { name, title, photo, bio, sort_order } = req.body;

      const result = await query(
        `UPDATE pastors SET
          name = COALESCE($1, name),
          title = COALESCE($2, title),
          photo = COALESCE($3, photo),
          bio = COALESCE($4, bio),
          sort_order = COALESCE($5, sort_order),
          updated_at = NOW()
         WHERE id = $6 RETURNING *`,
        [name, title, photo, bio, sort_order, pastorId]
      );

      releaseUnusedMedia(existing.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const pastorId = parseInt(req.params.id, 10);
    const existing = await query('SELECT * FROM pastors WHERE id = $1', [pastorId]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pastor not found' });
    }

    if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query('DELETE FROM pastors WHERE id = $1', [pastorId]);
    releaseUnusedMedia(existing.rows[0]);
    res.json({ message: 'Pastor removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
