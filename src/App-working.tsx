import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import MovementSection from './components/MovementSection';
import Testimonials from './components/Testimonials';
import TopSellers from './components/TopSellers';
import EmailSignup from './components/EmailSignup';
import ShopPage from './components/ShopPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import SuccessPage from './components/SuccessPage';
import UrgencyBar from './components/UrgencyBar';
import CartDrawer from './components/CartDrawer';

// Simple context providers for basic functionality
const SimpleCartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartContext = {
    cartItems,
    addToCart: () => {},
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    getTotalItems: () => 0,
    getTotalPrice: () => 0,
    isCartOpen,
    setIsCartOpen,
    refreshPricing: async () => {},
  };

  return (
    <div className="cart-context" data-context={JSON.stringify(cartContext)}>
      {children}
    </div>
  );
};

const SimpleAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const authContext = {
    user: null,
    session: null,
    loading: false,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => {},
    refreshSession: async () => {},
    isAuthenticated: false,
  };

  return (
    <div className="auth-context" data-context={JSON.stringify(authContext)}>
      {children}
    </div>
  );
};

const SimpleShippingProvider = ({ children }: { children: React.ReactNode }) => {
  const shippingContext = {
    shippingRates: [],
    selectedRate: null,
    setSelectedRate: () => {},
    calculateShipping: async () => ({}),
    loading: false,
  };

  return (
    <div className="shipping-context" data-context={JSON.stringify(shippingContext)}>
      {children}
    </div>
  );
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
    else if (path === '/login') setCurrentPage('login');
    else if (path === '/signup') setCurrentPage('signup');
    else setCurrentPage('home');
  }, [location.pathname]);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'shop':
        navigate('/shop');
        break;
      default:
        navigate('/');
    }
  };

  const handleShopClick = () => navigate('/shop');
  const handleBackToHome = () => navigate('/');
  const handleLoginClick = () => navigate('/login');
  const handleSignupClick = () => navigate('/signup');
  const handleCheckoutClick = () => navigate('/checkout');

  return (
    <div className="min-h-screen bg-lvn-white" role="application" aria-label="LVN Clothing - Premium Christian Streetwear">
      <Header 
        currentPage={currentPage} 
        setCurrentPage={handleNavigation} 
        onLoginClick={handleLoginClick} 
        onSignupClick={handleSignupClick} 
      />
      
      <main role="main" id="main-content">
        <Routes>
          <Route path="/" element={
            <>
              <UrgencyBar />
              <Hero onShopClick={handleShopClick} />
              <TopSellers onViewAllClick={handleShopClick} />
              <MovementSection />
              <Testimonials />
              <EmailSignup />
            </>
          } />
          
          <Route path="/shop" element={
            <ShopPage onProductClick={() => {}} />
          } />
          
          <Route path="/login" element={
            <LoginPage onBack={handleBackToHome} onSignupClick={handleSignupClick} />
          } />
          
          <Route path="/signup" element={
            <SignupPage onBack={handleBackToHome} onLoginClick={handleLoginClick} />
          } />
          
          <Route path="/success" element={
            <SuccessPage onBackToShop={handleBackToHome} />
          } />
        </Routes>
      </main>
      
      <Footer onPageNavigation={(page) => navigate(`/${page}`)} />
      <CartDrawer onCheckoutClick={handleCheckoutClick} />
    </div>
  );
};

const AppWorking = () => {
  return (
    <SimpleAuthProvider>
      <SimpleCartProvider>
        <SimpleShippingProvider>
          <Router>
            <AppContent />
          </Router>
        </SimpleShippingProvider>
      </SimpleCartProvider>
    </SimpleAuthProvider>
  );
};

export default AppWorking;
