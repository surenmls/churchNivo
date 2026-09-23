import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { getChurchTheme } from './churchUtils';

const ICONS = {
  Home: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  About: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Events: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Media: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Gallery: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Blog: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Contact: (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

function NavItem({ item, theme, onClick, compact = false }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-all duration-200 ${
          compact ? 'px-3 py-2 text-xs' : 'px-3 py-2 text-sm'
        } ${
          isActive
            ? 'text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
      style={({ isActive }) => (isActive ? { backgroundColor: theme } : undefined)}
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-white/90' : 'text-gray-400'}>{ICONS[item.label]}</span>
          {item.label}
        </>
      )}
    </NavLink>
  );
}

export default function ChurchNav({ navItems, themeColor, church, slug }) {
  const theme = getChurchTheme(themeColor);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [navItems]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const homeLink = `/church/${slug}`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-gray-200/90 bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.12)] backdrop-blur-md'
          : 'border-b border-gray-200/60 bg-white shadow-sm'
      }`}
    >
      <div className="h-1 w-full" style={{ backgroundColor: theme }} />

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-4">
          <Link
            to={homeLink}
            className="flex min-w-0 shrink-0 items-center gap-2.5 transition hover:opacity-80"
          >
            {church?.logo ? (
              <img
                src={church.logo}
                alt=""
                className="h-8 w-8 rounded-lg border border-gray-100 object-cover"
              />
            ) : (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: theme }}
              >
                {church?.name?.charAt(0) || 'C'}
              </div>
            )}
            <span className="hidden truncate font-display text-sm font-bold text-gray-900 md:block md:max-w-[140px] lg:max-w-[200px]">
              {church?.name}
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <NavItem key={item.to} item={item} theme={theme} />
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            {church?.donation_url && (
              <a
                href={church.donation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:inline-flex"
                style={{ backgroundColor: theme }}
              >
                Give
              </a>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-100 py-3 lg:hidden">
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-3">
              {navItems.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  theme={theme}
                  compact
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>
            {church?.donation_url && (
              <a
                href={church.donation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: theme }}
                onClick={() => setMobileOpen(false)}
              >
                Give Online
              </a>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
