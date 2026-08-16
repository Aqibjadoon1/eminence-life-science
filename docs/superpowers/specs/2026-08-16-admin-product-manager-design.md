# Admin Product Manager — Design

Date: 2026-08-16
Status: Approved (pending spec review)

## Goal

A user-friendly admin page where a simple user can fully manage products: add a
product with all its details, edit any existing product, and hide/show products.
The Admin link appears in the navbar ONLY when the logged-in user has admin
credentials. All pricing stays internal (recorded in the DB, never shown to
shoppers — consistent with the ongoing no-price storefront).

## Backend

### Migration 005 (`migrate_005_admin.js`, npm script `db:migrate:005`)

- `ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE`
- After the ALTER: if `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars are both set,
  upsert a user with that email/password (bcrypt-hashed, 12 rounds — same as
  auth) and `is_admin = TRUE`. Skips silently if either var is unset.
- Also applied at boot via `ensureLatestSchema` (same pattern as migration 004)
  so prod gets it automatically on deploy (Render free Postgres blocks external
  connections). Guard: check `information_schema.columns` for `users.is_admin`.

### Admin guard

- `middleware/requireAdmin.js`: runs `requireAuth` first, then rejects with
  403 unless `req.user.is_admin === true`.

### Admin API — `routes/admin.js` → `controllers/adminProducts.js`

All routes under `/api/admin/products`, all `requireAdmin`:

- `GET /` — list ALL products (active and hidden), newest first, using the same
  serializer as the public list (no drift).
- `POST /` — create. Validates: name (required), category_id (required, exists),
  price (required numeric ≥ 0), stock ≥ 0, slug/SKU unique (slug auto-generated
  from name if blank, made unique with suffix). Accepts all other fields:
  description, sale_price (kept nullable, unused by storefront), concern_tags[],
  key_ingredients[], how_to_use, full_ingredient_list, image_urls[],
  is_featured, is_best_seller.
- `PUT /:id` — full update, same validation as create. Also accepts
  `is_active` toggle (soft hide/show).
- Soft delete semantic: products are never dropped. Hide = `is_active = FALSE`
  (via PUT or a dedicated `PATCH /:id/toggle-active` — implementation detail,
  either is fine). Show = back to TRUE.
- Public product list/watch queries filter `is_active = TRUE` by default
  (products controller already carries a commented `include_inactive` intent).

### Auth plumbing

- `controllers/auth.js`: `register`, `login`, and `me` responses include
  `is_admin` on the user object; JWT payload gains `is_admin`.

## Frontend

### Navbar

- `Navbar/Navigation` component: render an "Admin" link conditionally when
  `useAuthStore` user object has `is_admin === true`.

### Routes

- `/admin` → `AdminPage` (client-side gate: if not `is_admin`, redirect to `/`).
  Tabbed single page, no nested routes: **Products** (list) | **Add Product** |
  **Edit Product** (appears when a product is selected from the list).

### Components

- `services/AdminProductService.js`: get / create / update / toggle-active,
  same client/api.js pattern as OrderService/AddressService.
- `components/admin/ProductForm.jsx`: single shared form for add and edit.
  Fields: name, category dropdown (from public categories endpoint), price
  (internal, labeled "record only — never shown to shoppers"), stock, SKU,
  description, how-to-use, full ingredient list, concern tags & key ingredients
  (comma-separated inputs converted to arrays), image URLs (add/remove rows
  with live preview + auto first-image selection in storefront), featured and
  bestseller toggle buttons, active toggle (edit only). Slug auto-generated,
  shown read-only with a note.
  - Plain labels + helper text on every field; client-side validation mirrors
    backend rules; submit button states via existing `useToastStore`.
- Product list tab: image thumb, name, category, status badge (Visible/Hidden),
  featured/bestseller marks, Edit and Hide/Show buttons. Confirm dialog for
  hide before acting.

### Styles

- Follow existing module.css patterns and tokens (`--charcoal`, `--gold-*`,
  `--ivory`, hairline, btn classes). Reuse `.formSection/.field/.label/.input`
  conventions from CheckoutPage.module.css.

## Testing

- CDP browser harness (same raw-CDP approach as `verify_whatsapp_flow.cjs`):
  1. Seed admin via env (local), login as admin
  2. Assert navbar shows Admin link — and does NOT for a normal user
  3. Create a product through the real form UI
  4. Assert it appears on `/shop` (public, active-only)
  5. Hide it via admin UI → assert gone from `/shop` → restore → assert back
  6. Non-admin token calling `/api/admin/products` → 403

## Scope guardrails

- No edit/delete of orders. No user management. No image upload (URLs only).
- No pricing surfaced to shoppers anywhere (form label makes this explicit).
- Edit/delete of products beyond hide/show is out of scope for this version.

## Open items during implementation

- Exact admin credentials come from ADMIN_EMAIL/ADMIN_PASSWORD env vars set on
  Render API service + local backend `.env` (revealed to the user in the final
  report so they can sign in; password change is a follow-up).