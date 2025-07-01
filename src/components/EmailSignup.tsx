import React, { useState } from 'react';
import { Mail, Gift, Users, Sparkles } from 'lucide-react';

const EmailSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section id="email-signup" className="py-16 bg-gradient-to-r from-[#009fe3] to-blue-600 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {!isSubscribed ? (
          <>
            <div className="mb-8">
              <Gift className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join the Movement & Save 10%
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-4">
                Be first to know about new drops, exclusive deals, and campaign updates. 
                Plus get 10% off your first order!
              </p>
              
              {/* Enhanced Benefits */}
              <div className="flex items-center justify-center space-x-2 text-blue-100 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Be first to know about exclusive limited-edition drops</span>
              </div>
              
              {/* Social Proof */}
              <div className="flex items-center justify-center space-x-2 text-blue-100 mb-6">
                <Users className="w-5 h-5" />
                <span className="font-semibold">Join 7,000+ supporters already on the list</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white text-lg"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-white text-[#009fe3] font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap text-lg shadow-lg"
                  >
                    Join Now
                  </button>
                </div>
              </form>
              
              <p className="text-sm text-blue-100 mt-4">
                By subscribing, you agree to receive campaign updates and promotional offers. 
                You can unsubscribe at any time.
              </p>
            </div>
          </>
        ) : (
          <div className="py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Welcome to the Movement!</h3>
            <p className="text-blue-100 mb-6">
              Check your email for your 10% discount code and latest updates.
            </p>
            <button
              onClick={() => setIsSubscribed(false)}
              className="text-blue-100 hover:text-white underline"
            >
              Subscribe another email
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EmailSignup;