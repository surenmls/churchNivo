import { Link } from 'react-router-dom';
import { getChurchTheme } from './churchUtils';
import SafeHtml from '../SafeHtml';
import { stripHtml } from '../../utils/sanitizeHtml';

function PastorPhoto({ pastor, theme, className = '' }) {
  if (pastor.photo) {
    return (
      <img src={pastor.photo} alt={pastor.name} className={`h-full w-full object-cover ${className}`} />
    );
  }

  return (
    <div
      className={`flex h-full min-h-[160px] items-center justify-center text-5xl text-white ${className}`}
      style={{ background: `linear-gradient(135deg, ${theme}, ${theme}99)` }}
    >
      ✝
    </div>
  );
}

/** Compact equal card for home — teaser bio + link to About */
export function PastorPreviewCard({ pastor, themeColor, aboutLink }) {
  const theme = getChurchTheme(themeColor);
  const bioText = stripHtml(pastor.bio || '');

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex flex-1 flex-col sm:flex-row">
        <div className="relative aspect-[4/3] shrink-0 sm:w-44 md:w-52 lg:aspect-auto lg:min-h-[200px]">
          <PastorPhoto pastor={pastor} theme={theme} />
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: theme }} />
        </div>
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <span
            className="inline-block w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: theme }}
          >
            {pastor.title || 'Pastor'}
          </span>
          <h3 className="mt-3 font-display text-xl font-bold text-gray-900">{pastor.name}</h3>
          {bioText ? (
            <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-gray-600">{bioText}</p>
          ) : (
            <p className="mt-3 flex-1 text-sm text-gray-400">Learn more about our leadership team.</p>
          )}
          {aboutLink && (
            <Link
              to={aboutLink}
              className="mt-4 inline-flex items-center text-sm font-semibold hover:opacity-80"
              style={{ color: theme }}
            >
              Read full profile →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** Full-width alternating profile for About page */
export function PastorProfileCard({ pastor, themeColor, reverse = false }) {
  const theme = getChurchTheme(themeColor);

  return (
    <article
      id={`pastor-${pastor.id}`}
      className="scroll-mt-24 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100"
    >
      <div className="grid md:grid-cols-2">
        <div className={`relative min-h-[280px] md:min-h-[360px] ${reverse ? 'md:order-2' : 'md:order-1'}`}>
          <PastorPhoto pastor={pastor} theme={theme} />
          <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: theme }} />
        </div>
        <div
          className={`flex flex-col justify-center p-8 md:p-10 lg:p-12 ${reverse ? 'md:order-1' : 'md:order-2'}`}
        >
          <span
            className="inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: theme }}
          >
            {pastor.title || 'Pastor'}
          </span>
          <h3 className="mt-4 font-display text-2xl font-bold text-gray-900 md:text-3xl">{pastor.name}</h3>
          {pastor.bio ? (
            <SafeHtml html={pastor.bio} className="prose-sm mt-5 max-w-none text-base leading-relaxed text-gray-600 md:prose" />
          ) : (
            <p className="mt-5 text-gray-500">Profile details coming soon.</p>
          )}
        </div>
      </div>
    </article>
  );
}

/** Home page — equal preview cards */
export function PastorsPreviewSection({ pastors, themeColor, title = 'Meet Our Pastors', slug }) {
  if (!pastors?.length) return null;

  const theme = getChurchTheme(themeColor);
  const aboutBase = slug ? `/church/${slug}/about` : null;

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme }}>
            Meet the Team
          </span>
          <h2 className="mt-1 font-display text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">The pastors and leaders serving our congregation</p>
        </div>
        {aboutBase && pastors.length > 0 && (
          <Link to={aboutBase} className="text-sm font-semibold hover:opacity-80" style={{ color: theme }}>
            View all on About →
          </Link>
        )}
      </div>

      <div className={`grid gap-6 ${pastors.length === 1 ? 'max-w-3xl' : 'md:grid-cols-2'}`}>
        {pastors.map((pastor) => (
          <PastorPreviewCard
            key={pastor.id}
            pastor={pastor}
            themeColor={themeColor}
            aboutLink={aboutBase ? `${aboutBase}#pastor-${pastor.id}` : null}
          />
        ))}
      </div>
    </section>
  );
}

/** About page — full profiles, alternating layout */
export function PastorsAboutSection({ pastors, themeColor, title = 'Our Leadership' }) {
  if (!pastors?.length) return null;

  const theme = getChurchTheme(themeColor);

  return (
    <section className="mt-16 border-t border-gray-200 pt-16">
      <div className="mb-10">
        <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: theme }}>
          Meet the Team
        </span>
        <h2 className="mt-1 font-display text-3xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-gray-600">The pastors and leaders serving our congregation</p>
      </div>

      <div className="space-y-10 lg:space-y-14">
        {pastors.map((pastor, index) => (
          <PastorProfileCard
            key={pastor.id}
            pastor={pastor}
            themeColor={themeColor}
            reverse={index % 2 === 1}
          />
        ))}
      </div>
    </section>
  );
}

/** @deprecated Use PastorsPreviewSection or PastorsAboutSection */
export default function PastorCard({ pastor, themeColor, featured = false }) {
  if (featured) {
    return <PastorProfileCard pastor={pastor} themeColor={themeColor} reverse={false} />;
  }
  return <PastorPreviewCard pastor={pastor} themeColor={themeColor} />;
}

export function PastorsSection(props) {
  return <PastorsAboutSection {...props} />;
}
