import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useIntersectionObserver } from '../utils/useIntersectionObserver.js';
import styles from './ContactPage.module.css';

const CONTACT_INFO = [
  {
    label: 'Email',
    value: 'hello@eminencelifescience.pk',
    icon: <MailIcon />,
  },
  {
    label: 'WhatsApp',
    value: '+92 300 000 0000',
    icon: <PhoneIcon />,
  },
  {
    label: 'Location',
    value: 'Lahore, Pakistan',
    icon: <MapIcon />,
  },
];

export default function ContactPage() {
  const [fields, setFields] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const { ref, isVisible }  = useIntersectionObserver();

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    // Simulated send — wire to a real endpoint (Formspree / custom route) in production
    await new Promise((r) => setTimeout(r, 900));
    setStatus('success');
  };

  return (
    <>
      <Helmet>
        <title>Contact — Eminence Life Science</title>
        <meta name="description" content="Get in touch with Eminence Life Science. Questions about your order, skincare advice, or wholesale enquiries." />
      </Helmet>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <span className="eyebrow">Reach Out</span>
          <h1 className={styles.pageTitle}>Contact Us</h1>
          <p className={styles.pageSub}>
            A real person reads every message. We typically respond within one business day.
          </p>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        {/* Contact info column */}
        <aside
          ref={ref}
          className={`${styles.infoCol} ${isVisible ? styles.visible : ''}`}
          aria-label="Contact information"
        >
          {CONTACT_INFO.map((item) => (
            <div key={item.label} className={styles.infoItem}>
              <span className={styles.infoIcon} aria-hidden="true">{item.icon}</span>
              <div>
                <span className={styles.infoLabel}>{item.label}</span>
                <span className={styles.infoValue}>{item.value}</span>
              </div>
            </div>
          ))}

          {/* Social links */}
          <div className={styles.socialLinks}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
              Facebook
            </a>
          </div>
        </aside>

        {/* Contact form */}
        <main className={styles.formCol}>
          {status === 'success' ? (
            <div className={styles.successMsg}>
              <span className={styles.successIcon} aria-hidden="true">✓</span>
              <h2 className={styles.successTitle}>Message Sent</h2>
              <p className={styles.successText}>
                Thank you for reaching out. We&rsquo;ll be in touch shortly.
              </p>
              <button
                className="btn btn-outline"
                onClick={() => { setStatus('idle'); setFields({ name: '', email: '', subject: '', message: '' }); }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate aria-label="Contact form">
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label htmlFor="ct-name" className={styles.label}>Full Name <span aria-hidden="true">*</span></label>
                  <input
                    id="ct-name"
                    type="text"
                    value={fields.name}
                    onChange={set('name')}
                    className={styles.input}
                    placeholder="Your name"
                    required
                    autoComplete="name"
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="ct-email" className={styles.label}>Email <span aria-hidden="true">*</span></label>
                  <input
                    id="ct-email"
                    type="email"
                    value={fields.email}
                    onChange={set('email')}
                    className={styles.input}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="ct-subject" className={styles.label}>Subject</label>
                <input
                  id="ct-subject"
                  type="text"
                  value={fields.subject}
                  onChange={set('subject')}
                  className={styles.input}
                  placeholder="Order enquiry, skincare advice…"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="ct-message" className={styles.label}>Message <span aria-hidden="true">*</span></label>
                <textarea
                  id="ct-message"
                  value={fields.message}
                  onChange={set('message')}
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="Tell us how we can help…"
                  rows={6}
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={status === 'loading' || !fields.name || !fields.email || !fields.message}
              >
                {status === 'loading' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </main>
      </div>
    </>
  );
}

function MailIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function PhoneIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function MapIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
