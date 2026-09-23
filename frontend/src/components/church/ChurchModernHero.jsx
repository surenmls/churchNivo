import { Link } from 'react-router-dom';
import { getChurchTheme, isSectionEnabled } from './churchUtils';
import { buildHeroSlides } from './buildHeroSlides';
import ScrollReveal, { modernStaggerDelay } from './ScrollReveal';

const QUICK_CARDS = [
  { key: 'media', label: 'Latest Message', desc: 'Watch or listen online', path: 'media', icon: '▶️' },
  { key: 'blog', label: 'Devotionals', desc: 'Read our latest articles', path: 'blog', icon: '📝' },
  { key: 'about', label: 'Our Story', desc: 'Learn about our church', path: 'about', icon: '✝' },
  { key: 'events', label: 'Get Involved', desc: 'Upcoming gatherings', path: 'events', icon: '📅' },
];

export default function ChurchModernHero({ church, slug, events = [], galleryAlbums = [] }) {
  const theme = getChurchTheme(church.theme_color);
  const slides = buildHeroSlides(church, events, galleryAlbums);
  const heroImage = slides[0]?.image || church.banner;

  const cards = QUICK_CARDS.filter((c) => isSectionEnabled(church.sections, c.key));

  return (
    <section className="relative">
      <div className="relative min-h-[420px] overflow-hidden sm:min-h-[480px] lg:min-h-[520px]">
        {heroImage ? (
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-black/55" />
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: `linear-gradient(135deg, ${theme}88 0%, transparent 60%)` }}
        />

        <div className="relative mx-auto flex min-h-[inherit] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
          <h1 className="max-w-3xl font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {church.tagline || `Welcome to ${church.name}`}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            {church.mission
              ? church.mission.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120)
              : 'A place to worship, belong, and grow together in faith.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {isSectionEnabled(church.sections, 'contact') && (
              <Link
                to={`/church/${slug}/contact`}
                className="rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                style={{ backgroundColor: theme }}
              >
                Plan Your Visit
              </Link>
            )}
            {isSectionEnabled(church.sections, 'media') && (
              <Link
                to={`/church/${slug}/media`}
                className="rounded-lg border-2 border-white/80 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Watch Online
              </Link>
            )}
            {isSectionEnabled(church.sections, 'blog') && (
              <Link
                to={`/church/${slug}/blog`}
                className="rounded-lg border-2 border-white/80 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Read Devotionals
              </Link>
            )}
          </div>
        </div>
      </div>

      {cards.length > 0 && (
        <div className="relative z-10 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:-mt-12 lg:px-8">
          <div
            className={`grid gap-4 ${
              cards.length >= 4
                ? 'sm:grid-cols-2 lg:grid-cols-4'
                : cards.length === 3
                  ? 'md:grid-cols-3'
                  : cards.length === 2
                    ? 'md:grid-cols-2'
                    : 'max-w-md'
            }`}
          >
            {cards.map((card, index) => (
              <ScrollReveal key={card.key} variant="modern" delay={modernStaggerDelay(100, index)} className="h-full">
                <Link
                  to={`/church/${slug}/${card.path}`}
                  className="flex h-full items-start gap-4 rounded-xl bg-white p-5 shadow-lg ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg text-white"
                    style={{ backgroundColor: theme }}
                  >
                    {card.icon}
                  </span>
                  <div>
                    <p className="font-display font-bold text-gray-900">{card.label}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{card.desc}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
