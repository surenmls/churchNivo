export const PLAN_TIERS = {
  free: {
    label: 'Free',
    max_photos: 50,
    max_storage_bytes: 100 * 1024 * 1024,
  },
  starter: {
    label: 'Starter',
    max_photos: 200,
    max_storage_bytes: 500 * 1024 * 1024,
  },
  pro: {
    label: 'Pro',
    max_photos: 1000,
    max_storage_bytes: 5 * 1024 * 1024 * 1024,
  },
};

export function getPlanLimits(tier) {
  return PLAN_TIERS[tier] || PLAN_TIERS.free;
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}
