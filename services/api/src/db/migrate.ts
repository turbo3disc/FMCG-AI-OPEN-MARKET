// Migration runner: applies infra/db/migrations/*.sql in filename order.
// Usage (compiled): node dist/db/migrate.js — tracks applied files in schema_migrations.
import 'dotenv/config';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const here = dirname(fileURLToPath(import.meta.url));
// src/db → repo root = 4 levels up, then infra/db/migrations
const dir = join(here, '..', '..', '..', '..', 'infra', 'db', 'migrations');

await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
const done = new Set(
  (await pool.query(`SELECT filename FROM schema_migrations`)).rows.map((r: { filename: string }) => r.filename),
);
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
let applied = 0;
for (const f of files) {
  if (done.has(f)) continue;
  const sql = readFileSync(join(dir, f), 'utf8');
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [f]);
    await pool.query('COMMIT');
    applied++;
    console.log(`applied ${f}`);
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }
}
console.log(applied ? `done, ${applied} migration(s) applied` : 'done, nothing new');
await pool.end();
