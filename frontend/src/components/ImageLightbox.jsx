import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

/**
 * Full-screen image viewer with zoom and optional gallery navigation.
 * images: [{ src, alt?, caption? }]
 */
export default function ImageLightbox({
  images = [],
  index = 0,
  onClose,
  onIndexChange,
}) {
  const [zoom, setZoom] = useState(1);
  const current = images[index];

  const clampZoom = useCallback(
    (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value)),
    []
  );

  useEffect(() => {
    setZoom(1);
  }, [index]);

  useEffect(() => {
    if (!current) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index > 0) onIndexChange?.(index - 1);
      if (e.key === 'ArrowRight' && index < images.length - 1) onIndexChange?.(index + 1);
      if (e.key === '+' || e.key === '=') setZoom((z) => clampZoom(z + ZOOM_STEP));
      if (e.key === '-') setZoom((z) => clampZoom(z - ZOOM_STEP));
      if (e.key === '0') setZoom(1);
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [current, index, images.length, onClose, onIndexChange, clampZoom]);

  if (!current) return null;

  const hasNav = images.length > 1 && onIndexChange;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/92 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={current.alt || 'Image viewer'}
      onClick={onClose}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1 truncate text-sm text-white/80">
          {hasNav && (
            <span>
              {index + 1} / {images.length}
              {current.caption ? ` · ${current.caption}` : ''}
            </span>
          )}
          {!hasNav && current.caption && <span>{current.caption}</span>}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition hover:bg-white/20"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="hidden min-w-[3.5rem] rounded-lg bg-white/10 px-2 py-1.5 text-xs font-semibold transition hover:bg-white/20 sm:inline-block"
            aria-label="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-lg transition hover:bg-white/20"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xl leading-none transition hover:bg-white/20"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
        {hasNav && index > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(index - 1);
            }}
            className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-2xl text-white transition hover:bg-black/70 sm:left-4"
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        <img
          src={current.src}
          alt={current.alt || ''}
          draggable={false}
          style={{ transform: `scale(${zoom})` }}
          className="max-h-[calc(100vh-8rem)] max-w-full origin-center object-contain transition-transform duration-200 ease-out"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setZoom((z) => (z === 1 ? 2 : 1));
          }}
        />

        {hasNav && index < images.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(index + 1);
            }}
            className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-2xl text-white transition hover:bg-black/70 sm:right-4"
            aria-label="Next image"
          >
            ›
          </button>
        )}
      </div>

      {current.caption && hasNav && (
        <p className="shrink-0 px-4 pb-4 text-center text-sm text-white/75">{current.caption}</p>
      )}

      <p className="shrink-0 pb-3 text-center text-xs text-white/40 sm:hidden">
        Double-tap to zoom · Pinch supported in browser
      </p>
    </div>,
    document.body
  );
}

/** Hook for multi-image lightbox (gallery albums). */
export function useImageLightbox(images = []) {
  const [index, setIndex] = useState(null);

  const open = useCallback((startIndex = 0) => setIndex(startIndex), []);
  const close = useCallback(() => setIndex(null), []);

  const lightbox =
    index !== null ? (
      <ImageLightbox
        images={images}
        index={index}
        onClose={close}
        onIndexChange={setIndex}
      />
    ) : null;

  return { open, close, lightbox, isOpen: index !== null };
}
