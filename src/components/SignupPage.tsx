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
          console.log('Newsletter subscription requested for:', formData.email);
        } catch (newsletterError) {
          // Silent error handling for newsletter subscription
        }
      }

      if (error) {
        let errorMessage = error.message;
        
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
        setTimeout(() => {
          onBack();
        }, 3000);
      }
    } catch (error: any) {
      console.error('Unexpected error during signup:', error);
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
            Join the Kingdom
          </h2>
          <p className="text-lvn-black/70 mb-6">
            Create your LVN Clothing account and become part of the leaven that transforms culture
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

        {/* Signup Form */}
        <form 
          className="mt-8 space-y-6 bg-lvn-white p-8 rounded-none shadow-sm" 
          onSubmit={handleSignup}
        >
          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-lvn-black mb-2">
                  First Name
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent transition-colors"
                    placeholder="John"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <User className="h-5 w-5 text-lvn-black/40" />
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-lvn-black mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent transition-colors"
                    placeholder="Doe"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <User className="h-5 w-5 text-lvn-black/40" />
                  </div>
                </div>
              </div>
            </div>

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
                  value={formData.email}
                  onChange={handleInputChange}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent transition-colors"
                  placeholder="Create a password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-lvn-black mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent transition-colors"
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-lvn-black/40 hover:text-lvn-maroon transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Newsletter Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                id="newsletter"
                name="newsletter"
                type="checkbox"
                checked={formData.newsletter}
                onChange={handleInputChange}
                className="h-4 w-4 text-lvn-maroon focus:ring-lvn-maroon border-gray-300 rounded"
              />
              <label htmlFor="newsletter" className="text-sm text-lvn-black/70">
                Join the LVN Kingdom newsletter for updates and exclusive content
              </label>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Join LVN Clothing</span>
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-lvn-black/60">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onLoginClick}
                className="text-lvn-maroon hover:text-lvn-black font-medium transition-colors"
              >
                Sign in to LVN Clothing
              </button>
            </p>
          </div>
        </form>

        {/* Kingdom Mission Footer */}
        <div className="text-center bg-lvn-maroon text-white p-4 rounded-none">
          <p className="text-sm">
            Become part of the leaven that transforms culture. Every LVN garment spreads the Kingdom.
          </p>
          <p className="text-xs opacity-80 mt-1">
            Christus Victor • Cultural Leaven • Gospel Witness
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;