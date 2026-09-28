import { env } from '../config/env.js';

// The database stores media as "/media/<path>". API responses expand that to
// env.mediaPublicUrl so the frontend can be hosted anywhere, and request bodies
// are converted back so absolute URLs never get saved.
const RELATIVE_PATTERN = /(^|[\s"'(=])\/media\//g;

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mapStrings(value, fn) {
  if (typeof value === 'string') return fn(value);
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn));
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v, fn)]));
  }
  return value;
}

export function mediaUrlMiddleware() {
  const base = env.mediaPublicUrl;
  if (!base) return (req, res, next) => next();

  const absolutePattern = new RegExp(`${escapeRegExp(base)}/`, 'g');
  const toPublic = (s) => (s.includes('/media/') ? s.replace(RELATIVE_PATTERN, `$1${base}/`) : s);
  const toStored = (s) => (s.includes(base) ? s.replace(absolutePattern, '/media/') : s);

  return (req, res, next) => {
    if (req.body) req.body = mapStrings(req.body, toStored);
    const json = res.json.bind(res);
    res.json = (body) => json(mapStrings(body, toPublic));
    next();
  };
}
