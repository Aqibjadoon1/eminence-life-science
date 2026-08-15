/**
 * /shop/:categorySlug — Category landing page.
 * Pulls category meta (name, description, image) and its products from the DB.
 * No hardcoded category knowledge anywhere in this file.
 */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CategoryService } from '../services/CategoryService.js';
import { useEffect } from 'react';
import ProductCard from '../components/cards/ProductCard.jsx';
import { useIntersectionObserver } from '../utils/useIntersectionObserver.js';
import { SORT_OPTIONS } from '../config.js';
import { canonicalUrl } from '../utils/seo.js';
import styles from './CategoryPage.module.css';

export default function CategoryPage() {
  const { categorySlug } = useParams();

  const [category, setCategory]   = useState(null);
  const [products, setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [sort, setSort]           = useState('newest');
  const [page, setPage]           = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const { ref: heroRef, isVisible: heroVisible } = useIntersectionObserver();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    CategoryService.getProductsByCategory(categorySlug, { sort, page, limit: 12 })
      .then((res) => {
        setCategory(res.category);
        setProducts(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [categorySlug, sort, page]);

  if (error) {
    return (
      <>
        {/* SPA soft-404 — keep out of the index */}
        <Helmet>
          <title>Category Not Found — Eminence Life Science</title>
          <meta name="robots" content="noindex,follow" />
        </Helmet>
        <div className={`container ${styles.error}`}>
          <p>Category not found.</p>
          <Link to="/shop" className="btn btn-outline">Back to Shop</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category?.name ? `${category.name} — ` : ''}Eminence Life Science</title>
        <meta name="description" content={category?.description || ''} />
        {/* Self-referencing canonical, sort/page params stripped */}
        <link rel="canonical" href={canonicalUrl(`/shop/${categorySlug}`)} />
      </Helmet>

      {/* Hero banner */}
      <section className={styles.hero} aria-label={`${category?.name} category`}>
        {category?.image_url && (
          <div className={styles.heroBg} aria-hidden="true">
            <img
              src={category.image_url}
              alt=""
              width={1600}
              height={500}
            />
            <div className={styles.heroOverlay} />
          </div>
        )}
        <div className={`container ${styles.heroContent}`} ref={heroRef}>
          <span className={`eyebrow ${styles.heroEyebrow}`}>The Collection</span>
          <h1 className={`${styles.heroTitle} ${heroVisible ? styles.visible : ''}`}>
            {isLoading ? ' ' : category?.name}
          </h1>
          {category?.description && (
            <p className={`${styles.heroDesc} ${heroVisible ? styles.visible : ''}`}>
              {category.description}
            </p>
          )}
        </div>
      </section>

      {/* Products */}
      <div className={`container ${styles.content}`}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <p className={styles.count} aria-live="polite">
            {!isLoading && pagination
              ? `${pagination.total} ${pagination.total === 1 ? 'product' : 'products'}`
              : ''}
          </p>
          <div className={styles.sortWrap}>
            <label htmlFor="cat-sort" className={styles.sortLabel}>Sort:</label>
            <select
              id="cat-sort"
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

        {/* Grid */}
        {isLoading ? (
          <div className={styles.grid} aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} aria-hidden="true">
                <div className={`skeleton ${styles.skeletonImg}`} />
                <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '70%' }} />
                <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '40%' }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No products yet</p>
            <p className={styles.emptyText}>
              This collection is coming soon. Browse all products in the meantime.
            </p>
            <Link to="/shop" className="btn btn-outline">Shop All</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className={styles.pagination}>
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
      </div>
    </>
  );
}
