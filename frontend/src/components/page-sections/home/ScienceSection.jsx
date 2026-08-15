import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './ScienceSection.module.css';

const ACTIVES = [
  { name: 'Retinol',          desc: 'Accelerates cell turnover, reducing lines and improving firmness.' },
  { name: 'Vitamin C',        desc: 'Neutralises free radicals and brightens uneven pigmentation.' },
  { name: 'Peptide Complex',  desc: 'Signals collagen synthesis for visibly firmer, denser skin.' },
  { name: 'Hyaluronic Acid',  desc: 'Binds up to 1,000× its weight in water for sustained plumping.' },
];

export default function ScienceSection() {
  const { ref: textRef, isVisible: textVisible } = useIntersectionObserver();
  const { ref: imgRef,  isVisible: imgVisible  } = useIntersectionObserver();

  return (
    <section className={`section ${styles.section}`} aria-labelledby="science-heading">
      <div className={`container ${styles.inner}`}>

        {/* Image side */}
        <div
          ref={imgRef}
          className={`${styles.imageCol} ${imgVisible ? styles.visible : ''}`}
        >
          <div className={styles.imageFrame}>
            <img
              src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=900&q=80"
              alt="Laboratory close-up showing serum formulation process"
              width={640}
              height={720}
              loading="lazy"
              className={styles.labImg}
            />
            {/* Floating stat card */}
            <div className={styles.statCard} aria-hidden="true">
              <span className={styles.statNum}>12+</span>
              <span className={styles.statLabel}>Clinical Actives</span>
            </div>
          </div>
        </div>

        {/* Text side */}
        <div
          ref={textRef}
          className={`${styles.textCol} ${textVisible ? styles.visible : ''}`}
        >
          <span className="eyebrow">The Science</span>
          <h2 id="science-heading" className={styles.heading}>
            Formulated Where<br />
            <em>Biology Meets Beauty</em>
          </h2>
          <p className={styles.body}>
            Every Eminence serum begins in a certified laboratory. We source pharmaceutical-grade
            actives, test every concentration for efficacy and safety, and refine until the
            formulation delivers measurable, visible results — not just pleasant textures.
          </p>

          {/* Active ingredients list */}
          <ul className={styles.activesList} aria-label="Key active ingredients">
            {ACTIVES.map((active) => (
              <li key={active.name} className={styles.activesItem}>
                <span className={styles.activeDot} aria-hidden="true" />
                <div>
                  <strong className={styles.activeName}>{active.name}</strong>
                  <span className={styles.activeDesc}>{active.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          <Link to="/our-science" className={`btn btn-outline ${styles.cta}`}>
            Read Our Formulation Story
          </Link>
        </div>

      </div>
    </section>
  );
}
