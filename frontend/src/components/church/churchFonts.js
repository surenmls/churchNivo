export const CHURCH_FONT_PRESETS = {
  modern: {
    id: 'modern',
    label: 'Modern',
    description: 'Clean and contemporary',
    sans: 'Inter',
    display: 'Plus Jakarta Sans',
    googleFamilies: 'Inter:wght@400;500;600;700|Plus+Jakarta+Sans:wght@600;700;800',
  },
  classic: {
    id: 'classic',
    label: 'Classic',
    description: 'Elegant and timeless',
    sans: 'Lora',
    display: 'Playfair Display',
    googleFamilies: 'Lora:wght@400;500;600;700|Playfair+Display:wght@600;700;800',
  },
  warm: {
    id: 'warm',
    label: 'Warm',
    description: 'Friendly and approachable',
    sans: 'Nunito',
    display: 'Merriweather',
    googleFamilies: 'Nunito:wght@400;500;600;700|Merriweather:wght@400;700',
  },
  bold: {
    id: 'bold',
    label: 'Bold',
    description: 'Strong and impactful',
    sans: 'Montserrat',
    display: 'Oswald',
    googleFamilies: 'Montserrat:wght@400;500;600;700|Oswald:wght@500;600;700',
  },
  traditional: {
    id: 'traditional',
    label: 'Traditional',
    description: 'Classic church feel',
    sans: 'Crimson Text',
    display: 'Libre Baskerville',
    googleFamilies: 'Crimson+Text:wght@400;600;700|Libre+Baskerville:wght@400;700',
  },
};

export const CHURCH_FONT_LIST = Object.values(CHURCH_FONT_PRESETS);

export function getChurchFontPreset(fontFamily) {
  return CHURCH_FONT_PRESETS[fontFamily] || CHURCH_FONT_PRESETS.modern;
}

export function getGoogleFontsUrl(preset) {
  return `https://fonts.googleapis.com/css2?family=${preset.googleFamilies}&display=swap`;
}
