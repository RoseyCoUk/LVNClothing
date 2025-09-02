import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import MovementSection from './components/MovementSection';
import Testimonials from './components/Testimonials';
import TopSellers from './components/TopSellers';
import EmailSignup from './components/EmailSignup';
import { ShopPage } from '@/pages/shop';
import { AboutPage, ContactPage } from '@/pages/support';
import { LoginPage, SignupPage, AccountPage } from '@/pages/auth';
import DynamicCheckoutPage from '@/components/checkout/DynamicCheckoutPage';
import { SuccessPage, OrdersPage, TrackOrderPage } from '@/pages/shop';
import { FAQPage } from '@/pages/support';
import { PrivacyPolicyPage, CookiePolicyPage, TermsOfServicePage } from '@/pages/legal';
import { ReturnsExchangesPage, ShippingInfoPage, SizeGuidePage, AccessibilityPage } from '@/pages/support';
import TestPaymentFlow from './components/TestPaymentFlow';
import UrgencyBar from './components/UrgencyBar';
import ProductBundles from './components/ProductBundles';
import CartDrawer from './components/CartDrawer';
import CartPopup from './components/CartPopup';
import PrintfulTest from './components/PrintfulTest';
import PrintfulProductDetailWrapper from './components/PrintfulProductDetailWrapper';
import ShippingTest from './components/ShippingTest';
import ShippingTestDashboard from './components/ShippingTestDashboard';
import ShippingExample from './components/checkout/ShippingExample';

// Dynamic Product Page
import DynamicProductPage from './components/products/DynamicProductPage';

// Dedicated Product Pages
import TShirtPage from './components/products/TShirtPage';
import HoodiePage from './components/products/HoodiePage';
import CapPage from './components/products/CapPage';
import ToteBagPage from './components/products/ToteBagPage';
import WaterBottlePage from './components/products/WaterBottlePage';
import MugPage from './components/products/MugPage';
import MousePadPage from './components/products/MousePadPage';

// Bundle Pages (keep these for now)
import StarterBundlePage from './components/products/StarterBundlePage';
import ChampionBundlePage from './components/products/ChampionBundlePage';
import ActivistBundlePage from './components/products/ActivistBundlePage';

import { CartProvider, AuthProvider, ShippingProvider } from '@/contexts';
import { AdminProvider, AdminProductsProvider } from '@/admin/contexts';
import PrintfulStatus from '@/components/PrintfulStatus';
import { performanceMonitor } from '@/lib/performance';

