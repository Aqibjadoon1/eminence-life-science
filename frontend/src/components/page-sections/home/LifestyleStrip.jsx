/**
 * Section 9 — Lifestyle / product image strip.
 * 5 square images in a horizontal row — visual breather before footer.
 * Colorful premium product photography matching the gold/ivory brand.
 */
import styles from './LifestyleStrip.module.css';

const IMAGES = [
  {
    // Skincare bottles with scattered rose petals — clean, soft color pop
    src: 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?auto=format&fit=crop&q=80',
    alt: 'Skincare serum and treatment bottles with rose petals',
  },
  {
    // Amber glass oil bottles with matcha and charcoal jars — warm, premium
    src: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&q=80',
    alt: 'Amber glass oil bottles and cream jars on a beige backdrop',
  },
  {
    // Skincare set on soft peach towels with palm fronds — warm spa mood
    src: 'https://images.unsplash.com/photo-1601049676869-702ea24cfd58?auto=format&fit=crop&q=80',
    alt: 'Skincare bottles on soft peach spa towels',
  },
  {
    // Hands applying serum with a glass dropper — editorial product shot
    src: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80',
    alt: 'Applying face serum with a glass dropper',
  },
  {
    // Colorful beauty flat lay on peach — vibrant, on-palette pop of colour
    src: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80',
    alt: 'Premium beauty products flat lay on a soft peach background',
  },
];

const SIZES = '(max-width: 768px) 30vw, 18vw';

export default function LifestyleStrip() {
  return (
    <section className={styles.strip} aria-label="Product lifestyle photography">
      <div className={styles.inner}>
        {IMAGES.map((img, i) => (
          <div key={i} className={styles.imgWrap}>
            <img
              src={`${img.src}&w=800`}
              srcSet={[320, 640, 1200, 2400, 3840]
                .map((w) => `${img.src}&w=${w} ${w}w`)
                .join(', ')}
              sizes={SIZES}
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
