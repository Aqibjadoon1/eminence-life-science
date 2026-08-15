import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — Eminence Life Science</title>
        {/* The SPA returns 200 for unknown routes (soft 404); keep them out of the index */}
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <div className={`container ${styles.page}`}>
        <span className={styles.code} aria-hidden="true">404</span>
        <span className="eyebrow">Lost in the Lab</span>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.body}>
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
          Let&rsquo;s get you back to something worth exploring.
        </p>
        <div className={styles.actions}>
          <Link to="/"     className="btn btn-primary">Return Home</Link>
          <Link to="/shop" className="btn btn-outline">Shop Serums</Link>
        </div>
      </div>
    </>
  );
}
