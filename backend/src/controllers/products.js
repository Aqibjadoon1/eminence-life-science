/**
 * Products controller — fully category-agnostic.
 * Filters by category slug, arbitrary product_attributes key/value pairs,
 * concern_tags, search, sort, and pagination.
 * No serum-specific hardcoding anywhere in this file.
 */
import pool from '../db/pool.js';

// ─────────────────────────────────────────────────────────────────────────────
//  Shared SELECT fragment — joins categories, reviews, and attributes
// ─────────────────────────────────────────────────────────────────────────────
const BASE_SELECT = `
  SELECT
    p.id, p.name, p.slug, p.description, p.price, p.sale_price,
    p.sku, p.stock, p.concern_tags, p.key_ingredients,
    p.how_to_use, p.full_ingredient_list, p.image_urls,
    p.is_featured, p.is_best_seller, p.needs_review, p.is_active,
    p.created_at,
    c.id   AS category_id,
    c.name AS category_name,
    c.slug AS category_slug,
    COALESCE(AVG(r.rating), 0)::NUMERIC(3,1) AS avg_rating,
    COUNT(DISTINCT r.id)::INTEGER             AS review_count,
    COALESCE(
      json_object_agg(pa.attr_key, pa.attr_value)
        FILTER (WHERE pa.attr_key IS NOT NULL),
      '{}'::json
    ) AS attributes
  FROM products p
  LEFT JOIN categories         c  ON c.id = p.category_id
  LEFT JOIN reviews            r  ON r.product_id = p.id
  LEFT JOIN product_attributes pa ON pa.product_id = p.id
`;

const GROUP_BY = `
  GROUP BY p.id, c.id
`;

