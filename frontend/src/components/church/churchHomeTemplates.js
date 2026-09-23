export const HOME_TEMPLATES = {
  classic: {
    id: 'classic',
    label: 'Classic',
    description: 'Carousel hero, info cards, stacked sections — current layout',
  },
  modern: {
    id: 'modern',
    label: 'Modern',
    description: 'Full-width hero, grid sections, Immanuel-style clean layout',
  },
};

export function getHomeTemplate(id) {
  return HOME_TEMPLATES[id] || HOME_TEMPLATES.classic;
}

export function isModernHomeTemplate(church) {
  return church?.home_template === 'modern';
}
