/**
 * ArticlesShowcase — "All Articles" editorial block.
 * Header (eyebrow + serif heading + sub-line) sits ABOVE the art, never on
 * top of it. The pictures render at their natural aspect ratio — full art,
 * uncropped and sharp. Desktop shows the wide desktop art; mobile swaps to
 * the portrait art (same responsive pattern as the hero slider).
 */
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './ArticlesShowcase.module.css';

export default function ArticlesShowcase() {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section className={styles.section} aria-labelledby="articles-heading">
      {/* Header — above the picture */}
      <div
        ref={ref}
        className={`container ${styles.header} ${isVisible ? styles.visible : ''}`}
      >
        <span className="eyebrow">The Journal</span>
        <h2 id="articles-heading" className={styles.heading}>
          All <em>Articles</em>
        </h2>
        <p className={styles.sub}>
          Stories, science, and rituals behind the Eminence collection.
        </p>
      </div>

      {/* Art — full picture, natural aspect ratio, never cropped */}
      <div className={styles.art} aria-hidden="true">
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
      </div>
    </section>
  );
}