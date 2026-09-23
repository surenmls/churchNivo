import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/churches', label: 'Churches' },
  { to: '/events', label: 'Events' },
  { to: '/media', label: 'Media' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/80 shadow-sm shadow-gray-200/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <BrandLogo onClick={() => setMobileOpen(false)} />

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium transition ${isActive ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/search" className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-primary-600" title="Search">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link to="/login" className="btn-secondary hidden sm:inline-flex">
              Sign In
            </Link>
            <Link to="/churches" className="btn-primary">
              Find a Church
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm font-medium ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-4">
              <Link to="/search" className="btn-secondary w-full" onClick={() => setMobileOpen(false)}>
                Search
              </Link>
              <Link to="/login" className="btn-secondary w-full" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
              <Link to="/churches" className="btn-primary w-full" onClick={() => setMobileOpen(false)}>
                Find a Church
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <BrandLogo light />
              <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-400">
                Find your church. Grow your faith. Discover congregations, events, and sermons near you.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Explore</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/churches" className="hover:text-white">Churches</Link></li>
                <li><Link to="/events" className="hover:text-white">Events</Link></li>
                <li><Link to="/media" className="hover:text-white">Media</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Admin</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link to="/admin/login" className="hover:text-white">Super Admin</Link></li>
                <li><Link to="/church-admin/login" className="hover:text-white">Church Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ChurchNivo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
