import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  ShoppingCart, 
  DollarSign,
  Eye,
  MousePointer,
  Heart,
  Star,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Clock
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    average_order_value: number;
    conversion_rate: number;
    revenue_growth: number;
    orders_growth: number;
    customers_growth: number;
  };
  sales_chart: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  top_products: Array<{
    id: string;
    name: string;
    revenue: number;
    units_sold: number;
    views: number;
    conversion_rate: number;
  }>;
  customer_insights: {
    new_customers: number;
    returning_customers: number;
    customer_lifetime_value: number;
    average_session_duration: number;
    bounce_rate: number;
  };
  traffic_sources: Array<{
    source: string;
    visitors: number;
    revenue: number;
    conversion_rate: number;
  }>;
  device_breakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  geographic_data: Array<{
    country: string;
    visitors: number;
    revenue: number;
  }>;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeView, setActiveView] = useState<'overview' | 'sales' | 'customers' | 'products' | 'traffic'>('overview');

  // Mock analytics data
  const mockAnalyticsData: AnalyticsData = {
    overview: {
      total_revenue: 45678.90,
      total_orders: 324,
      total_customers: 1247,
      average_order_value: 141.05,
      conversion_rate: 3.2,
      revenue_growth: 24.5,
      orders_growth: 18.3,
      customers_growth: 15.7
    },
    sales_chart: [
      { date: '2024-01-01', revenue: 1250.50, orders: 12 },
      { date: '2024-01-02', revenue: 2340.25, orders: 18 },
      { date: '2024-01-03', revenue: 1890.75, orders: 15 },
      { date: '2024-01-04', revenue: 3456.80, orders: 25 },
      { date: '2024-01-05', revenue: 2789.30, orders: 20 },
      { date: '2024-01-06', revenue: 4123.45, orders: 28 },
      { date: '2024-01-07', revenue: 3567.90, orders: 23 },
      { date: '2024-01-08', revenue: 2890.15, orders: 19 },
      { date: '2024-01-09', revenue: 4567.25, orders: 32 },
      { date: '2024-01-10', revenue: 3234.60, orders: 24 },
      { date: '2024-01-11', revenue: 2456.80, orders: 17 },
      { date: '2024-01-12', revenue: 3789.45, orders: 26 },
      { date: '2024-01-13', revenue: 4123.70, orders: 29 },
      { date: '2024-01-14', revenue: 3456.25, orders: 22 },
      { date: '2024-01-15', revenue: 4890.30, orders: 35 }
    ],
    top_products: [
      {
        id: '1',
        name: 'Kingdom Leaven Hoodie',
        revenue: 8997.75,
        units_sold: 100,
        views: 3456,
        conversion_rate: 2.89
      },
      {
        id: '2',
        name: 'Faith Warrior T-Shirt',
        revenue: 5597.44,
        units_sold: 160,
        views: 4890,
        conversion_rate: 3.27
      },
      {
        id: '3',
        name: 'Kingdom Starter Bundle',
        revenue: 7499.50,
        units_sold: 50,
        views: 2145,
        conversion_rate: 2.33
      },
      {
        id: '4',
        name: 'Gospel Guardian Cap',
        revenue: 2999.20,
        units_sold: 100,
        views: 2780,
        conversion_rate: 3.60
      },
      {
        id: '5',
        name: 'Psalm 91 Protection Hoodie',
        revenue: 6649.35,
        units_sold: 70,
        views: 2890,
        conversion_rate: 2.42
      }
    ],
    customer_insights: {
      new_customers: 145,
      returning_customers: 179,
      customer_lifetime_value: 287.50,
      average_session_duration: 285, // seconds
      bounce_rate: 42.3
    },
    traffic_sources: [
      { source: 'Organic Search', visitors: 4567, revenue: 18234.50, conversion_rate: 3.8 },
      { source: 'Social Media', visitors: 2890, revenue: 12456.75, conversion_rate: 4.2 },
      { source: 'Direct', visitors: 3456, revenue: 15678.90, conversion_rate: 4.5 },
      { source: 'Email', visitors: 1234, revenue: 8901.25, conversion_rate: 7.2 },
      { source: 'Paid Ads', visitors: 1890, revenue: 6789.30, conversion_rate: 3.6 }
    ],
    device_breakdown: {
      mobile: 68.4,
      desktop: 24.7,
      tablet: 6.9
    },
    geographic_data: [
      { country: 'United Kingdom', visitors: 8945, revenue: 32456.80 },
      { country: 'United States', visitors: 2134, revenue: 9876.45 },
      { country: 'Canada', visitors: 1456, revenue: 5234.60 },
      { country: 'Australia', visitors: 987, revenue: 3456.75 },
      { country: 'Ireland', visitors: 567, revenue: 2134.90 }
    ]
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600">Unable to load analytics data at this time.</p>
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
              <BarChart3 className="w-8 h-8 text-lvn-maroon mr-3" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive insights into your Kingdom commerce
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            <button 
              onClick={loadAnalyticsData}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button className="bg-lvn-maroon text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-lvn-maroon/90 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.total_revenue)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {React.createElement(getGrowthIcon(analyticsData.overview.revenue_growth), {
                className: `w-4 h-4 ${getGrowthColor(analyticsData.overview.revenue_growth)} mr-1`
              })}
              <span className={getGrowthColor(analyticsData.overview.revenue_growth)}>
                {analyticsData.overview.revenue_growth > 0 ? '+' : ''}{analyticsData.overview.revenue_growth.toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">from last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.total_orders.toLocaleString()}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {React.createElement(getGrowthIcon(analyticsData.overview.orders_growth), {
                className: `w-4 h-4 ${getGrowthColor(analyticsData.overview.orders_growth)} mr-1`
              })}
              <span className={getGrowthColor(analyticsData.overview.orders_growth)}>
                {analyticsData.overview.orders_growth > 0 ? '+' : ''}{analyticsData.overview.orders_growth.toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">from last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.total_customers.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {React.createElement(getGrowthIcon(analyticsData.overview.customers_growth), {
                className: `w-4 h-4 ${getGrowthColor(analyticsData.overview.customers_growth)} mr-1`
              })}
              <span className={getGrowthColor(analyticsData.overview.customers_growth)}>
                {analyticsData.overview.customers_growth > 0 ? '+' : ''}{analyticsData.overview.customers_growth.toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">from last period</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.conversion_rate.toFixed(1)}%</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Industry avg: 2.8%</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'sales', label: 'Sales', icon: DollarSign },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'products', label: 'Products', icon: Star },
              { id: 'traffic', label: 'Traffic', icon: Globe }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeView === tab.id
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
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-3 h-3 bg-lvn-maroon rounded"></div>
                  <span>Revenue</span>
                </div>
              </div>
              
              <div className="h-64 flex items-end space-x-1">
                {analyticsData.sales_chart.slice(-7).map((data, index) => {
                  const maxRevenue = Math.max(...analyticsData.sales_chart.map(d => d.revenue));
                  const height = (data.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-lvn-maroon rounded-t"
                        style={{ height: `${height}%` }}
                        title={`${formatCurrency(data.revenue)} on ${new Date(data.date).toLocaleDateString()}`}
                      ></div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
              
              <div className="space-y-4">
                {analyticsData.top_products.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-lvn-maroon/10 rounded-full flex items-center justify-center text-sm font-medium text-lvn-maroon">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.units_sold} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-gray-500">{product.conversion_rate.toFixed(1)}% CVR</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Insights */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Insights</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{analyticsData.customer_insights.new_customers}</p>
                  <p className="text-sm text-gray-600">New Customers</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.customer_insights.returning_customers}</p>
                  <p className="text-sm text-gray-600">Returning</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(analyticsData.customer_insights.customer_lifetime_value)}</p>
                  <p className="text-sm text-gray-600">Avg. LTV</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{formatDuration(analyticsData.customer_insights.average_session_duration)}</p>
                  <p className="text-sm text-gray-600">Avg. Session</p>
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h3>
              
              <div className="space-y-4">
                {analyticsData.traffic_sources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{source.source}</p>
                      <p className="text-sm text-gray-500">{source.visitors.toLocaleString()} visitors</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(source.revenue)}</p>
                      <p className="text-sm text-gray-500">{source.conversion_rate.toFixed(1)}% CVR</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other tab content would be implemented here */}
        {activeView !== 'overview' && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Analytics
            </h3>
            <p className="text-gray-600">Detailed {activeView} insights and metrics coming soon.</p>
          </div>
        )}

        {/* Scripture Quote */}
        <div className="mt-12 bg-gradient-to-r from-lvn-maroon to-red-800 text-white p-6 rounded-lg text-center">
          <p className="italic text-lg mb-2">
            "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
          </p>
          <p className="text-sm text-white/80">Matthew 13:33</p>
          <p className="text-sm text-white/70 mt-2">
            Every metric tells the story of Kingdom growth through faithful commerce
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
