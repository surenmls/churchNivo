import { parseServiceTimes, getChurchTheme } from './churchUtils';
import { SocialIconButtons, getSocialLinksFromChurch } from './SocialIcons';

export default function ChurchQuickInfo({ church }) {
  const theme = getChurchTheme(church.theme_color);
  const services = parseServiceTimes(church.service_times);
  const hasSocial = getSocialLinksFromChurch(church).length > 0;

  const cards = [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Service Times',
      content: services.length > 0 ? (
        <ul className="space-y-1.5">
          {services.slice(0, 4).map((s, i) => (
            <li key={i} className="flex justify-between gap-2 text-xs sm:text-sm">
              <span className="font-medium text-gray-900">{s.day}</span>
              <span className="text-right text-gray-500">{s.time}{s.label ? ` · ${s.label}` : ''}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 sm:text-sm">Contact us for service schedule</p>
      ),
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Location',
      content: church.address ? (
        <>
          <p className="line-clamp-3 text-xs text-gray-600 sm:text-sm">{church.address}</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(church.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-xs font-semibold transition hover:opacity-80 sm:text-sm"
            style={{ color: theme }}
          >
            Open in Maps →
          </a>
        </>
      ) : (
        <p className="text-xs text-gray-500 sm:text-sm">Address coming soon</p>
      ),
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: 'Connect',
      content: (
        <div className="space-y-1.5 text-xs sm:text-sm">
          {church.phone && (
            <a href={`tel:${church.phone}`} className="block font-medium text-gray-900 hover:opacity-80">
              {church.phone}
            </a>
          )}
          {church.contact_email && (
            <a href={`mailto:${church.contact_email}`} className="block truncate hover:opacity-80" style={{ color: theme }}>
              {church.contact_email}
            </a>
          )}
          {hasSocial && (
            <div className="pt-2">
              <SocialIconButtons church={church} size="sm" />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-3 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: theme }}
              >
                {card.icon}
              </span>
              <h3 className="font-display text-sm font-bold text-gray-900 sm:text-base">{card.title}</h3>
            </div>
            {card.content}
          </div>
        ))}
      </div>
    </section>
  );
}
