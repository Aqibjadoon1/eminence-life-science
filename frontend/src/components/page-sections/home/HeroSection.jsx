/**
 * HeroSection — GlowWell-structure slider reskinned in Eminence brand.
 * 2–3 slides with auto-advance (5s), manual dot/arrow nav.
 * LogoMark animation fires once on first load only (sessionStorage guard).
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LogoMark from '../../specials/LogoMark.jsx';
import styles from './HeroSection.module.css';

const SLIDES = [
  {
    id: 1,
    eyebrow: 'New Arrival',
    headline: ['Precision Serums', 'Crafted by Science'],
    body: 'Clinical-grade actives in every drop. Your skin\'s most demanding ritual, distilled to its essence.',
    cta: { label: 'Shop Serums', href: '/shop/brightening' },
    ctaSecondary: { label: 'Our Science', href: '/our-science' },
    image: '/images/hero1.png',
    imageMobile: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=1600&q=85',
    imagePosition: 'center 30%',
  },
  {
    id: 2,
    eyebrow: 'Dermatologist Formulated',
    headline: ['Medicated Bars', '& Face Washes'],
    body: 'Targeted cleansing actives for acne, dryness, and barrier repair — formulated with clinical precision.',
    cta: { label: 'Shop Bars & Washes', href: '/shop/soaps' },
    ctaSecondary: { label: 'Face Washes', href: '/shop/face-washes' },
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1600&q=85',
    imagePosition: 'center 40%',
  },
  {
    id: 3,
    eyebrow: 'Skin Barrier Science',
    headline: ['Emollients &', 'Sunblock SPF 60'],
    body: 'Lock in moisture, rebuild the barrier, and protect against UVA/UVB with our advanced hybrid formulations.',
    cta: { label: 'Shop Protection', href: '/shop/sunblock' },
    ctaSecondary: { label: 'Moisturizers', href: '/shop/emollients' },
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=3840&q=85',
    imagePosition: 'center 45%',
  },
];

const INTERVAL_MS = 5000;

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [animating,   setAnimating]   = useState(false);
  const [logoAnimated, setLogoAnimated] = useState(false);
  const intervalRef = useRef(null);

  // Logo animation fires on first visit only
  useEffect(() => {
    const fired = sessionStorage.getItem('els_logo_animated');
    if (!fired) {
      setLogoAnimated(true);
      sessionStorage.setItem('els_logo_animated', '1');
    }
  }, []);

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setActiveSlide(index);
    setTimeout(() => setAnimating(false), 700);
  }, [animating]);

  const next = useCallback(() => {
    goTo((activeSlide + 1) % SLIDES.length);
  }, [activeSlide, goTo]);

  const prev = useCallback(() => {
    goTo((activeSlide - 1 + SLIDES.length) % SLIDES.length);
  }, [activeSlide, goTo]);

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(next, INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [next]);

  // Reset timer on manual nav
  const manualGoTo = (i) => {
    clearInterval(intervalRef.current);
    goTo(i);
    intervalRef.current = setInterval(next, INTERVAL_MS);
  };

  const slide = SLIDES[activeSlide];

  return (
    <section
      className={styles.hero}
      aria-label="Hero banner"
      aria-roledescription="carousel"
    >
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`${styles.slide} ${i === activeSlide ? styles.slideActive : styles.slideInactive}`}
          aria-hidden={i !== activeSlide}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${i + 1} of ${SLIDES.length}`}
        >
          <div className={styles.slideBg}>
            <img
              className={styles.imgDesktop}
              src={s.image}
              alt=""
              width={1600}
              height={900}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchpriority={i === 0 ? 'high' : 'auto'}
              style={{ objectPosition: s.imagePosition }}
            />
            {s.imageMobile && (
              <img
                className={styles.imgMobile}
                src={s.imageMobile}
                alt=""
                width={1600}
                height={900}
                loading={i === 0 ? 'eager' : 'lazy'}
                fetchpriority={i === 0 ? 'high' : 'auto'}
                style={{ objectPosition: s.imagePosition }}
              />
            )}
            <div className={styles.slideOverlay} />
          </div>
        </div>
      ))}

      {/* Content — always rendered, keyed to activeSlide for animation */}
      <div className={`container ${styles.content}`} key={activeSlide}>
        {/* Animated logo mark — first visit only */}
        <div className={styles.logoWrap} aria-hidden="true">
          <LogoMark size={88} animated={logoAnimated} color="gold" />
        </div>

        <span className={`eyebrow ${styles.eyebrow}`}>
          {slide.eyebrow}
        </span>

        <h1 className={styles.headline}>
          {slide.headline[0]}<br />
          <em>{slide.headline[1]}</em>
        </h1>

        <p className={styles.body}>{slide.body}</p>

        <div className={styles.actions}>
          <Link to={slide.cta.href} className={`btn btn-primary ${styles.ctaPrimary}`}>
            {slide.cta.label}
          </Link>
          <Link to={slide.ctaSecondary.href} className={`btn ${styles.ctaSecondary}`}>
            {slide.ctaSecondary.label}
          </Link>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={() => manualGoTo((activeSlide - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous slide"
      >
        <ArrowLeftIcon />
      </button>
      <button
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={() => manualGoTo((activeSlide + 1) % SLIDES.length)}
        aria-label="Next slide"
      >
        <ArrowRightIcon />
      </button>

      {/* Dot navigation */}
      <div className={styles.dots} role="tablist" aria-label="Slide navigation">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === activeSlide}
            aria-label={`Go to slide ${i + 1}`}
            className={`${styles.dot} ${i === activeSlide ? styles.dotActive : ''}`}
            onClick={() => manualGoTo(i)}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <div className={styles.scrollHint} aria-hidden="true">
        <span className={styles.scrollLine} />
        <span className={styles.scrollLabel}>Scroll</span>
      </div>
    </section>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
