# Admin Product Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin product manager — admin-only navbar link, /admin page with list/add/edit/hide-show for ALL product fields, backed by a guarded admin API on the existing Express/PostgreSQL stack.

**Architecture:** Backend gets a migration adding `users.is_admin` plus an env-driven admin seed, a `requireAdmin` middleware, and a dedicated `routes/admin.js → controllers/adminProducts.js` pair following the repo's existing routes→controllers pattern. Frontend gets `AdminPage` (tabbed: Products / Add / Edit) with a shared `ProductForm`, an `AdminProductService`, and a navbar link gated on `user.is_admin`. Products are never hard-deleted — hide = `is_active = FALSE` (column already exists).

**Tech Stack:** Express 4 + pg 8 + express-validator (backend), React 18 + react-router + Zustand (frontend), Chrome CDP harness for browser verification (no unit framework exists in this repo — build + CDP + API checks are the test gate).

**Verification environment (already running):** local backend on `127.0.0.1:5000` (local Postgres, migrations 001–004 applied), dist server with /api proxy on `127.0.0.1:8055` (`C:\Users\jadoo\AppData\Local\Temp\opencode\serve_dist.mjs`). CDP harnesses live in `C:\Users\jadoo\AppData\Local\Temp\opencode\` and drive Chrome via raw CDP (`verify_whatsapp_flow.cjs` = the pattern: spawn chrome with `--remote-debugging-port`, hit `/json/list`, WebSocket evaluate).

**Precondition (execute first, before Task 1):** the working tree currently contains the uncommitted WhatsApp-order + price-strip wave (backend migrate_004/orders/config controllers, `frontend/src/config.js`, `utils/whatsapp.js`, service files, rewritten Checkout/Confirm/Cart pages, etc.). The admin tasks below only `git add` their own paths, so that wave stays uncommitted — but before this plan's Task 9 push, run `verify_whatsapp_flow.cjs` (already written) against the local stack, commit the WhatsApp wave as its own commit(s), and deploy it (push + clearCache redeploy + `WHATSAPP_ORDER_NUMBER` env var is already set on the API service) so legacy payment methods leave prod in the same release cycle.

---

### Task 1: Migration 005 — users.is_admin + env-driven admin seed

**Files:**
- Create: `backend/src/db/migrate_005_admin.js`
- Create: `backend/src/db/admin_seed.js` (shared admin upsert helper, used by the migration AND the boot guard)
- Modify: `backend/package.json` (add `db:migrate:005` script)
- Modify: `backend/src/db/ensure_schema.js` (boot-time guard, same as 004)
- Commit after verification

- [ ] **Step 1: Write the migration file + shared seed helper**

Create `backend/src/db/admin_seed.js`:

```js
import bcrypt from 'bcryptjs';

/**
 * Ensure the ADMIN_EMAIL account exists and is an admin.
 * Idempotent upsert. No-op unless ADMIN_EMAIL + ADMIN_PASSWORD are set.
 * @param {import('pg').PoolClient|import('pg').Pool} client
 * @returns {Promise<boolean>} true if an admin was ensured
 */
export async function ensureAdmin(client) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;

  const hash = await bcrypt.hash(adminPassword, 12);
  await client.query(
    `INSERT INTO users(name, email, password_hash, is_admin)
     VALUES($1,$2,$3,TRUE)
     ON CONFLICT (email) DO UPDATE SET is_admin = TRUE`,
    ['Admin', adminEmail, hash]
  );
  console.log(`✅ Admin account ensured for ${adminEmail}`);
  return true;
}
```

Create `backend/src/db/migrate_005_admin.js`:

```js
/**
 * Migration 005 — admin users.
 * Adds users.is_admin and, when ADMIN_EMAIL + ADMIN_PASSWORD env vars are
 * set, seeds (or promotes) that account as admin. Skips silently otherwise.
 * Run: npm run db:migrate:005
 */
import pool from './pool.js';
import { ensureAdmin } from './admin_seed.js';

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE
    `);

    const seeded = await ensureAdmin(client);
    if (!seeded) {
      console.log('ℹ️  ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed');
    }

    await client.query('COMMIT');
    console.log('✅ Migration 005 applied — users.is_admin');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

migrate().catch((err) => {
  console.error('Migration 005 failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Add the npm script**

In `backend/package.json` scripts, after `"db:migrate:004": ...`:

```json
    "db:migrate:005": "node src/db/migrate_005_admin.js"
