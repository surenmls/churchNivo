import { Link } from 'react-router-dom';

export default function HomeEventCard({ event }) {
  const date = new Date(event.event_at || event.date);

  return (
    <div className="group flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex w-24 flex-shrink-0 flex-col items-center justify-center bg-gradient-to-b from-primary-600 to-primary-700 p-4 text-white">
        <span className="text-xs font-bold uppercase tracking-wider opacity-90">
          {date.toLocaleString('en', { month: 'short' })}
        </span>
        <span className="font-display text-3xl font-extrabold">{date.getDate()}</span>
        <span className="mt-1 text-[10px] font-medium opacity-80">
          {date.toLocaleString('en', { weekday: 'short' })}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center p-5">
        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{event.title}</h3>
        {event.church_name && (
          <Link
            to={event.church_slug ? `/church/${event.church_slug}` : '/churches'}
            className="mt-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            onClick={(e) => e.stopPropagation()}
          >
            {event.church_name}
          </Link>
        )}
        {event.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">{event.description}</p>
        )}
        <p className="mt-3 text-xs font-medium text-gray-400">
          {date.toLocaleString('en', { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
