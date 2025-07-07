import React, { useState, useEffect } from 'react';
import { CartProvider } from './contexts/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import UrgencyBar from './components/UrgencyBar';
import TopSellers from './components/TopSellers';
import MovementSection from './components/MovementSection';
import ProductBundles from './components/ProductBundles';
import Testimonials from './components/Testimonials';
import EmailSignup from './components/EmailSignup';
import Footer from './components/Footer';
import ShopPage from './components/ShopPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import CheckoutPage from './components/CheckoutPage';
import SizeGuidePage from './components/SizeGuidePage';
import ShippingInfoPage from './components/ShippingInfoPage';
import ReturnsExchangesPage from './components/ReturnsExchangesPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import CookiePolicyPage from './components/CookiePolicyPage';
import AccessibilityPage from './components/AccessibilityPage';
import FAQPage from './components/FAQPage';
import TrackOrderPage from './components/TrackOrderPage';
import OrdersPage from './components/OrdersPage';
import AccountPage from './components/AccountPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import SuccessPage from './components/SuccessPage';
import TestPaymentFlow from './components/TestPaymentFlow';
import CartDrawer from './components/CartDrawer';
import CartPopup from './components/CartPopup';

// Import individual product pages
import HoodiePage from './components/products/HoodiePage';
import TShirtPage from './components/products/TShirtPage';
import CapPage from './components/products/CapPage';
import ToteBagPage from './components/products/ToteBagPage';
import WaterBottlePage from './components/products/WaterBottlePage';
import MugPage from './components/products/MugPage';
import MousePadPage from './components/products/MousePadPage';
import StickersPage from './components/products/StickersPage';
import BadgeSetPage from './components/products/BadgeSetPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [successParams, setSuccessParams] = useState<{ sessionId?: string; email?: string }>({});

  // Add URL-based routing
  useEffect(() => {
    const pathname = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for path-based routing FIRST (priority over query parameters)
    if (pathname.startsWith('/success')) {
      setCurrentPage('success');
      // Extract session_id and email from query parameters
      const sessionId = urlParams.get('session_id');
      const email = urlParams.get('email');
      setSuccessParams({
        sessionId: sessionId || undefined,
        email: email || undefined,
      });
      return; // Exit early, don't check other conditions
    }
    
    // Only check query parameters if NOT on success path
    if (urlParams.get('test') === 'payment') {
      setCurrentPage('test-payment');
      return;
    }
    
    if (urlParams.get('success') === 'true') {
      setCurrentPage('success');
      return;
    }
    
    // Map URL paths to page states
    switch (pathname) {
      case '/':
        setCurrentPage('home');
        break;
      case '/test-payment':
        setCurrentPage('test-payment');
        break;
      case '/shop':
        setCurrentPage('shop');
        break;
      case '/checkout':
        setCurrentPage('checkout');
        break;
      case '/login':
        setCurrentPage('login');
        break;
      case '/signup':
        setCurrentPage('signup');
        break;
      case '/account':
        setCurrentPage('account');
        break;
      default:
        // Handle product pages (e.g., /product/hoodie)
        if (pathname.startsWith('/product/')) {
          setCurrentPage('product');
        } else {
          setCurrentPage('home');
        }
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      const urlParams = new URLSearchParams(window.location.search);
      
      // Check for path-based routing FIRST (priority over query parameters)
      if (pathname.startsWith('/success')) {
        setCurrentPage('success');
        // Extract session_id and email from query parameters
        const sessionId = urlParams.get('session_id');
        const email = urlParams.get('email');
        setSuccessParams({
          sessionId: sessionId || undefined,
          email: email || undefined,
        });
        return; // Exit early, don't check other conditions
      }
      
      // Only check query parameters if NOT on success path
      if (urlParams.get('test') === 'payment') {
        setCurrentPage('test-payment');
        return;
      }
      
      if (urlParams.get('success') === 'true') {
        setCurrentPage('success');
        return;
      }
      
      switch (pathname) {
        case '/':
          setCurrentPage('home');
          break;
        case '/test-payment':
          setCurrentPage('test-payment');
          break;
        case '/shop':
          setCurrentPage('shop');
          break;
        case '/checkout':
          setCurrentPage('checkout');
          break;
        case '/login':
          setCurrentPage('login');
          break;
        case '/signup':
          setCurrentPage('signup');
          break;
        case '/account':
          setCurrentPage('account');
          break;
        default:
          if (pathname.startsWith('/product/')) {
            setCurrentPage('product');
          } else {
            setCurrentPage('home');
          }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when page changes
  useEffect(() => {
    const pathMap: { [key: string]: string } = {
      'home': '/',
      'success': '/success',
      'test-payment': '/test-payment',
      'shop': '/shop',
      'checkout': '/checkout',
      'login': '/login',
      'signup': '/signup',
      'account': '/account',
    };

    const path = pathMap[currentPage];
    if (path && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, [currentPage]);

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product');
    window.scrollTo(0, 0);
  };

  const handleBackToShop = () => {
    setSelectedProductId(null);
    setCurrentPage('shop');
    window.scrollTo(0, 0);
  };

  const handleViewAllClick = () => {
    setCurrentPage('shop');
    window.scrollTo(0, 0);
  };

  const handleShopClick = () => {
    setCurrentPage('shop');
    window.scrollTo(0, 0);
  };

  const handleCheckoutClick = () => {
    setCurrentPage('checkout');
    window.scrollTo(0, 0);
  };

  const handleBackFromCheckout = () => {
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  const handlePageNavigation = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  const handleLoginClick = () => {
    setCurrentPage('login');
    window.scrollTo(0, 0);
  };

  const handleSignupClick = () => {
    setCurrentPage('signup');
    window.scrollTo(0, 0);
  };

  const renderProductPage = () => {
    if (!selectedProductId) {
      return <ShopPage onProductClick={handleProductClick} />;
    }

    const productComponents = {
      1: HoodiePage,
      2: TShirtPage,
      3: CapPage,
      4: ToteBagPage,
      5: WaterBottlePage,
      6: MugPage,
      7: MousePadPage,
      8: StickersPage,
      9: BadgeSetPage,
    };

    const ProductComponent = productComponents[selectedProductId as keyof typeof productComponents];
    
    if (ProductComponent) {
      return <ProductComponent onBack={handleBackToShop} />;
    }

    return <ShopPage onProductClick={handleProductClick} />;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'shop':
        return <ShopPage onProductClick={handleProductClick} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'checkout':
        return <CheckoutPage onBack={handleBackFromCheckout} />;
      case 'size-guide':
        return <SizeGuidePage onBack={handleBackToHome} />;
      case 'shipping-info':
        return <ShippingInfoPage onBack={handleBackToHome} />;
      case 'returns-exchanges':
        return <ReturnsExchangesPage onBack={handleBackToHome} />;
      case 'privacy-policy':
        return <PrivacyPolicyPage onBack={handleBackToHome} />;
      case 'terms-of-service':
        return <TermsOfServicePage onBack={handleBackToHome} />;
      case 'cookie-policy':
        return <CookiePolicyPage onBack={handleBackToHome} />;
      case 'accessibility':
        return <AccessibilityPage onBack={handleBackToHome} />;
      case 'faq':
        return <FAQPage onBack={handleBackToHome} />;
      case 'track-order':
        return <TrackOrderPage onBack={handleBackToHome} />;
      case 'orders':
        return <OrdersPage onBack={handleBackToHome} />;
      case 'account':
        return <AccountPage onBack={handleBackToHome} />;
      case 'login':
        return <LoginPage onBack={handleBackToHome} onSignupClick={handleSignupClick} />;
      case 'signup':
        return <SignupPage onBack={handleBackToHome} onLoginClick={handleLoginClick} />;
      case 'success':
        return <SuccessPage onBackToShop={handleBackToHome} sessionId={successParams.sessionId} email={successParams.email} />;
      case 'test-payment':
        return <TestPaymentFlow />;
      case 'product':
        return renderProductPage();
      case 'home':
      default:
        return (
          <>
            <UrgencyBar />
            <Hero onShopClick={handleShopClick} />
            <TopSellers onProductClick={handleProductClick} onViewAllClick={handleViewAllClick} />
            <MovementSection />
            <ProductBundles />
            <Testimonials />
            <EmailSignup />
          </>
        );
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen">
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          onLoginClick={handleLoginClick}
          onSignupClick={handleSignupClick}
        />
        {renderPage()}
        {currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'success' && currentPage !== 'test-payment' && (
          <Footer onPageNavigation={handlePageNavigation} />
        )}
        <CartDrawer onCheckoutClick={handleCheckoutClick} />
        <CartPopup />
      </div>
    </CartProvider>
  );
}

export default App;