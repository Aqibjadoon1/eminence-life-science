# Eminence Life Science — Agent Task Ledger

## Project Overview
Premium skincare e-commerce — React (Vite) frontend + Node.js/Express API + PostgreSQL.
Full GlowWell-structure UI with Eminence gold/ivory brand skin.

---

## 🟢 Completed

### Phase 1 — DB + API Skeleton (original build)
- [x] Full project scaffold — frontend (React/Vite) + backend (Express/PostgreSQL)
- [x] PostgreSQL schema: users, addresses, categories, products, reviews, carts, cart_items, orders, order_items, newsletter_subscribers
- [x] Express API: auth (JWT/httpOnly), products, categories, cart, orders, newsletter, addresses
- [x] Seed: 4 serum categories + 12 serum products with clinical ingredient data

### Phase 2 — Homepage (original build)
- [x] Hero section, trust strip, bestsellers, science section, concern tiles, editorial banner, testimonials, newsletter, footer, navbar, cart drawer

### Phase 3 — Shop + Product pages (original build)
- [x] ShopPage, ProductPage, ProductCard, CartPage

### Phase 4 — Auth + Checkout (original build)
- [x] AccountPage (login/register + dashboard), CheckoutPage (3-step), OrderConfirmPage

### Phase 5 — Science + Contact (original build)
- [x] SciencePage, ContactPage, NotFoundPage

---

### Refactor A — DB Expansion
- [x] Audit: schema + all product images read and catalogued
- [x] Migration 002: product_attributes table, needs_review/is_active columns, category image_url/description/sort_order
- [x] Seed 002 (non-destructive): 6 new categories + 12 new products from real assets
  - Soaps/Bars: Anti Acne Bar, TrySCAB Bar, Mastic-E Medicated Bar
  - Face Washes: Anti Acne Face Wash, Glo Brightening Face Wash
  - Emollients: Mastic-E Emollient Cream, Mastic-E Moisturizer SPF 20
  - Sunblock: Antioxidant Sunblock SPF 60 PA+++ (needs_review)
  - Hair Care: Multi-Active Hair Oil, Anti Hair Fall Shampoo (needs_review, is_active:false)
  - Medicated: Tar Bar/Shampoo, Mastic-Wash Feminine Cleanser (needs_review, is_active:false)
- [x] Real product images copied to frontend/public/product-images/

### Refactor B — Catalog Logic
- [x] Products controller fully category-agnostic (generic attr_key/attr_value filtering)
- [x] New endpoints: /api/products/by-category/:slug, /api/products/attributes/:categorySlug
- [x] Categories controller returns sort_order, image_url, description, product_count
- [x] CategoryService + useCategories/useCategoryAttributes hooks
- [x] ShopPage: dynamic DB-driven category sidebar + adaptive attribute filters + URL sync
- [x] CategoryPage at /shop/:categorySlug with hero banner, sort, pagination
- [x] ProductPage: generic product.attributes spec grid (works for any category)
- [x] ConcernTiles: DB-driven, no hardcoded category copy
- [x] Build: 0 errors

### Refactor C — UI Structural Rebuild (GlowWell → Eminence)
- [x] **Section 1 — Announcement bar**: "Free delivery on orders over PKR 4,000" · Shop Now link
- [x] **Section 2 — Header**: Logo left · primary nav center · All Categories mega-menu (DB-driven) · wishlist/account/cart icons with badges · account icon opens LoginModal when not logged in
- [x] **Section 3 — Hero slider**: 3 slides, auto-advance 5s, manual dots + arrows, logo animation fires on first visit only (sessionStorage guard), reduced-motion safe
- [x] **Section 4 — Trust marquee**: Scrolling infinite ticker, 8 credentials, gold dividers, pauses on hover, static fallback for prefers-reduced-motion
- [x] **Section 5 — Top Pick of the Month**: 3 best-seller cards, wishlist heart overlay, gold-outline stock/sale badge (no red), quick-add hover overlay
- [x] **Section 6 — Promo tile pair**: Two large image tiles side by side ("This Week's Edit" + "New In"), overlay text + CTA
- [x] **Section 7 — Limited Time Deal**: Live countdown timer (gold serif digits), 6-product grid, gold-outline sale badges, wishlist hearts, "Explore More" CTA
- [x] **Section 8 — Newsletter**: "Get 15% Off Your First Order", centered, gold underline focus state, inline section
- [x] **Section 9 — Lifestyle image strip**: 5 real product images in square grid
- [x] **Section 10 — Feature icons row**: Free Shipping · Secure Payments · Customer Support, 3-col grid with gold hairline dividers
- [x] **Section 11 — Footer**: 4-column GlowWell layout — Logo+tagline | Find Us (address/phone/email) | Quick Links | Connect (social) · bottom bar: copyright + payment badges + Terms/Privacy
- [x] **Section 12 — Cart drawer**: Gift wrap toggle (+PKR 150), order note expandable field, running total with breakdown, "Go to Cart" + "Checkout" dual CTAs
- [x] **Section 13 — Login modal**: Account icon opens overlay modal (not page nav) when logged out · Sign In / New Customer tabs · Remember me + Forgot password · switches on "New customer? Create account" link
- [x] **Section 14 — Wishlist page**: /wishlist, full grid of saved products, clear all, empty state
- [x] **Section 15 — Search overlay**: Full-width slide-down overlay, large serif input, category quick-links with counts, filtered live on submit
- [x] useWishlistStore (Zustand, localStorage-persisted)
- [x] Final build: **0 errors · 177 modules · 358KB JS · 107KB CSS**

