import { useEffect } from 'react';

const DEFAULT_TITLE = 'ChurchNivo';
const DEFAULT_DESC = 'Find your church. Grow your faith. Discover churches, events, and sermons on ChurchNivo.';
const DEFAULT_OG_IMAGE = '/images/og-image.jpg';

export function usePageMeta({ title, description, image, noSuffix = false } = {}) {
  useEffect(() => {
    const fullTitle = title
      ? noSuffix
        ? title
        : `${title} | ${DEFAULT_TITLE}`
      : DEFAULT_TITLE;

    document.title = fullTitle;

    const setMeta = (name, content, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description || DEFAULT_DESC);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description || DEFAULT_DESC, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description || DEFAULT_DESC);

    const ogImage = image || DEFAULT_OG_IMAGE;
    setMeta('og:image', ogImage, true);
    setMeta('twitter:image', ogImage);

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, image, noSuffix]);
}

export default function PageMeta(props) {
  usePageMeta(props);
  return null;
}
