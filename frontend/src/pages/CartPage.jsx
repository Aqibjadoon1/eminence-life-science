import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useCartStore from '../store/useCartStore.js';
import { formatPrice } from '../utils/formatting.js';
import { SHIPPING_FEE } from '../config.js';
import { canonicalUrl } from '../utils/seo.js';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { items, updateItem, removeItem } = useCartStore();

  const subtotal = items.reduce((s, i) => s + (i.sale_price ?? i.price) * i.quantity, 0);
  const shipping  = subtotal > 4000 ? 0 : SHIPPING_FEE;
  const total     = subtotal + shipping;

  return (
    <>
      <Helmet>
        <title>Your Cart — Eminence Life Science</title>
        <link rel="canonical" href={canonicalUrl('/cart')} />
      </Helmet>

      <div className={`container ${styles.page}`}>
        <div className={styles.header}>
          <span className="eyebrow">Review</span>
          <h1 className={styles.title}>Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Your cart is empty</p>
            <p className={styles.emptyText}>Discover our serum collection and find your ritual.</p>
            <Link to="/shop" className="btn btn-primary">Shop Serums</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            {/* Items */}
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <Link to={`/product/${item.slug}`} className={styles.itemImg}>
                    <img src={item.image_urls?.[0] || '/placeholder.jpg'} alt={item.name} width={100} height={120} />
                  </Link>
                  <div className={styles.itemInfo}>
                    <Link to={`/product/${item.slug}`} className={styles.itemName}>{item.name}</Link>
                    <span className="price">{formatPrice(item.sale_price ?? item.price)}</span>
                    <div className={styles.itemControls}>
                      <div className={styles.qty}>
                        <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1} aria-label="Decrease">−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label="Increase">+</button>
                      </div>
                      <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>Remove</button>
                    </div>
                  </div>
                  <div className={styles.itemTotal}>
                    {formatPrice((item.sale_price ?? item.price) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className={styles.summary}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              <div className={styles.summaryRow}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className={styles.summaryRow}><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
              {shipping > 0 && <p className={styles.freeShip}>Add {formatPrice(4000 - subtotal)} more for free shipping</p>}
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
              <Link to="/checkout" className="btn btn-primary" style={{width:'100%', textAlign:'center', marginTop:'var(--space-5)'}}>
                Proceed to Checkout
              </Link>
              <Link to="/shop" className={styles.continueShopping}>Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
