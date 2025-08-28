import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Clock, 
  Send, 
  Eye,
  MousePointer,
  ShoppingCart,
  Heart,
  Gift,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Filter,
  Plus,
  Play,
  Pause,
  Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailCampaign {
  id: string;
  name: string;
  type: 'welcome' | 'abandoned_cart' | 'product_recommendation' | 'newsletter' | 're_engagement';
  status: 'draft' | 'active' | 'paused' | 'completed';
  subject_line: string;
  preview_text: string;
  content: string;
  audience_criteria: {
    segments: string[];
    user_tags: string[];
    purchase_history: string;
    engagement_level: string;
  };
  automation_trigger: {
    event: string;
    delay_hours?: number;
    conditions: string[];
  };
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  created_at: string;
  scheduled_at?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  preview_image: string;
  subject: string;
  content: string;
}

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: any;
  user_count: number;
  last_updated: string;
}

const EmailMarketingSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'automation' | 'segments' | 'analytics'>('campaigns');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  // Mock data for demonstration
  const mockCampaigns: EmailCampaign[] = [
    {
      id: '1',
      name: 'Welcome to the Kingdom',
      type: 'welcome',
      status: 'active',
      subject_line: 'Welcome to LVN Clothing - Your Kingdom Journey Starts Here 👑',
      preview_text: 'Discover premium Christian streetwear inspired by Matthew 13:33',
      content: 'Welcome email content...',
      audience_criteria: {
        segments: ['new_subscribers'],
        user_tags: ['welcome_series'],
        purchase_history: 'none',
        engagement_level: 'any'
      },
      automation_trigger: {
        event: 'user_signup',
        delay_hours: 1,
        conditions: ['email_verified']
      },
      metrics: {
        sent: 1247,
        delivered: 1198,
        opened: 642,
        clicked: 156,
        converted: 23,
        revenue: 1847.73
      },
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Abandoned Cart Recovery',
      type: 'abandoned_cart',
      status: 'active',
      subject_line: 'Your Kingdom items are waiting... 🛒',
      preview_text: 'Complete your order and spread the Gospel through fashion',
      content: 'Abandoned cart email content...',
      audience_criteria: {
        segments: ['cart_abandoners'],
        user_tags: ['has_cart_items'],
        purchase_history: 'any',
        engagement_level: 'medium'
      },
      automation_trigger: {
        event: 'cart_abandoned',
        delay_hours: 24,
        conditions: ['cart_value_over_25']
      },
      metrics: {
        sent: 856,
        delivered: 823,
        opened: 387,
        clicked: 94,
        converted: 38,
        revenue: 2156.42
      },
      created_at: '2024-01-02T00:00:00Z'
    },
    {
      id: '3',
      name: 'New Arrivals: Faith Collection',
      type: 'newsletter',
      status: 'active',
      subject_line: 'New Kingdom Arrivals - Limited Edition Faith Collection ✨',
      preview_text: 'Fresh designs that speak to your heart and style',
      content: 'Newsletter content...',
      audience_criteria: {
        segments: ['engaged_subscribers', 'previous_buyers'],
        user_tags: ['newsletter_subscriber'],
        purchase_history: 'previous_purchase',
        engagement_level: 'high'
      },
      automation_trigger: {
        event: 'weekly_newsletter',
        conditions: ['active_subscriber']
      },
      metrics: {
        sent: 3421,
        delivered: 3298,
        opened: 1876,
        clicked: 445,
        converted: 67,
        revenue: 4892.15
      },
      created_at: '2024-01-03T00:00:00Z'
    }
  ];

  const mockSegments: UserSegment[] = [
    {
      id: '1',
      name: 'VIP Kingdom Members',
      description: 'Customers who have spent over £200 in the last 6 months',
      criteria: { total_spent: { min: 200 }, last_purchase_days: { max: 180 } },
      user_count: 245,
      last_updated: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Cart Abandoners',
      description: 'Users who added items to cart but didn\'t complete purchase',
      criteria: { has_cart_items: true, last_purchase_days: { min: 7 } },
      user_count: 432,
      last_updated: '2024-01-15T09:15:00Z'
    },
    {
      id: '3',
      name: 'Engaged Browsers',
      description: 'Frequent visitors who haven\'t made a purchase yet',
      criteria: { page_views: { min: 10 }, purchases: 0, last_visit_days: { max: 7 } },
      user_count: 1387,
      last_updated: '2024-01-15T08:45:00Z'
    },
    {
      id: '4',
      name: 'Re-engagement Needed',
      description: 'Previous customers who haven\'t engaged in 90+ days',
      criteria: { last_purchase_days: { min: 90 }, last_email_open_days: { min: 30 } },
      user_count: 678,
      last_updated: '2024-01-15T07:20:00Z'
    }
  ];

  useEffect(() => {
    loadCampaigns();
    loadSegments();
  }, []);

  const loadCampaigns = async () => {
    try {
      // In real implementation, load from Supabase
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSegments = async () => {
    try {
      // In real implementation, load from Supabase
      setSegments(mockSegments);
    } catch (error) {
      console.error('Error loading segments:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return Heart;
      case 'abandoned_cart': return ShoppingCart;
      case 'product_recommendation': return Target;
      case 'newsletter': return Mail;
      case 're_engagement': return Zap;
      default: return Mail;
    }
  };

  const calculateOpenRate = (campaign: EmailCampaign) => {
    return campaign.metrics.delivered > 0 ? (campaign.metrics.opened / campaign.metrics.delivered * 100) : 0;
  };

  const calculateClickRate = (campaign: EmailCampaign) => {
    return campaign.metrics.opened > 0 ? (campaign.metrics.clicked / campaign.metrics.opened * 100) : 0;
  };

  const calculateConversionRate = (campaign: EmailCampaign) => {
    return campaign.metrics.clicked > 0 ? (campaign.metrics.converted / campaign.metrics.clicked * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Mail className="w-8 h-8 text-lvn-maroon mr-3" />
              Email Marketing
            </h1>
            <p className="text-gray-600 mt-1">
              Automated campaigns to grow your Kingdom community
            </p>
          </div>

          <button 
            onClick={() => setShowCreateCampaign(true)}
            className="bg-lvn-maroon text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-lvn-maroon/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">4,247</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">32.4%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+3.2%</span>
              <span className="text-gray-500 ml-1">industry avg</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">4.8%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MousePointer className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+1.8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Email Revenue</p>
                <p className="text-2xl font-bold text-gray-900">£8,896</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+24.3%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'campaigns', label: 'Campaigns', icon: Mail },
              { id: 'automation', label: 'Automation', icon: Zap },
              { id: 'segments', label: 'Segments', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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

        {/* Tab Content */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            {/* Campaigns List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {campaigns.map((campaign) => {
                  const TypeIcon = getTypeIcon(campaign.type);
                  const openRate = calculateOpenRate(campaign);
                  const clickRate = calculateClickRate(campaign);
                  const conversionRate = calculateConversionRate(campaign);
                  
                  return (
                    <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-lvn-maroon/10 p-3 rounded-lg">
                            <TypeIcon className="w-6 h-6 text-lvn-maroon" />
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                            <p className="text-sm text-gray-600 max-w-md">{campaign.subject_line}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(campaign.status)}`}>
                                {campaign.status}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {campaign.type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-8">
                          {/* Metrics */}
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{campaign.metrics.sent.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">Sent</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{openRate.toFixed(1)}%</p>
                            <p className="text-xs text-gray-500">Open Rate</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{clickRate.toFixed(1)}%</p>
                            <p className="text-xs text-gray-500">Click Rate</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">£{campaign.metrics.revenue.toFixed(0)}</p>
                            <p className="text-xs text-gray-500">Revenue</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                              <Settings className="w-4 h-4" />
                            </button>
                            {campaign.status === 'active' ? (
                              <button className="p-2 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-yellow-50">
                                <Pause className="w-4 h-4" />
                              </button>
                            ) : (
                              <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'segments' && (
          <div className="space-y-6">
            {/* Segments List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Customer Segments</h3>
                <button className="bg-lvn-maroon text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Segment</span>
                </button>
              </div>
              
              <div className="divide-y divide-gray-200">
                {segments.map((segment) => (
                  <div key={segment.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{segment.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Last updated: {new Date(segment.last_updated).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-lvn-maroon">{segment.user_count.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">Users</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented here */}
        {activeTab === 'automation' && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Automation Flows</h3>
            <p className="text-gray-600">Set up triggered email sequences based on customer behavior.</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Analytics</h3>
            <p className="text-gray-600">Detailed insights and performance metrics for your campaigns.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailMarketingSystem;
