import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const approvedOnly = req.query.approved !== 'false';

    const result = await query(
      approvedOnly
        ? `SELECT p.*, c.name as church_name, c.slug as church_slug
           FROM promotions p
           JOIN churches c ON c.id = p.church_id
           WHERE p.is_approved = true AND c.is_active = true
           ORDER BY p.created_at DESC`
        : `SELECT p.*, c.name as church_name, c.slug as church_slug
           FROM promotions p
           JOIN churches c ON c.id = p.church_id
           ORDER BY p.created_at DESC`
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
    body('image').optional().isURL(),
    body('link').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { church_id, title, image, link } = req.body;

      if (req.user.role === 'church_admin' && req.user.church_id !== church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const isApproved = req.user.role === 'super_admin';

      const result = await query(
        `INSERT INTO promotions (church_id, title, image, link, is_approved)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [church_id, title, image || null, link || null, isApproved]
      );

      res.status(201).json(result.rows[0]);
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
      const promoId = parseInt(req.params.id, 10);
      const { is_approved = true } = req.body;

      const result = await query(
        'UPDATE promotions SET is_approved = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [is_approved, promoId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Promotion not found' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
