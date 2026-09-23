import { useState } from 'react';
import ImageLightbox from './ImageLightbox';

/**
 * Click-to-zoom thumbnail. Opens a single-image lightbox.
 */
export default function LightboxImage({
  src,
  alt = '',
  caption,
  className = '',
  buttonClassName = '',
  hint = true,
  ...imgProps
}) {
  const [open, setOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group/lightbox relative block overflow-hidden p-0 text-left ${buttonClassName}`.trim()}
        aria-label={`View larger: ${alt || caption || 'image'}`}
      >
        <img src={src} alt={alt} className={className} {...imgProps} />
        {hint && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover/lightbox:bg-black/25">
            <span className="scale-90 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover/lightbox:scale-100 group-hover/lightbox:opacity-100">
              Zoom
            </span>
          </span>
        )}
      </button>

      {open && (
        <ImageLightbox
          images={[{ src, alt, caption }]}
          index={0}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