// Admin Components
import {
  AdminLoginPage,
  AdminDashboard,
  AdminOrdersPage,
  AdminAnalyticsPage,
  AdminCustomersPage,
  AdminSettingsPage,
  AdminProductsPage,
  AdminLayout,
  AdminProtectedRoute
} from '@/admin/components';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('home');

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Update currentPage based on location
  useEffect(() => {
    const path = location.pathname;
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
  }, [location.pathname]);

  // Performance monitoring for page loads
  useEffect(() => {
    // Start page load timer
    performanceMonitor.startPageLoadTimer();
    
    // End timer when component mounts
    performanceMonitor.endPageLoadTimer();
    
    // Monitor for performance issues
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message) {
        performanceMonitor.recordError(event.error.message);
      }
    };
    
    // Add responsive performance monitoring
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Log device characteristics for performance optimization
  
      
      // Adjust performance monitoring based on device capabilities
      if (width < 768) {
        // Mobile device - optimize for slower connections
        performanceMonitor.setMobileMode(true);
      } else {
        performanceMonitor.setMobileMode(false);
      }
    };
    
    // Initial call
    handleResize();
    
    window.addEventListener('error', handleError);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    <AuthProvider>
      <AdminProvider>
        <AdminProductsProvider>
          <CartProvider>
            <ShippingProvider>
          <div className="min-h-screen bg-white" role="application" aria-label="Reform UK E-commerce Platform">
          {!location.pathname.startsWith('/admin') && (
            <Header currentPage={currentPage} setCurrentPage={handleNavigation} onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
          )}
          <main role="main" id="main-content">
          <Routes>
            <Route path="/" element={
              <>
                <UrgencyBar />
                <Hero onShopClick={handleShopClick} />
                <TopSellers onViewAllClick={handleShopClick} />
                <MovementSection />
                <ProductBundles />
                <Testimonials />
                <EmailSignup />
              </>
            } />
            <Route path="/shop" element={
                <ShopPage onProductClick={handleProductClick} />
            } />
            <Route path="/about" element={
                <AboutPage />
            } />
            <Route path="/contact" element={
                <ContactPage />
            } />
            <Route path="/login" element={<LoginPage onBack={handleBackToHome} onSignupClick={handleSignupClick} />} />
            <Route path="/signup" element={<SignupPage onBack={handleBackToHome} onLoginClick={handleLoginClick} />} />
            <Route path="/account" element={<AccountPage onBack={handleBackToHome} />} />
            <Route path="/checkout" element={<DynamicCheckoutPage />} />
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
            <Route path="/printful-test" element={<PrintfulTest />} />
            <Route path="/shipping-test" element={<ShippingTest />} />
            <Route path="/shipping-dashboard" element={<ShippingTestDashboard />} />
            <Route path="/shipping-example" element={<ShippingExample />} />
            <Route path="/printful-product/:id" element={<PrintfulProductDetailWrapper />} />
            
            {/* Product Routes - Using dedicated product pages for merged products */}
            <Route path="/product/reform-uk-tshirt" element={<TShirtPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-hoodie" element={<HoodiePage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-cap" element={<CapPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-tote-bag" element={<ToteBagPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-water-bottle" element={<WaterBottlePage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-mug" element={<MugPage onBack={handleBackToShop} />} />
            <Route path="/product/reform-uk-mouse-pad" element={<MousePadPage onBack={handleBackToShop} />} />

            <Route path="/product/starter-bundle" element={<StarterBundlePage onBack={handleBackToShop} />} />
            <Route path="/product/champion-bundle" element={<ChampionBundlePage onBack={handleBackToShop} />} />
            <Route path="/product/activist-bundle" element={<ActivistBundlePage onBack={handleBackToShop} />} />
            
            {/* Fallback route for any other product URLs */}
            <Route path="/product/:slug" element={<DynamicProductPage onBack={handleBackToShop} />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={
              <AdminProtectedRoute requiredPermission="view_analytics">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminProtectedRoute requiredPermission="view_orders">
                <AdminLayout>
                  <AdminOrdersPage />
                </AdminLayout>
              </AdminProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <AdminProtectedRoute requiredPermission="view_products">
                <AdminLayout>
                  <AdminProductsPage />
                </AdminLayout>
              </AdminProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <AdminProtectedRoute requiredPermission="view_analytics">
                <AdminLayout>
                  <AdminAnalyticsPage />
                </AdminLayout>
              </AdminProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <AdminProtectedRoute requiredPermission="customers">
                <AdminLayout>
                  <AdminCustomersPage />
                </AdminLayout>
              </AdminProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <AdminProtectedRoute requiredPermission="settings">
                <AdminLayout>
                  <AdminSettingsPage />
                </AdminLayout>
              </AdminProtectedRoute>
            } />
          </Routes>
        </main>
        {!location.pathname.startsWith('/admin') && (
          <>
            <Footer onPageNavigation={(page) => navigate(`/${page}`)} />
            <CartDrawer onCheckoutClick={handleCheckoutClick} />
            <CartPopup />
            <PrintfulStatus />
          </>
        )}
        </div>
        </ShippingProvider>
        </CartProvider>
        </AdminProductsProvider>
      </AdminProvider>
    </AuthProvider>
  );
};

export default App;