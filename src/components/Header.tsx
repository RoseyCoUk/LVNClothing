import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, Package, Settings, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import ProductSearch from './ProductSearch';
import { useNavigate } from 'react-router-dom';
import { Product } from '../lib/api';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const Header = ({ currentPage, setCurrentPage, onLoginClick, onSignupClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { getTotalItems, setIsCartOpen } = useCart();
  const { user, signOut } = useAuth();
  const { adminUser } = useAdminAuth();
  const navigate = useNavigate();

  const totalItems = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogoClick = () => {
    // Logo should always go to homepage
    window.location.href = '/';
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  const handleProductSelect = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-lvnBg/95 backdrop-blur-md shadow-lg' : 'bg-lvnBg shadow-md'
    }`} role="banner">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            aria-label="Go to homepage"
          >
            <img
              src="/Leaven Logo.png"
              alt="LVN Clothing Logo"
              className="h-6 w-auto sm:h-8 md:h-10 lg:h-12"
              loading="eager"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Fallback to text logo if image fails
                const fallback = document.createElement('span');
                fallback.className = 'font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl text-lvn-maroon';
                fallback.textContent = 'LVN';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />

          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-lg mx-8">
            <ProductSearch 
              onProductSelect={handleProductSelect}
              placeholder="Search premium Christian streetwear..."
              className="w-full"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
            <button
              onClick={() => window.location.href = '/'}
              className={`font-medium transition-colors ${
                currentPage === 'home'
                  ? 'text-lvn-maroon'
                  : 'text-lvn-black hover:text-lvn-maroon'
              }`}
              aria-current={currentPage === 'home' ? 'page' : undefined}
            >
              Home
            </button>
            <button
              onClick={() => window.location.href = '/shop'}
              className={`font-medium transition-colors ${
                currentPage === 'shop'
                  ? 'text-lvn-maroon'
                  : 'text-lvn-black hover:text-lvn-maroon'
              }`}
              aria-current={currentPage === 'shop' ? 'page' : undefined}
            >
              Shop
            </button>
            <button
              onClick={() => window.location.href = '/about'}
              className={`font-medium transition-colors ${
                currentPage === 'about'
                  ? 'text-lvn-maroon'
                  : 'text-lvn-black hover:text-lvn-maroon'
              }`}
              aria-current={currentPage === 'about' ? 'page' : undefined}
            >
              About
            </button>
            <button
              onClick={() => window.location.href = '/contact'}
              className={`font-medium transition-colors ${
                currentPage === 'contact'
                  ? 'text-lvn-maroon'
                  : 'text-lvn-black hover:text-lvn-maroon'
              }`}
              aria-current={currentPage === 'contact' ? 'page' : undefined}
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
                  className="flex items-center space-x-2 p-2 text-lvn-black hover:text-lvn-maroon transition-colors"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">
                    {user.user_metadata?.first_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-lvn-white rounded-none shadow-lg border border-gray-200 py-2 z-50" role="menu" aria-label="User account options">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-lvn-black">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                
                                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-lvn-black hover:bg-lvn-off-white flex items-center space-x-2"
                      role="menuitem"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/wishlist');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-lvn-black hover:bg-lvn-off-white flex items-center space-x-2"
                      role="menuitem"
                    >
                      <Heart className="w-4 h-4" />
                      <span>My Wishlist</span>
                    </button>

                    {/* Admin Dashboard Link */}
                    <button
                      onClick={() => {
                        window.location.href = '/admin';
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-lvn-black hover:bg-lvn-off-white flex items-center space-x-2"
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        window.location.href = '/orders';
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-lvn-black hover:bg-lvn-off-white flex items-center space-x-2"
                      role="menuitem"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </button>
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-lvn-maroon hover:bg-lvn-off-white flex items-center space-x-2"
                      role="menuitem"
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
                  className="text-lvn-black hover:text-lvn-maroon transition-colors font-medium"
                >
                  Sign In
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={onSignupClick}
                  className="btn-lvn-outline text-sm"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Cart */}
            <button
              onClick={handleCartClick}
              className="relative p-2 text-lvn-black hover:text-lvn-maroon transition-colors"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-lvn-maroon text-lvn-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-lvn-black hover:text-lvn-maroon transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-lvn-white border-t border-gray-200 shadow-lg">
          {/* Mobile Search */}
          <div className="px-4 py-4 border-b border-gray-200">
            <ProductSearch 
              onProductSelect={(product) => {
                handleProductSelect(product);
                setIsMenuOpen(false);
              }}
              placeholder="Search products..."
              className="w-full"
            />
          </div>
          
          <div className="px-4 py-2 space-y-1">
            <button
              onClick={() => handleNavigation('home')}
              className={`w-full text-left px-4 py-3 font-medium transition-colors rounded-none ${
                currentPage === 'home'
                  ? 'text-lvn-maroon bg-lvn-off-white'
                  : 'text-lvn-black hover:bg-lvn-off-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('shop')}
              className={`w-full text-left px-4 py-3 font-medium transition-colors rounded-none ${
                currentPage === 'shop'
                  ? 'text-lvn-maroon bg-lvn-off-white'
                  : 'text-lvn-black hover:bg-lvn-off-white'
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => handleNavigation('about')}
              className={`w-full text-left px-4 py-3 font-medium transition-colors rounded-none ${
                currentPage === 'about'
                  ? 'text-lvn-maroon bg-lvn-off-white'
                  : 'text-lvn-black hover:bg-lvn-off-white'
              }`}
            >
              About
            </button>
            <button
              onClick={() => handleNavigation('contact')}
              className={`w-full text-left px-4 py-3 font-medium transition-colors rounded-none ${
                currentPage === 'contact'
                  ? 'text-lvn-maroon bg-lvn-off-white'
                  : 'text-lvn-black hover:bg-lvn-off-white'
              }`}
            >
              Contact
            </button>
            
            {!user && (
              <>
                <hr className="my-2" />
                <button
                  onClick={onLoginClick}
                  className="w-full text-left px-4 py-3 font-medium text-lvn-black hover:bg-lvn-off-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onSignupClick}
                  className="w-full text-left px-4 py-3 font-medium text-lvn-maroon hover:bg-lvn-off-white transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;