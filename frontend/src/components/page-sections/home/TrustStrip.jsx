/**
 * TrustStrip — scrolling trust marquee under the hero.
 * GlowWell layout: inline scrolling ticker.
 * Gold hairline dividers, no bullets.
 * Respects prefers-reduced-motion — pauses scroll animation.
 */
import styles from './TrustStrip.module.css';

const TRUST_ITEMS = [
  { icon: <LabIcon />,        label: 'Dermatologist Formulated' },
  { icon: <LeafIcon />,       label: 'Clean Actives, Real Results' },
  { icon: <HeartIcon />,      label: 'Cruelty-Free' },
  { icon: <StarIcon />,       label: '5-Star Customer Reviews' },
  { icon: <ShippingIcon />,   label: 'Fast Shipping, Easy Returns' },
  { icon: <PakistanIcon />,   label: 'Made in Pakistan' },
  { icon: <ShieldIcon />,     label: 'Clinically Tested' },
  { icon: <LockIcon />,       label: 'Secure Payments' },
];

// Duplicate items to create seamless infinite scroll
const ALL_ITEMS = [...TRUST_ITEMS, ...TRUST_ITEMS];

export default function TrustStrip() {
  return (
    <div
      className={styles.strip}
      aria-label="Brand credentials"
      role="marquee"
      aria-live="off"
    >
      <div className={styles.track} aria-hidden="true">
        {ALL_ITEMS.map((item, i) => (
          <span key={i} className={styles.item}>
            {i > 0 && <span className={styles.divider} aria-hidden="true" />}
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </span>
        ))}
      </div>

      {/* Screen-reader accessible static version */}
      <ul className={styles.srOnly} aria-label="Brand credentials">
        {TRUST_ITEMS.map((item, i) => (
          <li key={i}>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────────── */
function LabIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3h6v8l3 9H6l3-9V3z"/><line x1="9" y1="3" x2="15" y2="3"/></svg>;
}
function LeafIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 8C8 10 5.9 16.17 3.82 19.5C2 16 4 9 12 7c2.19-.56 4.5-.64 7-1l-2 2z"/></svg>;
}
function HeartIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}
function StarIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function ShippingIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
function PakistanIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20A14.5 14.5 0 0 0 12 2"/><line x1="2" y1="12" x2="22" y2="12"/></svg>;
}
function ShieldIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function LockIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
