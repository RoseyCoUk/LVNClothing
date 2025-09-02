import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Package, 
  Settings, 
  Shield, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Edit3,
  Save,
  X,
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Bell,
  Download,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getUserOrders } from '../../lib/stripe';

interface AccountPageProps {
  onBack: () => void;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  last_sign_in_at?: string;
}

interface Order {
  id: string;
  readable_order_id: string;
  customer_email: string;
  amount_total: number;
  created_at: string;
  items: any[];
}

interface UserPreferences {
  id: string;
  user_id: string;
  email_order_confirmations: boolean;
  email_newsletter: boolean;
  email_product_recommendations: boolean;
  created_at: string;
  updated_at: string;
}

const AccountPage = ({ onBack }: AccountPageProps) => {
  const { user: authUser, session, signOut } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'orders' | 'preferences' | 'privacy'>('profile');
  
  // Profile editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: ''
  });
  
  // Password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      if (!authUser || !session) {
        // Redirect to login page
        window.location.href = '/login';
        return;
      }

      const userProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || '',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at
      };

      setUser(userProfile);
      setProfileData({
        fullName: userProfile.full_name || '',
        email: userProfile.email
      });

      // Load orders
      try {
        const userOrders = await getUserOrders();
        setOrders(userOrders);
      } catch (orderError) {
        console.error('Failed to load orders:', orderError);
        // Set orders to empty array and show a subtle message
        setOrders([]);
        // Don't show error message to user as this is not critical functionality
      }

      // Load preferences
      try {
        const { data: userPrefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        if (prefsError && prefsError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Failed to load user preferences:', prefsError);
          
          // Handle specific preference loading errors
          if (prefsError.code === '42501') {
            console.warn('Access denied to user preferences - this may be a permissions issue');
          } else if (prefsError.code === '42P01') {
            console.warn('User preferences table not found - this may be a database schema issue');
          }
          
          // Set default preferences on error
          const defaultPrefs: UserPreferences = {
            id: `pref_${authUser.id}`,
            user_id: authUser.id,
            email_order_confirmations: true,
            email_newsletter: true,
            email_product_recommendations: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setPreferences(defaultPrefs);
        } else if (userPrefs) {
          setPreferences(userPrefs);
        } else {
          // Create default preferences if none exist
          try {
            const { data: newPrefs, error: createError } = await supabase
              .from('user_preferences')
              .insert([{
                user_id: authUser.id,
                email_order_confirmations: true,
                email_newsletter: true,
                email_product_recommendations: false
              }])
              .select()
              .single();

            if (createError) {
              console.error('Failed to create default user preferences:', createError);
              // Set default preferences locally if creation fails
              const defaultPrefs: UserPreferences = {
                id: `pref_${authUser.id}`,
                user_id: authUser.id,
                email_order_confirmations: true,
                email_newsletter: true,
                email_product_recommendations: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              setPreferences(defaultPrefs);
            } else if (newPrefs) {
              setPreferences(newPrefs);
            }
          } catch (createException) {
            console.error('Exception creating default preferences:', createException);
            // Set default preferences locally as fallback
            const defaultPrefs: UserPreferences = {
              id: `pref_${authUser.id}`,
              user_id: authUser.id,
              email_order_confirmations: true,
              email_newsletter: true,
              email_product_recommendations: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setPreferences(defaultPrefs);
          }
        }
      } catch (prefsError) {
        console.error('Unexpected error loading preferences:', prefsError);
        
        // Set default preferences as fallback
        const defaultPrefs: UserPreferences = {
          id: `pref_${authUser.id}`,
          user_id: authUser.id,
          email_order_confirmations: true,
          email_newsletter: true,
          email_product_recommendations: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setPreferences(defaultPrefs);
      }

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load account information' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setMessage(null);
      
      // Validate profile data
      if (!profileData.fullName.trim()) {
        setMessage({ type: 'error', text: 'Full name is required' });
        return;
      }
      
      if (profileData.fullName.trim().length < 2) {
        setMessage({ type: 'error', text: 'Full name must be at least 2 characters long' });
        return;
      }
      
      // Check if user is still authenticated
      if (!authUser || !session) {
        setMessage({ type: 'error', text: 'Your session has expired. Please log in again.' });
        return;
      }
      
      const { error } = await supabase.auth.updateUser({
        data: { full_name: profileData.fullName.trim() }
      });

      if (error) {
        console.error('Profile update error:', error);
        
        // Handle specific error types
        if (error.message?.includes('JWT expired')) {
          setMessage({ type: 'error', text: 'Your session has expired. Please log in again.' });
        } else if (error.message?.includes('not authenticated')) {
          setMessage({ type: 'error', text: 'You are not authenticated. Please log in again.' });
        } else if (error.message?.includes('rate limit')) {
          setMessage({ type: 'error', text: 'Too many update attempts. Please wait a moment before trying again.' });
        } else {
          setMessage({ type: 'error', text: error.message || 'Failed to update profile. Please try again.' });
        }
        return;
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditingProfile(false);
      
      // Reload user data
      await loadUserData();
      
    } catch (error: any) {
      console.error('Profile update exception:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    }
  };

  const handlePasswordChange = async () => {
    try {
      setMessage(null);
      
      // Validate password data
      if (!passwordData.currentPassword.trim()) {
        setMessage({ type: 'error', text: 'Current password is required' });
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
        return;
      }
      
      // Check if user is still authenticated
      if (!authUser || !session) {
        setMessage({ type: 'error', text: 'Your session has expired. Please log in again.' });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        console.error('Password change error:', error);
        
        // Handle specific error types
        if (error.message?.includes('JWT expired')) {
          setMessage({ type: 'error', text: 'Your session has expired. Please log in again.' });
        } else if (error.message?.includes('not authenticated')) {
          setMessage({ type: 'error', text: 'You are not authenticated. Please log in again.' });
        } else if (error.message?.includes('rate limit')) {
          setMessage({ type: 'error', text: 'Too many password change attempts. Please wait a moment before trying again.' });
        } else if (error.message?.includes('weak password')) {
          setMessage({ type: 'error', text: 'Password is too weak. Please choose a stronger password.' });
        } else {
          setMessage({ type: 'error', text: error.message || 'Failed to change password. Please try again.' });
        }
        return;
      }

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: any) {
      console.error('Password change exception:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      setMessage(null);
      
      // Use the session from auth context
      if (!session) {
        throw new Error('No active session found');
      }

      // Call the Edge Function to delete the account
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }

      setMessage({ type: 'success', text: 'Account deleted successfully' });
      
      // Sign out the user
      await signOut();
      
      // Redirect to home after a delay
      setTimeout(() => {
        onBack();
      }, 2000);
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete account' });
    }
  };

  const handleDataExport = async () => {
    try {
      setMessage(null);
      
      // Use user data from auth context
      if (!authUser) {
        throw new Error('No active session found');
      }

      // Get user orders
      const userOrders = await getUserOrders();
      
      // Get user preferences
      const { data: userPrefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      // Prepare export data
      const exportData = {
        user: {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at
        },
        orders: userOrders,
        preferences: userPrefs,
        export_date: new Date().toISOString()
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reform-uk-data-export-${authUser.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data export completed successfully!' });
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to export data' });
    }
  };

  const handleDataDeletion = async () => {
    if (!confirm('Are you sure you want to delete your account and all associated data? This action cannot be undone and will permanently remove all your information from our system.')) {
      return;
    }

    try {
      setMessage(null);
      
      // Call the existing delete account function
      await handleDeleteAccount();
      
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete data' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSavePreferences = async () => {
    if (!preferences || !user) return;

    try {
      setIsSavingPreferences(true);
      setMessage(null);
      
      // Check if user is still authenticated
      if (!authUser || !session) {
        setMessage({ type: 'error', text: 'Your session has expired. Please log in again.' });
        return;
      }

      const { error } = await supabase
        .from('user_preferences')
        .update({
          email_order_confirmations: preferences.email_order_confirmations,
          email_newsletter: preferences.email_newsletter,
          email_product_recommendations: preferences.email_product_recommendations,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Preferences update error:', error);
        
        // Handle specific error types
        if (error.code === 'PGRST116') {
          setMessage({ type: 'error', text: 'User preferences not found. Please refresh the page and try again.' });
        } else if (error.code === '42501') {
          setMessage({ type: 'error', text: 'Access denied. You may not have permission to update preferences.' });
        } else if (error.message?.includes('JWT expired')) {
          setMessage({ type: 'error', text: 'Your session has expired. Please log in again.' });
        } else if (error.message?.includes('not authenticated')) {
          setMessage({ type: 'error', text: 'You are not authenticated. Please log in again.' });
        } else {
          setMessage({ type: 'error', text: error.message || 'Failed to save preferences. Please try again.' });
        }
        return;
      }

      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
    } catch (error: any) {
      console.error('Preferences update exception:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const updatePreference = (key: keyof Pick<UserPreferences, 'email_order_confirmations' | 'email_newsletter' | 'email_product_recommendations'>, value: boolean) => {
    if (preferences) {
      setPreferences({ ...preferences, [key]: value });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#009fe3] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-[#009fe3]" />
                <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-[#009fe3] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-[#009fe3]" />
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 flex items-center space-x-2 px-4 py-3 rounded-lg text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-[#009fe3] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'security'
                      ? 'bg-[#009fe3] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Security</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-[#009fe3] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>Orders</span>
                  {orders.length > 0 && (
                    <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {orders.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'preferences'
                      ? 'bg-[#009fe3] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Preferences</span>
                </button>

                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeTab === 'privacy'
                      ? 'bg-[#009fe3] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Privacy & GDPR</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="flex items-center space-x-2 text-[#009fe3] hover:text-blue-600 font-medium"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleProfileUpdate}
                        className="flex items-center space-x-2 bg-[#009fe3] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({
                            fullName: user?.full_name || '',
                            email: user?.email || ''
                          });
                        }}
                        className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Full Name</span>
                        <p className="text-gray-900">{user?.full_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Email Address</span>
                        <p className="text-gray-900">{user?.email}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Account Created</span>
                        <p className="text-gray-900">{user?.created_at ? formatDate(user.created_at) : 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Last Sign In</span>
                        <p className="text-gray-900">{user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  {/* Change Password */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      {!isChangingPassword && (
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className="flex items-center space-x-2 text-[#009fe3] hover:text-blue-600 font-medium"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Change</span>
                        </button>
                      )}
                    </div>

                    {isChangingPassword ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <button
                            onClick={handlePasswordChange}
                            className="flex items-center space-x-2 bg-[#009fe3] hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            <span>Update Password</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsChangingPassword(false);
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              });
                            }}
                            className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Your password was last changed when you created your account.</p>
                    )}
                  </div>

                  {/* Delete Account */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-red-900">Delete Account</h3>
                        <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">
                      You haven't placed any orders yet. Start shopping to see your orders here.
                    </p>
                    <button
                      onClick={onBack}
                      className="bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Order #{order.readable_order_id || 'Processing...'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(order.created_at)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CreditCard className="w-4 h-4" />
                                <span>{formatCurrency(order.amount_total || 0)}</span>
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Confirmed
                          </span>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="border-t border-gray-200 pt-3">
                            <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                            <div className="space-y-1">
                              {order.items.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {item.name} x {item.quantity}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {formatCurrency(item.price * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>
                
                {(() => {
                  return preferences ? (
                  <div className="space-y-6">
                    {/* Email Preferences */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Mail className="w-5 h-5 text-[#009fe3]" />
                        <h3 className="text-lg font-semibold text-gray-900">Email Preferences</h3>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            checked={preferences.email_order_confirmations}
                            onChange={(e) => updatePreference('email_order_confirmations', e.target.checked)}
                            className="rounded border-gray-300 text-[#009fe3] focus:ring-[#009fe3]" 
                          />
                          <span className="text-gray-700">Order confirmations and updates</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            checked={preferences.email_newsletter}
                            onChange={(e) => updatePreference('email_newsletter', e.target.checked)}
                            className="rounded border-gray-300 text-[#009fe3] focus:ring-[#009fe3]" 
                          />
                          <span className="text-gray-700">Newsletter and promotions</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input 
                            type="checkbox" 
                            checked={preferences.email_product_recommendations}
                            onChange={(e) => updatePreference('email_product_recommendations', e.target.checked)}
                            className="rounded border-gray-300 text-[#009fe3] focus:ring-[#009fe3]" 
                          />
                          <span className="text-gray-700">Product recommendations</span>
                        </label>
                      </div>
                    </div>

                    {/* Save Preferences Button */}
                    <div className="pt-4">
                      <button 
                        onClick={handleSavePreferences}
                        disabled={isSavingPreferences}
                        className="flex items-center space-x-2 bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                      >
                        {isSavingPreferences ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Preferences</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading preferences...</p>
                  </div>
                );
                })()}
              </div>
            )}

            {/* Privacy & GDPR Tab */}
            {activeTab === 'privacy' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy & GDPR Compliance</h2>
                
                <div className="space-y-6">
                  {/* Data Export Section */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Download className="w-5 h-5 text-[#009fe3]" />
                      <h3 className="text-lg font-semibold text-gray-900">Data Export</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Download a copy of all your personal data stored in our system.
                    </p>
                    <button 
                      onClick={handleDataExport}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export My Data</span>
                    </button>
                  </div>

                  {/* Data Deletion Section */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Trash2 className="w-5 h-5 text-red-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Data Deletion</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Request permanent deletion of your account and all associated personal data.
                    </p>
                    <button 
                      onClick={handleDataDeletion}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete My Data</span>
                    </button>
                  </div>

                  {/* Privacy Information */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Eye className="w-5 h-5 text-[#009fe3]" />
                      <h3 className="text-lg font-semibold text-gray-900">Your Rights</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Under GDPR, you have the right to:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate data</li>
                        <li>Request data deletion</li>
                        <li>Export your data</li>
                        <li>Withdraw consent</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage; 