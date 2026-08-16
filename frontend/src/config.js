/**
 * Global application configuration.
 * All API endpoints and environment-based constants live here.
 * Components must NEVER contain hardcoded URLs.
 */

export const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API = {
  // Auth
  REGISTER:       `${BASE_URL}/auth/register`,
  LOGIN:          `${BASE_URL}/auth/login`,
  LOGOUT:         `${BASE_URL}/auth/logout`,
  ME:             `${BASE_URL}/auth/me`,

  // Products
  PRODUCTS:             `${BASE_URL}/products`,
  PRODUCT:              (slug) => `${BASE_URL}/products/${slug}`,
  RELATED:              (slug) => `${BASE_URL}/products/${slug}/related`,
  FEATURED:             `${BASE_URL}/products/featured`,
  BESTSELLERS:          `${BASE_URL}/products/bestsellers`,
  PRODUCTS_BY_CATEGORY: (slug) => `${BASE_URL}/products/by-category/${slug}`,
  CATEGORY_ATTRIBUTES:  (slug) => `${BASE_URL}/products/attributes/${slug}`,

  // Categories
  CATEGORIES:     `${BASE_URL}/categories`,

  // Cart
  CART:           `${BASE_URL}/cart`,
  CART_ITEM:      (id)    => `${BASE_URL}/cart/${id}`,
  CART_MERGE:     `${BASE_URL}/cart/merge`,

  // Orders
  ORDERS:         `${BASE_URL}/orders`,
  MY_ORDERS:      `${BASE_URL}/orders/mine`,
  ORDER:          (id)    => `${BASE_URL}/orders/${id}`,

  // Addresses
  ADDRESSES:      `${BASE_URL}/addresses`,

  // Newsletter
  NEWSLETTER:     `${BASE_URL}/newsletter/subscribe`,

  // Public config
  WHATSAPP_ORDER: `${BASE_URL}/config/whatsapp-order`,

  // Admin (products only — guarded by requireAdmin)
  ADMIN_PRODUCTS:       `${BASE_URL}/admin/products`,
  ADMIN_PRODUCT:        (id) => `${BASE_URL}/admin/products/${id}`,
  ADMIN_PRODUCT_ACTIVE: (id) => `${BASE_URL}/admin/products/${id}/active`,
};

export const SORT_OPTIONS = [
  { label: 'Newest',        value: 'newest' },
  { label: 'Most Reviewed', value: 'popular' },
];

// Static concern tags used only as fallback / serum-era legacy
// The ShopPage now loads categories dynamically from /api/categories
export const LEGACY_CONCERN_FILTERS = [
  { label: 'All',            value: '' },
  { label: 'Brightening',    value: 'brightening' },
  { label: 'Anti-Aging',     value: 'anti-aging' },
  { label: 'Hydration',      value: 'hydration' },
  { label: 'Barrier Repair', value: 'barrier-repair' },
];
