// Moves images referenced as .../uploads/<file> into Supabase Storage and rewrites
// the database values to /media/legacy/<file>.
// Usage (from backend/):  node scripts/migrate-uploads-to-storage.mjs          (dry run)
//                         node scripts/migrate-uploads-to-storage.mjs --apply  (upload + update DB)
import fs from 'fs';
import path from 'path';
import { pool } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { isStorageConfigured, uploadObject } from '../src/services/objectStorage.js';

const apply = process.argv.includes('--apply');
const FOLDER = 'legacy';
const FILE_PATTERN = /(?:https?:\/\/[^/"'\s]+)?\/uploads\/([A-Za-z0-9._-]+)/g;
const SQL_PATTERN = `(https?://[^/"'\\s]+)?/uploads/([A-Za-z0-9._-]+)`;
const CONTENT_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };

async function main() {
  if (apply && !isStorageConfigured()) {
    throw new Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET in backend/.env first.');
  }

  const { rows: columns } = await pool.query(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'json', 'jsonb')
  `);

  const referenced = new Set();
  const affected = [];

  for (const { table_name: table, column_name: column, data_type: type } of columns) {
    const { rows } = await pool.query(
      `SELECT "${column}"::text AS value FROM public."${table}" WHERE "${column}"::text ~ '/uploads/'`
    );
    if (!rows.length) continue;
    affected.push({ table, column, type, count: rows.length });
    for (const { value } of rows) {
      for (const match of value.matchAll(FILE_PATTERN)) referenced.add(match[1]);
    }
  }

  console.log('Columns with /uploads/ links:');
  affected.forEach((a) => console.log(`  ${a.table}.${a.column}: ${a.count} row(s)`));

  const missing = [...referenced].filter((f) => !fs.existsSync(path.join(env.uploadDir, f)));
  console.log(`\nReferenced files: ${referenced.size}, missing locally: ${missing.length}`);
  missing.forEach((f) => console.log(`  missing: ${f}`));

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to upload files and update the database.');
    return;
  }
  if (missing.length) {
    throw new Error('Some referenced files are missing from the uploads folder; nothing was changed.');
  }

  for (const file of referenced) {
    const contentType = CONTENT_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    try {
      await uploadObject(`${FOLDER}/${file}`, fs.readFileSync(path.join(env.uploadDir, file)), contentType);
      console.log(`  uploaded ${file}`);
    } catch (err) {
      if (!/409|already exists|Duplicate/i.test(err.message)) throw err;
      console.log(`  already in bucket: ${file}`);
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const { table, column, type } of affected) {
      const replaced = `regexp_replace("${column}"::text, $1, $2, 'g')`;
      const cast = type === 'json' || type === 'jsonb' ? `::${type}` : '';
      const result = await client.query(
        `UPDATE public."${table}" SET "${column}" = ${replaced}${cast} WHERE "${column}"::text ~ '/uploads/'`,
        [SQL_PATTERN, `/media/${FOLDER}/\\2`]
      );
      console.log(`  updated ${table}.${column}: ${result.rowCount} row(s)`);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  console.log('\nDone. Keep backend/uploads as a backup until you have checked the site.');
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
