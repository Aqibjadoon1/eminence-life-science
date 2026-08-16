import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useCartStore  from '../store/useCartStore.js';
import useAuthStore  from '../store/useAuthStore.js';
import useToastStore from '../store/useToastStore.js';
import { OrderService }   from '../services/OrderService.js';
import { AddressService } from '../services/AddressService.js';
import { ConfigService }  from '../services/ConfigService.js';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp.js';
import { canonicalUrl } from '../utils/seo.js';
import styles from './CheckoutPage.module.css';

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [waNumber, setWaNumber] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', city: '', line1: '', note: '' });

  useEffect(() => {
    ConfigService.getWhatsappOrder()
      .then((d) => setWaNumber(d?.whatsappNumber || null))
      .catch(() => setWaNumber(null));
  }, []);

  if (!isLoggedIn) {
    return (
      <div className={`container ${styles.guestPrompt}`}>
        <h2 className={styles.guestTitle}>Sign in to check out</h2>
        <p className={styles.guestText}>Create an account or sign in to place your order.</p>
        <div className={styles.guestActions}>
          <Link to="/account?mode=login&next=/checkout" className="btn btn-primary">Sign In</Link>
          <Link to="/account?mode=register&next=/checkout" className="btn btn-outline">Create Account</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`container ${styles.guestPrompt}`}>
        <h2 className={styles.guestTitle}>Your cart is empty</h2>
        <p className={styles.guestText}>Discover our serum collection and find your ritual.</p>
        <Link to="/shop" className="btn btn-primary">Shop Serums</Link>
      </div>
    );
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.line1 || !form.city) {
      addToast('Please fill in your name, address and city.', 'error');
      return;
    }
    if (!waNumber) {
      addToast('WhatsApp is unavailable right now — please try again in a moment.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const addr = await AddressService.create({
        line1: form.line1,
        city: form.city,
        phone: form.phone,
        label: 'Home',
      });
      const addressId = addr?.data?.id;

      const order = await OrderService.create({
        address_id: addressId,
        payment_method: 'whatsapp',
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        customer_name: form.name,
        order_note: form.note,
      });
      const orderId = order?.data?.id;

      const message = buildWhatsAppMessage({
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.line1,
        note: form.note,
        items: items.map((i) => ({ name: i.name, quantity: i.quantity })),
      });
      const waLink = buildWhatsAppUrl(waNumber, message);

      window.open(waLink, '_blank', 'noopener,noreferrer');
      await clearCart();
      navigate(`/order/${orderId}`, { state: { waLink } });
    } catch (err) {
      addToast(err.message || 'Order failed — please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout — Eminence Life Science</title>
        <link rel="canonical" href={canonicalUrl('/checkout')} />
      </Helmet>

      <div className={`container ${styles.page}`}>
        <div className={styles.header}>
          <span className="eyebrow">Checkout</span>
          <h1 className={styles.title}>Confirm Your Order</h1>
          <p className={styles.noteline}>
            We confirm every order personally on WhatsApp before dispatch — no
            online payment needed.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Left: delivery form */}
          <form className={styles.formSection} onSubmit={handleSubmit} noValidate>
            <h2 className={styles.sectionTitle}>Delivery Details</h2>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="co-name" className={styles.label}>Full Name <span aria-hidden="true">*</span></label>
                <input
                  id="co-name"
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  className={styles.input}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="co-phone" className={styles.label}>Phone <span aria-hidden="true">*</span></label>
                <input
                  id="co-phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  className={styles.input}
                  placeholder="0300 1234567"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="co-line1" className={styles.label}>Street Address <span aria-hidden="true">*</span></label>
              <input
                id="co-line1"
                type="text"
                value={form.line1}
                onChange={set('line1')}
                className={styles.input}
                placeholder="House / flat, street, area"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="co-city" className={styles.label}>City <span aria-hidden="true">*</span></label>
              <input
                id="co-city"
                type="text"
                value={form.city}
                onChange={set('city')}
                className={styles.input}
                placeholder="Karachi, Lahore…"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="co-note" className={styles.label}>Order Note (optional)</label>
              <textarea
                id="co-note"
                value={form.note}
                onChange={set('note')}
                className={styles.textarea}
                rows={3}
                placeholder="Preferred delivery time, landmarks…"
              />
            </div>

            <div className={styles.hint}>
              After placing your order, WhatsApp opens with your details pre-filled —
              just press send.
            </div>

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={submitting}
            >
              {submitting ? 'Placing Order…' : 'Place Order & Open WhatsApp'}
            </button>
          </form>

          {/* Right: items summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Your Items</h2>
            {items.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <img src={item.image_urls?.[0]} alt={item.name} width={48} height={56} className={styles.summaryImg} />
                <span className={styles.summaryItemName}>{item.name}</span>
                <span className={styles.summaryItemQty}>× {item.quantity}</span>
              </div>
            ))}
            <hr className="hairline" />
            <p className={styles.summaryNote}>
              Full order details are shared on WhatsApp. No payment is taken online —
              we arrange delivery and payment directly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}