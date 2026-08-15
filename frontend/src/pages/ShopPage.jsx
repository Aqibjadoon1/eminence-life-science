import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useProducts } from '../hooks/useProducts.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useCategories, useCategoryAttributes } from '../hooks/useCategories.js';
import ProductCard from '../components/cards/ProductCard.jsx';
import { SORT_OPTIONS } from '../config.js';
import { canonicalUrl } from '../utils/seo.js';
import styles from './ShopPage.module.css';

// Attribute keys we render as human-readable filter labels
const ATTR_LABEL_MAP = {
  skin_type:          'Skin Type',
  spf_value:          'SPF',
  format:             'Format',
  bar_weight_gm:      'Bar Weight',
  volume_ml:          'Volume',
  non_comedogenic:    'Non-Comedogenic',
  dermatologist_tested: 'Dermatologist Tested',
  key_benefit:        'Benefit',
};

// Attribute keys that are not useful as filters
const ATTR_FILTER_BLACKLIST = new Set([
  'manufacturer', 'use_area', 'use_frequency', 'coal_tar_pct',
  'oil_count', 'ph_value', 'key_complex', 'pa_rating', 'spf_spectrum',
]);

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search,   setSearch]   = useState(searchParams.get('search')   || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort,     setSort]     = useState(searchParams.get('sort')      || 'newest');
  const [page,     setPage]     = useState(1);
  const [attrFilters, setAttrFilters] = useState({}); // { attr_key: attr_value }

  const debouncedSearch = useDebounce(search, 400);
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: categoryAttrs } = useCategoryAttributes(category);

  // Sync URL params when filters change
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.search   = debouncedSearch;
    if (category)        params.category = category;
    if (sort !== 'newest') params.sort   = sort;
    setSearchParams(params, { replace: true });
    setPage(1);
  }, [debouncedSearch, category, sort, setSearchParams]);

  // Build API query — only one attr filter sent at a time (first active one)
  const firstAttr = Object.entries(attrFilters).find(([, v]) => v);
  const productQuery = {
    search:    debouncedSearch,
    category,
    sort,
    page,
    limit: 12,
    ...(firstAttr ? { attr_key: firstAttr[0], attr_value: firstAttr[1] } : {}),
  };

  const { data: products, pagination, isLoading } = useProducts(productQuery);

  const handleCategory = (slug) => {
    setCategory(slug);
    setAttrFilters({});
    setPage(1);
  };

  const handleAttrFilter = (key, value) => {
    setAttrFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? '' : value, // toggle
    }));
    setPage(1);
  };

  const clearAll = () => {
    setCategory('');
    setSearch('');
    setAttrFilters({});
    setPage(1);
  };

  const activeCategory = categories.find((c) => c.slug === category);
  const filterableAttrs = Object.entries(categoryAttrs).filter(
    ([key]) => !ATTR_FILTER_BLACKLIST.has(key) && categoryAttrs[key]?.length > 1
  );

  return (
    <>
      <Helmet>
        <title>
          {activeCategory ? `${activeCategory.name} — ` : ''}Shop — Eminence Life Science
        </title>
        <meta
          name="description"
          content={
            activeCategory?.description ||
            'Browse our full collection of premium skincare — serums, soaps, face washes, emollients, and sunblock.'
          }
        />
        {/* Canonical to the unfiltered shop — filter/sort/search params are stripped */}
        <link rel="canonical" href={canonicalUrl('/shop')} />
      </Helmet>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <span className="eyebrow">The Collection</span>
          <h1 className={styles.pageTitle}>
            {activeCategory ? activeCategory.name : 'All Products'}
          </h1>
          {activeCategory?.description && (
            <p className={styles.pageDesc}>{activeCategory.description}</p>
          )}
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside className={styles.sidebar} aria-label="Shop filters">

          {/* Category filter — from DB */}
          <div className={styles.filterGroup}>
            <h3 className={styles.filterHeading}>Category</h3>
            <ul className={styles.filterList} role="list">
              <li>
                <button
                  className={`${styles.filterBtn} ${!category ? styles.active : ''}`}
                  onClick={() => handleCategory('')}
                  aria-pressed={!category}
                >
                  All Products
                  <span className={styles.filterCount}>
                    {categories.reduce((s, c) => s + (c.product_count || 0), 0)}
                  </span>
                </button>
              </li>
              {catsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <li key={i}>
                      <div className={`skeleton ${styles.skeletonFilter}`} aria-hidden="true" />
                    </li>
                  ))
                : categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        className={`${styles.filterBtn} ${category === cat.slug ? styles.active : ''}`}
                        onClick={() => handleCategory(cat.slug)}
                        aria-pressed={category === cat.slug}
                      >
                        {cat.name}
                        <span className={styles.filterCount}>{cat.product_count}</span>
                      </button>
                    </li>
                  ))
              }
            </ul>
          </div>

          {/* Adaptive attribute filters — only shown when a category is selected
              and that category has filterable attributes */}
          {category && filterableAttrs.length > 0 && (
            filterableAttrs.map(([key, values]) => (
              <div key={key} className={styles.filterGroup}>
                <h3 className={styles.filterHeading}>
                  {ATTR_LABEL_MAP[key] || key.replace(/_/g, ' ')}
                </h3>
                <ul className={styles.filterList} role="list">
                  {values.map((val) => (
                    <li key={val}>
                      <button
                        className={`${styles.filterBtn} ${attrFilters[key] === val ? styles.active : ''}`}
                        onClick={() => handleAttrFilter(key, val)}
                        aria-pressed={attrFilters[key] === val}
                      >
                        {val}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}

          {/* Clear all */}
          {(category || search || Object.values(attrFilters).some(Boolean)) && (
            <button className={styles.clearBtn} onClick={clearAll}>
              Clear All Filters
            </button>
          )}
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className={styles.main}>
          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <SearchIcon />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className={styles.searchInput}
                aria-label="Search products"
              />
              {search && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >×</button>
              )}
            </div>

            <div className={styles.sortWrap}>
              <label htmlFor="sort-select" className={styles.sortLabel}>Sort:</label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          {!isLoading && pagination && (
            <p className={styles.resultCount} aria-live="polite">
              {pagination.total} {pagination.total === 1 ? 'product' : 'products'}
              {activeCategory && ` in ${activeCategory.name}`}
            </p>
          )}

          {/* Active attribute filter chips */}
          {Object.entries(attrFilters).some(([, v]) => v) && (
            <div className={styles.activeFilters} aria-label="Active filters">
              {Object.entries(attrFilters)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <button
                    key={k}
                    className={styles.filterChip}
                    onClick={() => handleAttrFilter(k, v)}
                    aria-label={`Remove filter: ${v}`}
                  >
                    {ATTR_LABEL_MAP[k] || k}: {v} ×
                  </button>
                ))}
            </div>
          )}

          {/* Product grid */}
          {isLoading ? (
            <div className={styles.grid} aria-busy="true" aria-label="Loading products">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} aria-hidden="true">
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '75%' }} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '45%' }} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No products found</p>
              <p className={styles.emptyText}>Try adjusting your filters or search term.</p>
              <button className="btn btn-outline" onClick={clearAll}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className={styles.pagination} aria-label="Pagination">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(i + 1)}
                  aria-label={`Page ${i + 1}`}
                  aria-current={page === i + 1 ? 'page' : undefined}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
