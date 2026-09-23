import { Link } from 'react-router-dom';
import { getChurchTheme } from './churchUtils';

export default function SectionHeader({ title, subtitle, linkTo, linkLabel, themeColor }) {
  const theme = getChurchTheme(themeColor);

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme }}>
          Explore
        </span>
        <h2 className="mt-1 font-display text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1 text-sm font-semibold transition hover:gap-2"
          style={{ color: theme }}
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
