// Moves files from media/legacy/ into media/church-<id>/ based on which church's
// rows reference them, and rewrites the database links.
// Usage (from backend/):  node scripts/organize-media-by-church.mjs          (dry run)
//                         node scripts/organize-media-by-church.mjs --apply
import { pool } from '../src/config/db.js';
import { isStorageConfigured, copyObject, deleteObjects } from '../src/services/objectStorage.js';

const apply = process.argv.includes('--apply');
const SOURCE_FOLDER = 'legacy/';
const PATH_PATTERN = /\/media\/(legacy\/[A-Za-z0-9._-]+)/g;

async function main() {
  if (apply && !isStorageConfigured()) {
    throw new Error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET in backend/.env first.');
  }

  const { rows: columns } = await pool.query(`
    SELECT c.table_name, c.column_name, c.data_type,
      EXISTS (SELECT 1 FROM information_schema.columns o
              WHERE o.table_schema = 'public' AND o.table_name = c.table_name AND o.column_name = 'church_id') AS has_church_id
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.data_type IN ('text', 'character varying', 'json', 'jsonb')
  `);

  // path -> Set of church ids that reference it
  const owners = new Map();
  for (const { table_name: table, column_name: column, has_church_id: hasChurchId } of columns) {
    const ownerExpr = table === 'churches' ? 'id' : hasChurchId ? 'church_id' : 'NULL';
    const { rows } = await pool.query(
      `SELECT ${ownerExpr} AS church_id, "${column}"::text AS value FROM public."${table}" WHERE "${column}"::text LIKE '%/media/legacy/%'`
    );
    for (const { church_id: churchId, value } of rows) {
      for (const match of value.matchAll(PATH_PATTERN)) {
        if (!owners.has(match[1])) owners.set(match[1], new Set());
        owners.get(match[1]).add(churchId);
      }
    }
  }

  const moves = [];
  for (const [path, churchIds] of owners) {
    const ids = [...churchIds].filter((id) => id !== null);
    if (ids.length === 1 && churchIds.size === 1) {
      moves.push({ from: path, to: `church-${ids[0]}/${path.slice(SOURCE_FOLDER.length)}` });
    } else {
      console.log(`  skipped ${path}: referenced by ${ids.length ? `churches ${ids.join(', ')}` : 'no church'}`);
    }
  }

  console.log(`Files in legacy/ referenced by the database: ${owners.size}, can move: ${moves.length}`);
  const byChurch = moves.reduce((acc, m) => ({ ...acc, [m.to.split('/')[0]]: (acc[m.to.split('/')[0]] || 0) + 1 }), {});
  Object.entries(byChurch).forEach(([folder, count]) => console.log(`  ${folder}/: ${count} file(s)`));

  if (!apply) {
    console.log('\nDry run only. Re-run with --apply to move the files.');
    return;
  }

  for (const { from, to } of moves) {
    try {
      await copyObject(from, to);
    } catch (err) {
      if (!/409|already exists|Duplicate/i.test(err.message)) throw err;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const { table_name: table, column_name: column, data_type: type } of columns) {
        const cast = type === 'json' || type === 'jsonb' ? `::${type}` : '';
        await client.query(
          `UPDATE public."${table}" SET "${column}" = replace("${column}"::text, $1, $2)${cast}
           WHERE position($1 IN "${column}"::text) > 0`,
          [`/media/${from}`, `/media/${to}`]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    await deleteObjects([from]);
    console.log(`  moved ${from} -> ${to}`);
  }

  console.log('\nDone.');
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
