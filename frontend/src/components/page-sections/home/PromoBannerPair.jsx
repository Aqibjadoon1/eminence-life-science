/**
 * Section 6 — "Enhance Your Beauty" — Two promo tiles side by side.
 * GlowWell two-tile layout — Eminence brand skin.
 */
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './PromoBannerPair.module.css';

const TILES = [
  {
    eyebrow: "This Week's Edit",
    title: 'Bestselling Serums',
    body: 'Our most-loved vitamin C, retinol, and peptide formulas — chosen by your skin.',
    cta: { label: 'Shop Serums', href: '/shop/brightening' },
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&q=80',
    imagePosition: 'center 30%',
  },
  {
    eyebrow: 'New In',
    title: 'Medicated Bars & Face Washes',
    body: 'Clinical cleansing actives for every concern — anti-acne, dry skin, and beyond.',
    cta: { label: 'Shop Cleansers', href: '/shop/soaps' },
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=900&q=80',
    imagePosition: 'center 40%',
  },
];

export default function PromoBannerPair() {
  return (
    <section className={styles.section} aria-labelledby="promo-heading">
      <div className="container">
        <h2 id="promo-heading" className="sr-only">Featured Categories</h2>
        <div className={styles.grid}>
          {TILES.map((tile, i) => (
            <PromoTile key={i} tile={tile} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PromoTile({ tile, delay }) {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`${styles.tile} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={styles.tileBg} aria-hidden="true">
        <img
          src={tile.image}
          alt=""
          width={700}
          height={480}
          loading="lazy"
          style={{ objectPosition: tile.imagePosition }}
        />
        <div className={styles.tileOverlay} />
      </div>

      <div className={styles.tileContent}>
        <span className={`eyebrow ${styles.tileEyebrow}`}>{tile.eyebrow}</span>
        <h3 className={styles.tileTitle}>{tile.title}</h3>
        <p className={styles.tileBody}>{tile.body}</p>
        <Link to={tile.cta.href} className={`btn ${styles.tileCta}`}>
          {tile.cta.label}
        </Link>
      </div>
    </div>
  );
}
