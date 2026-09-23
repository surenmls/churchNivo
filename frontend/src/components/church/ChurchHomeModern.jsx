import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ChurchMediaCard from './ChurchMediaCard';
import ChurchEmptyState from './ChurchEmptyState';
import SubscribeSection from './SubscribeSection';
import BlogArticleModal from './BlogArticleModal';
import LightboxImage from '../LightboxImage';
import ScrollReveal, { modernStaggerDelay } from './ScrollReveal';
import { formatBlogDate, formatReadTime } from '../../utils/blogUtils';

const MODERN = 'modern';
import { PastorsPreviewSection } from './PastorCard';
import { isSectionEnabled, getChurchTheme, formatEventDate } from './churchUtils';
import { getEventOccurrence } from '../../utils/eventDates';
import { isHtmlContent } from '../../utils/sanitizeHtml';
import { stripHtml } from '../../utils/sanitizeHtml';

function ModernSectionLabel({ children, theme }) {
  return (
    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme }}>
      {children}
    </span>
  );
}

function ModernAnnouncementTile({ item, theme }) {
  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {item.image ? (
          <LightboxImage
            src={item.image}
            alt={item.title}
            caption={item.title}
            buttonClassName="h-full w-full cursor-zoom-in"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl opacity-30">📣</div>
        )}
        <span
          className="absolute left-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white"
          style={{ backgroundColor: theme }}
        >
          News
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-gray-900 line-clamp-2">{item.title}</h3>
        {item.content && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{item.content}</p>
        )}
        <span className="mt-3 inline-flex text-sm font-semibold transition group-hover:gap-2" style={{ color: theme }}>
          Read more →
        </span>
      </div>
    </article>
  );
}

