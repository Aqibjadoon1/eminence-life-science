/**
 * Footer — GlowWell 4-column structure · Eminence brand skin.
 * Columns: Logo+tagline | Find Us | Quick Links | Connect
 * Bottom bar: copyright · payment icons · Terms/Privacy
 */
import { Link } from 'react-router-dom';
import LogoMark from '../specials/LogoMark.jsx';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* ── Main grid ─────────────────────────────────────────────── */}
      <div className={styles.main}>

        {/* Col 1 — Logo + tagline */}
        <div className={styles.brandCol}>
          <Link to="/" className={styles.logoLink} aria-label="Eminence Life Science — Home">
            <LogoMark size={42} animated={false} color="gold" />
            <div>
              <div className={styles.brandName}>Eminence</div>
              <div className={styles.brandSub}>LIFE SCIENCE</div>
            </div>
          </Link>
          <p className={styles.tagline}>
            Science-led skincare formulated for visible, lasting results.
            Clean actives, responsibly sourced — made in Pakistan.
          </p>
        </div>

        {/* Col 2 — Find Us */}
        <nav className={styles.col} aria-label="Find us">
          <h4 className={styles.colHeading}>Find Us</h4>
          <ul role="list">
            <li className={styles.contactItem}>
              <MapPinIcon />
              <span>Lahore, Pakistan</span>
            </li>
            <li className={styles.contactItem}>
              <PhoneIcon />
              <a href="tel:+923000000000">+92 300 000 0000</a>
            </li>
            <li className={styles.contactItem}>
              <MailIcon />
              <a href="mailto:hello@eminencelifescience.pk">
                hello@eminencelifescience.pk
              </a>
            </li>
          </ul>
        </nav>

        {/* Col 3 — Quick Links */}
        <nav className={styles.col} aria-label="Quick links">
          <h4 className={styles.colHeading}>Quick Links</h4>
          <ul role="list">
            <li><Link to="/our-science">Our Science / Our Story</Link></li>
            <li><Link to="/shop">Visit Our Store</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/account">My Account</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
            <li><Link to="/contact">Shipping & Returns</Link></li>
            <li><Link to="/contact">FAQ</Link></li>
          </ul>
        </nav>

        {/* Col 4 — Connect (social) */}
        <div className={styles.col} aria-label="Connect with us">
          <h4 className={styles.colHeading}>Connect</h4>
          <div className={styles.socialLinks} role="list">
            {[
              { href: 'https://instagram.com',  label: 'Instagram',  Icon: InstagramIcon  },
              { href: 'https://facebook.com',   label: 'Facebook',   Icon: FacebookIcon   },
              { href: 'https://tiktok.com',     label: 'TikTok',     Icon: TikTokIcon     },
              { href: 'https://wa.me/923000000000', label: 'WhatsApp', Icon: WhatsAppIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={label}
                role="listitem"
              >
                <Icon />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <hr className={styles.rule} />

      {/* ── Bottom bar ────────────────────────────────────────────── */}
      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {year} Eminence Life Science. All rights reserved.
        </p>

        <div className={styles.paymentBadges} aria-label="How to order">
          <span className={styles.payBadge}>Orders via WhatsApp</span>
        </div>

        <div className={styles.legalLinks}>
          <Link to="/contact">Privacy Policy</Link>
          <span aria-hidden="true">·</span>
          <Link to="/contact">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

/* ── Icons ─────────────────────────────────────────────────────── */
function MapPinIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function PhoneIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function MailIcon()     { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function InstagramIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>; }
function FacebookIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>; }
function TikTokIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>; }
function WhatsAppIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>; }
