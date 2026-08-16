import { Link } from 'react-router-dom';
import useCartStore  from '../../store/useCartStore.js';
import useToastStore from '../../store/useToastStore.js';
import { useIntersectionObserver } from '../../utils/useIntersectionObserver.js';
import styles from './ProductCard.module.css';

/**
 * ProductCard — used in bestselller rows, shop grid, and related products.
 */
export default function ProductCard({ product, priority = false }) {
  const addItem  = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const { ref, isVisible } = useIntersectionObserver();

  if (!product) return null;

  const { name, slug, image_urls, concern_tags, avg_rating, review_count } = product;
  const primaryImage = image_urls?.[0] || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=70';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    await addItem(product.id);
    addToast(`${name} added to cart`, 'success');
  };

  return (
    <article
      ref={ref}
      className={`${styles.card} ${isVisible ? styles.visible : ''}`}
      aria-label={name}
    >
      <Link to={`/product/${slug}`} className={styles.imageWrap} tabIndex={-1} aria-hidden="true">
        <img
          src={primaryImage}
          alt={name}
          width={480}
          height={600}
          loading={priority ? 'eager' : 'lazy'}
          className={styles.image}
        />
        {/* Hover overlay */}
        <div className={styles.overlay} aria-hidden="true">
          <span className={styles.overlayText}>View Details</span>
        </div>
      </Link>

      <div className={styles.body}>
        {/* Concern tags */}
        {concern_tags?.length > 0 && (
          <div className={styles.tags} aria-label="Concern tags">
            {concern_tags.slice(0, 2).map((tag) => (
              <span key={tag} className="concern-tag">{tag}</span>
            ))}
          </div>
        )}

        <Link to={`/product/${slug}`} className={styles.name}>
          {name}
        </Link>

        {/* Rating — minimal, no cluttered star rows */}
        {Number(review_count) > 0 && (
          <div className={styles.rating} aria-label={`${avg_rating} out of 5, ${review_count} reviews`}>
            <StarIcon />
            <span>{Number(avg_rating).toFixed(1)}</span>
            <span className={styles.reviewCount}>({review_count})</span>
          </div>
        )}

        <div className={styles.footer}>
          <button
            className={styles.addBtn}
            onClick={handleAddToCart}
            aria-label={`Add ${name} to cart`}
          >
            <PlusIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
