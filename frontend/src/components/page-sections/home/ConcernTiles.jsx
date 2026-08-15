import { Link } from 'react-router-dom';
import { useCategories } from '../../../hooks/useCategories.js';
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './ConcernTiles.module.css';

// Fallback images if a category has no image_url set
const FALLBACK_IMAGES = {
  serums:        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=75',
  brightening:   'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=1920&q=90',
  'anti-aging':  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=75',
  hydration:     'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=90',
  'barrier-repair': 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&q=75',
  soaps:         'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=75',
  'face-washes': 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&q=75',
  emollients:    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=75',
  sunblock:      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=75',
  'hair-care':   'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=75',
  medicated:     'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=75',
};

export default function ConcernTiles() {
  const { data: categories, isLoading } = useCategories();
  const { ref, isVisible } = useIntersectionObserver();

  // Show only the primary categories (those with products) — cap at 6 tiles
  const displayCategories = categories
    .filter((c) => c.product_count > 0)
    .slice(0, 6);

  return (
    <section className={`section ${styles.section}`} aria-labelledby="concern-heading">
      <div className="container">
        <div ref={ref} className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <span className="eyebrow">Shop by Category</span>
          <h2 id="concern-heading" className={styles.heading}>
            Find Your Ritual
          </h2>
        </div>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`skeleton ${styles.skeletonTile}`} aria-hidden="true" />
            ))}
          </div>
        ) : (
          <div
            className={styles.grid}
            style={{
              gridTemplateColumns: `repeat(${Math.min(displayCategories.length, 3)}, 1fr)`
            }}
            role="list"
          >
            {displayCategories.map((cat, i) => (
              <CategoryTile key={cat.id} category={cat} delay={i * 80} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryTile({ category, delay }) {
  const { ref, isVisible } = useIntersectionObserver();
  const image = category.image_url || FALLBACK_IMAGES[category.slug] || FALLBACK_IMAGES.serums;

  return (
    <Link
      ref={ref}
      to={`/shop/${category.slug}`}
      className={`${styles.tile} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
      role="listitem"
      aria-label={`Shop ${category.name} — ${category.product_count} product${category.product_count !== 1 ? 's' : ''}`}
    >
      {/* Background image */}
      <div className={styles.tileImg} aria-hidden="true">
        <img src={image} alt="" width={600} height={700} loading="lazy" />
        <div className={styles.tileOverlay} />
      </div>

      {/* Content */}
      <div className={styles.tileContent}>
        <span className={`eyebrow ${styles.tileEyebrow}`}>
          {category.product_count} product{category.product_count !== 1 ? 's' : ''}
        </span>
        <h3 className={styles.tileHeadline}>{category.name}</h3>
        {category.description && (
          <p className={styles.tileBody}>
            {category.description.length > 80
              ? category.description.slice(0, 80) + '…'
              : category.description}
          </p>
        )}
        <span className={styles.tileLink}>
          Shop Now <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}
