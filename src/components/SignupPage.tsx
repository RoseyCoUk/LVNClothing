import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SignupPageProps {
  onBack: () => void;
  onLoginClick: () => void;
}

const SignupPage = ({ onBack, onLoginClick }: SignupPageProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    newsletter: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const { signUp } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setMessage({ type: 'error', text: 'First name is required' });
      return false;
    }
    if (!formData.lastName.trim()) {
      setMessage({ type: 'error', text: 'Last name is required' });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ type: 'error', text: 'Email is required' });
      return false;
    }
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName
      });

      if (!error && formData.newsletter) {
        try {
          // Note: Newsletter subscription would need to be handled separately
          // as it requires database access that's not part of the auth context
          console.log('Newsletter subscription requested for:', formData.email);
        } catch (newsletterError) {
          // Silent error handling for newsletter subscription
        }
      }

      if (error) {
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many signup attempts. Please wait a moment before trying again.';
        }
        
        setMessage({ type: 'error', text: errorMessage });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Account created successfully! Please check your email to confirm your account.' 
        });
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          newsletter: false
        });
      }
    } catch (error: any) {
      console.error('Unexpected error during signup:', error);
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
              Join Our Community
            </h2>
            <p className="mt-2 text-sm text-lvn-black/70">
              Create your account to access exclusive LVN Clothing offers
            </p>
          </div>
        </div>

        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSignup}
          data-testid="signup-form"
        >
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-lvn-black mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-lvn-black/40" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-lvn-black/20 rounded-none placeholder-lvn-black/50 text-lvn-black bg-lvn-white focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-lvn-black mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-lvn-black/40" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-lvn-black/20 rounded-none placeholder-lvn-black/50 text-lvn-black bg-lvn-white focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-lvn-black/20 rounded-none placeholder-lvn-black/50 text-lvn-black bg-lvn-white focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-lvn-black/20 rounded-none placeholder-lvn-black/50 text-lvn-black bg-lvn-white focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-lvn-black mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-lvn-black/40" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 pr-10 border border-lvn-black/20 rounded-none placeholder-lvn-black/50 text-lvn-black bg-lvn-white focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-lvn-black/40 hover:text-lvn-black" />
                  ) : (
                    <Eye className="h-5 w-5 text-lvn-black/40 hover:text-lvn-black" />
                  )}
                </button>
              </div>
            </div>

            {/* Newsletter Checkbox */}
            <div className="flex items-center">
              <input
                id="newsletter"
                name="newsletter"
                type="checkbox"
                checked={formData.newsletter}
                onChange={handleInputChange}
                className="h-4 w-4 text-lvn-maroon border-lvn-black/20 rounded-none focus:ring-lvn-maroon focus:ring-2"
              />
              <label htmlFor="newsletter" className="ml-2 block text-sm text-lvn-black/70">
                Subscribe to our newsletter for exclusive offers and updates
              </label>
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
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-lvn-black/70">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="font-medium text-lvn-maroon hover:text-lvn-black transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;