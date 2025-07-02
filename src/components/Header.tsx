import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { getUserSubscription } from '../lib/stripe';
import { products } from '../stripe-config';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const Header = ({ currentPage, setCurrentPage, onLoginClick, onSignupClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { getTotalItems, setIsCartOpen } = useCart();

  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserSubscription();
      }
    });

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserSubscription();
        } else {
          setSubscription(null);
        }
      }
    );

    return () => authSubscription.unsubscribe();
  }, []);

  const loadUserSubscription = async () => {
    try {
      const subscriptionData = await getUserSubscription();
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
  };

  const getSubscriptionPlanName = () => {
    if (!subscription?.price_id) return null;
    
    const product = products.find(p => p.priceId === subscription.price_id);
    return product?.name || 'Unknown Plan';
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => handleNavigation('home')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/BackReformLogo.png" 
              alt="Reform UK" 
              className="h-8 w-auto"
            />
            <span className="font-bold text-xl text-gray-900">Back Reform</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('shop')}
              className={`font-medium transition-colors ${
                currentPage === 'shop' 
                  ? 'text-[#009fe3]' 
                  : 'text-gray-700 hover:text-[#009fe3]'
              }`}
            >
              Shop
            </button>
            <button 
              onClick={() => handleNavigation('about')}
              className={`font-medium transition-colors ${
                currentPage === 'about' 
                  ? 'text-[#009fe3]' 
                  : 'text-gray-700 hover:text-[#009fe3]'
              }`}
            >
              About
            </button>
            <button 
              onClick={() => handleNavigation('contact')}
              className={`font-medium transition-colors ${
                currentPage === 'contact' 
                  ? 'text-[#009fe3]' 
                  : 'text-gray-700 hover:text-[#009fe3]'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:text-[#009fe3] transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user.user_metadata?.first_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {subscription && getSubscriptionPlanName() && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#009fe3] text-white">
                            {getSubscriptionPlanName()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        handleNavigation('orders');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={onLoginClick}
                  className="text-gray-700 hover:text-[#009fe3] font-medium transition-colors"
                >
                  Sign In
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={onSignupClick}
                  className="bg-[#009fe3] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Cart Button */}
            <button 
              onClick={handleCartClick}
              className="relative p-2 text-gray-700 hover:text-[#009fe3] transition-colors group"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#009fe3] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {totalItems}
                </span>
              )}
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => handleNavigation('shop')}
                className={`text-left font-medium transition-colors py-2 ${
                  currentPage === 'shop' 
                    ? 'text-[#009fe3]' 
                    : 'text-gray-700 hover:text-[#009fe3]'
                }`}
              >
                Shop
              </button>
              <button 
                onClick={() => handleNavigation('about')}
                className={`text-left font-medium transition-colors py-2 ${
                  currentPage === 'about' 
                    ? 'text-[#009fe3]' 
                    : 'text-gray-700 hover:text-[#009fe3]'
                }`}
              >
                About
              </button>
              <button 
                onClick={() => handleNavigation('contact')}
                className={`text-left font-medium transition-colors py-2 ${
                  currentPage === 'contact' 
                    ? 'text-[#009fe3]' 
                    : 'text-gray-700 hover:text-[#009fe3]'
                }`}
              >
                Contact
              </button>
              
              {!user && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLoginClick?.();
                    }}
                    className="w-full text-left text-gray-700 hover:text-[#009fe3] font-medium py-2"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onSignupClick?.();
                    }}
                    className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              
              {user && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    {subscription && getSubscriptionPlanName() && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#009fe3] text-white mt-1">
                        {getSubscriptionPlanName()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      handleNavigation('orders');
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-700 hover:text-[#009fe3] font-medium py-2 flex items-center space-x-2"
                  >
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left text-gray-700 hover:text-[#009fe3] font-medium py-2 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;