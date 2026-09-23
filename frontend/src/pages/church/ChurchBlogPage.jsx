import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ChurchEmptyState from '../../components/church/ChurchEmptyState';
import BlogArticleModal from '../../components/church/BlogArticleModal';
import { isSectionEnabled, getChurchTheme } from '../../components/church/churchUtils';
import { BLOG_CATEGORIES, formatBlogDate, formatReadTime, getAuthorInitials } from '../../utils/blogUtils';

function CategoryPill({ label, active, theme, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-medium transition ${
        active
          ? 'text-white shadow-sm'
          : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
      }`}
      style={active ? { backgroundColor: theme } : undefined}
    >
      {label}
    </button>
  );
}

function MetaLine({ post }) {
  return (
    <p className="text-sm text-white/75">
      {post.author_name || 'Church Team'} · {formatBlogDate(post.published_at || post.created_at)} ·{' '}
      {formatReadTime(post.read_time_minutes)}
    </p>
  );
}

function SideMeta({ post }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
      <span className="inline-flex items-center gap-1">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {formatBlogDate(post.published_at || post.created_at)}
      </span>
      <span className="inline-flex items-center gap-1">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {formatReadTime(post.read_time_minutes)}
      </span>
    </div>
  );
}

function AuthorMeta({ post, theme }) {
  return (
    <div className="flex items-center gap-2">
      {post.author_avatar ? (
        <img src={post.author_avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: theme }}
        >
          {getAuthorInitials(post.author_name)}
        </div>
      )}
      <span className="text-sm text-gray-600">{post.author_name || 'Church Team'}</span>
    </div>
  );
}

function FeaturedArticle({ post, theme, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="group relative min-h-[320px] w-full overflow-hidden rounded-2xl text-left shadow-xl sm:min-h-[380px]"
    >
      {post.cover_image ? (
        <img
          src={post.cover_image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${theme}, ${theme}88)` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />
      <div className="relative flex h-full min-h-[320px] flex-col justify-end p-6 sm:min-h-[380px] sm:p-8">
        <span
          className="inline-block w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ backgroundColor: theme }}
        >
          Featured · {post.category}
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
            {post.excerpt}
          </p>
        )}
        <div className="mt-5">
          <MetaLine post={post} />
        </div>
      </div>
    </button>
  );
}

function SideArticle({ post, theme, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="group flex w-full gap-4 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-28">
        {post.cover_image ? (
          <img src={post.cover_image} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl text-white" style={{ backgroundColor: theme }}>
            ✍
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme }}>
          {post.category}
        </span>
        <h3 className="mt-1 line-clamp-2 font-display text-base font-bold leading-snug text-gray-900">
          {post.title}
        </h3>
        <SideMeta post={post} />
      </div>
    </button>
  );
}

function GridArticle({ post, theme, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(post)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center text-4xl text-white"
            style={{ background: `linear-gradient(135deg, ${theme}, ${theme}aa)` }}
          >
            ✍
          </div>
        )}
        <span
          className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase text-white"
          style={{ backgroundColor: theme }}
        >
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <SideMeta post={post} />
        <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold text-gray-900">{post.title}</h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{post.excerpt}</p>
        )}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <AuthorMeta post={post} theme={theme} />
        </div>
      </div>
    </button>
  );
}

function EmptySection({ message }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center text-gray-500 shadow-sm">
      {message}
    </div>
  );
}

function BlogPageHeader({ theme, churchName }) {
  return (
    <div className="mb-10">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme }}>
        <span aria-hidden>✎</span> Church Blog
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-gray-900 md:text-4xl">News & Devotionals</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        Encouraging articles, devotionals, and updates from {churchName || 'our pastoral team'}.
      </p>
    </div>
  );
}

export default function ChurchBlogPage() {
  const { church, blogPosts = [] } = useOutletContext();
  const [category, setCategory] = useState('All');
  const [activePost, setActivePost] = useState(null);
  const theme = getChurchTheme(church.theme_color);
  const enabled = isSectionEnabled(church.sections, 'blog');

  const sorted = useMemo(
    () =>
      [...blogPosts].sort(
        (a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
      ),
    [blogPosts]
  );

  const featured = sorted[0];
  const sidePosts = sorted.slice(1, 3);
  const belowHero = sorted.slice(3);
  const gridPosts =
    category === 'All' ? belowHero : belowHero.filter((p) => p.category === category);

  if (!enabled) {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ChurchEmptyState icon="📝" title="Blog unavailable" message="This section is not enabled." themeColor={church.theme_color} />
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BlogPageHeader theme={theme} churchName={church.name} />

        {sorted.length === 0 ? (
          <ChurchEmptyState
            icon="📝"
            title="No articles yet"
            message="Check back soon for devotionals and stories from our church."
            themeColor={church.theme_color}
          />
        ) : (
          <>
            <div className="mb-10 grid gap-5 lg:grid-cols-3 lg:gap-6">
              <div className={sidePosts.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}>
                {featured && <FeaturedArticle post={featured} theme={theme} onOpen={setActivePost} />}
              </div>
              {sidePosts.length > 0 && (
                <div className="flex flex-col gap-4 lg:col-span-1">
                  {sidePosts.map((post) => (
                    <SideArticle key={post.id} post={post} theme={theme} onOpen={setActivePost} />
                  ))}
                </div>
              )}
            </div>

            <div className="mb-8 flex flex-wrap gap-2">
              {BLOG_CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  active={category === cat}
                  theme={theme}
                  onClick={() => setCategory(cat)}
                />
              ))}
            </div>

            {gridPosts.length === 0 ? (
              <EmptySection message={`No articles in ${category === 'All' ? 'this section' : category} yet.`} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((post) => (
                  <GridArticle key={post.id} post={post} theme={theme} onOpen={setActivePost} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BlogArticleModal
        post={activePost}
        themeColor={church.theme_color}
        churchName={church.name}
        onClose={() => setActivePost(null)}
      />
    </div>
  );
}
