import { Link } from 'react-router-dom';
import { getChurchTheme } from './churchUtils';

export default function ChurchFooter({ church, slug }) {
  const theme = getChurchTheme(church.theme_color);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="h-1" style={{ backgroundColor: theme }} aria-hidden="true" />
      <div className="bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              {church.logo && (
                <img src={church.logo} alt="" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10" />
              )}
              <div>
                <p className="font-display font-bold text-white">{church.name}</p>
                <p className="text-sm text-gray-500">
                  © {year} · Powered by ChurchNivo
                </p>
              </div>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
              <Link to={`/church/${slug}`} className="text-gray-400 transition hover:text-white">Home</Link>
              <Link to={`/church/${slug}/events`} className="text-gray-400 transition hover:text-white">Events</Link>
              <Link to={`/church/${slug}/contact`} className="text-gray-400 transition hover:text-white">Contact</Link>
              <Link to="/churches" className="text-gray-400 transition hover:text-white">All Churches</Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
