import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import PageMeta from '../../components/PageMeta';

export default function ChurchesMapPage() {
  const [churches, setChurches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/churches')
      .then((data) => {
        const withAddress = data.filter((c) => c.address);
        setChurches(withAddress);
        setSelected(withAddress[0] || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const mapQuery = selected?.address || 'United States';

  return (
    <div className="py-16">
      <PageMeta title="Church Map" description="Find churches near you on an interactive map" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="section-title">Church Map</h1>
            <p className="mt-4 text-lg text-gray-600">Explore congregations by location</p>
          </div>
          <Link to="/churches" className="btn-secondary">
            ← List View
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          </div>
        ) : churches.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-lg">
            <span className="text-4xl">📍</span>
            <p className="mt-4 text-gray-500">No churches with addresses found.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="max-h-[600px] space-y-2 overflow-y-auto lg:col-span-2">
              {churches.map((church) => (
                <button
                  key={church.id}
                  type="button"
                  onClick={() => setSelected(church)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selected?.id === church.id
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{church.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{church.address}</p>
                  {(church.city || church.denomination) && (
                    <p className="mt-1 text-xs text-gray-400">
                      {[church.city, church.denomination].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg lg:col-span-3">
              <iframe
                title="Church location map"
                className="h-[400px] w-full lg:h-[600px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`}
              />
              {selected && (
                <div className="flex items-center justify-between border-t border-gray-100 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">{selected.name}</p>
                    <p className="text-sm text-gray-500">{selected.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(selected.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm"
                    >
                      Directions
                    </a>
                    <Link to={`/church/${selected.slug}`} className="btn-primary text-sm">
                      Visit Page
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
