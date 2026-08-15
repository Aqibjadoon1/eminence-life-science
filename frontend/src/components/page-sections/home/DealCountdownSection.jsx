/**
 * Section 7 — "Limited Time Deal"
 * Heading + sub-copy + live countdown timer (days:hrs:min:sec, gold digits)
 * + "Explore More" link + 6-product grid.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '../../../hooks/useProducts.js';
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import { formatPrice } from '../../../utils/formatting.js';
import useCartStore     from '../../../store/useCartStore.js';
import useWishlistStore from '../../../store/useWishlistStore.js';
import useToastStore    from '../../../store/useToastStore.js';
import styles from './DealCountdownSection.module.css';

// Deal ends 7 days from now — recalculate at module load
function getDealEnd() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 0);
  return d;
}
const DEAL_END = getDealEnd();

function useCountdown(targetDate) {
  const calc = () => {
    const diff = Math.max(0, targetDate - Date.now());
    return {
      days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

export default function DealCountdownSection() {
  const { data: products, isLoading } = useFeaturedProducts();
  const { ref, isVisible } = useIntersectionObserver();
  const time = useCountdown(DEAL_END);

  const display = products.slice(0, 6);

  return (
    <section className={`section ${styles.section}`} aria-labelledby="deal-heading">
      <div className="container">
        {/* Header + countdown */}
        <div ref={ref} className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <div className={styles.headerText}>
            <span className="eyebrow">Limited Time</span>
            <h2 id="deal-heading" className={styles.heading}>
              Exclusive Deals
            </h2>
            <p className={styles.sub}>
              Hand-picked formulas at special pricing — offer ends when the timer does.
            </p>
          </div>

          <div className={styles.timerBlock} aria-label="Time remaining for deal">
            {[
              { value: time.days,    label: 'Days' },
              { value: time.hours,   label: 'Hrs' },
              { value: time.minutes, label: 'Min' },
              { value: time.seconds, label: 'Sec' },
            ].map((unit, i) => (
              <div key={unit.label} className={styles.timerUnit}>
                {i > 0 && <span className={styles.timerColon} aria-hidden="true">:</span>}
                <div className={styles.timerBox}>
                  <span
                    className={styles.timerDigit}
                    aria-live={unit.label === 'Sec' ? 'polite' : 'off'}
                    aria-label={`${unit.value} ${unit.label}`}
                  >
                    {String(unit.value).padStart(2, '0')}
                  </span>
                  <span className={styles.timerLabel}>{unit.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className={styles.grid}>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} aria-hidden="true">
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '75%' }} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '45%' }} />
                </div>
              ))
            : display.map((p, i) => <DealCard key={p.id} product={p} delay={i * 60} />)
          }
        </div>

        <div className={styles.exploreCta}>
          <Link to="/shop" className="btn btn-outline">Explore More →</Link>
        </div>
      </div>
    </section>
  );
}

function DealCard({ product, delay }) {
  const { ref, isVisible } = useIntersectionObserver();
  const addItem    = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const addToast   = useToastStore((s) => s.addToast);
  const wishlisted = isWishlisted(product.id);
  const isOnSale   = !!product.sale_price;
  const displayPrice = product.sale_price ?? product.price;
  const image = product.image_urls?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=70';

  return (
    <article
      ref={ref}
      className={`${styles.card} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Link to={`/product/${product.slug}`} className={styles.imgWrap} tabIndex={-1} aria-hidden="true">
        <img src={image} alt={product.name} width={400} height={480} loading="lazy" className={styles.img} />

        {/* Gold-outline sale badge — NO red */}
        {isOnSale && (
          <span className={styles.saleBadge}>
            -{Math.round((1 - product.sale_price / product.price) * 100)}%
          </span>
        )}

        <button
          className={`${styles.wishBtn} ${wishlisted ? styles.wishActive : ''}`}
          onClick={(e) => { e.preventDefault(); toggle(product); addToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info'); }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-pressed={wishlisted}
        >
          <HeartIcon filled={wishlisted} />
        </button>
      </Link>

      <div className={styles.body}>
        <Link to={`/product/${product.slug}`} className={styles.name}>{product.name}</Link>
        <div className={styles.priceRow}>
          {isOnSale ? (
            <>
              <span className={`price price-sale`} style={{ fontSize: '15px', fontWeight: 500, color: 'var(--charcoal)' }}>
                {formatPrice(displayPrice)}
              </span>
              <span className="price price-original">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="price">{formatPrice(displayPrice)}</span>
          )}
        </div>
        <button
          className={styles.addBtn}
          onClick={() => { addItem(product.id); addToast(`${product.name} added to cart`, 'success'); }}
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
