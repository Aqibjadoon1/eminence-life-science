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
    // 4K-capable amber oil bottle — warm, premium, on-brand
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80',
    imagePosition: 'center 40%',
  },
  {
    eyebrow: 'New In',
    title: 'Medicated Bars & Face Washes',
    body: 'Clinical cleansing actives for every concern — anti-acne, dry skin, and beyond.',
    cta: { label: 'Shop Cleansers', href: '/shop/soaps' },
    // 4K-capable handmade soap bars — warm kraft tones match the brand
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&q=80',
    imagePosition: 'center 45%',
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
          src={`${tile.image}&w=1600`}
          srcSet={[700, 1200, 1600, 2400, 3840]
            .map((w) => `${tile.image}&w=${w} ${w}w`)
            .join(', ')}
          sizes="(max-width: 768px) 92vw, 44vw"
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
