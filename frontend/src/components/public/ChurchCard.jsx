import { Link } from 'react-router-dom';

export default function ChurchCard({ church }) {
  return (
    <Link to={`/church/${church.slug}`} className="card group overflow-hidden p-0">
      <div className="relative h-48 overflow-hidden">
        {church.banner ? (
          <img
            src={church.banner}
            alt={church.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-primary-100 text-primary-400">
            <span className="text-4xl">⛪</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-xl font-bold text-white">{church.name}</h3>
        </div>
      </div>
      <div className="p-5">
        <p className="line-clamp-2 text-sm text-gray-600">{church.description || church.tagline}</p>
        {(church.city || church.denomination) && (
          <p className="mt-2 text-xs font-medium text-primary-600">
            {[church.city, church.denomination].filter(Boolean).join(' · ')}
          </p>
        )}
        {church.address && (
          <p className="mt-2 text-xs text-gray-400">{church.address}</p>
        )}
      </div>
    </Link>
  );
}
