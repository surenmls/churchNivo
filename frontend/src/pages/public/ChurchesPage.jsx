import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import ChurchCard from '../../components/public/ChurchCard';
import PageMeta from '../../components/PageMeta';

export default function ChurchesPage() {
  const [churches, setChurches] = useState([]);
  const [filters, setFilters] = useState({ cities: [], denominations: [] });
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [denomination, setDenomination] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/churches/meta/filters').then(setFilters).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city) params.set('city', city);
    if (denomination) params.set('denomination', denomination);

    const qs = params.toString();
    api
      .get(`/churches${qs ? `?${qs}` : ''}`)
      .then(setChurches)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, city, denomination]);

  return (
    <div className="py-16">
      <PageMeta title="Churches" description="Browse and filter churches on ChurchNivo" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="section-title">All Churches</h1>
            <p className="mt-4 text-lg text-gray-600">Browse all active congregations on the platform</p>
          </div>
          <Link to="/churches/map" className="btn-secondary shrink-0">
            📍 Map View
          </Link>
        </div>

        <div className="mb-8 grid gap-4 rounded-2xl bg-white p-6 shadow-lg sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="search"
            className="input-field lg:col-span-2"
            placeholder="Search by name, tagline, or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="input-field" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All Cities</option>
            {filters.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select className="input-field" value={denomination} onChange={(e) => setDenomination(e.target.value)}>
            <option value="">All Denominations</option>
            {filters.denominations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : churches.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-lg">
            <span className="text-4xl">⛪</span>
            <p className="mt-4 text-gray-500">No churches match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {churches.map((church) => (
              <ChurchCard key={church.id} church={church} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
