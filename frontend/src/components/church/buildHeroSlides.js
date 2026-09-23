/**
 * Build hero carousel slides from admin picks or recent church content.
 * Each slide: { image, caption?, link? }
 */
export function buildHeroSlides(church, events = [], galleryAlbums = []) {
  const manual = parseHeroSlides(church?.hero_slides);
  if (manual.length > 0) return manual.slice(0, 8);

  const slides = [];
  const seen = new Set();

  const add = (image, caption, link) => {
    if (!image || seen.has(image)) return;
    seen.add(image);
    slides.push({ image, caption: caption || '', link: link || '', focus: 'top' });
  };

  if (church?.banner) {
    add(church.banner, church.tagline || church.name);
  }

  [...events]
    .filter((e) => e.media_url)
    .sort((a, b) => new Date(b.event_at || b.date) - new Date(a.event_at || a.date))
    .slice(0, 5)
    .forEach((event) => add(event.media_url, event.title));

  [...galleryAlbums]
    .filter((a) => a.cover_image_url)
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return (b.year || 0) - (a.year || 0);
    })
    .slice(0, 5)
    .forEach((album) => add(album.cover_image_url, album.title));

  return slides.slice(0, 8);
}

export function parseHeroSlides(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((s) => s?.image)
      .map((s) => ({
        image: s.image,
        caption: s.caption || '',
        link: s.link || '',
        focus: s.focus || 'top',
      }));
  }
  if (typeof raw === 'string') {
    try {
      return parseHeroSlides(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return [];
}
