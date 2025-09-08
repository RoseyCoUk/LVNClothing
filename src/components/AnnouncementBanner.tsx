import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('bannerDismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for this session
    localStorage.setItem('bannerDismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-lvn-maroon text-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center text-sm md:text-base font-medium">
          <span className="mr-2">❤️</span>
          <span>
            <strong>FREE UK SHIPPING OVER £60</strong> • PREMIUM CHRISTIAN STREETWEAR
          </span>
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-lvn-maroon-dark rounded transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;