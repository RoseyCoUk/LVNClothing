import React from 'react';
import { Facebook, Instagram, Shield, Truck, CreditCard, Mail, MapPin, MessageCircle, Heart } from 'lucide-react';
import { SiX, SiTiktok } from 'react-icons/si';

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
    <footer className="bg-lvn-black text-lvn-white">
      {/* Scripture Quote */}
      <div className="border-b border-lvn-white/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="scripture-quote text-2xl md:text-3xl text-lvn-maroon mb-2">
              "For he will command his angels concerning you to guard you in all your ways."
            </div>
            <p className="text-sm text-lvn-white/70">Psalm 91:11</p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-b border-lvn-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-6">
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-5 h-5 text-lvn-maroon" />
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Truck className="w-5 h-5 text-lvn-maroon" />
              <span>Free UK Shipping over £60</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Heart className="w-5 h-5 text-lvn-maroon" />
              <span>Made with Purpose</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-lvn-maroon font-bold">UK</span>
              <span>Premium Christian Streetwear</span>
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
            <p className="text-lvn-white/70 mb-3 text-sm leading-relaxed">
              Premium Christian streetwear inspired by Psalm 91. 
              Under His Wings - Shelter. Strength. Style.
            </p>
            <p className="text-lvn-white/70 mb-4 text-sm leading-relaxed">
              Dwell. Abide. LVN.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=61578282817124" target="_blank" rel="noopener noreferrer" className="text-lvn-white/70 hover:text-lvn-maroon transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/lvnclothing/" target="_blank" rel="noopener noreferrer" className="text-lvn-white/70 hover:text-lvn-maroon transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://x.com/lvnclothing" target="_blank" rel="noopener noreferrer" className="text-lvn-white/70 hover:text-lvn-maroon transition-colors">
                <SiX className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@lvnclothing?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-lvn-white/70 hover:text-lvn-maroon transition-colors">
                <SiTiktok className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handlePageClick('shop')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">View All Collection</button></li>
              <li><button onClick={() => handlePageClick('shop')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Clothing</button></li>
              <li><button onClick={() => handlePageClick('shop')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Accessories</button></li>
              <li><button onClick={() => handlePageClick('shop')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Bundles</button></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handlePageClick('faq')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">FAQ</button></li>
              <li><button onClick={() => handlePageClick('contact')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Contact Us</button></li>
              <li><button onClick={() => handlePageClick('size-guide')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Size Guide</button></li>
              <li><button onClick={() => handlePageClick('shipping-info')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Shipping Info</button></li>
              <li><button onClick={() => handlePageClick('returns-exchanges')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Returns & Exchanges</button></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handlePageClick('about')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Our Story</button></li>
              <li><button onClick={() => handlePageClick('privacy-policy')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => handlePageClick('terms-of-service')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Terms of Service</button></li>
              <li><button onClick={() => handlePageClick('cookie-policy')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Cookie Policy</button></li>
              <li><button onClick={() => handlePageClick('accessibility')} className="text-lvn-white/70 hover:text-lvn-white transition-colors">Accessibility</button></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-lvn-white/20 mt-8 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h4 className="font-semibold mb-2">Stay Connected</h4>
            <p className="text-sm text-lvn-white/70 mb-4">
              Join our community and be the first to know about new collections and exclusive offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-lvn-white/10 border border-lvn-white/20 text-lvn-white placeholder-lvn-white/50 focus:outline-none focus:border-lvn-maroon"
              />
              <button className="bg-lvn-maroon text-lvn-white px-4 py-2 hover:bg-lvn-maroon/80 transition-colors">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-lvn-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-lvn-white/70">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span>© 2024 LVN Clothing. All rights reserved.</span>
              <span>•</span>
              <span>Under His Wings - Psalm 91</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Premium Christian Streetwear</span>
              <span>•</span>
              <span>Made with ❤️ in the UK</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;