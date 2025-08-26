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
    console.log('🔍 handleLogin called with event:', e.type);
    e.preventDefault();
    console.log('Login form submitted with:', { email, password: password ? '[REDACTED]' : 'empty' });
    
    setIsLoading(true);
    setMessage(null);

    try {
      console.log('Attempting authentication...');
      const { error } = await signIn(email, password);

      console.log('Auth response:', { error: error?.message });

      if (error) {
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please sign up first.';
        }
        
        console.log('Setting error message:', errorMessage);
        setMessage({ type: 'error', text: errorMessage });
      } else {
        console.log('Login successful, setting success message');
        setMessage({ type: 'success', text: 'Successfully logged in!' });
        // The auth state change will be handled by the parent component
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
    <div className="min-h-screen bg-lvn-off-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-lvn-black/70 hover:text-lvn-maroon transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Shop</span>
          </button>
          
          <div className="text-center">
            <img 
              src="/Leaven Logo.png" 
              alt="LVN Clothing" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-lvn-black">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-lvn-black/70">
              Sign in to access your LVN Clothing account and orders
            </p>
          </div>
        </div>

        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleLogin}
          data-testid="login-form"
          action="#"
          method="post"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-lvn-black mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-lvn-black/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-lvn-black/20 rounded-none placeholder-lvn-black/50 text-lvn-black bg-lvn-white focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-lvn-black mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-lvn-black/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-lvn-black/20 rounded-none placeholder-lvn-black/50 text-lvn-black bg-lvn-white focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-lvn-black/40 hover:text-lvn-black" />
                  ) : (
                    <Eye className="h-5 w-5 text-lvn-black/40 hover:text-lvn-black" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {message && (
            <div className={`flex items-center space-x-2 p-3 rounded-none border ${
              message.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-800' 
                : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              {message.type === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-none text-lvn-white bg-lvn-maroon hover:bg-lvn-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lvn-maroon disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lvn-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-lvn-black/70">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSignupClick}
                className="font-medium text-lvn-maroon hover:text-lvn-black transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;