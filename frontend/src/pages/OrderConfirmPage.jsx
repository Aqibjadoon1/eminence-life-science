import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { OrderService }   from '../services/OrderService.js';
import { ConfigService }  from '../services/ConfigService.js';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp.js';
import { formatDate } from '../utils/formatting.js';
import { canonicalUrl } from '../utils/seo.js';
import styles from './OrderConfirmPage.module.css';

export default function OrderConfirmPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waLink, setWaLink] = useState(location.state?.waLink || null);

  useEffect(() => {
    OrderService.getById(id)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (waLink || !order) return;
    ConfigService.getWhatsappOrder()
      .then((d) => {
        const number = d?.whatsappNumber;
        if (!number) return;
        setWaLink(buildWhatsAppUrl(number, buildWhatsAppMessage({
          name: order.customer_name || '',
          phone: order.address?.phone || '',
          city: order.address?.city || '',
          address: order.address?.line1 || '',
          note: order.order_note || '',
          items: (order.items || []).map((i) => ({ name: i.name, quantity: i.quantity })),
        })));
      })
      .catch(() => {});
  }, [waLink, order]);

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
        <title>Order Placed — Eminence Life Science</title>
        <link rel="canonical" href={canonicalUrl(`/order/${id}`)} />
      </Helmet>
      <div className={`container ${styles.page}`}>
        <div className={styles.iconWrap} aria-hidden="true">
          <CheckIcon />
        </div>
        <span className="eyebrow">Thank You</span>
        <h1 className={styles.title}>Your Order is Placed</h1>
        <p className={styles.sub}>
          Order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> placed on {formatDate(order.created_at)}.
          We've handed it over to WhatsApp — we can't see the chat on our side, so
          please send the pre-filled message if the chat didn't open on its own.
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
            </div>
          ))}
        </div>

        <p className={styles.sub}>
          We'll confirm your order, delivery timeline and payment on WhatsApp shortly.
          It may take a few minutes during business hours.
        </p>

        <div className={styles.actions}>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Open WhatsApp Conversation
            </a>
          )}
          <Link to="/account" className="btn btn-outline">View My Orders</Link>
          <Link to="/shop" className="btn btn-ghost">Continue Shopping</Link>
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