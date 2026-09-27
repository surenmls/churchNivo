import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { checkUploadAllowed, QuotaExceededError } from '../services/storageQuota.js';
import { uploadObject } from '../services/objectStorage.js';

const router = Router();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
  }
};

const MAX_DIMENSION = 1600;

async function optimizeImage(file) {
  if (file.mimetype === 'image/gif') {
    return { buffer: file.buffer, contentType: file.mimetype, ext: '.gif' };
  }
  const buffer = await sharp(file.buffer)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  return { buffer, contentType: 'image/webp', ext: '.webp' };
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: env.uploadMaxMb * 1024 * 1024 },
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware('super_admin', 'church_admin'),
  (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Upload failed' });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    let image;
    try {
      image = await optimizeImage(req.file);
    } catch {
      return res.status(400).json({ error: 'This file could not be read as an image' });
    }

    const countsTowardQuota = req.body.count_quota === 'true' || req.body.count_quota === '1';

    if (countsTowardQuota && req.user.role === 'church_admin' && req.user.church_id) {
      try {
        await checkUploadAllowed(req.user.church_id, image.buffer.length);
      } catch (err) {
        if (err instanceof QuotaExceededError) {
          return res.status(403).json({ error: err.message, code: err.code });
        }
        return res.status(400).json({ error: err.message });
      }
    }

    const folder = req.user.church_id ? `church-${req.user.church_id}` : 'platform';
    const filename = `${uuidv4()}${image.ext}`;

    try {
      const url = await uploadObject(`${folder}/${filename}`, image.buffer, image.contentType);
      res.status(201).json({
        url,
        filename,
        size: image.buffer.length,
      });
    } catch (err) {
      console.error(err);
      res.status(502).json({ error: 'Could not save the image. Please try again.' });
    }
  }
);

export default router;
