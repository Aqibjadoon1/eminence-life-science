import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './Testimonials.module.css';

const TESTIMONIALS = [
  {
    quote:
      "After three weeks of the Luminance Serum, my colleagues asked if I'd been on holiday. The glow is unlike anything I've used before — and I've tried everything.",
    author: 'Aisha R.',
    location: 'Lahore',
  },
  {
    quote:
      "The Retinol serum is the first retinol I've used without irritation. My skin texture has transformed completely. I won't go back to anything else.",
    author: 'Sana K.',
    location: 'Karachi',
  },
  {
    quote:
      "What struck me first was the packaging — understated, precise, scientific. The serum itself lives up to exactly that promise.",
    author: 'Hira M.',
    location: 'Islamabad',
  },
];

export default function Testimonials() {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section className={`section ${styles.section}`} aria-labelledby="testimonials-heading">
      <div className="container">
        <div ref={ref} className={`${styles.header} ${isVisible ? styles.visible : ''}`}>
          <span className="eyebrow">Client Stories</span>
          <h2 id="testimonials-heading" className={styles.heading}>
            Results That Speak
          </h2>
        </div>

        <div className={styles.grid} role="list">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial, delay }) {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <figure
      ref={ref}
      className={`${styles.card} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
      role="listitem"
    >
      {/* Opening quote mark */}
      <span className={styles.quoteGlyph} aria-hidden="true">&ldquo;</span>

      <blockquote className={styles.quote}>
        <p>{testimonial.quote}</p>
      </blockquote>

      <figcaption className={styles.attribution}>
        <span className={styles.author}>{testimonial.author}</span>
        <span className={styles.location}>{testimonial.location}</span>
      </figcaption>

      {/* Bottom gold rule */}
      <div className={styles.rule} aria-hidden="true" />
    </figure>
  );
}
