import { query } from '../config/db.js';
import { deleteObjects, isStorageConfigured } from './objectStorage.js';

const MEDIA_PATH_PATTERN = /\/media\/([A-Za-z0-9._/-]+)/g;

let referenceQueryPromise;

// One query that returns which of the given object paths still appear in any
// text/json column. Built once from the live schema so new image columns are covered.
function getReferenceQuery() {
  referenceQueryPromise ??= query(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'json', 'jsonb')
  `)
    .then(({ rows }) => {
      const checks = rows.map(({ table_name: t, column_name: c }) =>
        `EXISTS (SELECT 1 FROM public."${t}" WHERE position('/media/' || p IN "${c}"::text) > 0)`
      );
      return `SELECT p FROM unnest($1::text[]) AS p WHERE ${checks.join(' OR ')}`;
    })
    .catch((err) => {
      referenceQueryPromise = undefined;
      throw err;
    });
  return referenceQueryPromise;
}

export function extractMediaPaths(...values) {
  const paths = new Set();
  for (const match of JSON.stringify(values).matchAll(MEDIA_PATH_PATTERN)) {
    paths.add(match[1]);
  }
  return [...paths];
}

// Call after a row has been updated or deleted, passing its previous values.
// Deletes bucket files that are no longer referenced anywhere. Never throws.
export async function releaseUnusedMedia(...previousValues) {
  try {
    if (!isStorageConfigured()) return;
    const candidates = extractMediaPaths(...previousValues);
    if (!candidates.length) return;

    const sql = await getReferenceQuery();
    const { rows } = await query(sql, [candidates]);
    const stillUsed = new Set(rows.map((r) => r.p));
    const unused = candidates.filter((p) => !stillUsed.has(p));

    await deleteObjects(unused);
  } catch (err) {
    console.error('Media cleanup failed:', err.message);
  }
}
