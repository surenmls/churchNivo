import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { ensureNotificationSettings } from '../services/notifications.js';

import { notifyContentPublished } from '../services/notifications.js';
import { env } from '../config/env.js';

const router = Router();

router.use(authMiddleware, roleMiddleware('super_admin'));

router.get('/inbox', async (req, res, next) => {
  try {
    const churches = await query('SELECT id, name, slug FROM churches WHERE is_active = true');
    const churchMap = Object.fromEntries(churches.rows.map((c) => [c.id, c]));

    const [events, media, announcements, albums, photos, promotions] = await Promise.all([
      query(
        `SELECT id, church_id, title, COALESCE(event_at, date) AS date, platform_requested_at AS created_at
         FROM events
         WHERE platform_requested = true AND platform_approved = false AND is_approved = true AND is_active = true
         ORDER BY platform_requested_at DESC`
      ),
      query(`SELECT id, church_id, title, type, created_at FROM media WHERE is_approved = false ORDER BY created_at DESC`),
      query(`SELECT id, church_id, title, published_at as created_at FROM announcements WHERE is_approved = false ORDER BY published_at DESC`),
      query(`SELECT id, church_id, title, year, created_at FROM gallery_albums WHERE is_approved = false ORDER BY created_at DESC`),
      query(`SELECT id, church_id, title, album_id, created_at FROM gallery_images WHERE is_approved = false ORDER BY created_at DESC`),
      query(`SELECT id, church_id, title, created_at FROM promotions WHERE is_approved = false ORDER BY created_at DESC`),
    ]);

    const mapItem = (item, type) => {
      const church = churchMap[item.church_id];
      return {
        id: item.id,
        type,
        title: item.title || 'Untitled',
        church_id: item.church_id,
        church_name: church?.name || 'Unknown',
        church_slug: church?.slug,
        created_at: item.created_at || item.date,
        meta: type === 'event' ? new Date(item.date).toLocaleString() : item.type || item.year || null,
      };
    };

    const items = [
      ...events.rows.map((i) => mapItem(i, 'platform_event')),
      ...media.rows.map((i) => mapItem(i, 'media')),
      ...announcements.rows.map((i) => mapItem(i, 'announcement')),
      ...albums.rows.map((i) => mapItem(i, 'gallery_album')),
      ...photos.rows.map((i) => mapItem(i, 'gallery_photo')),
      ...promotions.rows.map((i) => mapItem(i, 'promotion')),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const counts = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    res.json({ items, counts, total: items.length });
  } catch (err) {
    next(err);
  }
});

const approveHandlers = {
  platform_event: (id) =>
    query(
      `UPDATE events SET platform_approved = true, platform_requested = false, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    ),
  event: (id) =>
    query(
      `UPDATE events SET platform_approved = true, platform_requested = false, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    ),
  media: (id) => query('UPDATE media SET is_approved = true, updated_at = NOW() WHERE id = $1 RETURNING *', [id]),
  announcement: (id) => query('UPDATE announcements SET is_approved = true, updated_at = NOW() WHERE id = $1 RETURNING *', [id]),
  gallery_album: (id) => query('UPDATE gallery_albums SET is_approved = true, updated_at = NOW() WHERE id = $1 RETURNING *', [id]),
  gallery_photo: (id) => query('UPDATE gallery_images SET is_approved = true WHERE id = $1 RETURNING *', [id]),
  promotion: (id) => query('UPDATE promotions SET is_approved = true, updated_at = NOW() WHERE id = $1 RETURNING *', [id]),
};

router.patch('/inbox/:type/:id/approve', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const handler = approveHandlers[type];
    if (!handler) return res.status(400).json({ error: 'Invalid type' });

    const result = await handler(parseInt(id, 10));
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const row = result.rows[0];
    const notifyTypes = { announcement: 'announcement', media: 'media', gallery_album: 'gallery' };
    if (notifyTypes[type]) {
      const church = await query('SELECT slug FROM churches WHERE id = $1', [row.church_id]);
      const slug = church.rows[0]?.slug;
      const urlBase = `${env.frontendUrl}/church/${slug}`;
      const url = type === 'media' ? `${urlBase}/media` : type === 'gallery_album' ? `${urlBase}/gallery/${row.slug}` : urlBase;
      notifyContentPublished(row.church_id, notifyTypes[type], {
        title: row.title,
        body: row.content,
        url,
      }).catch(console.error);
    }

    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/churches/setup',
  [
    body('name').trim().notEmpty(),
    body('slug').trim().matches(/^[a-z0-9-]+$/),
    body('description').optional().trim(),
    body('contact_email').optional().isEmail(),
    body('admin.name').optional().trim().notEmpty(),
    body('admin.email').optional().isEmail(),
    body('admin.password').optional().isLength({ min: 8 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, slug, description, contact_email, address, city, admin, home_template } = req.body;
      const template = ['classic', 'modern'].includes(home_template) ? home_template : 'classic';

      const churchResult = await query(
        `INSERT INTO churches (name, slug, description, contact_email, address, city, onboarding_completed, home_template)
         VALUES ($1, $2, $3, $4, $5, $6, false, $7) RETURNING *`,
        [name, slug, description || null, contact_email || null, address || null, city || null, template]
      );

      const church = churchResult.rows[0];
      const sectionKeys = ['about', 'events', 'media', 'contact', 'gallery', 'announcements', 'blog'];

      for (const key of sectionKeys) {
        await query(
          'INSERT INTO church_sections (church_id, section_key, enabled) VALUES ($1, $2, true)',
          [church.id, key]
        );
      }

      await ensureNotificationSettings(church.id);

      let adminUser = null;
      if (admin?.name && admin?.email && admin?.password) {
        const existing = await query('SELECT id FROM users WHERE email = $1', [admin.email]);
        if (existing.rows.length > 0) {
          return res.status(409).json({ error: 'Admin email already registered' });
        }
        const hashed = await bcrypt.hash(admin.password, 12);
        const userResult = await query(
          `INSERT INTO users (name, email, password, role, church_id) VALUES ($1, $2, $3, 'church_admin', $4)
           RETURNING id, name, email, role, church_id`,
          [admin.name, admin.email, hashed, church.id]
        );
        adminUser = userResult.rows[0];
      }

      res.status(201).json({ church, admin: adminUser });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Slug or email already exists' });
      }
      next(err);
    }
  }
);

export default router;
