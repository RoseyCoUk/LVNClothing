import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';

// Simple Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          <h1 style={{ color: '#800000', marginBottom: '20px' }}>Something went wrong</h1>
          <p>Please refresh the page or contact support.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#800000',
              color: '#FFFFFF',
              border: 'none',
              padding: '12px 24px',
              marginTop: '20px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple Header Component
const SimpleHeader = ({ currentPage, onNavClick }: { 
  currentPage: string; 
  onNavClick: (page: string) => void;
}) => {
  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '16px 0',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => onNavClick('home')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: '#000000',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              LVN
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#000000' }}>
                LVN Clothing
              </div>
              <div style={{ fontSize: '12px', color: '#800000' }}>
                Under His Wings • Psalm 91
              </div>
            </div>
          </button>

          <nav style={{ display: 'flex', gap: '32px' }}>
            <button
              onClick={() => onNavClick('shop')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: currentPage === 'shop' ? '#800000' : '#000000',
                fontWeight: currentPage === 'shop' ? '600' : '400'
              }}
            >
              Shop
            </button>
            <button
              onClick={() => onNavClick('about')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: currentPage === 'about' ? '#800000' : '#000000',
                fontWeight: currentPage === 'about' ? '600' : '400'
              }}
            >
              About
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Simple Hero Component
const SimpleHero = ({ onShopClick }: { onShopClick: () => void }) => {
  return (
    <section style={{
      backgroundColor: '#F8F6F1',
      padding: '80px 20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '64px',
          fontWeight: 'bold',
          color: '#000000',
          marginBottom: '24px',
          lineHeight: 1.1
        }}>
          <div>Under His</div>
          <div style={{ color: '#800000' }}>Wings</div>
        </h1>
        
        <p style={{
          fontSize: '24px',
          fontStyle: 'italic',
          color: '#800000',
          marginBottom: '16px'
        }}>
          "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty."
        </p>
        
        <p style={{
          fontSize: '16px',
          color: '#800000',
          marginBottom: '40px'
        }}>
          Psalm 91:1
        </p>

        <div style={{ marginBottom: '48px' }}>
          <div style={{
            fontSize: '24px',
            color: '#000000',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Shelter. Strength. Style.
          </div>
          <div style={{
            fontSize: '18px',
            color: '#666666'
          }}>
            Dwell. Abide. LVN.
          </div>
        </div>

        <button
          onClick={onShopClick}
          style={{
            backgroundColor: '#800000',
            color: '#FFFFFF',
            border: 'none',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer',
            marginRight: '16px'
          }}
        >
          Shop Collection
        </button>
        
        <button style={{
          backgroundColor: 'transparent',
          color: '#000000',
          border: '2px solid #000000',
          padding: '16px 32px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Discover Our Story
        </button>
      </div>
    </section>
  );
};

// Simple Shop Page
const SimpleShopPage = () => {
  const products = [
    {
      id: 1,
      name: 'LVN Wings Hoodie',
      price: 44.99,
      image: '/Hoodie/Men/ReformMenHoodieBlack1.webp'
    },
    {
      id: 2,
      name: 'LVN Shelter T-Shirt',
      price: 29.99,
      image: '/Tshirt/Men/ReformMenTshirtCharcoal1.webp'
    },
    {
      id: 3,
      name: 'LVN Refuge Cap',
      price: 24.99,
      image: '/Cap/ReformCapBlue1.webp'
    }
  ];

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: '#000000',
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          Shop Collection
        </h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px'
        }}>
          {products.map(product => (
            <div key={product.id} style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <span style={{ color: '#9CA3AF' }}>Product Image</span>
              </div>
              
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '8px'
              }}>
                {product.name}
              </h3>
              
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#800000',
                marginBottom: '16px'
              }}>
                £{product.price}
              </p>
              
              <button style={{
                backgroundColor: '#800000',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple Footer
const SimpleFooter = () => {
  return (
    <footer style={{
      backgroundColor: '#000000',
      color: '#FFFFFF',
      padding: '40px 20px',
      marginTop: '80px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            LVN Clothing
          </div>
          <div style={{
            fontSize: '14px',
            color: '#800000'
          }}>
            Under His Wings - Psalm 91
          </div>
        </div>
        
        <p style={{
          fontSize: '16px',
          marginBottom: '24px',
          maxWidth: '600px',
          margin: '0 auto 24px'
        }}>
          Premium Christian streetwear inspired by Psalm 91. 
          Shelter. Strength. Style.
        </p>
        
        <div style={{
          borderTop: '1px solid #333333',
          paddingTop: '24px',
          fontSize: '14px',
          color: '#CCCCCC'
        }}>
          <p>© 2024 LVN Clothing. All rights reserved.</p>
          <p style={{ marginTop: '8px' }}>
            Shelter. Strength. Style. • Under His Wings - Psalm 91
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App Content
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setCurrentPage('home');
    else if (path === '/shop') setCurrentPage('shop');
    else if (path === '/about') setCurrentPage('about');
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
      case 'about':
        navigate('/about');
        break;
      default:
        navigate('/');
    }
  };

  const handleShopClick = () => navigate('/shop');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F6F1' }}>
      <SimpleHeader currentPage={currentPage} onNavClick={handleNavigation} />
      
      <main>
        <Routes>
          <Route path="/" element={<SimpleHero onShopClick={handleShopClick} />} />
          <Route path="/shop" element={<SimpleShopPage />} />
          <Route path="/about" element={
            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#000000', marginBottom: '24px' }}>
                Our Story
              </h1>
              <p style={{ fontSize: '18px', color: '#666666', maxWidth: '600px', margin: '0 auto' }}>
                Coming soon... Our mission to inspire through faith-based streetwear.
              </p>
            </div>
          } />
        </Routes>
      </main>
      
      <SimpleFooter />
    </div>
  );
};

// Main App Component
const AppRobust = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
};

export default AppRobust;
