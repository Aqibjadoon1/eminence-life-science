/**
 * Section 8 — Newsletter inline section.
 * GlowWell placement: right after deal grid, before lifestyle strip.
 * Headline: "Get 15% Off Your First Order"
 * Gold underline focus state on input, centered layout.
 */
import { useState } from 'react';
import { NewsletterService } from '../../../services/NewsletterService.js';
import { useIntersectionObserver } from '../../../utils/useIntersectionObserver.js';
import styles from './NewsletterSection.module.css';

export default function NewsletterSection() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const { ref, isVisible } = useIntersectionObserver();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await NewsletterService.subscribe(email);
      setStatus('success');
      setMessage('Your 15% discount is on its way. Check your inbox.');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section
      className={styles.section}
      aria-labelledby="newsletter-heading"
    >
      <div
        className={`container ${styles.inner}`}
        ref={ref}
      >
        <div className={`${styles.content} ${isVisible ? styles.visible : ''}`}>
          <span className="eyebrow">Join the List</span>
          <h2 id="newsletter-heading" className={styles.heading}>
            Get 15% Off Your First Order
          </h2>
          <p className={styles.sub}>
            Subscribe for exclusive formulation stories, early access to new launches,
            and a welcome discount on your first purchase.
          </p>

          {status === 'success' ? (
            <p className={styles.successMsg} role="status" aria-live="polite">
              ✓ {message}
            </p>
          ) : (
            <form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
              aria-label="Newsletter signup"
            >
              <div className={styles.inputWrap}>
                <label htmlFor="nl-email-home" className="sr-only">
                  Email address
                </label>
                <input
                  id="nl-email-home"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={styles.input}
                  required
                  aria-describedby={message ? 'nl-msg-home' : undefined}
                />
                <button
                  type="submit"
                  className={`btn btn-primary ${styles.submitBtn}`}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? '…' : 'Subscribe'}
                </button>
              </div>

              {message && (
                <p
                  id="nl-msg-home"
                  className={`${styles.errorMsg}`}
                  role="alert"
                  aria-live="polite"
                >
                  {message}
                </p>
              )}

              <p className={styles.disclaimer}>
                By subscribing you agree to receive marketing emails. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
