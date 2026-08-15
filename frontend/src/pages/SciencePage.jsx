import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../utils/useIntersectionObserver.js';
import { canonicalUrl } from '../utils/seo.js';
import styles from './SciencePage.module.css';

const PILLARS = [
  {
    title: 'Clinical Concentration',
    body: 'Every active ingredient is dosed at the concentration proven effective in peer-reviewed clinical trials — not the trace amounts found in mass-market formulas.',
    icon: <BeakerIcon />,
  },
  {
    title: 'Pharmaceutical-Grade Sourcing',
    body: 'We source our raw actives from ISO-certified suppliers, applying the same quality standards used in pharmaceutical manufacturing.',
    icon: <CertIcon />,
  },
  {
    title: 'Stability Engineering',
    body: 'Vitamin C oxidises. Retinol degrades. Every formula is stability-tested for 24 months to ensure the active you read on the label is the active that reaches your skin.',
    icon: <FlaskIcon />,
  },
  {
    title: 'Clean Without Compromise',
    body: 'No parabens, no sulphates, no unnecessary fragrance. Clean formulation does not mean less effective — it means a more precise, lower-irritation delivery system.',
    icon: <LeafIcon />,
  },
];

const TIMELINE = [
  { year: '2019', event: 'Founded in Lahore with a mandate to bring clinical-grade skincare to Pakistan.' },
  { year: '2020', event: 'First laboratory partnership established with a Karachi-based pharmaceutical facility.' },
  { year: '2021', event: 'Launched the inaugural Brightening collection — first formula with 15% L-Ascorbic Acid produced locally.' },
  { year: '2022', event: 'Expanded to Anti-Aging range following 18 months of retinol stabilisation research.' },
  { year: '2023', event: 'Introduced microbiome-first Barrier Repair line in collaboration with a Swiss biotech active supplier.' },
  { year: '2024', event: 'Became the first Pakistani skincare brand to publish full clinical efficacy data for all hero SKUs.' },
];

export default function SciencePage() {
  const { ref: heroRef, isVisible: heroVisible } = useIntersectionObserver();

  return (
    <>
      <Helmet>
        <title>Our Science — Eminence Life Science</title>
        <meta name="description" content="The philosophy and methodology behind Eminence Life Science formulations. Clinical concentrations, pharmaceutical-grade sourcing, stability-tested actives." />
        <link rel="canonical" href={canonicalUrl('/our-science')} />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <img
            src="/images/3.png"
            alt=""
            width={1672}
            height={941}
          />
          <div className={styles.heroOverlay} />
        </div>
        <div className={`container ${styles.heroContent}`} ref={heroRef}>
          <span className={`eyebrow ${styles.heroEyebrow}`}>Our Philosophy</span>
          <h1 className={`${styles.heroTitle} ${heroVisible ? styles.visible : ''}`}>
            Where Biology<br /><em>Meets Beauty</em>
          </h1>
          <p className={`${styles.heroSub} ${heroVisible ? styles.visible : ''}`}>
            Eminence Life Science was founded on a single conviction: that Pakistani skin deserves
            the same clinical-grade care available to consumers in London and New York — at a price
            that doesn&rsquo;t require an import premium.
          </p>
        </div>
      </section>

      {/* Formulation pillars */}
      <section className={`section ${styles.pillarsSection}`} aria-labelledby="pillars-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="eyebrow">The Standards</span>
            <h2 id="pillars-heading" className={styles.sectionTitle}>Four Pillars of Formulation</h2>
          </div>
          <div className={styles.pillarsGrid}>
            {PILLARS.map((p, i) => <PillarCard key={i} pillar={p} delay={i * 80} />)}
          </div>
        </div>
      </section>

      {/* Lab imagery split */}
      <section className={`section ${styles.labSection}`}>
        <div className={`container ${styles.labInner}`}>
          <LabImage
            src="/images/1.png"
            alt="Eminence product and laboratory imagery"
            width={1537}
            height={1023}
          />
          <LabImage
            src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=900&q=80"
            alt="Laboratory glassware and active ingredient bottles"
          />
          <LabImage
            src="https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=900&q=80"
            alt="Serum dropper bottle on marble surface"
          />
        </div>
      </section>

      {/* Timeline */}
      <section className={`section ${styles.timelineSection}`} aria-labelledby="timeline-heading">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className="eyebrow">Our Journey</span>
            <h2 id="timeline-heading" className={styles.sectionTitle}>From Lab to Ritual</h2>
          </div>
          <div className={styles.timeline} role="list">
            {TIMELINE.map((item, i) => <TimelineItem key={i} item={item} delay={i * 80} />)}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className={styles.ctaBand}>
        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.ctaTitle}>Ready to Start Your Ritual?</h2>
          <Link to="/shop" className="btn btn-primary">Discover the Collection</Link>
        </div>
      </section>
    </>
  );
}

function PillarCard({ pillar, delay }) {
  const { ref, isVisible } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`${styles.pillarCard} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className={styles.pillarIcon} aria-hidden="true">{pillar.icon}</span>
      <h3 className={styles.pillarTitle}>{pillar.title}</h3>
      <p className={styles.pillarBody}>{pillar.body}</p>
    </div>
  );
}

function LabImage({ src, alt, width = 600, height = 400 }) {
  const { ref, isVisible } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`${styles.labImgWrap} ${isVisible ? styles.visible : ''}`}
    >
      <img src={src} alt={alt} width={width} height={height} loading="lazy" />
    </div>
  );
}

function TimelineItem({ item, delay }) {
  const { ref, isVisible } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`${styles.timelineItem} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
      role="listitem"
    >
      <span className={styles.timelineYear}>{item.year}</span>
      <span className={styles.timelineDot} aria-hidden="true" />
      <p className={styles.timelineEvent}>{item.event}</p>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */
function BeakerIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3h6v8l3 9H6l3-9V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>;
}
function CertIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
}
function FlaskIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 2v7.31L5.5 17A5 5 0 0 0 10.5 22h3a5 5 0 0 0 5-5.69L14 9.31V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/></svg>;
}
function LeafIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 8C8 10 5.9 16.17 3.82 19.5C2 16 4 9 12 7c2.19-.56 4.5-.64 7-1l-2 2z"/></svg>;
}
