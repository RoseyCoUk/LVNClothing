import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import MovementSection from './components/MovementSection';
import Testimonials from './components/Testimonials';
import TopSellers from './components/TopSellers';
import EmailSignup from './components/EmailSignup';
import ShopPage from './components/ShopPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AccountPage from './components/AccountPage';
import CheckoutPage from './components/CheckoutPage';
import SuccessPage from './components/SuccessPage';
import OrdersPage from './components/OrdersPage';
import TrackOrderPage from './components/TrackOrderPage';
import FAQPage from './components/FAQPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import CookiePolicyPage from './components/CookiePolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import ReturnsExchangesPage from './components/ReturnsExchangesPage';
import ShippingInfoPage from './components/ShippingInfoPage';
import SizeGuidePage from './components/SizeGuidePage';
import AccessibilityPage from './components/AccessibilityPage';
import TestPaymentFlow from './components/TestPaymentFlow';
import UrgencyBar from './components/UrgencyBar';
import ProductBundles from './components/ProductBundles';
import CartDrawer from './components/CartDrawer';
import CartPopup from './components/CartPopup';

// Product Pages
import TShirtPage from './components/products/TShirtPage';
import HoodiePage from './components/products/HoodiePage';
import CapPage from './components/products/CapPage';
import ToteBagPage from './components/products/ToteBagPage';
import WaterBottlePage from './components/products/WaterBottlePage';
import MugPage from './components/products/MugPage';
import MousePadPage from './components/products/MousePadPage';
import StickersPage from './components/products/StickersPage';
import BadgeSetPage from './components/products/BadgeSetPage';
import StarterBundlePage from './components/products/StarterBundlePage';
import ChampionBundlePage from './components/products/ChampionBundlePage';
import ActivistBundlePage from './components/products/ActivistBundlePage';

import { CartProvider } from './contexts/CartContext';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('home');

  // Update currentPage based on location
  useEffect(() => {
    const path = location.pathname;
    console.log('Current path:', path);
    if (path === '/') setCurrentPage('home');
    else if (path === '/shop') setCurrentPage('shop');
    else if (path === '/about') setCurrentPage('about');
    else if (path === '/contact') setCurrentPage('contact');
    else if (path === '/login') setCurrentPage('login');
    else if (path === '/signup') setCurrentPage('signup');
    else if (path === '/account') setCurrentPage('account');
    else if (path === '/checkout') setCurrentPage('checkout');
    else if (path === '/orders') setCurrentPage('orders');
    else if (path.startsWith('/product/')) setCurrentPage('product');
    else setCurrentPage('home');
    console.log('Current page set to:', currentPage);
  }, [location.pathname]);

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    // The routing will be handled by React Router
  };

  const handleBackToShop = () => {
    setSelectedProductId(null);
    navigate('/shop');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  const handleShopClick = () => {
    navigate('/shop');
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'shop':
        navigate('/shop');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'contact':
        navigate('/contact');
        break;
      case 'account':
        navigate('/account');
        break;
      case 'orders':
        navigate('/orders');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <Header currentPage={currentPage} setCurrentPage={handleNavigation} onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <UrgencyBar />
                <Hero onShopClick={handleShopClick} />
                <TopSellers onProductClick={handleProductClick} onViewAllClick={handleShopClick} />
                <MovementSection />
                <ProductBundles />
                <Testimonials />
                <EmailSignup />
              </>
            } />
            <Route path="/shop" element={
              <div>
                <h1>Shop Page</h1>
                <ShopPage onProductClick={handleProductClick} />
              </div>
            } />
            <Route path="/about" element={
              <div>
                <h1>About Page</h1>
                <AboutPage />
              </div>
            } />
            <Route path="/contact" element={
              <div>
                <h1>Contact Page</h1>
                <ContactPage />
              </div>
            } />
            <Route path="/login" element={<LoginPage onBack={handleBackToHome} onSignupClick={handleSignupClick} />} />
            <Route path="/signup" element={<SignupPage onBack={handleBackToHome} onLoginClick={handleLoginClick} />} />
            <Route path="/account" element={<AccountPage onBack={handleBackToHome} />} />
            <Route path="/checkout" element={<CheckoutPage onBack={handleBackToHome} />} />
            <Route path="/success" element={<SuccessPage onBackToShop={handleBackToHome} />} />
            <Route path="/orders" element={<OrdersPage onBack={handleBackToHome} />} />
            <Route path="/track-order" element={<TrackOrderPage onBack={handleBackToHome} />} />
            <Route path="/faq" element={<FAQPage onBack={handleBackToHome} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage onBack={handleBackToHome} />} />
            <Route path="/cookie-policy" element={<CookiePolicyPage onBack={handleBackToHome} />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage onBack={handleBackToHome} />} />
            <Route path="/returns-exchanges" element={<ReturnsExchangesPage onBack={handleBackToHome} />} />
            <Route path="/shipping-info" element={<ShippingInfoPage onBack={handleBackToHome} />} />
            <Route path="/size-guide" element={<SizeGuidePage onBack={handleBackToHome} />} />
            <Route path="/accessibility" element={<AccessibilityPage onBack={handleBackToHome} />} />
            <Route path="/test-payment" element={<TestPaymentFlow />} />
            
            {/* Product Routes */}
            <Route path="/product/reform-uk-tshirt" element={<TShirtPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-hoodie" element={<HoodiePage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-cap" element={<CapPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-tote-bag" element={<ToteBagPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-water-bottle" element={<WaterBottlePage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-mug" element={<MugPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-mouse-pad" element={<MousePadPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-stickers" element={<StickersPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-badge-set" element={<BadgeSetPage onBack={handleBackToShop} />} />
            <Route path="/product/starter-bundle" element={<StarterBundlePage onBack={handleBackToShop} />} />
            <Route path="/product/champion-bundle" element={<ChampionBundlePage onBack={handleBackToShop} />} />
            <Route path="/product/activist-bundle" element={<ActivistBundlePage onBack={handleBackToShop} />} />
            
            {/* Fallback route for any other product URLs */}
            <Route path="/product/:slug" element={<ShopPage onProductClick={handleProductClick} />} />
          </Routes>
        </main>
        <Footer onPageNavigation={(page) => navigate(`/${page}`)} />
        <CartDrawer onCheckoutClick={handleCheckoutClick} />
        <CartPopup />
      </div>
    </CartProvider>
  );
};

export default App;