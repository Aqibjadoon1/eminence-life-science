# Promo/Category Card Hover — Active Spec

> **Status: ACTIVE.** This supersedes BOTH earlier specs for promo/category
> cards — the "frosted-glass overlay" and the "glass-shatter" effect — both of
> which were implemented and then replaced after review. The premium editorial
> hover below is the current interaction.

## Effect
A calm, premium editorial hover — no gimmicks. On hover the card:

1. **Slowly zooms the photo** (scale ~1.05–1.06 over 900–1100ms, ease-out) —
   a long, luxurious glide rather than a fast zoom.
2. **Fades in a thin gold hairline frame** inset ~12–18px around the card
   (like a gallery mat), on-brand gold (`rgba(232,206,142,…)`).
3. **Washes a warm golden light across the photo** — a soft
   `rgba(232,206,142,0.16–0.22)` gradient light fading in (~400ms).
4. **Lifts the content** (heading/CTA) up ~6px.
5. Deepens the card shadow slightly.

The permanent dark gradient overlay stays at rest for text legibility and does
NOT change on hover. CTA buttons keep their directional gold sweep (button spec).

## Implementation
Pure CSS, per card module (`ConcernTiles.module.css`, `PromoBannerPair.module.css`,
`EditorialBanner.module.css`):

- Image zoom: `transition: transform 900–1100ms var(--ease-out)` on the `<img>`,
  `scale(1.05–1.06)` on card hover. (Transform only — GPU-friendly.)
- Gold frame: a `::before` on the card, `inset: 12–18px`, 1px gold border,
  `opacity 0 → 1`, `pointer-events: none`, z-index above content.
- Golden light-wash: a `::after` on the image container, gradient fill,
  `opacity 0 → 1`.
- Content lift: `transform: translateY(-6px)` on the content block.
- Reduced motion: the global `prefers-reduced-motion` rule zeroes transition
  durations, so the hover becomes instant (still functional) — no motion.

## Where it applies
- Homepage promo tiles ("Enhance Your Beauty" — PromoBannerPair)
- Homepage shop-by-category tiles (ConcernTiles)
- Editorial/lifestyle banner (EditorialBanner)

**Do NOT apply** to the smaller product-grid cards (ProductCard, TopPicks, Deal
grid, Bestsellers) — those keep their existing wishlist-icon/badge hover behavior.
