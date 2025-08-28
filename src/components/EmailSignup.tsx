import React, { useState } from 'react';
import { Mail, Gift, Users, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EmailSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Basic validation
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Rate limiting - prevent multiple submissions within 5 seconds
    const now = Date.now();
    if (now - lastSubmissionTime < 5000) {
      setError('Please wait a moment before trying again');
      return;
    }
    
    setIsLoading(true);
    setLastSubmissionTime(now);

    try {
      // Call the newsletter signup function
      const { data, error } = await supabase.functions.invoke('newsletter-signup', {
        body: { email: email.trim() }
      });

      if (error) {
        console.error('Newsletter signup error:', error);
        
        // Handle specific error types
        if (error.message?.includes('already subscribed')) {
          setError('This email is already subscribed to our newsletter');
        } else if (error.message?.includes('rate limit')) {
          setError('Too many signup attempts. Please wait a moment before trying again.');
        } else if (error.message?.includes('invalid email')) {
          setError('Please enter a valid email address');
        } else {
          setError('Failed to subscribe. Please try again later.');
        }
        return;
      }

      if (data?.success) {
        setIsSubscribed(true);
        setEmail('');
        setError('');
      } else {
        setError(data?.error || 'Failed to subscribe. Please try again.');
      }
    } catch (err: any) {
      console.error('Newsletter signup exception:', err);
      
      // Handle network or other errors
      if (err.message?.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else if (err.message?.includes('timeout')) {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to subscribe. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="email-signup" className="py-16 bg-gradient-to-r from-lvn-maroon to-lvn-black text-lvn-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {!isSubscribed ? (
          <>
            <div className="mb-8">
              <Gift className="w-16 h-16 mx-auto mb-4 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Join Our Faith Community
              </h2>
              <p className="text-xl text-lvn-white/80 max-w-2xl mx-auto mb-4">
                Be the first to know about new collections, exclusive offers, and daily inspiration from Matthew 13:33.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 text-lvn-off-white" />
                  <span>Exclusive offers</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5 text-lvn-off-white" />
                  <span>Faith community</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-5 h-5 text-lvn-off-white" />
                  <span>Daily inspiration</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-lvn-white/10 border border-lvn-white/30 text-lvn-white placeholder-lvn-white/60 rounded-none focus:outline-none focus:border-lvn-white focus:bg-lvn-white/20 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-lvn-white text-lvn-black font-semibold py-3 px-6 rounded-none hover:bg-lvn-off-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Subscribe</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-3 text-red-200 text-sm bg-red-900/30 border border-red-500/30 px-3 py-2 rounded-none">
                  {error}
                </div>
              )}
            </form>

            <p className="text-sm text-lvn-white/60 mt-4">
              Join thousands of believers who trust LVN Clothing. Free UK shipping on orders over £60.
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-lvn-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-lvn-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to LVN Clothing!
            </h2>
            <p className="text-xl text-lvn-white/80 max-w-2xl mx-auto mb-6">
              Thank you for joining our faith community. You'll receive updates about new collections and daily inspiration from Matthew 13:33.
            </p>
            <div className="bg-lvn-white/10 border border-lvn-white/20 rounded-none p-4 max-w-md mx-auto">
              <p className="text-sm text-lvn-white/80">
                <strong>What's next?</strong> Check your email for a welcome message and stay tuned for exclusive offers and faith-inspired content.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default EmailSignup;