---

### Refactor D — Interaction Hover System
- [x] **Button sweep (site-wide)**: directional gold fill (L→R, 250ms ease) on hover with text/icon inverting to ivory — global `.btn` system (primary/outline/ghost) + module buttons: navbar search submit, ProductCard add, Deal/TopPicks add + wishlist hearts, ShopPage filters/chips/clear/pagination, CategoryPage pagination, cart drawer remove/continue, CartPage remove, Wishlist clear, Contact locate, PromoBanner tile CTA, hero secondary CTA
- [x] Removed the old `.btn::after` light shimmer (replaced by the fill sweep)
- [x] New `--sweep-fill` token (deeper gold so the fill visibly travels over primary buttons too); disabled `.btn` gets opacity + pointer-events: none (no sweep on disabled)
- [x] **Frosted-glass card hover**: ivory-tinted blur (8px) fades in over image-led cards — ConcernTiles, PromoBannerPair ("Enhance Your Beauty"), EditorialBanner — content elevated above the glass via text-shadow on hover; dark base gradients kept for rest-state legibility
- [x] Left as-is (reported): tiny icon utilities (nav icons, hamburger, close buttons, qty steppers, hero arrows/dots) and tabs/form links keep their existing hover treatment; product-grid cards keep wishlist/badge behavior per spec
- [x] Touch: hover-only states omitted on touch (matches existing site convention); `prefers-reduced-motion` zeroes transition durations globally

---

### SEO Phase 1 — Technical Foundation
- [x] **render.yaml SPA fallback**: added `/* → /index.html` rewrite (after the `/api/*` proxy) so deep links (/shop, /product/:slug) return 200 instead of 404 — verified the deployed site was 404ing every non-root route
- [x] **robots.txt** (frontend/public): Allow all public pages; disallow /cart, /checkout, /account, /wishlist, /order/, /admin, /api/; references the sitemap
- [x] **DB-driven sitemap**: new backend GET /api/sitemap.xml (controllers/sitemap.js) — homepage, /shop, every category with ≥1 active product, every active product, /our-science, /contact; priorities 1.0→0.5, weekly/monthly changefreq; content-type application/xml; uses CLIENT_URL (Render) / localhost:5173 (dev); proxied to the frontend origin via the /api rewrite
- [x] **Canonicals**: react-helmet-async `<link rel=canonical>` on all 12 pages via new utils/seo.js; shop canonicals strip filter/sort/search params → unfiltered /shop; category/product canonicals self-referencing (params stripped)
- [x] **Soft-404 mitigation**: noindex,follow on NotFoundPage + the ProductPage/CategoryPage not-found branches (SPA returns 200 for unknown routes)
- [x] **Favicon fix**: /logo.jpeg was 404ing (file lived in product-images/) — copied to frontend/public/logo.jpeg
- [x] lang="en" + charset + viewport already correct in index.html (verified, no change needed)
- [x] API already returns real 404s for missing products/categories (verified, no change needed)
- Flagged: full 404 status for unknown SPA routes needs the backend to serve the build (architectural change) — deferred; /about-us doesn't exist (site uses /our-science)

---

