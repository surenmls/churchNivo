import { Link } from 'react-router-dom';
import { getChurchTheme } from './churchUtils';
import { getMediaEmbed } from '../../utils/mediaEmbed';

const TYPE_META = {
  video: { icon: '▶️', label: 'Watch', gradient: 'from-red-500 to-rose-600' },
  audio: { icon: '🎵', label: 'Listen', gradient: 'from-violet-500 to-purple-600' },
  link: { icon: '🔗', label: 'Open', gradient: 'from-blue-500 to-indigo-600' },
  document: { icon: '📄', label: 'Read', gradient: 'from-amber-500 to-orange-600' },
};

export default function ChurchMediaCard({
  item,
  themeColor,
  large = false,
  slug,
  active = false,
  onSelect,
  compact = false,
}) {
  const theme = getChurchTheme(themeColor);
  const meta = TYPE_META[item.type] || TYPE_META.link;
  const embed = getMediaEmbed(item.url);
  const isPlayable = Boolean(embed);

  const cardClass = `group relative overflow-hidden rounded-2xl border bg-white shadow-md transition ${
    active ? 'border-2 shadow-lg' : 'border-gray-100 hover:-translate-y-1 hover:shadow-xl'
  } ${compact ? '' : large ? 'p-0' : 'p-0'}`;

  const inner = (
    <>
      {isPlayable ? (
        <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
          {embed.thumbnailUrl ? (
            <img
              src={embed.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={`flex h-full items-center justify-center bg-gradient-to-br ${meta.gradient} text-4xl text-white`}>
              {meta.icon}
            </div>
          )}
          <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/35" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-2xl shadow-lg transition group-hover:scale-110"
              style={{ color: theme }}
              aria-hidden
            >
              ▶
            </span>
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            {embed.provider}
          </span>
        </div>
      ) : (
        <div className={`flex items-start gap-4 ${large ? 'p-8' : 'p-5'}`}>
          <div
            className={`flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl text-white shadow-lg ${
              large ? 'h-16 w-16' : 'h-14 w-14'
            } ${meta.gradient}`}
          >
            {meta.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{item.type}</span>
            <h3 className={`mt-1 font-bold text-gray-900 ${large ? 'text-xl' : 'text-base'}`}>{item.title}</h3>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: theme }}>
              {meta.label} →
            </span>
          </div>
        </div>
      )}

      {isPlayable && (
        <div className={`${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
          <h3 className={`font-display font-bold leading-snug text-gray-900 ${large ? 'text-lg' : 'text-base'}`}>
            {item.title}
          </h3>
          {!compact && (
            <p className="mt-1 text-sm text-gray-500">
              {active ? 'Now playing' : 'Click to play in page'}
            </p>
          )}
        </div>
      )}

      {active && (
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: theme }} />
      )}
    </>
  );

  if (isPlayable && onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(item)}
        className={`${cardClass} w-full text-left`}
        style={active ? { borderColor: theme } : undefined}
      >
        {inner}
      </button>
    );
  }

  if (isPlayable && slug) {
    return (
      <Link
        to={`/church/${slug}/media?play=${item.id}`}
        className={`${cardClass} block`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cardClass} block`}
    >
      {inner}
    </a>
  );
}