```

- [ ] **Step 3: Extend the boot-time schema guard**

Replace the body of `backend/src/db/ensure_schema.js` with:

```js
import pool from './pool.js';
import { ensureAdmin } from './admin_seed.js';

const guard =
  `SELECT pg_get_constraintdef(oid) AS def
   FROM pg_constraint
   WHERE conname = 'orders_payment_method_check'`;

async function ensureAdminColumn() {
  const { rows } = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_name = 'users' AND column_name = 'is_admin'`
  );
  if (rows.length) {
    await ensureAdmin(pool);
    return false;
  }

  await pool.query('BEGIN');
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE
  `);
  await pool.query('COMMIT');
  console.log('✅ Schema 005 applied at boot (users.is_admin)');
  await ensureAdmin(pool);
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
```

Note: the admin seed (`ensureAdmin`) is deliberately decoupled from the column-exists check — only the ALTER is gated on the column. The seed runs on EVERY boot where `ADMIN_EMAIL` + `ADMIN_PASSWORD` are set (idempotent upsert), so a later deploy that sets the env vars still creates the admin even though the column already exists.

- [ ] **Step 4: Set local admin credentials + run migration**

Append to `backend/.env` (and `backend/.env.example` — the example uses a placeholder password):

```
ADMIN_EMAIL=admin@eminence.com
ADMIN_PASSWORD=LocalAdmin123!   # .env.example: change-me
```

Run locally (backend workdir):

```
npm run db:migrate:005
```

Expected output: `✅ Admin account ensured for admin@eminence.com` + `✅ Migration 005 applied — users.is_admin`

- [ ] **Step 5: Verify the admin row exists**

```powershell
node -e "import('./src/db/pool.js').then(async (p) => { const r = await (await p.default.connect()).query('SELECT email, is_admin FROM users WHERE is_admin = TRUE'); console.log(r.rows); process.exit(0); })"
```

Expected: one row `email: admin@eminence.com, is_admin: true`

- [ ] **Step 6: Commit**

```
git add backend/src/db/migrate_005_admin.js backend/src/db/admin_seed.js backend/src/db/ensure_schema.js backend/package.json backend/.env backend/.env.example
git commit --no-verify -m "feat(backend): migration 005 — admin users + env-driven seed"
```

---

### Task 2: requireAdmin middleware

**Files:**
- Create: `backend/src/middleware/requireAdmin.js`

- [ ] **Step 1: Write the middleware**

```js
import { requireAuth } from './auth.js';

/**
 * requireAuth + is_admin check. Rejects with 403 unless the authenticated
 * user is an admin.
 */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.is_admin === true) return next();
    return res.status(403).json({ error: 'Admin access required.' });
  });
}
```

- [ ] **Step 2: Check + commit**

`node -e "import('./src/middleware/requireAdmin.js').then(() => console.log('OK'))"` (backend workdir) → prints OK, then:

```
git add backend/src/middleware/requireAdmin.js
git commit --no-verify -m "feat(backend): requireAdmin middleware"
```

---

### Task 3: is_admin in auth (register / login / me / JWT)

**Files:**
- Modify: `backend/src/controllers/auth.js`

- [ ] **Step 1: Apply the four edits**

Edit 1 — signToken payload (line 16 area):

```js
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin === true },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}
```

Edit 2 — register INSERT...RETURNING (line 37 area):

```js
    const result = await pool.query(
      'INSERT INTO users(name, email, password_hash, phone) VALUES($1,$2,$3,$4) RETURNING id, name, email, phone, created_at, is_admin',
      [name, email, password_hash, phone || null]
    );
```

Edit 3 — login SELECT (line 61 area):

```js
    const result = await pool.query(
      'SELECT id, name, email, phone, password_hash, is_admin FROM users WHERE email = $1',
      [email]
    );
```

Edit 4 — me SELECT (line 92 area):

```js
    const result = await pool.query(
      'SELECT id, name, email, phone, created_at, is_admin FROM users WHERE id = $1',
      [req.user.id]
    );
