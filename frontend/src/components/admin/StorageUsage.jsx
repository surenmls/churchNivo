import { useEffect, useState } from 'react';
import { api } from '../../api/client';

function formatBytes(bytes) {
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

export default function StorageUsage({ churchId, compact = false }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!churchId) return;
    api
      .get(`/storage/church/${churchId}`)
      .then(setUsage)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [churchId]);

  if (loading || !usage) return null;

  const photoBar = usage.photos.percent;
  const storageBar = usage.storage.percent;
  const photoColor = photoBar >= 90 ? 'bg-red-500' : photoBar >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
  const storageColor = storageBar >= 90 ? 'bg-red-500' : storageBar >= 70 ? 'bg-amber-500' : 'bg-emerald-500';

  if (compact) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-gray-700">
            {usage.plan_label} plan · {usage.photos.used}/{usage.photos.max} photos · {usage.storage.used_label}/{usage.storage.max_label}
          </span>
          {!usage.can_upload && (
            <span className="text-xs font-semibold text-red-600">Limit reached</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Storage Usage</h2>
          <p className="mt-1 text-sm text-gray-500">
            Current plan: <span className="font-medium capitalize">{usage.plan_label}</span>
          </p>
        </div>
        {usage.upgrade_available && (
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Upgrade available
          </span>
        )}
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-gray-700">Photos</span>
            <span className="text-gray-500">
              {usage.photos.used} / {usage.photos.max} ({usage.photos.remaining} remaining)
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
            <div className={`h-full rounded-full transition-all ${photoColor}`} style={{ width: `${photoBar}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium text-gray-700">Storage</span>
            <span className="text-gray-500">
              {usage.storage.used_label} / {usage.storage.max_label}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
            <div className={`h-full rounded-full transition-all ${storageColor}`} style={{ width: `${storageBar}%` }} />
          </div>
        </div>
      </div>

      {!usage.can_upload && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You&apos;ve reached your {usage.plan_label} plan limit. Contact your platform admin to upgrade to Starter or Pro for more photos and storage.
        </div>
      )}

      {usage.upgrade_available && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Available plans</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {usage.available_plans.map((plan) => (
              <div
                key={plan.tier}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  plan.tier === usage.plan_tier ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="font-semibold text-gray-900">{plan.label}</p>
                <p className="text-xs text-gray-500">{plan.max_photos} photos · {plan.max_storage_label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { formatBytes };
