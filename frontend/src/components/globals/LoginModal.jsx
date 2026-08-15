/**
 * LoginModal — triggered from account icon when user is not logged in.
 * Overlay / modal (not a page nav).
 * Switches between Sign In and Create Account views.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore  from '../../store/useAuthStore.js';
import useCartStore  from '../../store/useCartStore.js';
import useToastStore from '../../store/useToastStore.js';
import styles from './LoginModal.module.css';

export default function LoginModal({ onClose, defaultMode = 'login', redirectTo = null }) {
  const [mode,      setMode]      = useState(defaultMode);
  const [fields,    setFields]    = useState({ name: '', email: '', password: '', phone: '' });
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [remember,  setRemember]  = useState(false);

  const { login, register } = useAuthStore();
  const mergeCart = useCartStore((s) => s.mergeCart);
  const addToast  = useToastStore((s) => s.addToast);
  const navigate  = useNavigate();

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: fields.email, password: fields.password });
      } else {
        await register({ name: fields.name, email: fields.email, password: fields.password, phone: fields.phone });
      }
      await mergeCart();
      addToast(mode === 'login' ? 'Welcome back.' : 'Account created. Welcome to Eminence.', 'success');
      onClose();
      if (redirectTo) navigate(redirectTo);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Sign in' : 'Create account'}
      >
        {/* Close button */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <span className="eyebrow">My Account</span>
          <h2 className={styles.title}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
        </div>

        {/* Mode tabs */}
        <div className={styles.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'login'}
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={mode === 'register'}
            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            New Customer
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {mode === 'register' && (
            <div className={styles.field}>
              <label htmlFor="modal-name" className={styles.label}>
                Full Name <span aria-hidden="true">*</span>
              </label>
              <input
                id="modal-name"
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
            <label htmlFor="modal-email" className={styles.label}>
              Email <span aria-hidden="true">*</span>
            </label>
            <input
              id="modal-email"
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
            <label htmlFor="modal-password" className={styles.label}>
              Password <span aria-hidden="true">*</span>
            </label>
            <input
              id="modal-password"
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
              <label htmlFor="modal-phone" className={styles.label}>Phone (optional)</label>
              <input
                id="modal-phone"
                type="tel"
                value={fields.phone}
                onChange={set('phone')}
                className={styles.input}
                placeholder="0300 1234567"
                autoComplete="tel"
              />
            </div>
          )}

          {mode === 'login' && (
            <div className={styles.loginExtras}>
              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className={styles.checkbox}
                />
                Remember me
              </label>
              <button type="button" className={styles.forgotLink}>
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <p className={styles.errorMsg} role="alert">{error}</p>
          )}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading
              ? 'Please wait…'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Switch mode link */}
        <p className={styles.switchMode}>
          {mode === 'login' ? (
            <>
              New customer?{' '}
              <button className={styles.switchLink} onClick={() => { setMode('register'); setError(''); }}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className={styles.switchLink} onClick={() => { setMode('login'); setError(''); }}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </>
  );
}

function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
