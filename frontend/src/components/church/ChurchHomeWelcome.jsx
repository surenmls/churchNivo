import { Link } from 'react-router-dom';
import { getChurchTheme, isSectionEnabled } from './churchUtils';
import SafeHtml from '../SafeHtml';
import { isHtmlContent } from '../../utils/sanitizeHtml';

export default function ChurchHomeWelcome({ church, slug }) {
  const theme = getChurchTheme(church.theme_color);
  const hasAbout = isSectionEnabled(church.sections, 'about');
  const fallbackIntro = `Welcome to ${church.name}. We're glad you're here — explore our events, media, and community.`;

  return (
    <section className="mb-10 md:mb-12">
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="grid lg:grid-cols-5">
          <div className="flex flex-col justify-center p-6 md:p-8 lg:col-span-3">
            <span
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: theme }}
            >
              Welcome Home
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-gray-900 md:text-3xl">
              {church.tagline || `We're glad you're here`}
            </h2>
            {church.description ? (
              isHtmlContent(church.description) ? (
                <SafeHtml
                  html={church.description}
                  className="rich-content-compact mt-3 text-base leading-relaxed text-gray-600"
                />
              ) : (
                <p className="mt-3 line-clamp-4 text-base leading-relaxed text-gray-600">{church.description}</p>
              )
            ) : (
              <p className="mt-3 line-clamp-4 text-base leading-relaxed text-gray-600">
                {church.tagline || fallbackIntro}
              </p>
            )}
            {church.mission && (
              <blockquote
                className="mt-6 rounded-xl border-l-4 bg-gray-50 px-5 py-4 italic text-gray-700"
                style={{ borderColor: theme }}
              >
                {isHtmlContent(church.mission) ? (
                  <SafeHtml html={church.mission} className="italic text-gray-700" />
                ) : (
                  <>&ldquo;{church.mission}&rdquo;</>
                )}
              </blockquote>
            )}
            {hasAbout && (
              <Link
                to={`/church/${slug}/about`}
                className="mt-6 inline-flex w-fit items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: theme }}
              >
                Learn more about us →
              </Link>
            )}
          </div>
          <div className="relative min-h-[180px] lg:col-span-2 lg:min-h-0">
            {(church.banner || church.logo) ? (
              <img
                src={church.banner || church.logo}
                alt={church.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full min-h-[280px] items-center justify-center text-6xl text-white"
                style={{ background: `linear-gradient(135deg, ${theme}, ${theme}99)` }}
              >
                ⛪
              </div>
            )}
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: `linear-gradient(to top, ${theme}, transparent)` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
