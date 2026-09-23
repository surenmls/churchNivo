import { Link } from 'react-router-dom';

export default function HomeSectionHeader({ eyebrow, title, subtitle, linkTo, linkLabel, centered = false }) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : 'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className={centered ? '' : 'max-w-2xl'}>
        {eyebrow && (
          <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-600">
            {eyebrow}
          </span>
        )}
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 text-lg text-gray-600">{subtitle}</p>}
      </div>
      {linkTo && linkLabel && !centered && (
        <Link
          to={linkTo}
          className="inline-flex items-center gap-1 text-sm font-bold text-primary-600 transition hover:gap-2 hover:text-primary-700"
        >
          {linkLabel} →
        </Link>
      )}
      {linkTo && linkLabel && centered && (
        <Link
          to={linkTo}
          className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-primary-600 hover:text-primary-700"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
