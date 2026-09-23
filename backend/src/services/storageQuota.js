import { query } from '../config/db.js';
import { getPlanLimits, formatBytes, PLAN_TIERS } from './plans.js';

export class QuotaExceededError extends Error {
  constructor(message, code) {
    super(message);
    this.status = 403;
    this.code = code;
  }
}

export async function getChurchStorage(churchId) {
  const result = await query(
    `SELECT id, plan_tier, max_photos, max_storage_bytes, storage_used_bytes, photo_count
     FROM churches WHERE id = $1`,
    [churchId]
  );
  if (result.rows.length === 0) return null;

  const church = result.rows[0];
  const photosUsed = church.photo_count || 0;
  const storageUsed = Number(church.storage_used_bytes) || 0;
  const maxPhotos = church.max_photos || getPlanLimits(church.plan_tier).max_photos;
  const maxStorage = Number(church.max_storage_bytes) || getPlanLimits(church.plan_tier).max_storage_bytes;

  return {
    church_id: church.id,
    plan_tier: church.plan_tier || 'free',
    plan_label: getPlanLimits(church.plan_tier).label,
    photos: {
      used: photosUsed,
      max: maxPhotos,
      remaining: Math.max(0, maxPhotos - photosUsed),
      percent: maxPhotos > 0 ? Math.min(100, Math.round((photosUsed / maxPhotos) * 100)) : 0,
    },
    storage: {
      used_bytes: storageUsed,
      max_bytes: maxStorage,
      remaining_bytes: Math.max(0, maxStorage - storageUsed),
      used_label: formatBytes(storageUsed),
      max_label: formatBytes(maxStorage),
      percent: maxStorage > 0 ? Math.min(100, Math.round((storageUsed / maxStorage) * 100)) : 0,
    },
    at_photo_limit: photosUsed >= maxPhotos,
    at_storage_limit: storageUsed >= maxStorage,
    can_upload: photosUsed < maxPhotos && storageUsed < maxStorage,
    upgrade_available: church.plan_tier !== 'pro',
    available_plans: Object.entries(PLAN_TIERS).map(([key, plan]) => ({
      tier: key,
      label: plan.label,
      max_photos: plan.max_photos,
      max_storage_label: formatBytes(plan.max_storage_bytes),
    })),
  };
}

export async function checkUploadAllowed(churchId, fileSizeBytes = 0) {
  const usage = await getChurchStorage(churchId);
  if (!usage) throw new QuotaExceededError('Church not found', 'CHURCH_NOT_FOUND');

  if (usage.at_photo_limit) {
    throw new QuotaExceededError(
      `Photo limit reached (${usage.photos.used}/${usage.photos.max}). Upgrade your plan for more storage.`,
      'PHOTO_LIMIT'
    );
  }

  const projected = usage.storage.used_bytes + (fileSizeBytes || 0);
  if (projected > usage.storage.max_bytes) {
    throw new QuotaExceededError(
      `Storage limit reached (${usage.storage.used_label}/${usage.storage.max_label}). Upgrade your plan for more space.`,
      'STORAGE_LIMIT'
    );
  }

  return usage;
}

export async function incrementUsage(churchId, fileSizeBytes = 0) {
  await query(
    `UPDATE churches SET
      photo_count = photo_count + 1,
      storage_used_bytes = storage_used_bytes + $1,
      updated_at = NOW()
     WHERE id = $2`,
    [fileSizeBytes || 0, churchId]
  );
}

export async function decrementUsage(churchId, fileSizeBytes = 0) {
  await query(
    `UPDATE churches SET
      photo_count = GREATEST(0, photo_count - 1),
      storage_used_bytes = GREATEST(0, storage_used_bytes - $1),
      updated_at = NOW()
     WHERE id = $2`,
    [fileSizeBytes || 0, churchId]
  );
}

export async function reconcileUsage(churchId) {
  await query(
    `UPDATE churches SET
      photo_count = (SELECT COUNT(*)::int FROM gallery_images WHERE church_id = $1),
      storage_used_bytes = (SELECT COALESCE(SUM(file_size_bytes), 0)::bigint FROM gallery_images WHERE church_id = $1),
      updated_at = NOW()
     WHERE id = $1`,
    [churchId]
  );
}

export async function applyPlanTier(churchId, tier, customLimits = {}) {
  const limits = getPlanLimits(tier);
  const maxPhotos = customLimits.max_photos ?? limits.max_photos;
  const maxStorage = customLimits.max_storage_bytes ?? limits.max_storage_bytes;

  await query(
    `UPDATE churches SET
      plan_tier = $1,
      max_photos = $2,
      max_storage_bytes = $3,
      updated_at = NOW()
     WHERE id = $4`,
    [tier, maxPhotos, maxStorage, churchId]
  );

  return getChurchStorage(churchId);
}
