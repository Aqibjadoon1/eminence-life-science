/**
 * Sitemap controller — generates an XML sitemap from the live database.
 * Served at GET /api/sitemap.xml (proxied to this origin on the frontend,
 * e.g. https://eminence-frontend.onrender.com/api/sitemap.xml).
 *
 * Kept in sync with the DB automatically: categories with at least one active
 * product and every active product are included on each request.
 */
import pool from '../db/pool.js';

const BASE_URL = () => process.env.CLIENT_URL || 'http://localhost:5173';

// Escape XML special characters in text nodes
function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, priority, changefreq) {
  return `  <url>\n` +
         `    <loc>${xmlEscape(loc)}</loc>\n` +
         `    <changefreq>${changefreq}</changefreq>\n` +
         `    <priority>${priority}</priority>\n` +
         `  </url>`;
}

export async function getSitemap(_req, res, next) {
  try {
    const base = BASE_URL().replace(/\/$/, '');

    // Only public, crawlable pages: active products + categories that have
    // at least one active product (matches what the shop actually shows).
    const [catsRes, prodsRes] = await Promise.all([
      pool.query(
        `SELECT c.slug
         FROM categories c
         WHERE EXISTS (
           SELECT 1 FROM products p
           WHERE p.category_id = c.id AND p.is_active = true
         )
         ORDER BY c.sort_order, c.name`
      ),
      pool.query(
        'SELECT slug FROM products WHERE is_active = true ORDER BY created_at DESC'
      ),
    ]);

    const urls = [];
    // Homepage + primary browse entry points (highest priority)
    urls.push(urlEntry(`${base}/`, '1.0', 'weekly'));
    urls.push(urlEntry(`${base}/shop`, '0.9', 'weekly'));
    // Every category landing page
    for (const cat of catsRes.rows) {
      urls.push(urlEntry(`${base}/shop/${cat.slug}`, '0.8', 'weekly'));
    }
    // Every product page
    for (const prod of prodsRes.rows) {
      urls.push(urlEntry(`${base}/product/${prod.slug}`, '0.7', 'monthly'));
    }
    // Supporting pages
    urls.push(urlEntry(`${base}/our-science`, '0.6', 'monthly'));
    urls.push(urlEntry(`${base}/contact`, '0.5', 'monthly'));

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.join('\n') +
      `\n</urlset>\n`;

    res.type('application/xml').send(xml);
  } catch (err) {
    next(err);
  }
}
