import { useEffect, useCallback } from 'react';
import SafeHtml from '../SafeHtml';
import { formatBlogDate, formatReadTime, getAuthorInitials } from '../../utils/blogUtils';
import { getChurchTheme } from './churchUtils';

export default function BlogArticleModal({ post, themeColor, churchName, onClose }) {
  const theme = getChurchTheme(themeColor);

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!post) return undefined;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [post, handleKey]);

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="blog-modal-title"
      onClick={onClose}
    >
      <article
        className="relative my-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-gray-700 shadow-md transition hover:bg-white"
          aria-label="Close article"
        >
          ×
        </button>

        {post.cover_image ? (
          <div className="relative aspect-[16/10] max-h-72 w-full overflow-hidden bg-gray-100">
            <img src={post.cover_image} alt="" className="h-full w-full object-cover" />
            <span
              className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: theme }}
            >
              {post.category}
            </span>
          </div>
        ) : (
          <div
            className="relative flex aspect-[16/10] max-h-48 items-center justify-center text-5xl text-white"
            style={{ background: `linear-gradient(135deg, ${theme}, ${theme}bb)` }}
          >
            ✍
            <span
              className="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            >
              {post.category}
            </span>
          </div>
        )}

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatBlogDate(post.published_at || post.created_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatReadTime(post.read_time_minutes)}
            </span>
          </div>

          <h1 id="blog-modal-title" className="mt-4 font-display text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
            {post.title}
          </h1>

          {(post.author_name || churchName) && (
            <div className="mt-6 flex items-center gap-3">
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author_name || 'Author'}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: theme }}
                >
                  {getAuthorInitials(post.author_name)}
                </div>
              )}
              <div>
                {post.author_name && <p className="font-semibold text-gray-900">{post.author_name}</p>}
                {churchName && <p className="text-sm text-gray-500">{churchName}</p>}
              </div>
            </div>
          )}

          <SafeHtml
            html={post.content}
            className="blog-article-body blog-drop-cap mt-8 max-w-none font-serif text-[17px] leading-relaxed text-gray-700"
          />
        </div>
      </article>
    </div>
  );
}
