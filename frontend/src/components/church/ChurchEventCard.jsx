import { formatEventDate, getChurchTheme } from './churchUtils';
import { getEventOccurrence } from '../../utils/eventDates';

export default function ChurchEventCard({ event, themeColor, featured = false }) {
  const theme = getChurchTheme(themeColor);
  const date = formatEventDate(getEventOccurrence(event));

  if (featured) {
    return (
      <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition hover:shadow-xl">
        <div className="flex flex-col sm:flex-row">
          <div
            className="flex flex-col items-center justify-center px-8 py-6 text-white sm:w-36"
            style={{ background: `linear-gradient(135deg, ${theme}, ${theme}dd)` }}
          >
            <span className="text-sm font-bold uppercase tracking-wider opacity-90">{date.month}</span>
            <span className="text-4xl font-extrabold">{date.day}</span>
            <span className="mt-1 text-xs opacity-80">{date.weekday}</span>
          </div>
          <div className="flex flex-1 flex-col justify-center p-6">
            <h3 className="font-display text-xl font-bold text-gray-900 group-hover:opacity-90">{event.title}</h3>
            {event.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{event.description}</p>
            )}
            <p className="mt-3 text-sm font-medium" style={{ color: theme }}>
              {date.time}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex gap-4">
        <div
          className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: theme }}
        >
          <span className="text-[10px] font-bold uppercase">{date.month}</span>
          <span className="text-xl font-extrabold">{date.day}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-gray-900">{event.title}</h3>
          <p className="mt-1 text-xs text-gray-500">{date.full}</p>
          {event.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{event.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