### Interaction — Glass-Shatter Hover (promo/category cards)
- [x] New reusable `ShatterImageCard` (components/specials/) — irregular triangular shard mesh (jittered grid + random diagonal, seeded mulberry32 PRNG so the pattern is stable across hovers), 12–48 shards scaled by container width, pixel-exact reassembly via cover-correct background slicing (natural dims loaded at runtime, object-position parsed), per-shard translate 5–20px / rotate ±8° / scale 0.97 / 0–120ms stagger via CSS custom props, icy glint (::after, mix-blend screen) + drop-shadow on a wrapper div (clip-path clips element filters), transform/opacity/filter only, 450ms ease
- [x] Applied to PromoBannerPair, ConcernTiles (hover + focus trigger), EditorialBanner — driven by card-level `active` prop (controlled), so the whole card triggers the shatter, not just the image area
- [x] Replaced the frosted-glass overlays on those cards (removed ::after glass + img zoom); permanent dark gradients stay at rest but fade to ~0.12 on hover so the shattered image reads through; hover text-shadow elevation kept
- [x] prefers-reduced-motion: shards pinned at rest (no shatter), gradient fade remains as the motionless cue
- [x] CORRECTED per user review: the photo is no longer sliced — it renders whole underneath; the shards are now a translucent glass pane ABOVE the photo that shatters on hover (removed the per-shard image background slicing, natural-dims loading, and object-position parsing — no longer needed)
- [x] CORRECTED per user review #2: added a static "glass bed" layer (same mesh, held in place) that fades in on shatter beneath the moving shards — the gaps between scattered shards are now glass too, never bare photo
- [x] REPLACED per user review #3 (shatter not premium): removed ShatterImageCard entirely (deleted files) and implemented a calm premium editorial hover — slow photo zoom (900–1100ms), gold hairline frame fading in, warm golden light-wash, gentle content lift, card shadow — on ConcernTiles/PromoBannerPair/EditorialBanner; agent-guiders spec updated
- [x] Verified shard math offline: coverage ratio 1.0000 (no gaps), cover scale guarantees bg >= box, vertices in-bounds; production build 0 errors
- [x] Contact form: stronger visible field borders (charcoal @30% → 50% hover → gold focus ring) in ContactPage.module.css
- [x] agent-guiders/Promo-card-hover-spec.md created — active spec, explicitly supersedes the frosted-glass overlay

---

## ⚪ Pending — Optional Next Steps

### Pricing confirmation required
- [ ] Confirm retail price for Eminence Sunblock SPF 60 (physician sample — needs_review=true)
- [ ] Enable Hair Care products (currently is_active=false): set stock + price in DB or re-run seed with updated values
- [ ] Enable Mastic-Wash if you want it visible in the shop

### Production hardening
- [ ] Replace Unsplash placeholder images with real product photography
- [ ] Wire real JazzCash / EasyPaisa payment gateway APIs
- [ ] Set JWT_SECRET to a cryptographically secure value in .env
- [ ] Add rate limiting on auth routes (register/login)
- [ ] Image upload endpoint for product management
- [ ] Admin panel for product/order management

### Performance (optional polish)
- [ ] Route-level code splitting with React.lazy for pages
- [ ] WebP conversion for product images
- [ ] Add sitemap.xml + robots.txt for SEO

---

## 🏗 Architecture Decisions

| Decision | Rationale |
|---|---|
| CSS Modules | Scoped styles, zero runtime overhead, matches agent-guiders architecture guide |
| Zustand (not Redux) | Cart + auth + wishlist are the only global stores; everything else is local or URL state |
| httpOnly JWT cookies | XSS-safe per Security-guidelines.md |
| product_attributes EAV table | Handles category-specific specs (bar_weight, spf_value, volume_ml) without schema bloat |
| is_active column | Lets us seed incomplete products without them appearing in shop |
| sessionStorage for logo animation | Fires once per session — not on every page reload |
| IntersectionObserver scroll animations | No animation library dependency; respects prefers-reduced-motion |
| Hardcoded CONCERN_FILTERS removed | Everything pulled from DB — adding a new category requires zero frontend code change |

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Database setup
```sql
CREATE DATABASE eminence_db;
```

### 2. Backend
```bash
cd backend
cp .env.example .env          # edit DB_PASSWORD + JWT_SECRET
npm install
npm run db:migrate            # creates all tables
npm run db:seed               # seeds 12 original serums
npm run db:migrate:002        # adds product_attributes, new columns
npm run db:seed:002           # seeds 12 new products across 6 categories
npm run dev                   # starts on :5000
```

Or all at once after first install:
```bash
npm run db:expand             # runs migrate:002 + seed:002 together
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                   # starts on :5173, proxies /api → :5000
```

### Key URLs
| URL | Page |
|---|---|
| http://localhost:5173 | Homepage |
| http://localhost:5173/shop | All Products |
| http://localhost:5173/shop/serums | Category landing |
| http://localhost:5173/product/luminance-vitamin-c-serum | Product detail |
| http://localhost:5173/wishlist | Wishlist |
| http://localhost:5173/our-science | Science page |
| http://localhost:5000/api/health | API health check |
