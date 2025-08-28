import React, { useState, useEffect } from 'react';
import { X, Gift, Mail, Star, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ExitIntentPopupProps {
  onClose: () => void;
  isVisible: boolean;
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ onClose, isVisible }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Subscribe to newsletter with discount code
      const { error } = await supabase.functions.invoke('newsletter-signup', {
        body: { 
          email: email.trim(),
          source: 'exit_intent',
          discount_code: 'KINGDOM10'
        }
      });

      if (error) {
        setError('Failed to subscribe. Please try again.');
        return;
      }

      setIsSuccess(true);
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-lvn-maroon to-red-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 rounded-full p-3">
              <Gift className="w-8 h-8" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Wait! Don't Leave Empty-Handed</h2>
          <p className="text-white/90">Join our Kingdom community and save!</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSuccess ? (
            <>
              {/* Offer Details */}
              <div className="text-center mb-6">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6 text-yellow-600 mr-2" />
                    <span className="text-2xl font-bold text-yellow-800">10% OFF</span>
                  </div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Your first order + exclusive Kingdom updates
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>Exclusive Offers</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-blue-500 mr-1" />
                    <span>Faith Inspiration</span>
                  </div>
                </div>

                <div className="bg-lvn-off-white p-4 rounded-xl mb-4">
                  <p className="text-sm italic text-gray-700 mb-2">
                    "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
                  </p>
                  <p className="text-xs text-lvn-maroon font-medium">— Matthew 13:33</p>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full bg-lvn-maroon text-white font-semibold py-3 rounded-xl hover:bg-lvn-maroon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Joining Kingdom Community...
                    </div>
                  ) : (
                    'Claim My 10% Discount'
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Gift className="w-10 h-10 text-green-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to the Kingdom!</h3>
              <p className="text-gray-600 mb-4">
                Check your email for your 10% discount code: <strong>KINGDOM10</strong>
              </p>
              
              <div className="bg-lvn-maroon text-white p-3 rounded-xl text-sm">
                Use code <strong>KINGDOM10</strong> at checkout for 10% off your first order!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for exit-intent detection
export const useExitIntent = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('exitIntentShown');
    if (hasSeenPopup) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of screen and hasn't been shown
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        localStorage.setItem('exitIntentShown', 'true');
      }
    };

    // Also show after 30 seconds if user is still on page
    const timeoutId = setTimeout(() => {
      if (!hasShown) {
        setShowPopup(true);
        setHasShown(true);
        localStorage.setItem('exitIntentShown', 'true');
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutId);
    };
  }, [hasShown]);

  const closePopup = () => {
    setShowPopup(false);
  };

  return { showPopup, closePopup };
};

export default ExitIntentPopup;
