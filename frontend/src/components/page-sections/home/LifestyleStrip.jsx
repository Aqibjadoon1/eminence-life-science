/**
 * Section 9 — Lifestyle / product image strip.
 * 5 square images in a horizontal row — visual breather before footer.
 * Uses real product images from /product-images/ where available.
 */
import styles from './LifestyleStrip.module.css';

const IMAGES = [
  { src: '/product-images/IMG-20260814-WA0020.jpg', alt: 'Eminence Anti Acne Bar' },
  { src: '/product-images/IMG-20260814-WA0027.jpg', alt: 'Eminence Anti Acne Face Wash' },
  { src: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80', alt: 'Eminence serum bottle' },
  { src: '/product-images/IMG-20260814-WA0029.jpg', alt: 'Mastic-E Moisturizer Lotion' },
  { src: '/product-images/IMG-20260814-WA0025.jpg', alt: 'Eminence Sunblock SPF 60' },
];

export default function LifestyleStrip() {
  return (
    <section className={styles.strip} aria-label="Product lifestyle photography">
      <div className={styles.inner}>
        {IMAGES.map((img, i) => (
          <div key={i} className={styles.imgWrap}>
            <img
              src={img.src}
              alt={img.alt}
              width={320}
              height={320}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