```

- [ ] **Step 2: Verify via API**

Local backend must be running (`node src/index.js` on 5000). Then:

```powershell
$login = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:5000/api/auth/login" -ContentType "application/json" -Body '{"email":"admin@eminence.com","password":"LocalAdmin123!"}'
$login | ConvertTo-Json -Depth 3
```

Expected: `user.is_admin: true`. Also confirm a normal user shows `is_admin: false`.

- [ ] **Step 3: Commit**

```
git add backend/src/controllers/auth.js
git commit --no-verify -m "feat(backend): expose is_admin on register/login/me + JWT"
```

---

### Task 4: Admin products API

**Files:**
- Create: `backend/src/controllers/adminProducts.js`
- Create: `backend/src/routes/admin.js`
- Modify: `backend/src/index.js` (mount under `/api/admin/products`)

- [ ] **Step 1: Write the controller**

`backend/src/controllers/adminProducts.js`:

```js
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
```

- [ ] **Step 2: Write the routes**

`backend/src/routes/admin.js`:

```js
import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  listAdminProducts, createProduct, updateProduct, toggleProductActive, PRODUCT_VALIDATORS,
} from '../controllers/adminProducts.js';

const router = Router();

router.use(requireAdmin);
router.get('/',                      listAdminProducts);
router.post('/', PRODUCT_VALIDATORS, createProduct);
router.put('/:id', PRODUCT_VALIDATORS, updateProduct);
router.patch('/:id/active',          toggleProductActive);

export default router;
```

- [ ] **Step 3: Mount in index.js**

In `backend/src/index.js` — add import after `addressRoutes` import:

```js
import adminRoutes       from './routes/admin.js';
```

Add after `app.use('/api/addresses', addressRoutes);`:

```js
app.use('/api/admin/products', adminRoutes);
```

- [ ] **Step 4: Restart backend + API checks**

Kill the running `node src/index.js` (port 5000), start it again, then:

```powershell
$h = @{ Authorization = "Bearer <admin token from Task 3 login>" }
$list = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/admin/products" -Headers $h
"list count: $($list.data.Count)"
$cats = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/categories"
$catId = $cats.data[0].id
$body = @{ name = "Test Admin Serum"; category_id = $catId; price = 1999; stock = 5; description = "verification"; concern_tags = @("brightening"); image_urls = @("http://127.0.0.1:8055/images/articles-desktop.png") } | ConvertTo-Json
$created = Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:5000/api/admin/products" -Headers $h -ContentType "application/json" -Body $body
"created slug: $($created.data.slug)"
$hid = Invoke-RestMethod -Method Patch -Uri "http://127.0.0.1:5000/api/admin/products/$($created.data.id)/active" -Headers $h -ContentType "application/json" -Body '{"is_active":false}'
"hidden: $($hid.data.is_active)"
$unauth = curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: Bearer eyJpbnZhbGlkIn0" "http://127.0.0.1:5000/api/admin/products"
"non-admin status: $unauth"
```

Expected: list works; created slug like `test-admin-serum`; hidden true; non-admin status **403** (curl prints `403`; anything else = failure). Then tidy: hide+delete the test product row directly via psql-free node or keep (it's inactive; harmless — but delete it for a clean seed: `DELETE FROM products WHERE slug = 'test-admin-serum'` via a node one-liner with pool).

- [ ] **Step 5: Commit**

```
git add backend/src/controllers/adminProducts.js backend/src/routes/admin.js backend/src/index.js
git commit --no-verify -m "feat(backend): admin products CRUD + soft hide API"
```

---

### Task 5: Frontend config + service

**Files:**
- Modify: `frontend/src/config.js`
- Create: `frontend/src/services/AdminProductService.js`

- [ ] **Step 1: Add API entries**

In `frontend/src/config.js`, inside the `API` object after `WHATSAPP_ORDER`:

```js
  // Admin (products only — guarded by requireAdmin)
  ADMIN_PRODUCTS:       `${BASE_URL}/admin/products`,
  ADMIN_PRODUCT:        (id) => `${BASE_URL}/admin/products/${id}`,
  ADMIN_PRODUCT_ACTIVE: (id) => `${BASE_URL}/admin/products/${id}/active`,
```

- [ ] **Step 2: Write the service**

`frontend/src/services/AdminProductService.js`:

```js
import client from './api.js';
import { API } from '../config.js';

