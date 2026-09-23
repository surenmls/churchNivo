import { Link } from 'react-router-dom';
import { getChurchTheme } from './churchUtils';

export default function ChurchEmptyState({ icon, title, message, linkTo, linkLabel, themeColor }) {
  const theme = getChurchTheme(themeColor);

  return (
    <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-8 py-12 text-center shadow-md">
      <span className="text-4xl">{icon}</span>
      <h3 className="mt-4 font-display text-lg font-bold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{message}</p>
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold transition hover:gap-2"
          style={{ color: theme }}
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
