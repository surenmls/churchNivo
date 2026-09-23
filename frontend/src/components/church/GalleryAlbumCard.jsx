import { Link } from 'react-router-dom';

export default function GalleryAlbumCard({ album, slug, themeColor, large }) {
  const cover = album.cover_image_url || '/images/gallery-placeholder.jpg';

  return (
    <Link
      to={`/church/${slug}/gallery/${album.slug}`}
      className={`group overflow-hidden rounded-2xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${large ? '' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={cover}
          alt={album.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          {album.year && (
            <span
              className="mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ backgroundColor: `${themeColor || '#4f46e5'}cc` }}
            >
              {album.year}
            </span>
          )}
          <h3 className="font-display text-lg font-bold">{album.title}</h3>
          <p className="mt-1 text-sm text-white/80">
            {album.photo_count || 0} photo{(album.photo_count || 0) !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}
