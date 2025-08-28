import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Button } from '../ui/button';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 Attempting login with:', email);
      const { error: authError } = await signIn(email, password);
      
      console.log('🔍 Login result:', { authError });
      
      if (authError) {
        console.error('❌ Login error:', authError);
        setError(`Login failed: ${authError.message || 'Invalid email or password'}`);
      } else {
        console.log('✅ Login successful, navigating to admin');
        navigate('/admin');
      }
    } catch (err) {
      console.error('💥 Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2 text-gray-600 hover:text-lvn-maroon transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to LVN Website</span>
        </button>
        
        {/* Logo and Header */}
        <div className="text-center">
          <img 
            src="/Leaven Logo.png" 
            alt="LVN Clothing Admin" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-gray-600">
            Sign in to manage LVN Clothing
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-sm border" onSubmit={handleLogin}>
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent transition-colors"
                  placeholder="admin@lvnclothing.com"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In to Admin'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            LVN Clothing Admin Dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
