import { useEffect } from 'react';
import { CHURCH_FONT_LIST, getGoogleFontsUrl, getChurchFontPreset } from './churchFonts';

export default function ChurchFontPicker({ value, onChange }) {
  const selected = getChurchFontPreset(value);

  useEffect(() => {
    CHURCH_FONT_LIST.forEach((preset) => {
      const linkId = `preview-font-${preset.id}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = getGoogleFontsUrl(preset);
        document.head.appendChild(link);
      }
    });
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Choose a font style for your public church page headings and body text.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {CHURCH_FONT_LIST.map((preset) => {
          const active = preset.id === selected.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                active ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <p
                className="text-lg font-bold text-gray-900"
                style={{ fontFamily: `'${preset.display}', '${preset.sans}', sans-serif` }}
              >
                {preset.label}
              </p>
              <p
                className="mt-1 text-sm text-gray-600"
                style={{ fontFamily: `'${preset.sans}', sans-serif` }}
              >
                {preset.description}
              </p>
              <p
                className="mt-3 text-xs text-gray-400"
                style={{ fontFamily: `'${preset.display}', '${preset.sans}', sans-serif` }}
              >
                The Lord is my shepherd
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
