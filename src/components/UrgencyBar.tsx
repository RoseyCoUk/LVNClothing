import React from 'react';
import { Truck, Heart } from 'lucide-react';

const UrgencyBar: React.FC = () => {
  return (
    <div className="bg-lvn-maroon text-lvn-white py-3 px-4 text-center relative overflow-hidden">
      <div className="flex items-center justify-center space-x-2 text-sm font-medium">
        <Truck className="w-4 h-4" />
        <span>🚚 FREE UK SHIPPING OVER £60 • PREMIUM CHRISTIAN STREETWEAR</span>
        <Heart className="w-4 h-4" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lvn-white/10 to-transparent animate-pulse"></div>
    </div>
  );
};

export default UrgencyBar;