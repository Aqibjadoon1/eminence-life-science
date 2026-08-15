/**
 * Migration 002 — Expand catalog beyond serums.
 * NON-DESTRUCTIVE: adds new tables/columns only. Never drops existing data.
 *
 * Changes:
 *  1. product_attributes table (key/value per product for category-specific specs)
 *  2. products.needs_review   BOOLEAN column (flags items pending pricing/review)
 *  3. products.is_active      BOOLEAN column (false = hidden from shop; default true)
 *  4. categories.image_url    VARCHAR column (for category tile images)
 *  5. categories.description  TEXT column
 *  6. Indexes on product_attributes
 *
 * Run: node src/db/migrate_002_expand_catalog.js
 */
import pool from './pool.js';
import dotenv from 'dotenv';
dotenv.config();

const SQL = `
-- ── 1. product_attributes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_attributes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attr_key    VARCHAR(100) NOT NULL,
  attr_value  TEXT NOT NULL,
  UNIQUE(product_id, attr_key)
);

CREATE INDEX IF NOT EXISTS idx_product_attrs_product
  ON product_attributes(product_id);

CREATE INDEX IF NOT EXISTS idx_product_attrs_key_value
  ON product_attributes(attr_key, attr_value);

-- ── 2. products.needs_review ──────────────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 3. products.is_active ─────────────────────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- ── 4. categories.image_url ───────────────────────────────────────────────────
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ── 5. categories.description ────────────────────────────────────────────────
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description TEXT;

-- ── 6. categories.sort_order (for menu ordering) ─────────────────────────────
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- ── 7. Ensure is_active is indexed for shop listing queries ──────────────────
CREATE INDEX IF NOT EXISTS idx_products_active
  ON products(is_active);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔧 Running migration 002 — expand catalog...');
    await client.query(SQL);
    console.log('✅ Migration 002 complete.');
    console.log('   + product_attributes table');
    console.log('   + products.needs_review column');
    console.log('   + products.is_active column');
    console.log('   + categories.image_url column');
    console.log('   + categories.description column');
    console.log('   + categories.sort_order column');
  } catch (err) {
    console.error('❌ Migration 002 failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
