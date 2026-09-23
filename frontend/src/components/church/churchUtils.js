export function isSectionEnabled(sections, key) {
  const section = sections?.find((s) => s.section_key === key);
  return section ? section.enabled : true;
}

export function parseServiceTimes(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getChurchTheme(color) {
  return color && /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#4f46e5';
}

export function formatEventDate(dateStr) {
  const date = new Date(dateStr);
  return {
    month: date.toLocaleString('en', { month: 'short' }),
    day: date.getDate(),
    weekday: date.toLocaleString('en', { weekday: 'long' }),
    time: date.toLocaleString('en', { hour: 'numeric', minute: '2-digit' }),
    full: date.toLocaleString('en', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
  };
}
