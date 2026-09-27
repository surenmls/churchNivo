import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { churchResolverMiddleware, requireResolvedChurch } from '../middleware/churchResolver.js';
import { validate } from '../middleware/validate.js';
import { releaseUnusedMedia } from '../services/mediaCleanup.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { q, city, denomination } = req.query;
    const conditions = ['is_active = true'];
    const params = [];
    let paramIndex = 1;

    if (q && q.trim()) {
      conditions.push(`(name ILIKE $${paramIndex} OR tagline ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR city ILIKE $${paramIndex})`);
      params.push(`%${q.trim()}%`);
      paramIndex++;
    }
    if (city && city.trim()) {
      conditions.push(`city ILIKE $${paramIndex}`);
      params.push(city.trim());
      paramIndex++;
    }
    if (denomination && denomination.trim()) {
      conditions.push(`denomination ILIKE $${paramIndex}`);
      params.push(denomination.trim());
      paramIndex++;
    }

    const result = await query(
      `SELECT id, name, slug, logo, banner, tagline, description, address, city, denomination,
              contact_email, phone, donation_url, is_active, home_template
       FROM churches WHERE ${conditions.join(' AND ')} ORDER BY name`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/meta/filters', async (req, res, next) => {
  try {
    const [cities, denominations] = await Promise.all([
      query(`SELECT DISTINCT city FROM churches WHERE is_active = true AND city IS NOT NULL AND city != '' ORDER BY city`),
      query(`SELECT DISTINCT denomination FROM churches WHERE is_active = true AND denomination IS NOT NULL AND denomination != '' ORDER BY denomination`),
    ]);
    res.json({
      cities: cities.rows.map((r) => r.city),
      denominations: denominations.rows.map((r) => r.denomination),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/featured', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, slug, logo, banner, description
       FROM churches WHERE is_active = true ORDER BY name LIMIT 6`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', churchResolverMiddleware, requireResolvedChurch, async (req, res, next) => {
  try {
    const church = req.resolvedChurch;

    const sectionsResult = await query(
      'SELECT section_key, enabled FROM church_sections WHERE church_id = $1',
      [church.id]
    );

    res.json({
      ...church,
      sections: sectionsResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authMiddleware,
  roleMiddleware('super_admin'),
  [
    body('name').trim().notEmpty(),
    body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/),
    body('description').optional().trim(),
    body('address').optional().trim(),
    body('contact_email').optional().isEmail(),
    body('phone').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, slug, logo, banner, description, address, contact_email, phone } = req.body;

      const result = await query(
        `INSERT INTO churches (name, slug, logo, banner, description, address, contact_email, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [name, slug, logo || null, banner || null, description || null, address || null, contact_email || null, phone || null]
      );

      const church = result.rows[0];
      const sectionKeys = ['about', 'events', 'media', 'contact', 'gallery', 'announcements', 'blog'];

      for (const key of sectionKeys) {
        await query(
          'INSERT INTO church_sections (church_id, section_key, enabled) VALUES ($1, $2, true)',
          [church.id, key]
        );
      }

      res.status(201).json(church);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Slug already exists' });
      }
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
    body('description').optional().trim(),
    body('address').optional().trim(),
    body('contact_email').optional().isEmail(),
    body('phone').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const churchId = parseInt(req.params.id, 10);

      if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      let { name, logo, banner, description, address, contact_email, phone, is_active,
        tagline, mission, service_times, website, facebook_url, instagram_url, youtube_url, theme_color,
        donation_url, city, denomination, gallery_featured_count, onboarding_completed, font_family,
        hero_slides, home_template } = req.body;

      if (req.user.role !== 'super_admin') {
        home_template = undefined;
      } else if (home_template !== undefined && !['classic', 'modern'].includes(home_template)) {
        return res.status(400).json({ error: 'home_template must be classic or modern' });
      }

      const heroSlidesValue = hero_slides !== undefined
        ? JSON.stringify(Array.isArray(hero_slides) ? hero_slides : [])
        : undefined;

      const previous = await query('SELECT logo, banner, hero_slides FROM churches WHERE id = $1', [churchId]);

      const result = await query(
        `UPDATE churches SET
          name = COALESCE($1, name),
          logo = COALESCE($2, logo),
          banner = COALESCE($3, banner),
          description = COALESCE($4, description),
          address = COALESCE($5, address),
          contact_email = COALESCE($6, contact_email),
          phone = COALESCE($7, phone),
          is_active = COALESCE($8, is_active),
          tagline = COALESCE($9, tagline),
          mission = COALESCE($10, mission),
          service_times = COALESCE($11, service_times),
          website = COALESCE($12, website),
          facebook_url = COALESCE($13, facebook_url),
          instagram_url = COALESCE($14, instagram_url),
          youtube_url = COALESCE($15, youtube_url),
          theme_color = COALESCE($16, theme_color),
          donation_url = COALESCE($17, donation_url),
          city = COALESCE($18, city),
          denomination = COALESCE($19, denomination),
          gallery_featured_count = COALESCE($20, gallery_featured_count),
          onboarding_completed = COALESCE($21, onboarding_completed),
          font_family = COALESCE($22, font_family),
          hero_slides = COALESCE($23::jsonb, hero_slides),
          home_template = COALESCE($24, home_template),
          updated_at = NOW()
         WHERE id = $25 RETURNING *`,
        [name, logo, banner, description, address, contact_email, phone, is_active,
          tagline, mission, service_times, website, facebook_url, instagram_url, youtube_url, theme_color,
          donation_url, city, denomination, gallery_featured_count, onboarding_completed, font_family,
          heroSlidesValue, home_template, churchId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Church not found' });
      }

      releaseUnusedMedia(previous.rows[0]);
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.patch('/:id/complete-onboarding', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.id, 10);
    if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const result = await query(
      'UPDATE churches SET onboarding_completed = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [churchId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Church not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/:id/sections', authMiddleware, async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.id, 10);

    if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      'SELECT id, section_key, enabled FROM church_sections WHERE church_id = $1',
      [churchId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.put('/:id/sections', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.id, 10);

    if (req.user.role === 'church_admin' && req.user.church_id !== churchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { sections } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'sections must be an array' });
    }

    for (const section of sections) {
      await query(
        'UPDATE church_sections SET enabled = $1 WHERE church_id = $2 AND section_key = $3',
        [section.enabled, churchId, section.section_key]
      );
    }

    const result = await query(
      'SELECT id, section_key, enabled FROM church_sections WHERE church_id = $1',
      [churchId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
