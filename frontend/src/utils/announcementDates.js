export function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocal(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function getAnnouncementStatus(item) {
  const now = Date.now();
  const starts = item.starts_at ? new Date(item.starts_at).getTime() : now;
  const expires = item.expires_at ? new Date(item.expires_at).getTime() : null;

  if (!item.is_approved) return { label: 'Pending', className: 'bg-amber-100 text-amber-800' };
  if (starts > now) return { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' };
  if (expires !== null && expires <= now) return { label: 'Expired', className: 'bg-gray-100 text-gray-600' };
  return { label: 'Live', className: 'bg-green-100 text-green-800' };
}

export function formatAnnouncementWindow(item) {
  const start = item.starts_at ? new Date(item.starts_at).toLocaleString() : 'Now';
  const end = item.expires_at ? new Date(item.expires_at).toLocaleString() : 'No expiry';
  return `${start} → ${end}`;
}
