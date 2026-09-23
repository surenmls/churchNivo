import { query } from '../config/db.js';
import { env } from '../config/env.js';

/**
 * Resolves church from:
 * 1. X-Church-Slug header (dev / explicit)
 * 2. Subdomain (production: grace.churchnivo.com)
 * 3. :slug route param
 */
export async function churchResolverMiddleware(req, res, next) {
  try {
    let slug = null;

    if (req.headers['x-church-slug']) {
      slug = req.headers['x-church-slug'];
    } else if (req.params.slug) {
      slug = req.params.slug;
    } else {
      const host = req.headers.host || '';
      const hostname = host.split(':')[0];

      if (hostname && hostname !== env.baseDomain && hostname !== 'localhost') {
        const parts = hostname.split('.');
        if (parts.length >= 3) {
          slug = parts[0];
        } else if (parts.length === 2 && parts[1] === 'localhost') {
          slug = parts[0];
        }
      }
    }

    if (slug) {
      const result = await query(
        'SELECT * FROM churches WHERE slug = $1 AND is_active = true',
        [slug]
      );

      if (result.rows.length > 0) {
        req.resolvedChurch = result.rows[0];
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

export async function requireResolvedChurch(req, res, next) {
  if (!req.resolvedChurch) {
    return res.status(404).json({ error: 'Church not found' });
  }
  next();
}
