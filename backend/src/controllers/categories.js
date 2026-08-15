import pool from '../db/pool.js';

/**
 * GET /api/categories
 * Returns all categories with product counts (active products only).
 * Ordered by sort_order so the menu matches the intended display sequence.
 */
export async function getCategories(_req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         c.id, c.name, c.slug, c.parent_id,
         c.description, c.image_url, c.sort_order,
         COUNT(p.id) FILTER (WHERE p.is_active = true)::INTEGER AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}
