import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Shield, Truck, CreditCard, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
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
              <span>Free UK Shipping Over £30</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CreditCard className="w-5 h-5 text-purple-400" />
              <span>Easy Returns</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-yellow-400">🇬🇧</span>
              <span>Made in Britain</span>
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
                src="/BackReformLogo.png" 
                alt="Reform UK" 
                className="h-8 w-auto"
              />
              <span className="font-bold text-lg">Back Reform</span>
            </div>
            <p className="text-gray-400 mb-3 text-sm leading-relaxed">
              Official merchandise supporting Reform UK's mission for real change in Britain. 
              Every purchase helps fund our democratic movement.
            </p>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              Run by Reform UK volunteers and supporters.
            </p>
            <div className="flex space-x-4">
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#009fe3] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#009fe3] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#009fe3] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#009fe3] transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">View All Merch</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Clothing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Accessories</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Bundles</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sale Items</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Size Guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#009fe3]" />
                <span className="text-gray-400">0800 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#009fe3]" />
                <span className="text-gray-400">shop@reformuk.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#009fe3] mt-0.5" />
                <span className="text-gray-400">Reform UK HQ<br />London, United Kingdom</span>
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
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>© 2024 Back Reform. All rights reserved.</p>
              <p className="mt-1">
                <span className="text-[#009fe3]">100% of proceeds</span> support Reform UK initiatives
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;