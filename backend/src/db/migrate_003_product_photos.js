/**
 * Migration 003 — Assign real product packaging photos.
 *
 * The storefront previously used Unsplash placeholder images for every product
 * and a handful of WhatsApp-sourced JPGs. This migration swaps them for the
 * real packaging photos now shipped in frontend/public/product-images/.
 *
 * Changes (all idempotent — safe to re-run on every deploy since db:setup
 * runs migrate_003 after the seeds):
 *
 *  1. UPDATE image_urls on every product that has a corresponding real photo.
 *  2. INSERT the new "Anti Acne Face Wash + Bar" bundle product (both items
 *     are photographed together — treated as a distinct combo product).
 *  3. SET is_active = false on the 12 serum products that only ever had
 *     Unsplash placeholder photos and have no real photo (they're hidden from
 *     the shop, not deleted — data is preserved for when photos are provided).
 */
import pool from './pool.js';
import dotenv from 'dotenv';
dotenv.config();

// slug -> new image_urls[] (relative asset paths served from /product-images/)
const PHOTO_UPDATE = {
  'eminence-anti-acne-bar':             ['/product-images/eminence.png'],
  'tryscab-medicated-bar':              ['/product-images/try-scab.png'],
  'mastic-e-medicated-bar':             ['/product-images/mastic-e-medicated-bar.png'],
  'eminence-anti-acne-face-wash':       ['/product-images/eminence-antiacne-facewash.png'],
  'eminence-glo-brightening-face-wash': ['/product-images/eminence-glow-facewash.png'],
  'mastic-e-emollient-cream':           ['/product-images/mastic-e-emollient.png'],
  'mastic-e-moisturizer-spf20':         ['/product-images/mastic-e-oil-free-mosturiser.png', '/product-images/mastic-e-mosturiser-lotion.png'],
  'eminence-sunblock-spf60':            ['/product-images/eminence-antioxidant-sunblock.png'],
  'eminence-tar-bar-shampoo':           ['/product-images/eminence-tar-bar-shampoo.png'],
  'eminence-hair-oil':                  ['/product-images/eminece-hair-oil.png'],
  'eminence-anti-hairfall-shampoo':     ['/product-images/eminence-anti-hairfall-shampoo.png'],
  'mastic-wash-feminine-cleanser':      ['/product-images/masstic-wash.png', '/product-images/mastic-feminine-intimate-cleanser.png'],
};

// Combo product — the face wash + bar photographed together.
const COMBO = {
  name: 'Anti Acne Face Wash + Bar',
  slug: 'eminence-anti-acne-facewash-bar',
  sku: 'ELS-SET-001',
  description:
    'A complete 2-piece anti-acne ritual: the Anti Acne Face Wash and the Anti Acne Bar together. Both are formulated with Mandelic and Glycolic Acid plus Tea Tree Oil to deep-clean, exfoliate congested pores, and neutralise acne-causing bacteria — without over-drying the skin.',
  price: 1850,
  stock: 60,
  category: 'face-washes',
  image_urls: ['/product-images/eminence-anti-acne-facewash-plus-bar.png'],
};

// Serum products that have NO real photo — hide (not delete) them.
const HIDE_SLUGS = [
  'pure-balance-niacinamide-serum',
  'restore-probiotic-barrier-serum',
  'clarity-kojic-acid-glow-serum',
  'shield-centella-calm-serum',
  'radiance-aha-resurfacing-serum',
  'luminance-vitamin-c-serum',
  'lift-firm-peptide-concentrate',
  'oasis-squalane-ceramide-serum',
  'aqua-surge-hyaluronic-acid-serum',
  'time-reverse-bakuchiol-serum',
  'renewal-retinol-night-serum',
  'dew-drop-polyglutamic-acid-serum',
];

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('🖼  Running migration 003 — real product photos...');

    // ── 1. Update image_urls ─────────────────────────────────────────
    let updated = 0;
    for (const [slug, urls] of Object.entries(PHOTO_UPDATE)) {
      const r = await client.query(
        'UPDATE products SET image_urls = $1 WHERE slug = $2 RETURNING id',
        [urls, slug]
      );
      if (r.rows.length) {
        updated++;
        console.log(`   ✓ ${slug} → ${urls.join(', ')}`);
      } else {
        console.log(`   ⚠️  no product with slug '${slug}' — skipping`);
      }
    }

    // ── 2. Insert combo product ──────────────────────────────────────
    const catRes = await client.query(
      'SELECT id FROM categories WHERE slug = $1', [COMBO.category]
    );
    const comboCat = catRes.rows[0];
    let comboCreated = false;
    if (comboCat) {
      const combo = await client.query(
        `INSERT INTO products (
           name, slug, description, price, sale_price, sku, stock,
           category_id, concern_tags, key_ingredients, how_to_use,
           full_ingredient_list, image_urls, is_featured, is_best_seller,
           needs_review, is_active
         ) VALUES ($1,$2,$3,$4,NULL,$5,$6,$7,
           ARRAY['acne','oily-skin','pores','breakouts'],
           ARRAY['Mandelic Acid','Glycolic Acid','Tea Tree Oil'],
           'For best results use both as part of your daily routine. Start with the Anti Acne Face Wash: apply to damp face, massage gently for 30–60 seconds, then rinse. Use the Anti Acne Bar on affected areas up to twice daily, leaving the lather on for a few minutes before rinsing.',
           NULL, $8, TRUE, TRUE, FALSE, TRUE
         )
         ON CONFLICT (sku) DO UPDATE
           SET image_urls = EXCLUDED.image_urls,
               price     = EXCLUDED.price,
               stock     = EXCLUDED.stock,
               is_active = TRUE
         RETURNING id`,
        [COMBO.name, COMBO.slug, COMBO.description, COMBO.price, COMBO.sku, COMBO.stock, comboCat.id, COMBO.image_urls]
      );
      comboCreated = true;
      console.log(`   ✓ Combo product '${COMBO.name}' (${COMBO.sku}) ensured`);
    } else {
      console.log(`   ⚠️  Category '${COMBO.category}' not found — combo product skipped`);
    }

    // ── 3. Hide serum products without real photos ──────────────────
    const hideRes = await client.query(
      `UPDATE products
         SET is_active = FALSE, is_featured = FALSE, is_best_seller = FALSE
       WHERE slug = ANY($1::text[]) RETURNING slug`,
      [HIDE_SLUGS]
    );
    console.log(`   ✓ Hidden ${hideRes.rows.length} products without real photos`);

    await client.query('COMMIT');
    console.log('✅ Migration 003 complete.');
    console.log(`   • updated photos: ${updated}`);
    console.log(`   • combo product:  ${comboCreated ? COMBO.name : 'SKIPPED'}`);
    console.log(`   • hidden serums:  ${hideRes.rows.length}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration 003 failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
