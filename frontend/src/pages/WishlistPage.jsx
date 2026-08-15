import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import useWishlistStore from '../store/useWishlistStore.js';
import ProductCard from '../components/cards/ProductCard.jsx';
import styles from './WishlistPage.module.css';

export default function WishlistPage() {
  const { items, clear } = useWishlistStore();

  return (
    <>
      <Helmet>
        <title>Wishlist — Eminence Life Science</title>
      </Helmet>

      <div className={`container ${styles.page}`}>
        <div className={styles.header}>
          <div>
            <span className="eyebrow">Saved Items</span>
            <h1 className={styles.title}>My Wishlist</h1>
          </div>
          {items.length > 0 && (
            <button className={styles.clearBtn} onClick={clear}>
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <WishlistEmptyIcon />
            <p className={styles.emptyTitle}>Your wishlist is empty</p>
            <p className={styles.emptyText}>
              Save products by tapping the heart icon on any product card.
            </p>
            <Link to="/shop" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function WishlistEmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--hairline)' }} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
