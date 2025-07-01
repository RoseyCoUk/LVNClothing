import React, { useState } from 'react';
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

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const handleProductClick = (productId: number) => {
    setSelectedProductId(productId);
    setCurrentPage('product');
  };

  const handleBackToShop = () => {
    setSelectedProductId(null);
    setCurrentPage('shop');
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
      case 'product':
        return renderProductPage();
      case 'home':
      default:
        return (
          <>
            <UrgencyBar />
            <Hero />
            <TopSellers onProductClick={handleProductClick} />
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
        <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
        {renderPage()}
        <Footer />
        <CartDrawer />
        <CartPopup />
      </div>
    </CartProvider>
  );
}

export default App;