import { Link } from 'react-router-dom';
import { useBestSellers } from '../../../hooks/useProducts.js';
import ProductCard from '../../cards/ProductCard.jsx';
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './BestsellersSection.module.css';

export default function BestsellersSection() {
  const { data: products, isLoading } = useBestSellers();
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section className={`section ${styles.section}`} aria-labelledby="bestsellers-heading">
      <div className="container">
        {/* Header */}
        <div ref={ref} className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <span className="eyebrow">The Edit</span>
          <h2 id="bestsellers-heading" className={styles.heading}>
            Our Bestselling Serums
          </h2>
          <p className={styles.sub}>
            The formulas our clients return to. Each one a distillation of years of clinical research.
          </p>
        </div>

        {/* Product grid */}
        <div className={styles.grid} role="list" aria-label="Bestselling products">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.skeleton} aria-hidden="true">
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '80%' }} />
                  <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '50%' }} />
                </div>
              ))
            : products.map((p) => (
                <div key={p.id} role="listitem">
                  <ProductCard product={p} />
                </div>
              ))
          }
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <Link to="/shop" className="btn btn-outline">
            View All Serums
          </Link>
        </div>
      </div>
    </section>
  );
}
