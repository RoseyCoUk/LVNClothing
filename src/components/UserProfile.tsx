import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  Package, 
  Settings, 
  Edit3, 
  Save, 
  X,
  Shield,
  Gift,
  Star,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  profile_image?: string;
  bio?: string;
  preferences: {
    newsletter_subscribed: boolean;
    size_preferences: string[];
    favorite_colors: string[];
    style_preferences: string[];
    communication_preferences: {
      email_marketing: boolean;
      sms_notifications: boolean;
      order_updates: boolean;
    };
  };
  address: {
    street_line1?: string;
    street_line2?: string;
    city?: string;
    postal_code?: string;
    country: string;
  };
  loyalty: {
    points: number;
    tier: 'Kingdom Seeker' | 'Faith Warrior' | 'Gospel Guardian' | 'Heaven Ambassador';
    total_spent: number;
    orders_count: number;
    referrals_count: number;
  };
  created_at: string;
  updated_at: string;
}

interface UserStats {
  total_orders: number;
  total_spent: number;
  favorite_category: string;
  loyalty_points: number;
  reviews_count: number;
  average_rating_given: number;
  wishlist_items: number;
  last_order_date?: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'preferences' | 'loyalty'>('overview');

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserStats();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createUserProfile();
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;

    try {
      // This would normally be a database view or computed values
      const mockStats: UserStats = {
        total_orders: 12,
        total_spent: 485.99,
        favorite_category: 'Hoodies',
        loyalty_points: 245,
        reviews_count: 8,
        average_rating_given: 4.7,
        wishlist_items: 5,
        last_order_date: '2024-01-15'
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const createUserProfile = async () => {
    if (!user) return;

    const defaultProfile: Partial<UserProfile> = {
      id: user.id,
      email: user.email || '',
      preferences: {
        newsletter_subscribed: true,
        size_preferences: [],
        favorite_colors: [],
        style_preferences: [],
        communication_preferences: {
          email_marketing: true,
          sms_notifications: false,
          order_updates: true,
        }
      },
      address: {
        country: 'GB'
      },
      loyalty: {
        points: 0,
        tier: 'Kingdom Seeker',
        total_spent: 0,
        orders_count: 0,
        referrals_count: 0
      }
    };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!profile || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'Kingdom Seeker': return 'text-gray-600 bg-gray-100';
      case 'Faith Warrior': return 'text-blue-600 bg-blue-100';
      case 'Gospel Guardian': return 'text-purple-600 bg-purple-100';
      case 'Heaven Ambassador': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lvnBg py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-lvnBg py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't load your profile. Please try again.</p>
            <button 
              onClick={loadUserProfile}
              className="btn-lvn-primary"
            >
              Retry Loading Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lvnBg py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-lvn-maroon to-red-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  {profile.profile_image ? (
                    <img 
                      src={profile.profile_image} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile.first_name && profile.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : 'Kingdom Member'
                    }
                  </h1>
                  <p className="text-white/80">{profile.email}</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getLoyaltyTierColor(profile.loyalty.tier)}`}>
                    <Star className="w-4 h-4 mr-1" />
                    {profile.loyalty.tier}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'orders', label: 'Orders', icon: Package },
                { id: 'preferences', label: 'Preferences', icon: Settings },
                { id: 'loyalty', label: 'Loyalty', icon: Gift },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-lvn-maroon text-lvn-maroon'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <Package className="w-8 h-8 text-lvn-maroon mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats?.total_orders || 0}</p>
                  <p className="text-sm text-gray-600">Orders</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">£{stats?.total_spent || 0}</p>
                  <p className="text-sm text-gray-600">Total Spent</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats?.loyalty_points || 0}</p>
                  <p className="text-sm text-gray-600">Points</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm text-center">
                  <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats?.wishlist_items || 0}</p>
                  <p className="text-sm text-gray-600">Wishlist</p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  {isEditing && (
                    <button
                      onClick={saveProfile}
                      disabled={isSaving}
                      className="btn-lvn-primary flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.first_name || ''}
                        onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.first_name || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.last_name || ''}
                        onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.last_name || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profile.date_of_birth || ''}
                        onChange={(e) => setProfile({...profile, date_of_birth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.date_of_birth || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                      placeholder="Tell us about your faith journey..."
                    />
                  ) : (
                    <p className="text-gray-900">{profile.bio || 'No bio provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Scripture Card */}
              <div className="bg-gradient-to-br from-lvn-maroon to-red-800 p-6 rounded-lg text-white">
                <div className="text-center">
                  <p className="italic text-lg mb-3">
                    "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
                  </p>
                  <p className="text-sm text-white/80">Matthew 13:33</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Order #1234 shipped</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">Review submitted for Faith Hoodie</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm text-gray-600">25 loyalty points earned</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-3">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Track Orders</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-3">
                    <Heart className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">View Wishlist</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-3">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Write Review</span>
                  </button>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center space-x-3">
                    <Gift className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Redeem Points</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tab content would go here */}
        {activeTab === 'orders' && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order History</h3>
            <p className="text-gray-600">This section will show detailed order history and tracking.</p>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Preferences</h3>
            <p className="text-gray-600">Communication preferences and shopping settings will be here.</p>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loyalty Program</h3>
            <p className="text-gray-600">Points, rewards, and loyalty tier information coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
