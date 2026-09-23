import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(__dirname, '../src/db/seed-blog-sample.sql'), 'utf8');

await pool.query(sql);

const result = await pool.query(
  `SELECT c.slug, COUNT(bp.id)::int AS posts
   FROM churches c
   LEFT JOIN blog_posts bp ON bp.church_id = c.id
   GROUP BY c.slug
   ORDER BY c.slug`
);

console.log('Blog posts per church:');
console.table(result.rows);

await pool.end();
