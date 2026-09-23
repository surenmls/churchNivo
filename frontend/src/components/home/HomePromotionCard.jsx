import { Link } from 'react-router-dom';

export default function HomePromotionCard({ promotion, featured = false }) {
  const href = promotion.link?.startsWith('/') ? promotion.link : promotion.link || '#';
  const isInternal = promotion.link?.startsWith('/');

  const content = (
    <>
      <div className={`relative overflow-hidden ${featured ? 'h-80' : 'h-56'}`}>
        {promotion.image ? (
          <img
            src={promotion.image}
            alt={promotion.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-500 to-indigo-700">
            <span className="text-6xl">📢</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {promotion.church_name && (
          <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {promotion.church_name}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className={`font-display font-bold text-white ${featured ? 'text-2xl' : 'text-lg'}`}>
            {promotion.title}
          </h3>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/80 transition group-hover:gap-2 group-hover:text-white">
            Learn more →
          </span>
        </div>
      </div>
    </>
  );

  if (isInternal) {
    return (
      <Link to={href} className="group block overflow-hidden rounded-3xl shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-3xl shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
    >
      {content}
    </a>
  );
}
