
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ShopPage from './components/ShopPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import SuccessPage from './components/SuccessPage';
import UrgencyBar from './components/UrgencyBar';
import TopSellers from './components/TopSellers';
import MovementSection from './components/MovementSection';
import Testimonials from './components/Testimonials';
import EmailSignup from './components/EmailSignup';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './components/CheckoutPage';
import StripeCheckoutPage from './components/StripeCheckoutPage';
import ProductDetailPage from './components/ProductDetailPage';
import ExitIntentPopup, { useExitIntent } from './components/ExitIntentPopup';
import SocialProofNotification from './components/SocialProofNotification';
import UserProfile from './components/UserProfile';
import WishlistPage from './components/WishlistPage';


// Admin Components
import AdminLoginPage from './components/admin/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverviewPage from './components/admin/AdminOverviewPage';
import AdminOrdersPage from './components/admin/AdminOrdersPage';
import AdminProductsPage from './components/admin/AdminProductsPage';
import AdminCustomersPage from './components/admin/AdminCustomersPage';
import AdminSettingsPage from './components/admin/AdminSettingsPage';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ShippingProvider } from './contexts/ShippingContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showPopup, closePopup } = useExitIntent();



  // Determine current page for header
  const currentPage = location.pathname === '/' ? 'home' : 
                     location.pathname === '/shop' ? 'shop' : 
                     location.pathname === '/about' ? 'about' : 
                     location.pathname === '/contact' ? 'contact' : 'other';

  // Check if we're on an admin page
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-lvnBg" role="application" aria-label="LVN Clothing - Premium Christian Streetwear">
      {/* Only show Header and UrgencyBar on non-admin pages */}
      {!isAdminPage && (
        <>
          <Header 
            currentPage={currentPage} 
            setCurrentPage={(page) => {
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
                default:
                  navigate('/');
              }
            }}
            onLoginClick={() => navigate('/login')}
            onSignupClick={() => navigate('/signup')}
          />
          
          <UrgencyBar />
        </>
      )}
      
      <main>
        <Routes>
          <Route path="/" element={
            <>
              <Hero 
                onShopClick={() => navigate('/shop')} 
                onStoryClick={() => navigate('/about')}
              />
              <TopSellers onViewAllClick={() => navigate('/shop')} />
              <MovementSection />
              <Testimonials />
              <EmailSignup />
            </>
          } />
          
          <Route path="/shop" element={
            <ShopPage onProductClick={(productId) => {
              // Handle product click - could navigate to product detail page
              console.log('Product clicked:', productId);
            }} />
          } />
          
          <Route path="/login" element={
            <LoginPage 
              onBack={() => navigate('/')}
              onSignupClick={() => navigate('/signup')}
            />
          } />
          
          <Route path="/signup" element={
            <SignupPage 
              onBack={() => navigate('/')}
              onLoginClick={() => navigate('/login')}
            />
          } />
          
          <Route path="/success" element={
            <SuccessPage onBackToShop={() => navigate('/')} />
          } />
          
          <Route path="/checkout" element={
            <StripeCheckoutPage onBack={() => navigate('/')} />
          } />
          
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          
          <Route path="/profile" element={<UserProfile />} />
          
          <Route path="/wishlist" element={<WishlistPage />} />
          
          <Route path="/about" element={
            <div className="min-h-screen bg-lvnBg py-20">
              <div className="max-w-6xl mx-auto px-4">
                {/* Hero Section */}
                <div className="text-center mb-16">
                  <img 
                    src="/Leaven Logo.png" 
                    alt="LVN Clothing" 
                    className="w-32 h-32 mx-auto mb-8 object-contain"
                  />
                  <h1 className="text-5xl font-bold text-lvn-black mb-6">
                    About Leaven Clothing
                  </h1>
                  <p className="text-xl text-lvn-black/70 max-w-3xl mx-auto leading-relaxed">
                    Leaven Clothing — also known as LVN — is more than apparel. Our mission is to provide 
                    excellent clothing while exercising the gifts God has given us for His glory.
                  </p>
                </div>

                {/* Mission Statement */}
                <div className="bg-lvn-white p-8 rounded-none shadow-sm mb-12">
                  <h2 className="text-3xl font-bold text-lvn-black mb-6">Our Mission</h2>
                  <div className="prose prose-lg max-w-none text-lvn-black/80 leading-relaxed space-y-4">
                    <p>
                      Every piece we design carries a Kingdom mindset: proclaiming that Christ is victorious 
                      over sin and death, and that He is even now putting all of His enemies under His feet 
                      (Psalm 110:1), until He returns to destroy the final enemy, death (1 Corinthians 15:20–26).
                    </p>
                    <p>
                      Through clothing, we seek to herald that Kingdom, pointing to the unstoppable growth 
                      of Christ's reign on Earth.
                    </p>
                  </div>
                </div>

                {/* Final Statement */}
                <div className="bg-lvn-maroon text-white p-8 rounded-none shadow-sm text-center">
                  <p className="text-2xl font-bold mb-4">
                    ⚜️ Leaven Clothing exists to build up the body of Christ, bear witness to the Kingdom, 
                    and glorify God through the work of our hands.
                  </p>
                  <p className="text-lg opacity-90">
                    Every piece carries the Gospel message.
                  </p>
                </div>
              </div>
            </div>
          } />
          
          <Route path="/contact" element={
            <div className="min-h-screen bg-lvnBg py-20">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-5xl font-bold text-lvn-black mb-8 text-center">
                  Contact Us
                </h1>
                <p className="text-xl text-lvn-black/70 text-center mb-12">
                  Get in touch with the LVN Clothing team
                </p>
                
                <div className="bg-lvn-white p-8 rounded-none shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-bold text-lvn-black mb-4">Get In Touch</h3>
                      <p className="text-lvn-black/70 mb-6">
                        Have questions about our clothing or mission? We'd love to hear from you.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-lvn-maroon rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">✉</span>
                          </div>
                          <span className="text-lvn-black">hello@lvnclothing.com</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-lvn-maroon rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">📍</span>
                          </div>
                          <span className="text-lvn-black">United Kingdom</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-lvn-black mb-4">Contact Form</h3>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-lvn-black mb-2">Name</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-lvn-black mb-2">Email</label>
                          <input 
                            type="email" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                            placeholder="your@email.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-lvn-black mb-2">Message</label>
                          <textarea 
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                            placeholder="Your message"
                          ></textarea>
                        </div>
                        <button 
                          type="submit"
                          className="w-full btn-lvn-primary"
                        >
                          Send Message
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminOverviewPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </main>
      
      {/* Only show CartDrawer and Footer on non-admin pages */}
      {!isAdminPage && (
        <>
          <CartDrawer onCheckoutClick={() => navigate('/checkout')} />
          <Footer />
          <ExitIntentPopup isVisible={showPopup} onClose={closePopup} />
          <SocialProofNotification />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <ShippingProvider>
              <Router>
                <AppContent />
              </Router>
            </ShippingProvider>
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;