import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import galleryAlbumRoutes from './galleryAlbums.js';
import {
  checkUploadAllowed,
  incrementUsage,
  decrementUsage,
  QuotaExceededError,
} from '../services/storageQuota.js';
import { releaseUnusedMedia } from '../services/mediaCleanup.js';

const router = Router();

router.use('/albums', galleryAlbumRoutes);

router.get('/church/:churchId', async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.churchId, 10);
    const { album_id } = req.query;
    const approvedOnly = req.query.approved !== 'false';

    const conditions = ['church_id = $1'];
    const params = [churchId];
    let paramIndex = 2;

    if (approvedOnly) {
      conditions.push('is_approved = true');
    }
    if (album_id) {
      conditions.push(`album_id = $${paramIndex}`);
      params.push(parseInt(album_id, 10));
      paramIndex++;
    }

    const result = await query(
      `SELECT * FROM gallery_images WHERE ${conditions.join(' AND ')} ORDER BY sort_order, created_at DESC`,
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
    body('image_url').trim().notEmpty(),
    body('album_id').isInt(),
    body('title').optional().trim(),
    body('sort_order').optional().isInt(),
    body('file_size_bytes').optional().isInt(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { church_id, title, image_url, sort_order, album_id, file_size_bytes } = req.body;
      const sizeBytes = file_size_bytes || 0;

      if (req.user.role === 'church_admin' && req.user.church_id !== church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const album = await query(
        'SELECT id, church_id FROM gallery_albums WHERE id = $1',
        [album_id]
      );
      if (album.rows.length === 0 || album.rows[0].church_id !== church_id) {
        return res.status(400).json({ error: 'Invalid album' });
      }

      if (req.user.role === 'church_admin') {
        try {
          await checkUploadAllowed(church_id, sizeBytes);
        } catch (err) {
          if (err instanceof QuotaExceededError) {
            return res.status(403).json({ error: err.message, code: err.code });
          }
          throw err;
        }
      }

      const result = await query(
        `INSERT INTO gallery_images (church_id, album_id, title, image_url, sort_order, file_size_bytes, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING *`,
        [church_id, album_id, title || null, image_url, sort_order || 0, sizeBytes]
      );

      await incrementUsage(church_id, sizeBytes);

      res.status(201).json(result.rows[0]);
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
      'UPDATE gallery_images SET is_approved = $1 WHERE id = $2 RETURNING *',
      [is_approved, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await query('SELECT * FROM gallery_images WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query('DELETE FROM gallery_images WHERE id = $1', [id]);
    await decrementUsage(existing.rows[0].church_id, existing.rows[0].file_size_bytes || 0);
    releaseUnusedMedia(existing.rows[0]);

    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
