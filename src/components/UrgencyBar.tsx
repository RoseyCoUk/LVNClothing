import React from 'react';
import { Clock } from 'lucide-react';

const UrgencyBar: React.FC = () => {
  return (
    <div className="bg-red-600 text-white py-2 px-4 text-center relative overflow-hidden">
      <div className="flex items-center justify-center space-x-2 text-sm font-medium">
        <Clock className="w-4 h-4" />
        <span>Limited Time Offer: Best Shipping Rates - Ends Soon!</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
    </div>
  );
};

export default UrgencyBar;