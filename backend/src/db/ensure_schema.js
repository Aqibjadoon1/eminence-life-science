import pool from './pool.js';
import bcrypt from 'bcryptjs';

const guard =
  `SELECT pg_get_constraintdef(oid) AS def
   FROM pg_constraint
   WHERE conname = 'orders_payment_method_check'`;

async function ensureAdminColumn() {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = 'users' AND column_name = 'is_admin'`
  );
  if (rows.length) return false;

  await pool.query('BEGIN');
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE
  `);
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const hash = await bcrypt.hash(adminPassword, 12);
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    if (existing.rows.length) {
      await pool.query('UPDATE users SET is_admin = TRUE WHERE email = $1', [adminEmail]);
    } else {
      await pool.query(
        'INSERT INTO users(name, email, password_hash, is_admin) VALUES($1,$2,$3,TRUE)',
        ['Admin', adminEmail, hash]
      );
    }
    console.log(`✅ Admin account ensured at boot for ${adminEmail}`);
  }
  await pool.query('COMMIT');
  console.log('✅ Schema 005 applied at boot (users.is_admin)');
  return true;
}

export async function ensureLatestSchema() {
  try {
    const { rows } = await pool.query(guard);
    if ((rows[0]?.def || '').includes('whatsapp')) {
      await ensureAdminColumn();
      return false;
    }

    await pool.query('BEGIN');
    await pool.query('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check');
    await pool.query(`
      ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
      CHECK (payment_method IN ('jazzcash','easypaisa','cod','whatsapp'))
    `);
    await pool.query('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check');
    await pool.query(`
      ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('pending','paid','failed','refunded','sent_to_whatsapp'))
    `);
    await pool.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS customer_name TEXT,
        ADD COLUMN IF NOT EXISTS order_note TEXT
    `);
    await pool.query('COMMIT');
    console.log('✅ Schema 004 applied at boot (whatsapp payment path)');
    await ensureAdminColumn();
    return true;
  } catch (err) {
    console.error('⚠️ ensureLatestSchema failed (will retry next boot):', err.message);
    return false;
  }
}