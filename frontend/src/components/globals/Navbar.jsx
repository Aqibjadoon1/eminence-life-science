/**
 * Navbar — GlowWell-structure reskinned in Eminence gold/ivory.
 *
 * Layout (top to bottom):
 *  1. HeaderRow     — logo (left) · primary nav (center) · icons (right)
 *  2. MobileDrawer  — slide-in left panel (mobile)
 *  3. SearchOverlay — full-width search with category counts
 */
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useCartStore     from '../../store/useCartStore.js';
import useAuthStore     from '../../store/useAuthStore.js';
import useWishlistStore from '../../store/useWishlistStore.js';
import { useCategories } from '../../hooks/useCategories.js';
import LogoMark         from '../specials/LogoMark.jsx';
import LoginModal       from './LoginModal.jsx';
import styles           from './Navbar.module.css';

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [loginOpen,    setLoginOpen]    = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount    = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const openCart     = useCartStore((s) => s.openCart);
  const isLoggedIn   = useAuthStore((s) => s.isLoggedIn);
  const isAdmin      = useAuthStore((s) => s.user?.is_admin === true);
  const wishCount    = useWishlistStore((s) => s.items.length);
  const { data: categories } = useCategories();

  // Active categories only (has products)
  const activeCategories = categories.filter((c) => c.product_count > 0);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location]);

  // Scrolled state for glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Prevent body scroll when mobile menu / search open
  useEffect(() => {
    document.body.style.overflow = (menuOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen, searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* ── 1. Header row ────────────────────────────────────────────────── */}
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
        role="navigation"
        aria-label="Site header"
      >
        <div className={styles.headerInner}>

          {/* Mobile hamburger */}
          <button
            className={styles.hamburgerBtn}
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            <HamburgerIcon />
          </button>

          {/* Logo */}
          <Link to="/" className={styles.logo} aria-label="Eminence Life Science — Home">
            <LogoMark size={38} animated={false} />
            <div className={styles.wordmark}>
              <span className={styles.wordmarkMain}>Eminence</span>
              <span className={styles.wordmarkSub}>LIFE SCIENCE</span>
            </div>
          </Link>

          {/* Desktop primary nav */}
          <nav className={styles.primaryNav} aria-label="Primary navigation">
            <ul role="list">
              <li>
                <NavLink to="/" end className={({ isActive }) => isActive ? styles.navActive : ''}>
                  Home
                </NavLink>
              </li>

              {/* All Categories — plain link to the shop (hover card removed) */}
              <li>
                <NavLink to="/shop" className={({ isActive }) => isActive ? styles.navActive : ''}>
                  All Categories
                </NavLink>
              </li>

              <li>
                <NavLink to="/our-science" className={({ isActive }) => isActive ? styles.navActive : ''}>
                  Our Science
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop" className={({ isActive }) => isActive ? styles.navActive : ''}>
                  Shop
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={({ isActive }) => isActive ? styles.navActive : ''}>
                  Contact Us
                </NavLink>
              </li>
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className={({ isActive }) => isActive ? styles.navActive : ''}>
                    Admin
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Right-side icon actions */}
          <div className={styles.iconActions}>
            {/* Search */}
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
            >
              <SearchIcon />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className={styles.iconBtn}
              aria-label={`Wishlist — ${wishCount} saved item${wishCount !== 1 ? 's' : ''}`}
            >
              <WishlistIcon />
              {wishCount > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {wishCount > 9 ? '9+' : wishCount}
                </span>
              )}
            </Link>

            {/* Account — opens modal if not logged in, navigates if logged in */}
            {isLoggedIn ? (
              <Link
                to="/account"
                className={styles.iconBtn}
                aria-label="My account"
              >
                <AccountIcon />
              </Link>
            ) : (
              <button
                className={styles.iconBtn}
                onClick={() => setLoginOpen(true)}
                aria-label="Sign in"
              >
                <AccountIcon />
              </button>
            )}

            {/* Cart */}
            <button
              className={styles.iconBtn}
              onClick={openCart}
              aria-label={`Shopping cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className={styles.badge} aria-hidden="true">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. Search overlay ────────────────────────────────────────────── */}
      {searchOpen && (
        <>
          <div
            className={styles.searchBackdrop}
            onClick={() => setSearchOpen(false)}
            aria-hidden="true"
          />
          <div
            className={styles.searchOverlay}
            role="dialog"
            aria-label="Search"
            aria-modal="true"
          >
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <SearchIcon />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search serums, soaps, ingredients…"
                className={styles.searchInput}
                aria-label="Search products"
              />
              <button type="submit" className={styles.searchSubmitBtn} aria-label="Submit search">
                Search
              </button>
              <button
                type="button"
                className={styles.searchCloseBtn}
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <CloseIcon />
              </button>
            </form>

            {/* Category quick-links with counts */}
            {activeCategories.length > 0 && (
              <div className={styles.searchCategories}>
                <p className={styles.searchCatLabel}>Browse by Category</p>
                <ul className={styles.searchCatList} role="list">
                  <li>
                    <Link
                      to="/shop"
                      className={styles.searchCatItem}
                      onClick={() => setSearchOpen(false)}
                    >
                      All Products
                      <span className={styles.searchCatCount}>
                        {activeCategories.reduce((n, c) => n + c.product_count, 0)}
                      </span>
                    </Link>
                  </li>
                  {activeCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/shop/${cat.slug}`}
                        className={styles.searchCatItem}
                        onClick={() => setSearchOpen(false)}
                      >
                        {cat.name}
                        <span className={styles.searchCatCount}>{cat.product_count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── 3. Mobile drawer ─────────────────────────────────────────────── */}
      {menuOpen && (
        <>
          <div
            className={styles.drawerBackdrop}
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            className={styles.mobileDrawer}
            role="dialog"
            aria-label="Navigation menu"
            aria-modal="true"
          >
            <div className={styles.drawerHeader}>
              <Link to="/" className={styles.drawerLogo} onClick={() => setMenuOpen(false)}>
                <LogoMark size={32} animated={false} />
                <span className={styles.drawerLogoText}>Eminence</span>
              </Link>
              <button
                className={styles.drawerClose}
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            <nav aria-label="Mobile navigation">
              <ul className={styles.drawerNav}>
                <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
                <li>
                  <p className={styles.drawerCatHeading}>All Categories</p>
                  <ul className={styles.drawerCatList}>
                    {activeCategories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          to={`/shop/${cat.slug}`}
                          onClick={() => setMenuOpen(false)}
                        >
                          {cat.name}
                          <span className={styles.drawerCount}>{cat.product_count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li><Link to="/our-science" onClick={() => setMenuOpen(false)}>Our Science</Link></li>
                <li><Link to="/contact"     onClick={() => setMenuOpen(false)}>Contact Us</Link></li>
                <li><Link to="/account"     onClick={() => setMenuOpen(false)}>My Account</Link></li>
                {isAdmin && (
                  <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link></li>
                )}
                <li><Link to="/wishlist"    onClick={() => setMenuOpen(false)}>Wishlist {wishCount > 0 && `(${wishCount})`}</Link></li>
              </ul>
            </nav>
          </div>
        </>
      )}

      {/* ── Login modal ──────────────────────────────────────────────────── */}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          defaultMode="login"
        />
      )}
    </>
  );
}

/* ── SVG Icons ───────────────────────────────────────────────────────────── */
function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6"  x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function WishlistIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}
function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

