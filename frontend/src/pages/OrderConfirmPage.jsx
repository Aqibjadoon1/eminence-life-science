import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { OrderService } from '../services/OrderService.js';
import { formatPrice, formatDate } from '../utils/formatting.js';
import { canonicalUrl } from '../utils/seo.js';
import styles from './OrderConfirmPage.module.css';

export default function OrderConfirmPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrderService.getById(id)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.loading} aria-busy="true"><div className="skeleton" style={{width:200, height:20}} /></div>;

  if (!order) return (
    <div className={`container ${styles.error}`}>
      <p>Order not found.</p>
      <Link to="/account" className="btn btn-outline">My Orders</Link>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Order Confirmed — Eminence Life Science</title>
        <link rel="canonical" href={canonicalUrl(`/order/${id}`)} />
      </Helmet>
      <div className={`container ${styles.page}`}>
        <div className={styles.iconWrap} aria-hidden="true">
          <CheckIcon />
        </div>
        <span className="eyebrow">Thank You</span>
        <h1 className={styles.title}>Your Order is Confirmed</h1>
        <p className={styles.sub}>
          Order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> placed on {formatDate(order.created_at)}.
          {order.payment_method === 'cod' && ' You will pay upon delivery.'}
        </p>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Items</h2>
          {order.items?.map((item, i) => (
            <div key={i} className={styles.item}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} width={56} height={68} className={styles.itemImg} />
              )}
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemMeta}>× {item.quantity}</span>
              <span className={styles.itemPrice}>{formatPrice(item.unit_price * item.quantity)}</span>
            </div>
          ))}
          <hr className="hairline" style={{margin: 'var(--space-4) 0'}} />
          <div className={styles.total}>
            <span>Total</span>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </div>

        <div className={styles.actions}>
          <Link to="/account" className="btn btn-primary">View My Orders</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </>
  );
}

function CheckIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  );
}
