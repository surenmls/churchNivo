export default function PromotionCard({ promotion }) {
  return (
    <a
      href={promotion.link || '#'}
      className="card group overflow-hidden p-0"
      onClick={(e) => {
        if (promotion.link?.startsWith('/')) {
          e.preventDefault();
          window.location.href = promotion.link;
        }
      }}
    >
      <div className="relative h-52 overflow-hidden">
        {promotion.image ? (
          <img
            src={promotion.image}
            alt={promotion.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
            <span className="text-5xl">📢</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-lg font-bold text-white">{promotion.title}</h3>
          {promotion.church_name && (
            <p className="mt-1 text-sm text-gray-300">{promotion.church_name}</p>
          )}
        </div>
      </div>
    </a>
  );
}
