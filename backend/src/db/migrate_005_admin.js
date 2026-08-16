/**
 * Migration 005 — admin users.
 * Adds users.is_admin and, when ADMIN_EMAIL + ADMIN_PASSWORD env vars are
 * set, seeds (or promotes) that account as admin. Skips silently otherwise.
 * Run: npm run db:migrate:005
 */
import pool from './pool.js';
import { ensureAdmin } from './admin_seed.js';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE
    `);

    const seeded = await ensureAdmin(client);
    if (!seeded) {
      console.log('ℹ️  ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed');
    }

    await client.query('COMMIT');
    console.log('✅ Migration 005 applied — users.is_admin');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

migrate().catch((err) => {
  console.error('Migration 005 failed:', err);
  process.exit(1);
});
