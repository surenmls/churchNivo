import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import PageMeta from '../../components/PageMeta';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    if (q.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    api
      .get(`/search?q=${encodeURIComponent(q)}`)
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) {
      setSearchParams({ q: trimmed });
    }
  };

  const hasResults =
    results &&
    (results.churches?.length > 0 ||
      results.events?.length > 0 ||
      results.media?.length > 0 ||
      results.announcements?.length > 0);

  return (
    <div className="py-16">
      <PageMeta title="Search" description="Search churches, events, media, and announcements on ChurchNivo" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="section-title">Search</h1>
          <p className="mt-4 text-lg text-gray-600">Find churches, events, media, and announcements</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10">
          <div className="flex gap-3">
            <input
              type="search"
              className="input-field flex-1"
              placeholder="Search by name, city, event, sermon..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </div>
        </form>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        )}

        {!loading && searchParams.get('q') && searchParams.get('q').length >= 2 && !hasResults && (
          <div className="mt-12 rounded-2xl bg-white py-16 text-center shadow-lg">
            <span className="text-4xl">🔍</span>
            <p className="mt-4 text-gray-500">No results found for &ldquo;{searchParams.get('q')}&rdquo;</p>
          </div>
        )}

        {!loading && hasResults && (
          <div className="mt-12 space-y-10">
            {results.churches?.length > 0 && (
              <ResultSection title="Churches" count={results.churches.length}>
                {results.churches.map((church) => (
                  <Link
                    key={church.id}
                    to={`/church/${church.slug}`}
                    className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    {church.logo ? (
                      <img src={church.logo} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-2xl">⛪</div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{church.name}</p>
                      <p className="text-sm text-gray-500">
                        {[church.city, church.denomination].filter(Boolean).join(' · ') || church.tagline}
                      </p>
                    </div>
                  </Link>
                ))}
              </ResultSection>
            )}

            {results.events?.length > 0 && (
              <ResultSection title="Events" count={results.events.length}>
                {results.events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/church/${event.church_slug}/events`}
                    className="block rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.church_name} · {new Date(event.event_at || event.date).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </ResultSection>
            )}

            {results.media?.length > 0 && (
              <ResultSection title="Media" count={results.media.length}>
                {results.media.map((item) => (
                  <Link
                    key={item.id}
                    to={`/church/${item.church_slug}/media`}
                    className="block rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.church_name}</p>
                  </Link>
                ))}
              </ResultSection>
            )}

            {results.announcements?.length > 0 && (
              <ResultSection title="Announcements" count={results.announcements.length}>
                {results.announcements.map((item) => (
                  <Link
                    key={item.id}
                    to={`/church/${item.church_slug}`}
                    className="block rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.church_name}</p>
                  </Link>
                ))}
              </ResultSection>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultSection({ title, count, children }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-xl font-bold text-gray-900">
        {title} <span className="text-base font-normal text-gray-400">({count})</span>
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
