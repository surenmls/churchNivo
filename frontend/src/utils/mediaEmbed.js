/**
 * Parse common video URLs for in-app embedding (YouTube, Vimeo).
 */

export function parseYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return id && id.length >= 6 ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null;
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || null;
      }
      const v = parsed.searchParams.get('v');
      return v && v.length >= 6 ? v : null;
    }
  } catch {
    // fall through — raw id
  }

  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

export function parseVimeoId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean).pop();
      return id && /^\d+$/.test(id) ? id : null;
    }
    if (host === 'player.vimeo.com') {
      const match = parsed.pathname.match(/\/video\/(\d+)/);
      return match?.[1] || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function getMediaEmbed(url) {
  const youtubeId = parseYouTubeId(url);
  if (youtubeId) {
    return {
      provider: 'youtube',
      id: youtubeId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    };
  }

  const vimeoId = parseVimeoId(url);
  if (vimeoId) {
    return {
      provider: 'vimeo',
      id: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0`,
      thumbnailUrl: null,
    };
  }

  return null;
}

export function isEmbeddableVideo(url, type) {
  if (type && type !== 'video') return false;
  return Boolean(getMediaEmbed(url));
}

export function normalizeMediaUrl(url) {
  if (!url) return url;
  let trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  const embed = getMediaEmbed(trimmed);
  if (embed?.provider === 'youtube') {
    return `https://www.youtube.com/watch?v=${embed.id}`;
  }
  if (embed?.provider === 'vimeo') {
    return `https://vimeo.com/${embed.id}`;
  }
  return trimmed;
}