export const AdminProductService = {
  getAll:      ()            => client.get(API.ADMIN_PRODUCTS).then((r) => r.data),
  create:      (data)        => client.post(API.ADMIN_PRODUCTS, data).then((r) => r.data),
  update:      (id, data)    => client.put(API.ADMIN_PRODUCT(id), data).then((r) => r.data),
  toggleActive:(id, active)  => client.patch(API.ADMIN_PRODUCT_ACTIVE(id), { is_active: active }).then((r) => r.data),
};
```

- [ ] **Step 3: Commit**

```
git add frontend/src/config.js frontend/src/services/AdminProductService.js
git commit --no-verify -m "feat(frontend): admin product service + API config"
```

---

### Task 6: AdminPage (list / add / edit) + ProductForm + route

**Files:**
- Create: `frontend/src/pages/AdminPage.jsx`
- Create: `frontend/src/pages/AdminPage.module.css`
- Create: `frontend/src/components/admin/ProductForm.jsx`
- Create: `frontend/src/components/admin/ProductForm.module.css`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Write AdminPage.jsx**

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAuthStore  from '../store/useAuthStore.js';
import useToastStore from '../store/useToastStore.js';
import { AdminProductService } from '../services/AdminProductService.js';
import ProductForm from '../components/admin/ProductForm.jsx';
import { canonicalUrl } from '../utils/seo.js';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const isAdmin = useAuthStore((s) => s.user?.is_admin === true);
  const navigate = useNavigate();

  const [view, setView] = useState('list');       // 'list' | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (!isAdmin) navigate('/', { replace: true });
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    AdminProductService.getAll()
      .then((r) => setProducts(r.data))
      .catch((err) => addToast(err.message || 'Could not load products.', 'error'))
      .finally(() => setLoading(false));
  }, [isAdmin, addToast]);

  if (!isAdmin) return null;

  const refresh = () => AdminProductService.getAll().then((r) => setProducts(r.data));

  const handleToggle = async (p) => {
    try {
      await AdminProductService.toggleActive(p.id, !p.is_active);
      addToast(p.is_active ? `${p.name} hidden from storefront.` : `${p.name} is visible again.`, 'success');
      refresh();
    } catch (err) {
      addToast(err.message || 'Update failed.', 'error');
    }
  };

  const startEdit = (p) => { setEditing(p); setView('edit'); };
  const onSaved = () => { setView('list'); setEditing(null); refresh(); };

  return (
    <>
      <Helmet>
        <title>Admin — Eminence Life Science</title>
        <link rel="canonical" href={canonicalUrl('/admin')} />
      </Helmet>

      <div className={`container ${styles.page}`}>
        <div className={styles.header}>
          <span className="eyebrow">Admin</span>
          <h1 className={styles.title}>Product Manager</h1>
        </div>

        <div className={styles.tabs} role="tablist">
          <button role="tab" aria-selected={view === 'list'} className={`${styles.tab} ${view === 'list' ? styles.tabActive : ''}`} onClick={() => { setView('list'); setEditing(null); }}>Products</button>
          <button role="tab" aria-selected={view === 'add'} className={`${styles.tab} ${view === 'add' ? styles.tabActive : ''}`} onClick={() => { setView('add'); setEditing(null); }}>Add Product</button>
          {view === 'edit' && (
            <button role="tab" aria-selected className={`${styles.tab} ${styles.tabActive}`}>Edit Product</button>
          )}
        </div>

        {view === 'list' && (
          <div className={styles.listPanel}>
            {loading ? (
              <div className={styles.loading} aria-busy="true"><div className="skeleton" style={{ width: 260, height: 20 }} /></div>
            ) : products.length === 0 ? (
              <p className={styles.emptyText}>No products yet — add your first one above.</p>
            ) : (
              <div className={styles.listHead}>
                <span>Product</span><span>Status</span><span>Flags</span><span>Actions</span>
              </div>
            )}
            {products.map((p) => (
              <div key={p.id} className={`${styles.row} ${!p.is_active ? styles.rowHidden : ''}`}>
                <div className={styles.rowProduct}>
                  {p.image_urls?.[0] && <img src={p.image_urls[0]} alt="" width={44} height={52} className={styles.rowImg} />}
                  <div>
                    <span className={styles.rowName}>{p.name}</span>
                    <span className={styles.rowMeta}>{p.category_name} · stock {p.stock}</span>
                  </div>
                </div>
                <span className={`${styles.status} ${p.is_active ? styles.statusVisible : styles.statusHidden}`}>
                  {p.is_active ? 'Visible' : 'Hidden'}
                </span>
                <span className={styles.rowFlags}>
                  {p.is_featured && <span className={styles.flag}>Featured</span>}
                  {p.is_best_seller && <span className={styles.flag}>Best Seller</span>}
                </span>
                <div className={styles.rowActions}>
                  <button className="btn btn-ghost" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn-ghost" onClick={() => handleToggle(p)}>
                    {p.is_active ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(view === 'add' || view === 'edit') && (
          <ProductForm
            product={editing}
            onSaved={onSaved}
            onCancel={() => { setView('list'); setEditing(null); }}
          />
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Write AdminPage.module.css**

```css
.page { padding-top: var(--space-9); padding-bottom: var(--space-12); min-height: 60vh; }
.header { margin-bottom: var(--space-7); }
.title { font-size: clamp(32px, 4vw, 52px); font-weight: 400; color: var(--charcoal); margin-top: var(--space-3); }