function ModernBlogFeatured({ post, theme, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="group relative min-h-[280px] w-full overflow-hidden rounded-2xl text-left shadow-lg sm:min-h-[320px]"
    >
      {post.cover_image ? (
        <img
          src={post.cover_image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${theme}, ${theme}88)` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="relative flex h-full min-h-[280px] flex-col justify-end p-6 sm:min-h-[320px]">
        <span
          className="inline-block w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: theme }}
        >
          Featured · {post.category}
        </span>
        <h3 className="mt-3 font-display text-xl font-bold leading-tight text-white sm:text-2xl">{post.title}</h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-white/85">{post.excerpt}</p>
        )}
        <p className="mt-3 text-xs text-white/70">
          {post.author_name || 'Church Team'} · {formatBlogDate(post.published_at || post.created_at)} ·{' '}
          {formatReadTime(post.read_time_minutes)}
        </p>
      </div>
    </button>
  );
}

function ModernBlogSide({ post, theme, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="group flex w-full gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24">
        {post.cover_image ? (
          <img src={post.cover_image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-xl text-white" style={{ backgroundColor: theme }}>
            ✍
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme }}>
          {post.category}
        </span>
        <h4 className="mt-1 line-clamp-2 font-display text-sm font-bold text-gray-900">{post.title}</h4>
        <p className="mt-1 text-xs text-gray-400">
          {formatBlogDate(post.published_at || post.created_at)} · {formatReadTime(post.read_time_minutes)}
        </p>
      </div>
    </button>
  );
}

function ModernEventRow({ event, theme }) {
  const date = formatEventDate(getEventOccurrence(event));
  return (
    <div className="flex gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div
        className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg text-white"
        style={{ backgroundColor: theme }}
      >
        <span className="text-[10px] font-bold uppercase leading-none">{date.month}</span>
        <span className="text-2xl font-extrabold leading-tight">{date.day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display font-bold text-gray-900">{event.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{date.time} · {date.weekday}</p>
        {event.description && (
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{event.description}</p>
        )}
      </div>
    </div>
  );
}

export default function ChurchHomeModern({
  church, slug, events, media, pastors, announcements, galleryAlbums, blogPosts = [],
}) {
  const [activeBlogPost, setActiveBlogPost] = useState(null);
  const theme = getChurchTheme(church.theme_color);
  const sortedBlog = useMemo(
    () =>
      [...blogPosts].sort(
        (a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
      ),
    [blogPosts]
  );
  const featuredBlog = sortedBlog[0];
  const sideBlog = sortedBlog.slice(1, 3);
  const introRaw = church.description || church.tagline || '';
  const intro = isHtmlContent(introRaw) ? stripHtml(introRaw) : introRaw;
  const featuredAlbums = galleryAlbums.filter((a) => a.is_featured).slice(0, 6);
  const displayAlbums = (featuredAlbums.length > 0 ? featuredAlbums : galleryAlbums).slice(0, 6);

  return (
    <div className="bg-white pb-16">
      {/* Welcome */}
      <ScrollReveal variant={MODERN}>
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              {(church.banner || church.logo) ? (
                <img src={church.banner || church.logo} alt={church.name} className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-gray-100 text-6xl">⛪</div>
              )}
            </div>
            <div>
              <ModernSectionLabel theme={theme}>Welcome</ModernSectionLabel>
              <h2 className="mt-2 font-display text-3xl font-bold text-gray-900 lg:text-4xl">
                Welcome to {church.name}
              </h2>
              {intro && <p className="mt-4 text-base leading-relaxed text-gray-600">{intro}</p>}
              {isSectionEnabled(church.sections, 'about') && (
                <Link
                  to={`/church/${slug}/about`}
                  className="mt-6 inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  style={{ backgroundColor: theme }}
                >
                  Learn More About Us
                </Link>
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Visit / ministries dark band */}
      <section className="bg-gray-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <ScrollReveal variant={MODERN} delay={80}>
              <div className="overflow-hidden rounded-2xl">
                {pastors[0]?.photo ? (
                  <img src={pastors[0].photo} alt="" className="aspect-[4/5] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center bg-gray-800 text-5xl">🙏</div>
                )}
              </div>
            </ScrollReveal>
            <ScrollReveal variant={MODERN} delay={120}>
              <div>
                <ModernSectionLabel theme={theme}>Plan Your Visit</ModernSectionLabel>
                <h2 className="mt-2 font-display text-3xl font-bold">We&apos;d love to meet you</h2>
                <p className="mt-4 text-gray-300">
                  Join us for worship, connect with our community, and discover how you can be part of what God is doing here.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { key: 'events', label: 'Events', desc: 'See what is coming up', path: 'events' },
                    { key: 'blog', label: 'Blog', desc: 'Devotionals & articles', path: 'blog' },
                    { key: 'about', label: 'About Us', desc: 'Our story and mission', path: 'about' },
                    { key: 'contact', label: 'Contact', desc: 'Get in touch with us', path: 'contact' },
                    { key: null, label: 'Give', desc: 'Support our ministry', path: null, href: church.donation_url },
                  ]
                    .filter((item) => item.href || isSectionEnabled(church.sections, item.key))
                    .slice(0, 4)
                    .map((item, index) => {
                      const card = item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                        >
                          <p className="font-semibold">{item.label}</p>
                          <p className="mt-1 text-sm text-gray-400">{item.desc}</p>
                        </a>
                      ) : (
                        <Link
                          to={`/church/${slug}/${item.path}`}
                          className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                        >
                          <p className="font-semibold">{item.label}</p>
                          <p className="mt-1 text-sm text-gray-400">{item.desc}</p>
                        </Link>
                      );
                      return (
                        <ScrollReveal key={item.label} variant={MODERN} delay={modernStaggerDelay(160, index)}>
                          {card}
                        </ScrollReveal>
                      );
                    })}
                </div>
                {isSectionEnabled(church.sections, 'contact') && (
                  <Link
                    to={`/church/${slug}/contact`}
                    className="mt-8 inline-flex rounded-lg px-6 py-3 text-sm font-semibold text-white"
                    style={{ backgroundColor: theme }}
                  >
                    Plan Your Visit
                  </Link>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Announcements grid */}
      {isSectionEnabled(church.sections, 'announcements') && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <ScrollReveal variant={MODERN} delay={120}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <ModernSectionLabel theme={theme}>Our News</ModernSectionLabel>
                <h2 className="mt-1 font-display text-3xl font-bold text-gray-900">Latest Announcements</h2>
              </div>
            </div>
          </ScrollReveal>
          {announcements.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {announcements.slice(0, 3).map((item, index) => (
                <ScrollReveal key={item.id} variant={MODERN} delay={modernStaggerDelay(180, index)} className="h-full">
                  <ModernAnnouncementTile item={item} theme={theme} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal variant={MODERN} delay={180}>
              <ChurchEmptyState icon="📣" title="No announcements yet" message="News and updates will appear here." themeColor={church.theme_color} />
            </ScrollReveal>
          )}
        </section>
      )}

      {/* Events */}
      {isSectionEnabled(church.sections, 'events') && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal variant={MODERN} delay={160}>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <ModernSectionLabel theme={theme}>Calendar</ModernSectionLabel>
                  <h2 className="mt-1 font-display text-3xl font-bold text-gray-900">Upcoming Events</h2>
                </div>
                <Link to={`/church/${slug}/events`} className="text-sm font-semibold" style={{ color: theme }}>
                  View all →
                </Link>
              </div>
            </ScrollReveal>
            {events.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.slice(0, 3).map((event, index) => (
                  <ScrollReveal key={event.id} variant={MODERN} delay={modernStaggerDelay(220, index)}>
                    <ModernEventRow event={event} theme={theme} />
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <ScrollReveal variant={MODERN} delay={220}>
                <ChurchEmptyState icon="📅" title="Events coming soon" message="Upcoming gatherings will be listed here." themeColor={church.theme_color} />
              </ScrollReveal>
            )}
          </div>
        </section>
      )}

      {/* Blog */}
      {isSectionEnabled(church.sections, 'blog') && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <ScrollReveal variant={MODERN} delay={180}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <ModernSectionLabel theme={theme}>Church Blog</ModernSectionLabel>
                <h2 className="mt-1 font-display text-3xl font-bold text-gray-900">News & Devotionals</h2>
                <p className="mt-2 text-gray-600">Encouraging articles from our pastoral team</p>
              </div>
              <Link to={`/church/${slug}/blog`} className="text-sm font-semibold" style={{ color: theme }}>
                View all posts →
              </Link>
            </div>
          </ScrollReveal>
          {sortedBlog.length > 0 ? (
            <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
              <ScrollReveal variant={MODERN} delay={220} className={sideBlog.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
                {featuredBlog && (
                  <ModernBlogFeatured post={featuredBlog} theme={theme} onOpen={setActiveBlogPost} />
                )}
              </ScrollReveal>
              {sideBlog.length > 0 && (
                <div className="flex flex-col gap-4 lg:col-span-1">
                  {sideBlog.map((post, index) => (
                    <ScrollReveal key={post.id} variant={MODERN} delay={modernStaggerDelay(260, index)}>
                      <ModernBlogSide post={post} theme={theme} onOpen={setActiveBlogPost} />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ScrollReveal variant={MODERN} delay={220}>
              <ChurchEmptyState
                icon="📝"
                title="Articles coming soon"
                message="Devotionals and stories will be shared here."
                linkTo={`/church/${slug}/blog`}
                linkLabel="Visit blog"
                themeColor={church.theme_color}
              />
            </ScrollReveal>
          )}
        </section>
      )}

      {/* Media */}
      {isSectionEnabled(church.sections, 'media') && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <ScrollReveal variant={MODERN} delay={200}>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <ModernSectionLabel theme={theme}>Messages</ModernSectionLabel>
                <h2 className="mt-1 font-display text-3xl font-bold text-gray-900">Latest Sermons</h2>
              </div>
              <Link to={`/church/${slug}/media`} className="text-sm font-semibold" style={{ color: theme }}>
                Browse all →
              </Link>
            </div>
          </ScrollReveal>
          {media.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {media.slice(0, 3).map((item, index) => (
                <ScrollReveal key={item.id} variant={MODERN} delay={modernStaggerDelay(260, index)} className="h-full">
                  <ChurchMediaCard item={item} themeColor={church.theme_color} slug={slug} compact />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <ScrollReveal variant={MODERN} delay={260}>
              <ChurchEmptyState icon="🎬" title="Media coming soon" message="Sermons and messages will appear here." themeColor={church.theme_color} />
            </ScrollReveal>
          )}
        </section>
      )}

      {/* Gallery grid */}
      {isSectionEnabled(church.sections, 'gallery') && displayAlbums.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal variant={MODERN} delay={240}>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <ModernSectionLabel theme={theme}>Community</ModernSectionLabel>
                  <h2 className="mt-1 font-display text-3xl font-bold text-gray-900">Our Ministries</h2>
                </div>
                <Link to={`/church/${slug}/gallery`} className="text-sm font-semibold" style={{ color: theme }}>
                  View gallery →
                </Link>
              </div>
            </ScrollReveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayAlbums.map((album, index) => (
                <ScrollReveal key={album.id} variant={MODERN} delay={modernStaggerDelay(300, index)}>
                  <Link
                    to={`/church/${slug}/gallery/${album.slug}`}
                    className="group relative block aspect-square overflow-hidden rounded-xl"
                  >
                    <img
                      src={album.cover_image_url || '/images/gallery-placeholder.jpg'}
                      alt={album.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <p className="absolute bottom-4 left-4 right-4 font-display text-lg font-bold text-white">{album.title}</p>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {pastors.length > 0 && (
        <ScrollReveal variant={MODERN} delay={280}>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <PastorsPreviewSection pastors={pastors.slice(0, 4)} themeColor={church.theme_color} title="Our Leadership" slug={slug} />
          </div>
        </ScrollReveal>
      )}

      {/* CTA banner */}
      <ScrollReveal variant={MODERN} delay={320}>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl px-8 py-12 text-center text-white"
            style={{ background: `linear-gradient(135deg, ${theme}, ${theme}cc)` }}
          >
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Join Us This Sunday</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/85">
              Experience worship, community, and the love of Christ. Everyone is welcome.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {isSectionEnabled(church.sections, 'contact') && (
                <Link to={`/church/${slug}/contact`} className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100">
                  Plan Your Visit
                </Link>
              )}
              {isSectionEnabled(church.sections, 'events') && (
                <Link to={`/church/${slug}/events`} className="rounded-lg border-2 border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  View Events
                </Link>
              )}
              {isSectionEnabled(church.sections, 'blog') && (
                <Link to={`/church/${slug}/blog`} className="rounded-lg border-2 border-white/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Read Blog
                </Link>
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal variant={MODERN} delay={360}>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SubscribeSection church={church} themeColor={theme} />
        </section>
      </ScrollReveal>

      <BlogArticleModal
        post={activeBlogPost}
        themeColor={church.theme_color}
        churchName={church.name}
        onClose={() => setActiveBlogPost(null)}
      />
    </div>
  );
}
