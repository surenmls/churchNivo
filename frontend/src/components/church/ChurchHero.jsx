import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getChurchTheme, isSectionEnabled } from './churchUtils';
import { buildHeroSlides } from './buildHeroSlides';

const FOCUS_CLASS = {
  top: 'object-top',
  center: 'object-center',
  bottom: 'object-bottom',
};

const AUTO_INTERVAL_MS = 5500;

export default function ChurchHero({ church, slug, events = [], galleryAlbums = [] }) {
  const theme = getChurchTheme(church.theme_color);
  const slides = buildHeroSlides(church, events, galleryAlbums);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasMultiple = slides.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [church?.id, slides.length]);

  useEffect(() => {
    if (!hasMultiple || paused) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [hasMultiple, paused, slides.length]);

  const goTo = (index) => setActiveIndex((index + slides.length) % slides.length);

  return (
    <section
      className="relative flex min-h-[300px] flex-col overflow-hidden sm:min-h-[360px] lg:min-h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 z-0">
        {slides.length > 0 ? (
          slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === activeIndex ? 'z-10 opacity-100' : 'z-0 opacity-0'
              }`}
              aria-hidden={index !== activeIndex}
            >
              <img
                src={slide.image}
                alt={slide.caption ? slide.caption : ''}
                className={`h-full w-full object-cover ${FOCUS_CLASS[slide.focus] || FOCUS_CLASS.top}`}
                loading={index <= 1 ? 'eager' : 'lazy'}
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/55 to-black/35" />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-50"
        style={{ background: `linear-gradient(135deg, ${theme}66 0%, transparent 55%)` }}
      />

      <div className="relative z-[2] mx-auto flex w-full max-w-7xl flex-1 flex-col justify-between px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            to="/churches"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20 sm:text-sm"
          >
            ← All Churches
          </Link>
          {church.website && (
            <a
              href={church.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-white/20 sm:inline-flex sm:text-sm"
            >
              Website ↗
            </a>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          {church.logo && (
            <div className="relative shrink-0">
              <div
                className="absolute -inset-1 rounded-2xl opacity-50 blur-md"
                style={{ backgroundColor: theme }}
              />
              <img
                src={church.logo}
                alt={church.name}
                className="relative h-16 w-16 rounded-2xl border-2 border-white/90 object-cover shadow-xl sm:h-20 sm:w-20"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white sm:text-xs"
              style={{ backgroundColor: `${theme}dd` }}
            >
              Welcome
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              {church.name}
            </h1>
            {(slides[activeIndex]?.caption || church.tagline) && (
              <p className="mt-1.5 line-clamp-2 max-w-xl text-sm font-medium text-white/85 sm:text-base">
                {slides[activeIndex]?.caption || church.tagline}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {isSectionEnabled(church.sections, 'events') && (
              <Link
                to={`/church/${slug}/events`}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 sm:text-sm"
                style={{ backgroundColor: theme }}
              >
                View Events
              </Link>
            )}
            {isSectionEnabled(church.sections, 'contact') && (
              <Link
                to={`/church/${slug}/contact`}
                className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-sm"
              >
                Get in Touch
              </Link>
            )}
            {church.donation_url && (
              <a
                href={church.donation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-sm"
              >
                Give Online
              </a>
            )}
          </div>

          {hasMultiple && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
                aria-label="Previous slide"
              >
                ‹
              </button>
              <div className="flex gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goTo(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === activeIndex ? 'w-6 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
