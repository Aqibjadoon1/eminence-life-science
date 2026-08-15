import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './EditorialBanner.module.css';

export default function EditorialBanner() {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section
      ref={ref}
      className={`${styles.banner} ${isVisible ? styles.visible : ''}`}
      aria-label="Editorial feature"
    >
      {/* Full-bleed background */}
      <div className={styles.bg} aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1600&q=80"
          alt=""
          width={1600}
          height={800}
          loading="lazy"
        />
        <div className={styles.overlay} />
      </div>

      {/* Text block */}
      <div className={`container ${styles.content}`}>
        <div className={styles.textBlock}>
          <span className={`eyebrow ${styles.eyebrow}`}>New Arrival</span>
          <h2 className={styles.heading}>
            The Luminance<br />
            <em>Vitamin C Ritual</em>
          </h2>
          <p className={styles.body}>
            Our most luminous formula yet. 15% stabilised L-Ascorbic Acid with Ferulic Acid
            for a glow that speaks before you do.
          </p>
          <Link to="/product/luminance-vitamin-c-serum" className={`btn btn-primary ${styles.cta}`}>
            Discover the Serum
          </Link>
        </div>
      </div>
    </section>
  );
}
