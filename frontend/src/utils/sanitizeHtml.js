import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'h2', 'h3', 'ul', 'ol', 'li', 'a', 'blockquote',
];

const ALLOWED_ATTR = ['href', 'target', 'rel'];

export function sanitizeHtml(dirty) {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['target'],
  });
}

export function stripHtml(html) {
  if (!html) return '';
  const text = html.replace(/<[^>]+>/g, ' ');
  return text.replace(/\s+/g, ' ').trim();
}

export function isHtmlContent(value) {
  return /<[a-z][\s\S]*>/i.test(value || '');
}
