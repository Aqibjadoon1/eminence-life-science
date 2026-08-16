/**
 * Migration 005 — admin users.
 * Adds users.is_admin and, when ADMIN_EMAIL + ADMIN_PASSWORD env vars are
 * set, seeds (or promotes) that account as admin. Skips silently otherwise.
 * Run: npm run db:migrate:005
 */
import pool from './pool.js';
import bcrypt from 'bcryptjs';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE
    `);

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const hash = await bcrypt.hash(adminPassword, 12);
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
      if (existing.rows.length) {
        await client.query('UPDATE users SET is_admin = TRUE WHERE email = $1', [adminEmail]);
      } else {
        await client.query(
          'INSERT INTO users(name, email, password_hash, is_admin) VALUES($1,$2,$3,TRUE)',
          ['Admin', adminEmail, hash]
        );
      }
      console.log(`✅ Admin account ensured for ${adminEmail}`);
    } else {
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