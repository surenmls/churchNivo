export default function EventCard({ event, showChurch = false }) {
  const date = new Date(event.event_at || event.date);

  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-primary-50 text-primary-700">
          <span className="text-xs font-semibold uppercase">
            {date.toLocaleString('en', { month: 'short' })}
          </span>
          <span className="text-xl font-bold">{date.getDate()}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
          {showChurch && event.church_name && (
            <p className="mt-1 text-sm text-primary-600">{event.church_name}</p>
          )}
          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{event.description}</p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            {date.toLocaleString('en', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
