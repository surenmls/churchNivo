import { Link } from 'react-router-dom';
import { getChurchTheme, isSectionEnabled } from './churchUtils';

const LINKS = [
  { key: 'events', label: 'Events', icon: '📅', path: 'events', desc: 'Upcoming gatherings' },
  { key: 'media', label: 'Media', icon: '🎬', path: 'media', desc: 'Sermons & resources' },
  { key: 'gallery', label: 'Gallery', icon: '🖼️', path: 'gallery', desc: 'Photos & memories' },
  { key: 'about', label: 'About', icon: '✝', path: 'about', desc: 'Our story & mission' },
  { key: 'contact', label: 'Contact', icon: '✉️', path: 'contact', desc: 'Reach out to us' },
];

export default function ChurchQuickLinks({ church, slug }) {
  const theme = getChurchTheme(church.theme_color);
  const items = LINKS.filter((l) => isSectionEnabled(church.sections, l.key));

  if (items.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.key}
            to={`/church/${slug}/${item.path}`}
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition group-hover:scale-110"
              style={{ backgroundColor: `${theme}15` }}
            >
              {item.icon}
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-gray-900">{item.label}</h3>
            <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
          </Link>
        ))}
        {church.donation_url && (
          <a
            href={church.donation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition group-hover:scale-110"
              style={{ backgroundColor: `${theme}15` }}
            >
              💝
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-gray-900">Give</h3>
            <p className="mt-1 text-sm text-gray-500">Support our ministry</p>
          </a>
        )}
      </div>
    </section>
  );
}
