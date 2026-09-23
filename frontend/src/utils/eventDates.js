export { toDatetimeLocal, fromDatetimeLocal } from './announcementDates';

/** When the event actually takes place */
export function getEventOccurrence(item) {
  return item?.event_at || item?.date || null;
}

export function getEventStatus(item) {
  const now = Date.now();
  const active = item.is_active ?? true;

  if (!active) return { label: 'Hidden', className: 'bg-gray-200 text-gray-600' };
  if (!item.is_approved) return { label: 'Unpublished', className: 'bg-amber-100 text-amber-800' };

  const starts = item.starts_at ? new Date(item.starts_at).getTime() : now;
  const ends = item.ends_at ? new Date(item.ends_at).getTime() : null;

  if (starts > now) return { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' };
  if (ends !== null && ends <= now) return { label: 'Ended', className: 'bg-gray-100 text-gray-600' };
  return { label: 'Live', className: 'bg-green-100 text-green-800' };
}

/** Site visibility window */
export function formatEventWindow(item) {
  const start = item.starts_at ? new Date(item.starts_at).toLocaleString() : 'Now';
  const end = item.ends_at ? new Date(item.ends_at).toLocaleString() : 'No end date';
  return `Visible: ${start} → ${end}`;
}

export function formatEventOccurrence(item) {
  const at = getEventOccurrence(item);
  return at ? new Date(at).toLocaleString() : '—';
}

export function getEventOccurrenceDate(item) {
  const at = getEventOccurrence(item);
  return at ? new Date(at) : null;
}

export function getPlatformListingStatus(item) {
  if (item.platform_approved) {
    return { label: 'On main site', className: 'bg-indigo-100 text-indigo-800' };
  }
  if (item.platform_requested) {
    return { label: 'Platform request pending', className: 'bg-amber-100 text-amber-800' };
  }
  return null;
}
