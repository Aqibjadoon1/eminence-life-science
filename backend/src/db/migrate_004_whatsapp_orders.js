/**
 * Migration 004 — WhatsApp order flow.
 *
 * Widens the orders CHECK constraints so the WhatsApp hand-off path can be
 * recorded, and adds customer-facing order fields. Nothing is dropped:
 * payment_method / payment_status columns are kept, just given more values.
 *
 * Run with: npm run db:migrate:004
 * (Point DATABASE_URL at any environment — prod migration uses Render's
 *  external connection string.)
 */
import pool from './pool.js';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Allow 'whatsapp' as an order's payment conveyance method
    await client.query(`
      ALTER TABLE orders
        DROP CONSTRAINT IF EXISTS orders_payment_method_check;
      ALTER TABLE orders
        ADD CONSTRAINT orders_payment_method_check
        CHECK (payment_method IN ('jazzcash','easypaisa','cod','whatsapp'));
    `);

    // Allow 'sent_to_whatsapp' as a payment-status value (repurposed for
    // tracking the WhatsApp hand-off state — no payment is collected here)
    await client.query(`
      ALTER TABLE orders
        DROP CONSTRAINT IF EXISTS orders_payment_status_check;
      ALTER TABLE orders
        ADD CONSTRAINT orders_payment_status_check
        CHECK (payment_status IN ('pending','paid','failed','refunded','sent_to_whatsapp'));
    `);

    // Customer details captured at checkout (name + optional note;
    // phone/city/address ride on the referenced addresses row)
    await client.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS customer_name TEXT,
        ADD COLUMN IF NOT EXISTS order_note TEXT;
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 004 applied — whatsapp payment path + customer_name / order_note');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

migrate().catch((err) => {
  console.error('Migration 004 failed:', err);
  process.exit(1);
});
