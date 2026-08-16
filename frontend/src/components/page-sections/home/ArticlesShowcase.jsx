/**
 * ArticlesShowcase — hero-style band with the "All Articles" heading.
 * Sits below the promo tiles on the home page. Desktop shows the wide
 * desktop articles art; mobile swaps to the portrait art (same responsive
 * image pattern as the hero slider).
 */
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './ArticlesShowcase.module.css';

export default function ArticlesShowcase() {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section className={styles.band} aria-labelledby="articles-heading">
      {/* Art — desktop image by default, mobile portrait below 768px */}
      <div className={styles.bg} aria-hidden="true">
        <img
          className={styles.imgDesktop}
          src="/images/articles-desktop.png"
          alt=""
          width={1996}
          height={788}
          loading="lazy"
        />
        <img
          className={styles.imgMobile}
          src="/images/articles-mobile.png"
          alt=""
          width={941}
          height={1672}
          loading="lazy"
        />
        <div className={styles.overlay} />
      </div>

      <div
        ref={ref}
        className={`container ${styles.content} ${isVisible ? styles.visible : ''}`}
      >
        <span className={`eyebrow ${styles.eyebrow}`}>The Journal</span>
        <h2 id="articles-heading" className={styles.heading}>
          All <em>Articles</em>
        </h2>
        <p className={styles.sub}>
          Stories, science, and rituals behind the Eminence collection.
        </p>
      </div>
    </section>
  );
}