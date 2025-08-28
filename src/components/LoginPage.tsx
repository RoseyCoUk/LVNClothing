import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onBack: () => void;
  onSignupClick: () => void;
}

const LoginPage = ({ onBack, onSignupClick }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please sign up first.';
        }
        
        setMessage({ type: 'error', text: errorMessage });
      } else {
        setMessage({ type: 'success', text: 'Successfully logged in!' });
        setTimeout(() => {
          onBack();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Unexpected error during login:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lvnBg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-lvn-black/70 hover:text-lvn-maroon transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to LVN</span>
        </button>
        
        {/* Header */}
        <div className="text-center">
          <img 
            src="/Leaven Logo.png" 
            alt="LVN Clothing" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-lvn-black mb-2">
            Welcome Back
          </h2>
          <p className="text-lvn-black/70 mb-6">
            Sign in to your LVN Clothing account and continue spreading the Kingdom
          </p>
          
          {/* Kingdom Mission Statement */}
          <div className="bg-lvn-white p-4 rounded-none shadow-sm mb-6">
            <div className="text-lvn-maroon italic text-sm mb-2">
              "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
            </div>
            <div className="text-xs text-lvn-black/60 font-medium">
              — Matthew 13:33
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form 
          className="mt-8 space-y-6 bg-lvn-white p-8 rounded-none shadow-sm" 
          onSubmit={handleLogin}
        >
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-lvn-black mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent transition-colors"
                  placeholder="your@email.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Mail className="h-5 w-5 text-lvn-black/40" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-lvn-black mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-lvn-black/40 hover:text-lvn-maroon transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-none border ${
              message.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'error' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-lvn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lvn-white"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In to LVN</span>
            )}
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-lvn-black/60">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSignupClick}
                className="text-lvn-maroon hover:text-lvn-black font-medium transition-colors"
              >
                Sign up for LVN Clothing
              </button>
            </p>
          </div>
        </form>

        {/* Kingdom Mission Footer */}
        <div className="text-center bg-lvn-maroon text-white p-4 rounded-none">
          <p className="text-sm">
            Join the Kingdom movement. Every LVN garment carries the Gospel message.
          </p>
          <p className="text-xs opacity-80 mt-1">
            Christus Victor • Cultural Leaven • Gospel Witness
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;