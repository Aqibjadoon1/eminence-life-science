/**
 * CartDrawer — GlowWell structure · Eminence brand skin.
 * Slides in from right on cart icon click.
 */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../../store/useCartStore.js';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { isOpen, items, isLoading, closeCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={closeCart} aria-hidden="true" />

      <div
        className={styles.drawer}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            Cart
            {items.length > 0 && (
              <span className={styles.itemCount}>
                {items.reduce((n, i) => n + i.quantity, 0)}
              </span>
            )}
          </h2>
          <button className={styles.closeBtn} onClick={closeCart} aria-label="Close cart">
            <CloseIcon />
          </button>
        </div>

        <hr className={styles.rule} />

        {/* Items */}
        <div className={styles.items}>
          {isLoading && items.length === 0 ? (
            <CartSkeleton />
          ) : items.length === 0 ? (
            <EmptyCart onClose={closeCart} />
          ) : (
            items.map((item) => (
              <CartItem key={item.id} item={item} onUpdate={updateItem} onRemove={removeItem} />
            ))
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <hr className={styles.ruleThin} />

            {/* CTAs */}
            <div className={styles.ctaGroup}>
              <Link
                to="/cart"
                className={`btn btn-ghost ${styles.viewCartBtn}`}
                onClick={closeCart}
              >
                Go to Cart
              </Link>
              <Link
                to="/checkout"
                className={`btn btn-primary ${styles.checkoutBtn}`}
                onClick={closeCart}
              >
                Checkout
              </Link>
            </div>

            <button className={styles.continueBtn} onClick={closeCart}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */
function CartItem({ item, onUpdate, onRemove }) {
  return (
    <div className={styles.item}>
      <Link to={`/product/${item.slug}`} className={styles.itemImg} tabIndex={-1} aria-hidden="true">
        <img
          src={item.image_urls?.[0] || '/placeholder.jpg'}
          alt={item.name}
          width={80}
          height={96}
        />
      </Link>

      <div className={styles.itemDetails}>
        <Link to={`/product/${item.slug}`} className={styles.itemName}>{item.name}</Link>

        <div className={styles.itemControls}>
          <div className={styles.qty} role="group" aria-label={`Quantity for ${item.name}`}>
            <button
              onClick={() => onUpdate(item.id, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >−</button>
            <span aria-live="polite">{item.quantity}</span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              aria-label="Increase quantity"
            >+</button>
          </div>

          <button
            className={styles.removeBtn}
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name}`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyCart({ onClose }) {
  return (
    <div className={styles.empty}>
      <CartEmptyIcon />
      <p className={styles.emptyTitle}>Your cart is empty</p>
      <p className={styles.emptyText}>Discover our collection and find your ritual.</p>
      <Link to="/shop" className="btn btn-outline" onClick={onClose} style={{ marginTop: 'var(--space-3)' }}>
        Shop Now
      </Link>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {[1, 2].map((i) => (
        <div key={i} className={styles.skeletonItem}>
          <div className={`skeleton ${styles.skeletonImg}`} />
          <div className={styles.skeletonLines}>
            <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '70%' }} />
            <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────────────── */
function CloseIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function CartEmptyIcon(){ return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--hairline)' }} aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>; }
