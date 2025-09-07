import React from 'react';
import { Facebook, Instagram, Shield, Truck, CreditCard, Mail, MapPin, MessageCircle } from 'lucide-react';
import { SiX, SiTiktok } from 'react-icons/si';
// Add TikTok import if available
// import { Tiktok } from 'lucide-react';

interface FooterProps {
  onPageNavigation?: (page: string) => void;
}

const Footer = ({ onPageNavigation }: FooterProps) => {
  const handlePageClick = (page: string) => {
    if (onPageNavigation) {
      onPageNavigation(page);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Trust Badges */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-6">
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Truck className="w-5 h-5 text-blue-400" />
              <span>Best Shipping Rates</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <span>Easy Returns</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-yellow-400">🇬🇧</span>
              <span>Printed in Britain</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/Leaven Logo.png" 
                alt="LVN Clothing" 
                className="h-8 w-auto"
              />
              <span className="font-bold text-lg">LVN Clothing</span>
            </div>
            <p className="text-gray-400 mb-3 text-sm leading-relaxed">
              Premium Christian streetwear inspired by Matthew 13:33. 
              Faith woven into culture through every piece.
            </p>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              Just as leaven spreads through dough, faith spreads through culture.
            </p>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lvn-maroon transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lvn-maroon transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lvn-maroon transition-colors">
                <SiX className="w-5 h-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lvn-maroon transition-colors">
                <SiTiktok className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handlePageClick('shop')} className="text-gray-400 hover:text-white transition-colors">View All Products</button></li>
              <li><button onClick={() => handlePageClick('shop')} className="text-gray-400 hover:text-white transition-colors">Clothing</button></li>
              <li><button onClick={() => handlePageClick('shop')} className="text-gray-400 hover:text-white transition-colors">Accessories</button></li>
              <li><button onClick={() => handlePageClick('shop')} className="text-gray-400 hover:text-white transition-colors">Bundles</button></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handlePageClick('faq')} className="text-gray-400 hover:text-white transition-colors">FAQ</button></li>
              <li><button onClick={() => handlePageClick('contact')} className="text-gray-400 hover:text-white transition-colors">Contact Us</button></li>
              <li><button onClick={() => handlePageClick('size-guide')} className="text-gray-400 hover:text-white transition-colors">Size Guide</button></li>
              <li><button onClick={() => handlePageClick('shipping-info')} className="text-gray-400 hover:text-white transition-colors">Shipping Info</button></li>
              <li><button onClick={() => handlePageClick('returns-exchanges')} className="text-gray-400 hover:text-white transition-colors">Returns & Exchanges</button></li>
              {/* <li><button onClick={() => handlePageClick('track-order')} className="text-gray-400 hover:text-white transition-colors">Track Order</button></li> */}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-lvn-maroon" />
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-lvn-maroon transition-colors">
                  WhatsApp Support
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-lvn-maroon" />
                <a href="mailto:support@lvnclothing.com" className="text-gray-400 hover:text-lvn-maroon transition-colors">
                  support@lvnclothing.com
                </a>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-lvn-maroon mt-0.5" />
                <span className="text-gray-400">LVN Clothing<br />United Kingdom</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm text-gray-400">
              <button onClick={() => handlePageClick('privacy-policy')} className="hover:text-white transition-colors">Privacy Policy</button>
              <button onClick={() => handlePageClick('terms-of-service')} className="hover:text-white transition-colors">Terms of Service</button>
              <button onClick={() => handlePageClick('cookie-policy')} className="hover:text-white transition-colors">Cookie Policy</button>
              <button onClick={() => handlePageClick('accessibility')} className="hover:text-white transition-colors">Accessibility</button>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>© 2025 LVN Clothing. Faith That Spreads.</p>
              <p className="mt-1">
                Faith woven into culture.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;