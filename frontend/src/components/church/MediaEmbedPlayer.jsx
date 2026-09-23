import { getMediaEmbed } from '../../utils/mediaEmbed';

export default function MediaEmbedPlayer({ url, title, className = '' }) {
  const embed = getMediaEmbed(url);

  if (!embed) {
    return (
      <div className={`flex aspect-video items-center justify-center rounded-2xl bg-gray-900 text-white ${className}`}>
        <p className="text-sm text-white/70">This link opens in a new tab.</p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl bg-black shadow-xl ring-1 ring-black/10 ${className}`}>
      <div className="relative aspect-video w-full">
        <iframe
          src={embed.embedUrl}
          title={title || 'Video player'}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}
