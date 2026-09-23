export default function MediaCard({ item, showChurch = false }) {
  const typeIcons = { video: '🎬', audio: '🎵', link: '🔗', document: '📄' };

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card group flex items-center gap-4 transition hover:border-primary-200"
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-2xl">
        {typeIcons[item.type] || '🔗'}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{item.title}</h3>
        {showChurch && item.church_name && (
          <p className="mt-1 text-sm text-gray-500">{item.church_name}</p>
        )}
        <p className="mt-1 text-xs capitalize text-gray-400">{item.type}</p>
      </div>
      <span className="text-gray-300 group-hover:text-primary-500">→</span>
    </a>
  );
}
