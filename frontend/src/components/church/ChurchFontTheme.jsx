import { useEffect } from 'react';
import { getChurchFontPreset, getGoogleFontsUrl } from './churchFonts';

export default function ChurchFontTheme({ fontFamily, children }) {
  const preset = getChurchFontPreset(fontFamily);

  useEffect(() => {
    const linkId = `church-fonts-${preset.id}`;
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = getGoogleFontsUrl(preset);
  }, [preset]);

  return (
    <div
      className="church-font-theme min-h-screen"
      style={{
        fontFamily: `'${preset.sans}', system-ui, sans-serif`,
        '--church-font-display': `'${preset.display}', '${preset.sans}', sans-serif`,
      }}
    >
      <style>{`
        .church-font-theme .font-display,
        .church-font-theme h1,
        .church-font-theme h2,
        .church-font-theme h3 {
          font-family: var(--church-font-display);
        }
      `}</style>
      {children}
    </div>
  );
}