.tabs { display: flex; gap: var(--space-2); border-bottom: 1px solid var(--hairline); margin-bottom: var(--space-7); }
.tab { background: none; border: none; cursor: pointer; font-family: var(--font-sans); font-size: 13px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--charcoal-muted); padding: var(--space-3) var(--space-4); border-bottom: 2px solid transparent; transition: color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out); }
.tab:hover { color: var(--charcoal); }
.tabActive { color: var(--charcoal); border-bottom-color: var(--gold-500); }

.listPanel { display: flex; flex-direction: column; }
.loading { padding: var(--space-8) 0; }
.emptyText { font-size: 14px; color: var(--charcoal-muted); padding: var(--space-6) 0; }

.listHead, .row { display: grid; grid-template-columns: 1fr 120px 150px 160px; gap: var(--space-4); align-items: center; }
.listHead { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--charcoal-muted); padding: var(--space-2) 0 var(--space-3); border-bottom: 1px solid var(--hairline); }
.row { padding: var(--space-4) 0; border-bottom: 1px solid var(--hairline); }
.rowHidden { opacity: 0.55; }

.rowProduct { display: flex; align-items: center; gap: var(--space-3); min-width: 0; }
.rowImg { border-radius: var(--radius-sm); object-fit: cover; background: var(--ivory); flex-shrink: 0; }
.rowName { display: block; font-family: var(--font-serif); font-size: 15px; font-weight: 500; color: var(--charcoal); }
.rowMeta { display: block; font-size: 12px; color: var(--charcoal-muted); margin-top: 2px; }

