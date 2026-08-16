/**
 * Section 5 — "Top Pick of the Month"
 * Row of 3 product cards. Each card has: image, wishlist heart overlay,
 * subtle gold-outline stock badge (no red/loud style), name, price.
 * GlowWell structure — Eminence brand skin.
 */
import { Link } from 'react-router-dom';
import { useBestSellers } from '../../../hooks/useProducts.js';
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import useCartStore      from '../../../store/useCartStore.js';
import useWishlistStore  from '../../../store/useWishlistStore.js';
import useToastStore     from '../../../store/useToastStore.js';
import styles from './TopPicksSection.module.css';

export default function TopPicksSection() {
  const { data: products, isLoading } = useBestSellers();
  const { ref, isVisible } = useIntersectionObserver();

  // Cap at 3 for this section
  const picks = products.slice(0, 3);

  return (
    <section className={`section ${styles.section}`} aria-labelledby="toppick-heading">
      <div className="container">
        <div ref={ref} className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <span className="eyebrow">Curated for You</span>
          <h2 id="toppick-heading" className={styles.heading}>
            Top Pick of the Month
          </h2>
          <p className={styles.sub}>
            The formulas our clients reach for first — each one backed by real results.
          </p>
        </div>

        <div className={styles.grid} role="list" aria-label="Top picks">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeleton} aria-hidden="true">
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '75%' }} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '45%' }} />
                </div>
              ))
            : picks.map((p, i) => (
                <TopPickCard key={p.id} product={p} delay={i * 100} />
              ))
          }
        </div>

        <div className={styles.cta}>
          <Link to="/shop" className="btn btn-outline">View All Products</Link>
        </div>
      </div>
    </section>
  );
}

function TopPickCard({ product, delay }) {
  const { ref, isVisible } = useIntersectionObserver();
  const addItem      = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const addToast     = useToastStore((s) => s.addToast);
  const wishlisted   = isWishlisted(product.id);

  const isLowStock  = product.stock > 0 && product.stock <= 10;
  const image = product.image_urls?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=70';

  const handleWishlist = (e) => {
    e.preventDefault();
    const added = toggle(product);
    addToast(added ? `Added to wishlist` : `Removed from wishlist`, 'info');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addItem(product.id);
    addToast(`${product.name} added to cart`, 'success');
  };

  return (
    <article
      ref={ref}
      className={`${styles.card} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
      role="listitem"
      aria-label={product.name}
    >
      <Link to={`/product/${product.slug}`} className={styles.imageWrap} tabIndex={-1} aria-hidden="true">
        <img src={image} alt={product.name} width={480} height={580} loading="lazy" className={styles.image} />

        {/* Subtle stock badge — gold-outline pill, never red */}
        {isLowStock && (
          <span className={styles.badge} aria-label="Low Stock">
            Selling Fast
          </span>
        )}

        {/* Wishlist heart */}
        <button
          className={`${styles.wishBtn} ${wishlisted ? styles.wishActive : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={wishlisted}
        >
          <HeartIcon filled={wishlisted} />
        </button>

        {/* Hover overlay */}
        <div className={styles.overlay} aria-hidden="true">
          <button className={styles.quickAdd} onClick={handleAddToCart} tabIndex={0}>
            Add to Cart
          </button>
        </div>
      </Link>

      <div className={styles.body}>
        {product.concern_tags?.length > 0 && (
          <div className={styles.tags}>
            {product.concern_tags.slice(0, 2).map((t) => (
              <span key={t} className="concern-tag">{t}</span>
            ))}
          </div>
        )}

        <Link to={`/product/${product.slug}`} className={styles.name}>
          {product.name}
        </Link>
      </div>
    </article>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
