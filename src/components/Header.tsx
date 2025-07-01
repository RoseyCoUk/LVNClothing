import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Header = ({ currentPage, setCurrentPage }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { getTotalItems, setIsCartOpen } = useCart();

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
    window.scrollTo(0, 0);
  };

  const handleCartClick = () => {
    setIsCartOpen(true);
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

          {/* Cart & Mobile Menu */}
          <div className="flex items-center space-x-4">
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;