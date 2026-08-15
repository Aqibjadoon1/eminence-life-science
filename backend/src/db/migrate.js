/**
 * Database migration — creates all tables for Eminence Life Science.
 * Run: npm run db:migrate
 */
import pool from './pool.js';
import dotenv from 'dotenv';

dotenv.config();

const SQL = `
-- ============================================================
--  EMINENCE LIFE SCIENCE — DATABASE SCHEMA
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone       VARCHAR(30),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(100) DEFAULT 'Home',
  line1       TEXT NOT NULL,
  city        VARCHAR(100) NOT NULL,
  phone       VARCHAR(30),
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (supports parent_id for nesting: e.g. Serums > Brightening)
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 VARCHAR(255) NOT NULL,
  slug                 VARCHAR(255) UNIQUE NOT NULL,
  description          TEXT,
  price                NUMERIC(10,2) NOT NULL,
  sale_price           NUMERIC(10,2),
  sku                  VARCHAR(100) UNIQUE NOT NULL,
  stock                INTEGER NOT NULL DEFAULT 0,
  category_id          UUID REFERENCES categories(id) ON DELETE SET NULL,
  concern_tags         TEXT[] DEFAULT '{}',
  key_ingredients      TEXT[] DEFAULT '{}',
  how_to_use           TEXT,
  full_ingredient_list TEXT,
  image_urls           TEXT[] DEFAULT '{}',
  is_featured          BOOLEAN DEFAULT FALSE,
  is_best_seller       BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Carts (supports both guest and logged-in users)
CREATE TABLE IF NOT EXISTS carts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id  VARCHAR(255),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT  cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE(cart_id, product_id)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  address_id      UUID REFERENCES addresses(id) ON DELETE SET NULL,
  status          VARCHAR(50) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  subtotal        NUMERIC(10,2) NOT NULL,
  shipping_fee    NUMERIC(10,2) NOT NULL DEFAULT 0,
  total           NUMERIC(10,2) NOT NULL,
  payment_method  VARCHAR(50) NOT NULL
                  CHECK (payment_method IN ('jazzcash','easypaisa','cod')),
  payment_status  VARCHAR(50) NOT NULL DEFAULT 'pending'
                  CHECK (payment_status IN ('pending','paid','failed','refunded')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10,2) NOT NULL
);

-- Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug        ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_bestseller  ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart      ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product      ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user          ON orders(user_id);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔧 Running migrations...');
    await client.query(SQL);
    console.log('✅ Migration complete — all tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
