import { sanitizeHtml } from '../utils/sanitizeHtml';

export default function SafeHtml({ html, className = '' }) {
  if (!html) return null;

  const clean = sanitizeHtml(html);
  if (!clean) return null;

  return (
    <div
      className={`rich-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
