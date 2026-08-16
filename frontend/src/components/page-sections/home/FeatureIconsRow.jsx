/**
 * Section 10 — Feature icons row.
 * 3 columns: Free Shipping · Secure Payments · Customer Support
 */
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './FeatureIconsRow.module.css';

const FEATURES = [
  {
    icon: <ShippingIcon />,
    title: 'Free Shipping',
    body: 'Complimentary standard delivery on all orders above 4000 rupees, nationwide.',
  },
  {
    icon: <LockIcon />,
    title: 'WhatsApp Ordering',
    body: 'Every order is confirmed personally over WhatsApp — clear, secure, no checkout friction.',
  },
  {
    icon: <SupportIcon />,
    title: 'Customer Support',
    body: 'Real people, real answers. Reach us by WhatsApp or email within 24 hours.',
  },
];

export default function FeatureIconsRow() {
  const { ref, isVisible } = useIntersectionObserver();

  return (
    <section
      className={styles.section}
      ref={ref}
      aria-label="Service features"
    >
      <div className={`container ${styles.inner}`}>
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className={`${styles.feature} ${isVisible ? styles.visible : ''}`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            {i > 0 && <span className={styles.divider} aria-hidden="true" />}
            <div className={styles.featureContent}>
              <span className={styles.icon} aria-hidden="true">{f.icon}</span>
              <div>
                <h3 className={styles.title}>{f.title}</h3>
                <p className={styles.body}>{f.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShippingIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}
function LockIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
function SupportIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
