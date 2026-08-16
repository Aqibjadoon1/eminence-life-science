import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useAuthStore  from '../store/useAuthStore.js';
import useCartStore  from '../store/useCartStore.js';
import useToastStore from '../store/useToastStore.js';
import { OrderService } from '../services/OrderService.js';
import { formatDate } from '../utils/formatting.js';
import { canonicalUrl } from '../utils/seo.js';
import styles from './AccountPage.module.css';

export default function AccountPage() {
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get('mode') || 'login';
  const nextPath    = searchParams.get('next') || '/account';

  const { isLoggedIn, isLoading: authLoading } = useAuthStore();

  if (authLoading) return null;
  if (isLoggedIn)  return <Dashboard nextPath={nextPath} />;
  return <AuthForms defaultMode={defaultMode} nextPath={nextPath} />;
}

/* ── Auth forms (login / register) ─────────────────────────── */
function AuthForms({ defaultMode, nextPath }) {
  const [mode, setMode]         = useState(defaultMode);
  const [fields, setFields]     = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError]       = useState('');
  const [submitting, setSubm]   = useState(false);

  const { login, register } = useAuthStore();
  const mergeCart = useCartStore((s) => s.mergeCart);
  const addToast  = useToastStore((s) => s.addToast);
  const navigate  = useNavigate();

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubm(true);
    try {
      if (mode === 'login') {
        await login({ email: fields.email, password: fields.password });
      } else {
        await register({ name: fields.name, email: fields.email, password: fields.password, phone: fields.phone });
      }
      await mergeCart();
      addToast(`Welcome${mode === 'register' ? ' to Eminence' : ' back'}.`, 'success');
      navigate(nextPath);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubm(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{mode === 'login' ? 'Sign In' : 'Create Account'} — Eminence Life Science</title>
        <link rel="canonical" href={canonicalUrl('/account')} />
      </Helmet>

      <div className={`container ${styles.authPage}`}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <span className="eyebrow">My Account</span>
            <h1 className={styles.authTitle}>
              {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
          </div>

          {/* Mode toggle */}
          <div className={styles.modeToggle} role="tablist">
            <button
              role="tab"
              aria-selected={mode === 'login'}
              className={`${styles.modeBtn} ${mode === 'login' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              role="tab"
              aria-selected={mode === 'register'}
              className={`${styles.modeBtn} ${mode === 'register' ? styles.modeBtnActive : ''}`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
            {mode === 'register' && (
              <div className={styles.field}>
                <label htmlFor="auth-name" className={styles.label}>Full Name <span aria-hidden="true">*</span></label>
                <input
                  id="auth-name"
                  type="text"
                  value={fields.name}
                  onChange={set('name')}
                  className={styles.input}
                  placeholder="Your name"
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className={styles.field}>
              <label htmlFor="auth-email" className={styles.label}>Email <span aria-hidden="true">*</span></label>
              <input
                id="auth-email"
                type="email"
                value={fields.email}
                onChange={set('email')}
                className={styles.input}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="auth-password" className={styles.label}>Password <span aria-hidden="true">*</span></label>
              <input
                id="auth-password"
                type="password"
                value={fields.password}
                onChange={set('password')}
                className={styles.input}
                placeholder={mode === 'register' ? 'Min 8 characters' : ''}
                required
                minLength={mode === 'register' ? 8 : undefined}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            {mode === 'register' && (
              <div className={styles.field}>
                <label htmlFor="auth-phone" className={styles.label}>Phone (optional)</label>
                <input
                  id="auth-phone"
                  type="tel"
                  value={fields.phone}
                  onChange={set('phone')}
                  className={styles.input}
                  placeholder="0300 1234567"
                  autoComplete="tel"
                />
              </div>
            )}

            {error && (
              <p className={styles.errorMsg} role="alert">{error}</p>
            )}

            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={submitting}
            >
              {submitting
                ? 'Please wait…'
                : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── Logged-in dashboard ────────────────────────────────────── */
function Dashboard() {
  const [tab, setTab]       = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    OrderService.getAll()
      .then((res) => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    addToast('Signed out successfully.', 'info');
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>My Account — Eminence Life Science</title>
        <link rel="canonical" href={canonicalUrl('/account')} />
      </Helmet>

      <div className={`container ${styles.dashboard}`}>
        <div className={styles.dashHeader}>
          <div>
            <span className="eyebrow">My Account</span>
            <h1 className={styles.dashTitle}>Hello, {user?.name?.split(' ')[0]}</h1>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout}>Sign Out</button>
        </div>

        {/* Tab nav */}
        <div className={styles.tabNav} role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'orders'}
            className={`${styles.tabNavBtn} ${tab === 'orders' ? styles.tabNavActive : ''}`}
            onClick={() => setTab('orders')}
          >
            Order History
          </button>
          <button
            role="tab"
            aria-selected={tab === 'profile'}
            className={`${styles.tabNavBtn} ${tab === 'profile' ? styles.tabNavActive : ''}`}
            onClick={() => setTab('profile')}
          >
            Profile
          </button>
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className={styles.ordersPanel} role="tabpanel" aria-label="Order history">
            {loading ? (
              <div className={styles.loadingOrders} aria-busy="true">
                {[1,2,3].map((i) => (
                  <div key={i} className={styles.orderSkeletonRow} aria-hidden="true">
                    <div className={`skeleton ${styles.skeletonCell}`} style={{width:'60%'}} />
                    <div className={`skeleton ${styles.skeletonCell}`} style={{width:'30%'}} />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <p className={styles.emptyTitle}>No orders yet</p>
                <p className={styles.emptyText}>Your order history will appear here once you place your first order.</p>
                <Link to="/shop" className="btn btn-primary">Shop Serums</Link>
              </div>
            ) : (
              <div className={styles.orderList}>
                {orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className={styles.profilePanel} role="tabpanel" aria-label="Profile">
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Name</span>
              <span className={styles.profileValue}>{user?.name}</span>
            </div>
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Email</span>
              <span className={styles.profileValue}>{user?.email}</span>
            </div>
            {user?.phone && (
              <div className={styles.profileField}>
                <span className={styles.profileLabel}>Phone</span>
                <span className={styles.profileValue}>{user.phone}</span>
              </div>
            )}
            <div className={styles.profileField}>
              <span className={styles.profileLabel}>Member Since</span>
              <span className={styles.profileValue}>{formatDate(user?.created_at)}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function OrderRow({ order }) {
  const STATUS_COLORS = {
    pending:    '#C9A24B',
    confirmed:  '#4caf82',
    processing: '#4caf82',
    shipped:    '#4caf82',
    delivered:  '#2D6A4F',
    cancelled:  '#C0392B',
  };

  return (
    <Link to={`/order/${order.id}`} className={styles.orderRow}>
      <div className={styles.orderInfo}>
        <span className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
        <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
      </div>
      <span
        className={styles.orderStatus}
        style={{ color: STATUS_COLORS[order.status] || 'inherit' }}
      >
        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
      </span>
      <ChevronRightIcon />
    </Link>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
