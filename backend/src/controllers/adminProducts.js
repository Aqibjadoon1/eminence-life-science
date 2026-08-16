import { body, validationResult } from 'express-validator';
import pool from '../db/pool.js';

const ADMIN_LIST_SELECT = `
  SELECT p.id, p.name, p.slug, p.sku, p.stock, p.price, p.is_active,
         p.is_featured, p.is_best_seller, p.image_urls, p.created_at,
         c.name AS category_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

export async function listAdminProducts(_req, res, next) {
  try {
    const result = await pool.query(`${ADMIN_LIST_SELECT} ORDER BY p.created_at DESC`);
    res.json({ data: result.rows });
  } catch (err) { next(err); }
}

export const PRODUCT_VALIDATORS = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 255 }).withMessage('Name too long.'),
  body('category_id').isUUID().withMessage('Valid category required.'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a number >= 0.'),
  body('stock').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Stock must be >= 0.'),
  body('sku').optional({ values: 'falsy' }).trim().isLength({ max: 100 }).withMessage('SKU too long.'),
  body('description').optional({ values: 'falsy' }).trim(),
  body('how_to_use').optional({ values: 'falsy' }).trim(),
  body('full_ingredient_list').optional({ values: 'falsy' }).trim(),
  body('concern_tags').optional().isArray().withMessage('concern_tags must be an array.'),
  body('key_ingredients').optional().isArray().withMessage('key_ingredients must be an array.'),
  body('image_urls').optional().isArray().withMessage('image_urls must be an array.'),
  body('is_featured').optional().isBoolean(),
  body('is_best_seller').optional().isBoolean(),
  body('is_active').optional().isBoolean(),
];

function cleanArray(value) {
  return Array.isArray(value) ? value.map((v) => String(v).trim()).filter(Boolean) : [];
}

function slugify(name) {
  return String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 200);
}

async function uniqueSlug(client, base, excludeId = null) {
  const prefix = base || 'product';
  const params = [prefix + '%'];
  let where = 'slug LIKE $1';
  if (excludeId) { where += ' AND id != $2'; params.push(excludeId); }
  const { rows } = await client.query(`SELECT slug FROM products WHERE ${where}`, params);
  const taken = new Set(rows.map((r) => r.slug));
  for (let i = 1; i <= 1000; i++) {
    const next = i === 1 ? prefix : `${prefix}-${i}`;
    if (!taken.has(next)) return next;
  }
  return `${prefix}-${Date.now()}`;
}

export async function createProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const {
      name, category_id, price, stock = 0, sku,
      description, how_to_use, full_ingredient_list,
      concern_tags, key_ingredients, image_urls,
      is_featured = false, is_best_seller = false,
    } = req.body;

    const cat = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (!cat.rows.length) return res.status(422).json({ error: 'Unknown category.' });

    const slug = await uniqueSlug(pool, slugify(name));
    const finalSku = (sku && String(sku).trim()) || slug.toUpperCase().slice(0, 80);

    const INSERT = `
      INSERT INTO products (name, slug, description, price, sale_price, sku, stock, category_id,
        concern_tags, key_ingredients, how_to_use, full_ingredient_list, image_urls,
        is_featured, is_best_seller)
      VALUES ($1,$2,$3,$4,NULL,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id, slug
    `;
    const params = [
      name, slug, description || null, price, finalSku, parseInt(stock, 10), category_id,
      cleanArray(concern_tags), cleanArray(key_ingredients), how_to_use || null,
      full_ingredient_list || null, cleanArray(image_urls),
      is_featured === true, is_best_seller === true,
    ];

    try {
      const result = await pool.query(INSERT, params);
      return res.status(201).json({ data: result.rows[0] });
    } catch (err) {
      if (err.code === '23505' && err.constraint === 'products_sku_key') {
        params[4] = `${slug.toUpperCase().slice(0, 76)}-${Date.now() % 10000}`;
        const result = await pool.query(INSERT, params);
        return res.status(201).json({ data: result.rows[0] });
      }
      throw err;
    }
  } catch (err) { next(err); }
}

export async function updateProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { id } = req.params;
    const found = await pool.query('SELECT id, name FROM products WHERE id = $1', [id]);
    if (!found.rows.length) return res.status(404).json({ error: 'Product not found.' });

    const b = req.body;
    const slug = await uniqueSlug(pool, slugify(b.name || found.rows[0].name), id);
    const finalSku = (b.sku && String(b.sku).trim()) || slug.toUpperCase().slice(0, 80);

    await pool.query(
      `UPDATE products SET
         name=$1, slug=$2, description=$3, price=$4, sale_price=NULL,
         sku=$5, stock=$6, category_id=$7, concern_tags=$8, key_ingredients=$9,
         how_to_use=$10, full_ingredient_list=$11, image_urls=$12,
         is_featured=$13, is_best_seller=$14, is_active=$15
       WHERE id=$16`,
      [
        b.name, slug, b.description || null, b.price, finalSku, parseInt(b.stock, 10) || 0, b.category_id,
        cleanArray(b.concern_tags), cleanArray(b.key_ingredients), b.how_to_use || null,
        b.full_ingredient_list || null, cleanArray(b.image_urls),
        b.is_featured === true, b.is_best_seller === true, b.is_active !== false,
        id,
      ]
    );
    res.json({ data: { id } });
  } catch (err) { next(err); }
}

export async function toggleProductActive(req, res, next) {
  try {
    const { id } = req.params;
    const found = await pool.query('SELECT id FROM products WHERE id = $1', [id]);
    if (!found.rows.length) return res.status(404).json({ error: 'Product not found.' });
    if (typeof req.body.is_active !== 'boolean') {
      return res.status(422).json({ error: 'is_active (boolean) required.' });
    }
    await pool.query('UPDATE products SET is_active = $1 WHERE id = $2', [req.body.is_active, id]);
    res.json({ data: { id, is_active: req.body.is_active } });
  } catch (err) { next(err); }
}