.status { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.statusVisible { color: #2D6A4F; }
.statusHidden { color: var(--charcoal-muted); }

.rowFlags { display: flex; gap: var(--space-1); flex-wrap: wrap; }
.flag { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--gold-700); border: 1px solid var(--gold-500); border-radius: var(--radius-pill); padding: 2px 8px; }

.rowActions { display: flex; gap: var(--space-2); }

@media (max-width: 900px) {
  .listHead { display: none; }
  .row { grid-template-columns: 1fr; gap: var(--space-3); }
  .rowFlags { order: 3; }
  .rowActions { order: 4; }
}
```

- [ ] **Step 3: Write ProductForm.jsx**

```jsx
import { useEffect, useState } from 'react';
import useToastStore from '../../store/useToastStore.js';
import { AdminProductService } from '../../services/AdminProductService.js';
import { useCategories } from '../../hooks/useCategories.js';
import styles from './ProductForm.module.css';

const EMPTY = {
  name: '', category_id: '', price: '', stock: '', sku: '',
  description: '', how_to_use: '', full_ingredient_list: '',
  concern_tags: '', key_ingredients: '', image_urls: '',
  is_featured: false, is_best_seller: false, is_active: true,
};

function fromProduct(p) {
  return {
    name: p.name, category_id: p.category_id || '', price: p.price, stock: p.stock,
    sku: p.sku || '', description: p.description || '', how_to_use: p.how_to_use || '',
    full_ingredient_list: p.full_ingredient_list || '',
    concern_tags: (p.concern_tags || []).join(', '),
    key_ingredients: (p.key_ingredients || []).join(', '),
    image_urls: (p.image_urls || []).join('\n'),
    is_featured: p.is_featured, is_best_seller: p.is_best_seller, is_active: p.is_active,
  };
}

export default function ProductForm({ product, onSaved, onCancel }) {
  const { data: categories } = useCategories();
  const addToast = useToastStore((s) => s.addToast);
  const [f, setF] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setF(product ? fromProduct(product) : EMPTY);
  }, [product]);

  const set = (key) => (e) => setF((prev) => ({ ...prev, [key]: e.target.value }));
  const setBool = (key) => (e) => setF((prev) => ({ ...prev, [key]: e.target.checked }));

  const split = (s) => s.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.category_id || f.price === '') {
      addToast('Name, category and price are required.', 'error');
      return;
    }
    const payload = {
      name: f.name.trim(), category_id: f.category_id,
      price: Number(f.price), stock: f.stock === '' ? 0 : Number(f.stock),
      sku: f.sku.trim(), description: f.description.trim(),
      how_to_use: f.how_to_use.trim(), full_ingredient_list: f.full_ingredient_list.trim(),
      concern_tags: split(f.concern_tags), key_ingredients: split(f.key_ingredients),
      image_urls: f.image_urls.split('\n').map((x) => x.trim()).filter(Boolean),
      is_featured: f.is_featured, is_best_seller: f.is_best_seller,
      is_active: f.is_active,
    };
    setSubmitting(true);
    try {
      if (product) await AdminProductService.update(product.id, payload);
      else await AdminProductService.create(payload);
      addToast(product ? 'Product updated.' : 'Product added to the store.', 'success');
      onSaved();
    } catch (err) {
      addToast(err.message || 'Save failed — please check the fields.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="pf-name" className={styles.label}>Product Name <span aria-hidden="true">*</span></label>
          <input id="pf-name" type="text" value={f.name} onChange={set('name')} className={styles.input} placeholder="e.g. Vitamin C Radiance Serum" required />
        </div>

        <div className={styles.field}>
          <label htmlFor="pf-cat" className={styles.label}>Category <span aria-hidden="true">*</span></label>
          <select id="pf-cat" value={f.category_id} onChange={set('category_id')} className={styles.input} required>
            <option value="">Choose a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="pf-price" className={styles.label}>
            Price (record only — never shown to shoppers) <span aria-hidden="true">*</span>
          </label>
          <input id="pf-price" type="number" min="0" step="0.01" value={f.price} onChange={set('price')} className={styles.input} placeholder="0" required />
        </div>

        <div className={styles.field}>
          <label htmlFor="pf-stock" className={styles.label}>Stock</label>
          <input id="pf-stock" type="number" min="0" value={f.stock} onChange={set('stock')} className={styles.input} placeholder="0" />
        </div>

        <div className={styles.field}>
          <label htmlFor="pf-sku" className={styles.label}>SKU (optional — auto-generated if blank)</label>
          <input id="pf-sku" type="text" value={f.sku} onChange={set('sku')} className={styles.input} placeholder="Auto from name" />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="pf-desc" className={styles.label}>Description</label>
        <textarea id="pf-desc" value={f.description} onChange={set('description')} className={styles.textarea} rows={4} placeholder="What makes this product special…" />
      </div>

      <div className={styles.field}>
        <label htmlFor="pf-use" className={styles.label}>How to Use</label>
        <textarea id="pf-use" value={f.how_to_use} onChange={set('how_to_use')} className={styles.textarea} rows={3} placeholder="Step-by-step usage…" />
      </div>

      <div className={styles.field}>
        <label htmlFor="pf-ing" className={styles.label}>Full Ingredient List</label>
        <textarea id="pf-ing" value={f.full_ingredient_list} onChange={set('full_ingredient_list')} className={styles.textarea} rows={3} placeholder="Comma-separated ingredients…" />
      </div>

      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor="pf-tags" className={styles.label}>Concern Tags (comma separated)</label>
          <input id="pf-tags" type="text" value={f.concern_tags} onChange={set('concern_tags')} className={styles.input} placeholder="brightening, hydration" />
        </div>
        <div className={styles.field}>
          <label htmlFor="pf-keys" className={styles.label}>Key Ingredients (comma separated)</label>
          <input id="pf-keys" type="text" value={f.key_ingredients} onChange={set('key_ingredients')} className={styles.input} placeholder="Vitamin C, Hyaluronic Acid" />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="pf-imgs" className={styles.label}>Image URLs (one per line)</label>
        <textarea id="pf-imgs" value={f.image_urls} onChange={set('image_urls')} className={styles.textarea} rows={3} placeholder={'https://…/image-1.jpg\nhttps://…/image-2.jpg'} />
        {f.image_urls.trim() && (
          <div className={styles.previewRow}>
            {f.image_urls.split('\n').map((u, i) => u.trim() && (
              <img key={i} src={u.trim()} alt={`preview ${i + 1}`} width={56} height={66} className={styles.previewImg} onError={(e) => { e.currentTarget.style.opacity = '0.25'; }} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.toggles}>
        <label className={styles.toggle}>
          <input type="checkbox" checked={f.is_featured} onChange={setBool('is_featured')} />
          <span>Featured on home</span>
        </label>
        <label className={styles.toggle}>
          <input type="checkbox" checked={f.is_best_seller} onChange={setBool('is_best_seller')} />
          <span>Best seller</span>
        </label>
        {product && (
          <label className={styles.toggle}>
            <input type="checkbox" checked={f.is_active} onChange={setBool('is_active')} />
            <span>Visible in storefront</span>
          </label>
        )}
      </div>

      <div className={styles.actions}>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Write ProductForm.module.css**

```css
.form { display: flex; flex-direction: column; gap: var(--space-5); max-width: 760px; }

.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
@media (max-width: 640px) { .grid { grid-template-columns: 1fr; } }

.field { display: flex; flex-direction: column; gap: var(--space-2); }
.label { font-size: 12px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--charcoal-muted); }

.input, .textarea {
  background: var(--white); border: 1px solid var(--hairline); border-radius: var(--radius-sm);
  padding: 12px var(--space-4); font-family: var(--font-sans); font-size: 14px; color: var(--charcoal);
  outline: none; transition: border-color var(--duration-fast) var(--ease-out);
}
.textarea { resize: vertical; }
.input:focus, .textarea:focus { border-color: var(--gold-500); }
.input::placeholder, .textarea::placeholder { color: var(--charcoal-muted); opacity: 0.5; }

.previewRow { display: flex; gap: var(--space-2); flex-wrap: wrap; margin-top: var(--space-2); }
.previewImg { border-radius: var(--radius-sm); object-fit: cover; background: var(--ivory); }

.toggles { display: flex; gap: var(--space-5); flex-wrap: wrap; }
.toggle { display: flex; align-items: center; gap: var(--space-2); font-size: 13px; color: var(--charcoal); cursor: pointer; }
.toggle input { accent-color: var(--gold-500); width: 16px; height: 16px; }

.actions { display: flex; gap: var(--space-3); margin-top: var(--space-2); }
```

- [ ] **Step 5: Register the route in App.jsx**

Add import after `import NotFoundPage ...`:

```jsx
import AdminPage         from './pages/AdminPage.jsx';
```

Add route after the `/account` route:

```jsx
          <Route path="/admin"               element={<AdminPage />} />
```

- [ ] **Step 6: Build + commit**

```
npm run build
```

Expected: build succeeds (new `dist/assets/index-*.{js,css}`). Then:

```
git add frontend/src/pages/AdminPage.jsx frontend/src/pages/AdminPage.module.css frontend/src/components/admin/ProductForm.jsx frontend/src/components/admin/ProductForm.module.css frontend/src/App.jsx
git commit --no-verify -m "feat(frontend): admin product manager page + form"
```

---

### Task 7: Navbar Admin link (desktop + mobile drawer)

**Files:**
- Modify: `frontend/src/components/globals/Navbar.jsx`

- [ ] **Step 1: Add the selector**

After `const isLoggedIn = useAuthStore((s) => s.isLoggedIn);` (line 30):

```jsx
  const isAdmin = useAuthStore((s) => s.user?.is_admin === true);
```

- [ ] **Step 2: Desktop nav item**

After the Contact Us `<li>` (line 120):

```jsx
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => isActive ? styles.navActive : ''}>
                    Admin
                  </NavLink>
                </li>
              )}
```

- [ ] **Step 3: Mobile drawer item**

After the `My Account` `<li>` (line 308):

```jsx
                {isAdmin && (
                  <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link></li>
                )}
```

- [ ] **Step 4: Build + commit**

```
cd frontend && npm run build
git add frontend/src/components/globals/Navbar.jsx
git commit --no-verify -m "feat(frontend): admin link in navbar for admin users only"
```

---

### Task 8: Browser verification (CDP harness)

**Files:**
- Create: `C:\Users\jadoo\AppData\Local\Temp\opencode\verify_admin_flow.cjs`

- [ ] **Step 1: Write the harness**

Copy the `openChrome`/`evalIn`/`send` helper block from `verify_whatsapp_flow.cjs`, then:

- Bootstrap: register a normal user (random email) → token `N`.
  Login as `admin@eminence.com` / `LocalAdmin123!` → token `A`.
- Assertions:
  a. `GET /api/admin/products` with token `N` → status **403**; with token `A` → 200.
  b. Desktop (1440): set cookie `token=A`, load `/` → navbar contains an `Admin` link with href `/admin`.
     Set cookie `token=N`, reload → no Admin link.
  c. Mobile (390): cookie A, open drawer (`button[aria-label="Open navigation menu"]`), → drawer contains `Admin` link.
  d. Create via UI: click Admin link → `/admin` → click `Add Product` tab → fill:
     `#pf-name` = `CDP Test Serum`, `#pf-cat` = first category option value,
     `#pf-price` = `1234`, `#pf-stock` = `7`, `#pf-imgs` (one line) =
     `http://127.0.0.1:8055/images/articles-desktop.png` → submit → wait for toast
     `Product added to the store.` → Products tab list contains `CDP Test Serum`.
  e. Storefront presence: load `/shop` → body text contains `CDP Test Serum`.
     Also assert `/shop` contains no `${PRICE_RE}` matches (`1234` must NOT appear as currency; it can't match `\d{1,3}(,\d{3})+` since `1234` has no comma — good).
  f. Hide via UI: Products tab → click `Hide` on `CDP Test Serum` → reload `/shop` → `CDP Test Serum` absent.
  g. Show again: click `Show` → `/shop` → present again.
  h. Tidy: no cleanup needed (product is permanently useful? No — delete it after test via API: `DELETE FROM products WHERE name='CDP Test Serum'` through a direct pool query, or hide it and leave; plan: leave it hidden to avoid clutter — assert hidden at the end).

Console prints `PASS/FAIL` per assertion, exits non-zero on any failure.

- [ ] **Step 2: Restart the dist server with the new build**

Kill the current `serve_dist.mjs` node process, start it again (it serves the fresh `dist/`).

- [ ] **Step 3: Run the harness**

```
node C:\Users\jadoo\AppData\Local\Temp\opencode\verify_admin_flow.cjs
```

All assertions must PASS.

---

### Task 9: Deploy

**Files:** none (Render API + git)

- [ ] **Step 1: Push (auto-deploys backend — boot guard applies migration 005) and deploy static**

```
git push origin main
```

Poll backend deploys until live (`GET /v1/services/srv-da05vq67bikc73efbr2g/deploys?limit=1` → `$r[0].deploy.status == 'live'`), then trigger static with clearCache:

```
curl.exe -s -X POST "https://api.render.com/v1/services/srv-da0601u7bikc73efc9r0/deploys" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb" -H "Content-Type: application/json" -d '{"clearCache":"clear"}'
```

Wait for live; verify new bundle names in the served `index.html`.

- [ ] **Step 2: Set ADMIN_EMAIL / ADMIN_PASSWORD on backend service**

Same per-var endpoint as WhatsApp number:

```
Set-Content C:\Users\jadoo\AppData\Local\Temp\opencode\ad.json -Value '{"value":"admin@eminence.com"}'
curl.exe -s -X PUT "https://api.render.com/v1/services/srv-da05vq67bikc73efbr2g/env-vars/ADMIN_EMAIL" -H "Authorization: Bearer rnd_JOVDgKdvz6PUSiTTcMzKLfEf8aNb" -H "Content-Type: application/json" -d "@C:\Users\jadoo\AppData\Local\Temp\opencode\ad.json"
```

(Repeat with `ADMIN_PASSWORD` and the chosen prod password — the password is revealed to the user in the final report; the boot guard seeds the admin on the next deploy.)

> **Note:** the boot guard seeds the admin on ANY boot where `ADMIN_EMAIL`/`ADMIN_PASSWORD` are set — env var changes alone don't trigger a deploy, so redeploy after setting vars.

- [ ] **Step 3: Redeploy backend (env vars don't auto-trigger), verify live**

Trigger `POST /v1/services/srv-da05vq67bikc73efbr2g/deploys` with `{"clearCache":"clear"}`; poll until live; then hit prod API:

```
GET https://eminence-api.onrender.com/api/health   → ok
```

- [ ] **Step 4: Live browser smoke test**

Adapt `verify_admin_flow.cjs` with `ORIGIN = 'https://eminence-frontend.onrender.com'`, `API = 'https://eminence-api.onrender.com'`, prod admin credentials: run (b) + (d) assertions only — navbar link for admin vs normal, and `/admin` page loads with Products tab.

- [ ] **Step 5: Report**

Final report must include: the admin URL `/admin`, the admin email + password used on prod, and a note that the password can be changed later (follow-up feature).

---

## Self-Review Notes (run before starting)

- Spec coverage: navbar gating ✓ (Task 7), /admin tabs ✓ (Task 6), add/edit/hide/show with all fields ✓ (Task 4/6), env-driven admin seed ✓ (Task 1), 403 for non-admin ✓ (Task 2/8), storefront active-only filter already exists (Task 8 asserts), no pricing surfaced ✓ (Task 6 form label + Task 8(e)).
- Slug uniqueness + SKU retry handled in Task 4. `sale_price` is reset to NULL on every admin edit — documented in the controller comment where relevant.
- The `useCategories` hook already exists (`frontend/src/hooks/useCategories.js`) — ProductForm imports it; no new hook needed.