const ACTIVE_ONLY = `p.is_active = true`;

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products
//  Query params: category, concern, attr_key + attr_value, search, sort,
//                page, limit, include_inactive (admin only, not yet guarded)
// ─────────────────────────────────────────────────────────────────────────────
export async function getProducts(req, res, next) {
  try {
    const {
      category,
      concern,
      attr_key,
      attr_value,
      sort     = 'newest',
      search,
      page     = 1,
      limit    = 12,
      include_inactive,
    } = req.query;

    const conditions = [];
    const params     = [];
    let   idx        = 1;

    // Active-only filter (skip when explicitly requested — future admin use)
    if (!include_inactive) {
      conditions.push(ACTIVE_ONLY);
    }

    // Category filter — by slug
    if (category) {
      conditions.push(`c.slug = $${idx}`);
      params.push(category);
      idx++;
    }

    // Concern tag filter
    if (concern) {
      conditions.push(`$${idx} = ANY(p.concern_tags)`);
      params.push(concern);
      idx++;
    }

    // Generic attribute filter — attr_key + attr_value must both be present
    if (attr_key && attr_value) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM product_attributes pa2
          WHERE pa2.product_id = p.id
            AND pa2.attr_key   = $${idx}
            AND pa2.attr_value = $${idx + 1}
        )
      `);
      params.push(attr_key, attr_value);
      idx += 2;
    }

    // Full-text search on name + description
    if (search) {
      conditions.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const where = conditions.length
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const ORDER_MAP = {
      newest:       'p.created_at DESC',
      'price-asc':  'p.price ASC',
      'price-desc': 'p.price DESC',
      popular:      'review_count DESC',
      featured:     'p.is_featured DESC, p.created_at DESC',
    };
    const orderClause = ORDER_MAP[sort] || ORDER_MAP.newest;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Count query (no GROUP BY needed — just distinct products)
    const countRes = await pool.query(
      `SELECT COUNT(DISTINCT p.id)
       FROM products p
       LEFT JOIN categories         c  ON c.id = p.category_id
       LEFT JOIN product_attributes pa ON pa.product_id = p.id
       ${where}`,
      params
    );
    const total = parseInt(countRes.rows[0].count);

    // Data query
    const dataRes = await pool.query(
      `${BASE_SELECT}
       ${where}
       ${GROUP_BY}
       ORDER BY ${orderClause}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      data: dataRes.rows,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products/featured
// ─────────────────────────────────────────────────────────────────────────────
export async function getFeaturedProducts(_req, res, next) {
  try {
    const result = await pool.query(
      `${BASE_SELECT}
       WHERE p.is_featured = true AND ${ACTIVE_ONLY}
       ${GROUP_BY}
       ORDER BY p.created_at DESC
       LIMIT 8`
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products/bestsellers
// ─────────────────────────────────────────────────────────────────────────────
export async function getBestSellers(_req, res, next) {
  try {
    const result = await pool.query(
      `${BASE_SELECT}
       WHERE p.is_best_seller = true AND ${ACTIVE_ONLY}
       ${GROUP_BY}
       ORDER BY p.created_at DESC
       LIMIT 6`
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products/:slug
// ─────────────────────────────────────────────────────────────────────────────
export async function getProductBySlug(req, res, next) {
  try {
    const result = await pool.query(
      `${BASE_SELECT}
       WHERE p.slug = $1
       ${GROUP_BY}`,
      [req.params.slug]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Reviews (separate query — no GROUP BY conflict)
    const reviews = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.name AS reviewer_name
       FROM reviews r
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [result.rows[0].id]
    );

    res.json({ data: { ...result.rows[0], reviews: reviews.rows } });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products/:slug/related
//  Cross-category: same category first, then products sharing concern_tags
// ─────────────────────────────────────────────────────────────────────────────
export async function getRelatedProducts(req, res, next) {
  try {
    const product = await pool.query(
      'SELECT id, category_id, concern_tags FROM products WHERE slug = $1',
      [req.params.slug]
    );
    if (!product.rows.length) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const { id, category_id, concern_tags } = product.rows[0];

    const result = await pool.query(
      `${BASE_SELECT}
       WHERE p.id != $1
         AND ${ACTIVE_ONLY}
         AND (p.category_id = $2 OR p.concern_tags && $3)
       ${GROUP_BY}
       ORDER BY
         (p.category_id = $2)::int DESC,
         p.is_best_seller DESC,
         p.created_at DESC
       LIMIT 3`,
      [id, category_id, concern_tags]
    );

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products/by-category/:slug
//  Category landing page — all active products for one category
// ─────────────────────────────────────────────────────────────────────────────
export async function getProductsByCategory(req, res, next) {
  try {
    const { slug } = req.params;
    const { sort = 'newest', page = 1, limit = 12 } = req.query;

    const ORDER_MAP = {
      newest:       'p.created_at DESC',
      'price-asc':  'p.price ASC',
      'price-desc': 'p.price DESC',
      popular:      'review_count DESC',
    };
    const orderClause = ORDER_MAP[sort] || ORDER_MAP.newest;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Verify category exists
    const cat = await pool.query(
      'SELECT id, name, slug, description, image_url FROM categories WHERE slug = $1',
      [slug]
    );
    if (!cat.rows.length) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const countRes = await pool.query(
      `SELECT COUNT(DISTINCT p.id)
       FROM products p
       WHERE p.category_id = $1 AND ${ACTIVE_ONLY}`,
      [cat.rows[0].id]
    );

    const dataRes = await pool.query(
      `${BASE_SELECT}
       WHERE p.category_id = $1 AND ${ACTIVE_ONLY}
       ${GROUP_BY}
       ORDER BY ${orderClause}
       LIMIT $2 OFFSET $3`,
      [cat.rows[0].id, parseInt(limit), offset]
    );

    res.json({
      category: cat.rows[0],
      data: dataRes.rows,
      pagination: {
        total:  parseInt(countRes.rows[0].count),
        page:   parseInt(page),
        limit:  parseInt(limit),
        pages:  Math.ceil(parseInt(countRes.rows[0].count) / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/products/attributes/:categorySlug
//  Returns all distinct attr_key/value pairs for products in a category.
//  Used by the frontend to build adaptive attribute filters.
// ─────────────────────────────────────────────────────────────────────────────
export async function getCategoryAttributes(req, res, next) {
  try {
    const { categorySlug } = req.params;

    const result = await pool.query(
      `SELECT DISTINCT pa.attr_key, pa.attr_value
       FROM product_attributes pa
       JOIN products    p ON p.id = pa.product_id
       JOIN categories  c ON c.id = p.category_id
       WHERE c.slug = $1 AND p.is_active = true
       ORDER BY pa.attr_key, pa.attr_value`,
      [categorySlug]
    );

    // Group into { attr_key: [value1, value2, ...] }
    const grouped = {};
    for (const row of result.rows) {
      if (!grouped[row.attr_key]) grouped[row.attr_key] = [];
      grouped[row.attr_key].push(row.attr_value);
    }

    res.json({ data: grouped });
  } catch (err) {
    next(err);
  }
}
