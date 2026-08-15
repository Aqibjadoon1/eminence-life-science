import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './store/useAuthStore.js';
import useCartStore from './store/useCartStore.js';

// Global layout components
import Navbar         from './components/globals/Navbar.jsx';
import CartDrawer     from './components/globals/CartDrawer.jsx';
import Footer         from './components/globals/Footer.jsx';
import ToastContainer from './components/globals/ToastContainer.jsx';

// Pages
import HomePage         from './pages/HomePage.jsx';
import ShopPage         from './pages/ShopPage.jsx';
import CategoryPage     from './pages/CategoryPage.jsx';
import ProductPage      from './pages/ProductPage.jsx';
import CartPage         from './pages/CartPage.jsx';
import CheckoutPage     from './pages/CheckoutPage.jsx';
import OrderConfirmPage from './pages/OrderConfirmPage.jsx';
import AccountPage      from './pages/AccountPage.jsx';
import WishlistPage     from './pages/WishlistPage.jsx';
import SciencePage      from './pages/SciencePage.jsx';
import ContactPage      from './pages/ContactPage.jsx';
import NotFoundPage     from './pages/NotFoundPage.jsx';

export default function App() {
  const initAuth  = useAuthStore((s) => s.init);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    initAuth();
    fetchCart();
  }, [initAuth, fetchCart]);

  return (
    <>
      <Navbar />
      <CartDrawer />
      <ToastContainer />

      <main>
        <Routes>
          <Route path="/"                    element={<HomePage />} />
          <Route path="/shop"                element={<ShopPage />} />
          <Route path="/shop/:categorySlug"  element={<CategoryPage />} />
          <Route path="/product/:slug"       element={<ProductPage />} />
          <Route path="/cart"                element={<CartPage />} />
          <Route path="/checkout"            element={<CheckoutPage />} />
          <Route path="/order/:id"           element={<OrderConfirmPage />} />
          <Route path="/account"             element={<AccountPage />} />
          <Route path="/wishlist"            element={<WishlistPage />} />
          <Route path="/our-science"         element={<SciencePage />} />
          <Route path="/contact"             element={<ContactPage />} />
          <Route path="*"                    element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
