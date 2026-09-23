import LightboxImage from '../LightboxImage';
import { getChurchTheme } from './churchUtils';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ChurchAnnouncementCard({ item, themeColor, featured = false }) {
  const theme = getChurchTheme(themeColor);
  const displayDate = formatDate(item.starts_at || item.published_at);

  if (item.image) {
    return (
      <article
        className={`overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition hover:shadow-lg ${
          featured ? 'shadow-lg' : 'shadow-md'
        }`}
      >
        <div className="flex flex-col sm:min-h-[7.5rem] sm:flex-row">
          <div
            className={`relative shrink-0 bg-gray-100 sm:min-h-[7.5rem] ${
              featured ? 'sm:w-52 md:w-56' : 'sm:w-44 md:w-48'
            }`}
          >
            <div className="aspect-video w-full sm:absolute sm:inset-0 sm:aspect-auto">
              <LightboxImage
                src={item.image}
                alt={item.title}
                caption={item.title}
                buttonClassName="h-full w-full cursor-zoom-in"
                className="h-full w-full object-cover"
              />
            </div>
            <div
              className="absolute left-0 top-0 hidden h-full w-1 sm:block"
              style={{ backgroundColor: theme }}
            />
            <div
              className="absolute bottom-0 left-0 h-1 w-full sm:hidden"
              style={{ backgroundColor: theme }}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {featured && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: theme }}
                  >
                    Latest
                  </span>
                )}
                {!featured && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white sm:hidden"
                    style={{ backgroundColor: theme }}
                  >
                    News
                  </span>
                )}
              </div>
              {displayDate && (
                <time className="shrink-0 text-xs font-medium text-gray-400">{displayDate}</time>
              )}
            </div>
            <h3
              className={`font-display font-bold leading-snug text-gray-900 ${
                featured ? 'mt-2 text-xl sm:text-2xl' : 'mt-1.5 text-lg'
              }`}
            >
              {item.title}
            </h3>
            {item.content && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-600">{item.content}</p>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-black/5 sm:p-6 ${
        featured ? 'shadow-lg' : 'shadow-md'
      }`}
      style={{ borderLeft: `4px solid ${theme}` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {featured && (
            <span
              className="mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: theme }}
            >
              Latest
            </span>
          )}
          <h3 className={`font-display font-bold text-gray-900 ${featured ? 'text-xl' : 'text-lg'}`}>
            {item.title}
          </h3>
          {item.content && (
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.content}</p>
          )}
        </div>
        {displayDate && (
          <time className="shrink-0 text-xs font-medium text-gray-400">{displayDate}</time>
        )}
      </div>
    </article>
  );
}
