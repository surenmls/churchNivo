import { Router } from 'express';
import { body } from 'express-validator';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleMiddleware } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { releaseUnusedMedia } from '../services/mediaCleanup.js';

const router = Router();

export const BLOG_CATEGORIES = ['Devotional', 'Community', 'Family'];

const PUBLIC_FILTER = `
  AND is_approved = true
  AND is_active = true
  AND (published_at IS NULL OR published_at <= NOW())
`;

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'post';
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function estimateReadTime(content) {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

async function uniqueSlug(churchId, baseSlug, excludeId = null) {
  let slug = baseSlug;
  let n = 0;
  for (;;) {
    const params = excludeId ? [churchId, slug, excludeId] : [churchId, slug];
    const sql = excludeId
      ? 'SELECT id FROM blog_posts WHERE church_id = $1 AND slug = $2 AND id != $3'
      : 'SELECT id FROM blog_posts WHERE church_id = $1 AND slug = $2';
    const existing = await query(sql, params);
    if (existing.rows.length === 0) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
}

router.get('/categories', (_req, res) => {
  res.json(BLOG_CATEGORIES);
});

router.get('/church/:id', async (req, res, next) => {
  try {
    const churchId = parseInt(req.params.id, 10);
    const approvedOnly = req.query.approved !== 'false';
    const category = req.query.category;

    let sql = approvedOnly
      ? `SELECT * FROM blog_posts WHERE church_id = $1 ${PUBLIC_FILTER}`
      : 'SELECT * FROM blog_posts WHERE church_id = $1';
    const params = [churchId];

    if (category && category !== 'All' && BLOG_CATEGORIES.includes(category)) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY published_at DESC NULLS LAST, created_at DESC';

    const result = await query(sql, params);
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
    body('content').trim().notEmpty(),
    body('excerpt').optional().trim(),
    body('cover_image').optional({ values: 'falsy' }).isURL(),
    body('category').optional().isIn(BLOG_CATEGORIES),
    body('author_name').optional().trim(),
    body('author_avatar').optional({ values: 'falsy' }).isURL(),
    body('author_bio').optional().trim(),
    body('published_at').optional().isISO8601(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        church_id,
        title,
        content,
        excerpt,
        cover_image,
        category,
        author_name,
        author_avatar,
        author_bio,
        published_at,
      } = req.body;

      if (req.user.role === 'church_admin' && req.user.church_id !== church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const slug = await uniqueSlug(church_id, slugify(title));
      const readTime = estimateReadTime(content);
      const excerptText = excerpt || stripHtml(content).slice(0, 220);

      const result = await query(
        `INSERT INTO blog_posts (
          church_id, title, slug, excerpt, content, cover_image, category,
          author_name, author_avatar, author_bio, read_time_minutes, published_at,
          is_approved, is_active
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,true) RETURNING *`,
        [
          church_id,
          title,
          slug,
          excerptText,
          content,
          cover_image || null,
          category || 'Devotional',
          author_name || null,
          author_avatar || null,
          author_bio || null,
          readTime,
          published_at || new Date().toISOString(),
        ]
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
    body('content').optional().trim().notEmpty(),
    body('excerpt').optional().trim(),
    body('cover_image').optional({ values: 'falsy' }),
    body('category').optional().isIn(BLOG_CATEGORIES),
    body('author_name').optional().trim(),
    body('author_avatar').optional({ values: 'falsy' }),
    body('author_bio').optional().trim(),
    body('published_at').optional().isISO8601(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const postId = parseInt(req.params.id, 10);
      const existing = await query('SELECT * FROM blog_posts WHERE id = $1', [postId]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const row = existing.rows[0];
      if (req.user.role === 'church_admin' && req.user.church_id !== row.church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const {
        title,
        content,
        excerpt,
        cover_image,
        category,
        author_name,
        author_avatar,
        author_bio,
        published_at,
      } = req.body;

      const nextTitle = title ?? row.title;
      const nextContent = content ?? row.content;
      const nextSlug =
        title && title !== row.title
          ? await uniqueSlug(row.church_id, slugify(title), postId)
          : row.slug;

      const result = await query(
        `UPDATE blog_posts SET
          title = $1,
          slug = $2,
          excerpt = $3,
          content = $4,
          cover_image = $5,
          category = $6,
          author_name = $7,
          author_avatar = $8,
          author_bio = $9,
          read_time_minutes = $10,
          published_at = COALESCE($11, published_at),
          updated_at = NOW()
         WHERE id = $12 RETURNING *`,
        [
          nextTitle,
          nextSlug,
          excerpt ?? row.excerpt ?? stripHtml(nextContent).slice(0, 220),
          nextContent,
          cover_image !== undefined ? cover_image || null : row.cover_image,
          category ?? row.category,
          author_name !== undefined ? author_name || null : row.author_name,
          author_avatar !== undefined ? author_avatar || null : row.author_avatar,
          author_bio !== undefined ? author_bio || null : row.author_bio,
          estimateReadTime(nextContent),
          published_at ?? null,
          postId,
        ]
      );

      releaseUnusedMedia(row);
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
      const postId = parseInt(req.params.id, 10);
      const { is_active } = req.body;

      const existing = await query('SELECT church_id FROM blog_posts WHERE id = $1', [postId]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const result = await query(
        'UPDATE blog_posts SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [is_active, postId]
      );

      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', authMiddleware, roleMiddleware('super_admin', 'church_admin'), async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const existing = await query('SELECT * FROM blog_posts WHERE id = $1', [postId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (req.user.role === 'church_admin' && req.user.church_id !== existing.rows[0].church_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await query('DELETE FROM blog_posts WHERE id = $1', [postId]);
    releaseUnusedMedia(existing.rows[0]);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
