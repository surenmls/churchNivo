import { env } from '../config/env.js';

export const MEDIA_PATH_PREFIX = '/media/';

function encodeObjectPath(objectPath) {
  return objectPath.split('/').map(encodeURIComponent).join('/');
}

export function isStorageConfigured() {
  return Boolean(env.supabase.url && env.supabase.serviceRoleKey && env.supabase.bucket);
}

export function publicObjectUrl(objectPath) {
  return `${env.supabase.url}/storage/v1/object/public/${env.supabase.bucket}/${encodeObjectPath(objectPath)}`;
}

export async function uploadObject(objectPath, buffer, contentType) {
  if (!isStorageConfigured()) {
    throw new Error('File storage is not configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET.');
  }

  const response = await fetch(
    `${env.supabase.url}/storage/v1/object/${env.supabase.bucket}/${encodeObjectPath(objectPath)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
        apikey: env.supabase.serviceRoleKey,
        'Content-Type': contentType,
        'Cache-Control': 'max-age=31536000',
        'x-upsert': 'false',
      },
      body: buffer,
    }
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Storage upload failed (${response.status}): ${body}`);
  }

  return `${MEDIA_PATH_PREFIX}${objectPath}`;
}

export async function copyObject(sourcePath, destinationPath) {
  const response = await fetch(`${env.supabase.url}/storage/v1/object/copy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
      apikey: env.supabase.serviceRoleKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bucketId: env.supabase.bucket, sourceKey: sourcePath, destinationKey: destinationPath }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Storage copy failed (${response.status}): ${body}`);
  }
}

export async function deleteObjects(objectPaths) {
  if (!objectPaths.length || !isStorageConfigured()) return;

  const response = await fetch(`${env.supabase.url}/storage/v1/object/${env.supabase.bucket}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
      apikey: env.supabase.serviceRoleKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefixes: objectPaths }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Storage delete failed (${response.status}): ${body}`);
  }
}
