import { Link } from 'react-router-dom';

export default function HomeChurchCard({ church }) {
  return (
    <Link
      to={`/church/${church.slug}`}
      className="group relative overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative h-56 overflow-hidden">
        {church.banner ? (
          <img
            src={church.banner}
            alt={church.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-100 to-indigo-100">
            <span className="text-5xl">⛪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {church.logo && (
          <img
            src={church.logo}
            alt=""
            className="absolute left-4 top-4 h-12 w-12 rounded-xl border-2 border-white object-cover shadow-lg"
          />
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-xl font-bold text-white">{church.name}</h3>
          {church.tagline && (
            <p className="mt-1 text-sm text-white/80">{church.tagline}</p>
          )}
        </div>
      </div>
      <div className="p-5">
        <p className="line-clamp-2 text-sm leading-relaxed text-gray-600">{church.description}</p>
        {church.address && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <span>📍</span> {church.address}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary-600 transition group-hover:gap-2">
          Visit church →
        </span>
      </div>
    </Link>
  );
}
