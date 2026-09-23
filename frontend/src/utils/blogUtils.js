export const BLOG_CATEGORIES = ['All', 'Devotional', 'Community', 'Family'];

export function formatBlogDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatReadTime(minutes) {
  const m = minutes || 1;
  return `${m} min read`;
}

export function getAuthorInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
