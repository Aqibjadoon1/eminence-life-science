/**
 * Boot-time schema guard — idempotently brings the orders schema to
 * migration 004 on whatever database the app connects to (Render's
 * free Postgres blocks external connections, so prod migrations run
 * from inside the service on deploy).
 *
 * Safe to run on every boot: checks pg_constraint first, and skips
 * everything once the 'whatsapp' value is present. Non-fatal on
 * failure — the API still boots, and the next boot retries.
 */
import pool from './pool.js';

const guard =
  `SELECT pg_get_constraintdef(oid) AS def
   FROM pg_constraint
   WHERE conname = 'orders_payment_method_check'`;

export async function ensureLatestSchema() {
  try {
    const { rows } = await pool.query(guard);
    if ((rows[0]?.def || '').includes('whatsapp')) {
      return false; // already current
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
    return true;
  } catch (err) {
    console.error('⚠️ ensureLatestSchema failed (will retry next boot):', err.message);
    return false;
  }
}
