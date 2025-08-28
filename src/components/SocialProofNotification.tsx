import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Users, MapPin } from 'lucide-react';

interface PurchaseNotification {
  id: string;
  customerName: string;
  productName: string;
  location: string;
  timeAgo: string;
  avatar?: string;
}

const SocialProofNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<PurchaseNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<PurchaseNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Mock recent purchases - in production, this would come from your API
  const mockPurchases: PurchaseNotification[] = [
    {
      id: '1',
      customerName: 'Sarah M.',
      productName: 'LVN Kingdom Hoodie',
      location: 'London',
      timeAgo: '3 minutes ago'
    },
    {
      id: '2',
      customerName: 'James R.',
      productName: 'Faith Collection T-Shirt',
      location: 'Manchester',
      timeAgo: '7 minutes ago'
    },
    {
      id: '3',
      customerName: 'Emma L.',
      productName: 'LVN Premium Cap',
      location: 'Birmingham',
      timeAgo: '12 minutes ago'
    },
    {
      id: '4',
      customerName: 'Michael T.',
      productName: 'Kingdom Leaven Bundle',
      location: 'Liverpool',
      timeAgo: '18 minutes ago'
    },
    {
      id: '5',
      customerName: 'Grace K.',
      productName: 'LVN Tote Bag',
      location: 'Leeds',
      timeAgo: '25 minutes ago'
    }
  ];

  useEffect(() => {
    setNotifications(mockPurchases);
  }, []);

  useEffect(() => {
    if (notifications.length === 0) return;

    // Show first notification after 5 seconds
    const initialDelay = setTimeout(() => {
      showRandomNotification();
    }, 5000);

    // Then show notifications every 15-25 seconds
    const interval = setInterval(() => {
      showRandomNotification();
    }, Math.random() * 10000 + 15000); // Random between 15-25 seconds

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [notifications]);

  const showRandomNotification = () => {
    if (notifications.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * notifications.length);
    const notification = notifications[randomIndex];
    
    setCurrentNotification(notification);
    setIsVisible(true);

    // Auto-hide after 6 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!currentNotification || !isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 animate-slide-up">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg max-w-sm w-full overflow-hidden">
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-lvn-maroon to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {currentNotification.customerName.charAt(0)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    <span className="text-lvn-maroon">{currentNotification.customerName}</span> just purchased
                  </p>
                  <p className="text-sm text-gray-800 font-semibold mb-2">
                    {currentNotification.productName}
                  </p>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {currentNotification.location}
                    </div>
                    <div className="flex items-center">
                      <ShoppingBag className="w-3 h-3 mr-1" />
                      {currentNotification.timeAgo}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Trust Indicator */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
              <Users className="w-3 h-3" />
              <span>47 people viewing this item</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-lvn-maroon to-red-600 animate-progress"
            style={{
              animation: 'progress 6s linear forwards'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }

        .animate-progress {
          animation: progress 6s linear forwards;
        }
      `}</style>
    </div>
  );
};

export default SocialProofNotification;
