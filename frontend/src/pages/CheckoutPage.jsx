import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useCartStore  from '../store/useCartStore.js';
import useAuthStore  from '../store/useAuthStore.js';
import useToastStore from '../store/useToastStore.js';
import { OrderService } from '../services/OrderService.js';
import { formatPrice } from '../utils/formatting.js';
import { PAYMENT_METHODS, SHIPPING_FEE } from '../config.js';
import { canonicalUrl } from '../utils/seo.js';
import styles from './CheckoutPage.module.css';

const STEPS = ['Address', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { isLoggedIn, user } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState({
    line1: '', city: '', phone: '',
  });
  const [savedAddressId, setSavedAddressId] = useState(null);
  const [payment, setPayment] = useState('cod');

  const subtotal = items.reduce((s, i) => s + (i.sale_price ?? i.price) * i.quantity, 0);
  const shipping  = subtotal > 4000 ? 0 : SHIPPING_FEE;
  const total     = subtotal + shipping;

  if (!isLoggedIn) {
    return (
      <div className={`container ${styles.guestPrompt}`}>
        <h2 className={styles.guestTitle}>Sign in to checkout</h2>
        <p className={styles.guestText}>Create an account or sign in to place your order and track it.</p>
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
        <Link to="/shop" className="btn btn-primary">Shop Serums</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!address.line1 || !address.city) {
      addToast('Please fill in your delivery address.', 'error');
      setStep(0);
      return;
    }

    setSubmitting(true);
    try {
      // Create address on backend (simplified — full address management in Account page)
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(address),
      });
      const addrData = await res.json();
      const addressId = addrData.data?.id || savedAddressId;

      const orderPayload = {
        address_id: addressId,
        payment_method: payment,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      };

      const order = await OrderService.create(orderPayload);
      await clearCart();
      navigate(`/order/${order.data.id}`);
    } catch (err) {
      addToast(err.message || 'Order failed. Please try again.', 'error');
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
          <h1 className={styles.title}>Complete Your Order</h1>
        </div>

        {/* Step indicator */}
        <div className={styles.steps} aria-label="Checkout steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`${styles.step} ${i <= step ? styles.stepActive : ''}`}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span className={styles.stepLabel}>{s}</span>
            </div>
          ))}
        </div>

        <div className={styles.layout}>
          {/* Left: form */}
          <div className={styles.form}>
            {/* Step 0: Address */}
            {step === 0 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Delivery Address</h2>

                <div className={styles.field}>
                  <label htmlFor="line1" className={styles.label}>Street Address <span aria-hidden="true">*</span></label>
                  <input
                    id="line1"
                    type="text"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    className={styles.input}
                    placeholder="House / flat, street, area"
                    required
                  />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.field}>
                    <label htmlFor="city" className={styles.label}>City <span aria-hidden="true">*</span></label>
                    <input
                      id="city"
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className={styles.input}
                      placeholder="Karachi, Lahore…"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="phone" className={styles.label}>Phone</label>
                    <input
                      id="phone"
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className={styles.input}
                      placeholder="0300 1234567"
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setStep(1)}
                  disabled={!address.line1 || !address.city}
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Payment Method</h2>

                <div className={styles.paymentOptions} role="radiogroup" aria-label="Payment method">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.id}
                      className={`${styles.paymentOption} ${payment === m.id ? styles.paymentActive : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={payment === m.id}
                        onChange={() => setPayment(m.id)}
                        className={styles.radioHidden}
                      />
                      <span className={styles.paymentIcon} aria-hidden="true">{m.icon}</span>
                      <span className={styles.paymentLabel}>{m.label}</span>
                    </label>
                  ))}
                </div>

                <div className={styles.stepActions}>
                  <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
                  <button className="btn btn-primary" onClick={() => setStep(2)}>Review Order</button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Review & Confirm</h2>

                <div className={styles.reviewBlock}>
                  <h3 className={styles.reviewLabel}>Delivering to</h3>
                  <p className={styles.reviewValue}>{address.line1}, {address.city}</p>
                  {address.phone && <p className={styles.reviewValue}>{address.phone}</p>}
                </div>

                <div className={styles.reviewBlock}>
                  <h3 className={styles.reviewLabel}>Payment</h3>
                  <p className={styles.reviewValue}>
                    {PAYMENT_METHODS.find((m) => m.id === payment)?.label}
                  </p>
                </div>

                <div className={styles.reviewItems}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.reviewItem}>
                      <span className={styles.reviewItemName}>{item.name}</span>
                      <span className={styles.reviewItemMeta}>× {item.quantity}</span>
                      <span className={styles.reviewItemPrice}>
                        {formatPrice((item.sale_price ?? item.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.stepActions}>
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button
                    className="btn btn-primary"
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                  >
                    {submitting ? 'Placing Order…' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: order summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            {items.map((item) => (
              <div key={item.id} className={styles.summaryItem}>
                <img src={item.image_urls?.[0]} alt={item.name} width={48} height={56} className={styles.summaryImg} />
                <span className={styles.summaryItemName}>{item.name}</span>
                <span className={styles.summaryItemQty}>× {item.quantity}</span>
              </div>
            ))}
            <hr className="hairline" />
            <div className={styles.summaryRow}><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className={styles.summaryRow}><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
