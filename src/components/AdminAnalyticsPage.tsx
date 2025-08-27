import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  PoundSterling,
  ShoppingBag,
  Users
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  ordersByMonth: { month: string; count: number; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  customerGrowth: { month: string; count: number }[];
}

const AdminAnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    ordersByMonth: [],
    topProducts: [],
    customerGrowth: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    fetchAnalyticsData();
  }, [user, navigate, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 30);
      }

      // Fetch orders data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // Fetch order items for product analytics
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*');

      if (orderItemsError) throw orderItemsError;

      // Fetch customer profiles
      const { data: customersData, error: customersError } = await supabase
        .from('customer_profiles')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (customersError) throw customersError;

      // Process analytics data
      const processedData = processAnalyticsData(ordersData || [], customersData || [], orderItemsData || []);
      setAnalyticsData(processedData);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (orders: any[], customers: any[], orderItems: any[]) => {
    // Filter out test orders (only include real orders with amount_total > 0)
    const realOrders = orders.filter(order => (order.amount_total || 0) > 0);
    
    // Calculate basic stats (only real orders)
    const totalOrders = realOrders.length;
    const totalRevenue = realOrders.reduce((sum, order) => sum + (order.amount_total || 0), 0);
    const totalCustomers = customers.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Process monthly data (only real orders)
    const monthlyData = new Map<string, { count: number; revenue: number }>();
    
    realOrders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { count: 0, revenue: 0 });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      monthData.count += 1;
      monthData.revenue += order.amount_total || 0;
    });

    const ordersByMonth = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        count: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Process customer growth
    const customerMonthlyData = new Map<string, number>();
    
    customers.forEach(customer => {
      const date = new Date(customer.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      customerMonthlyData.set(monthKey, (customerMonthlyData.get(monthKey) || 0) + 1);
    });

    const customerGrowth = Array.from(customerMonthlyData.entries())
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
        count
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Calculate real top products data from order items
    const productStats = new Map<string, { quantity: number; revenue: number }>();
    
    // Process order items to calculate product performance
    orderItems.forEach(item => {
      // Find the corresponding order to check if it's a real order
      const order = realOrders.find(o => o.id === item.order_id);
      if (order) { // Only include items from real orders
        const productName = item.product_name || item.product_id || 'Unknown Product';
        const quantity = item.quantity || 1;
        const price = item.price || 0;
        const revenue = quantity * price;
        
        if (!productStats.has(productName)) {
          productStats.set(productName, { quantity: 0, revenue: 0 });
        }
        
        const stats = productStats.get(productName)!;
        stats.quantity += quantity;
        stats.revenue += revenue;
      }
    });
    
    // Convert to array and sort by revenue
    const topProducts = Array.from(productStats.entries())
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 products

    return {
      totalOrders,
      totalRevenue,
      totalCustomers,
      averageOrderValue,
      ordersByMonth,
      topProducts,
      customerGrowth
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-sm text-gray-600">
                  Comprehensive business insights and performance metrics • Test orders (£0.00) excluded from calculations
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatNumber(analyticsData.totalOrders)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <PoundSterling className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatNumber(analyticsData.totalCustomers)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Order Value</dt>
                    <dd className="text-lg font-medium text-gray-900">{formatCurrency(analyticsData.averageOrderValue)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Orders Trend */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Orders Trend</h3>
              {analyticsData.ordersByMonth.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.ordersByMonth.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-900">{month.count} orders</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(month.revenue)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available for selected time range</p>
              )}
            </div>
          </div>

          {/* Customer Growth */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Growth</h3>
              {analyticsData.customerGrowth.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.customerGrowth.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{month.count} customers</span>
                        {index > 0 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            month.count > analyticsData.customerGrowth[index - 1].count
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {month.count > analyticsData.customerGrowth[index - 1].count ? '+' : ''}
                            {getPercentageChange(month.count, analyticsData.customerGrowth[index - 1].count).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available for selected time range</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Products</h3>
            <p className="text-sm text-gray-600 mb-4">Based on real order data from your actual sales</p>
            {analyticsData.topProducts.length > 0 ? (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity Sold
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue Generated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.topProducts.map((product, index) => (
                      <tr key={product.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNumber(product.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${analyticsData.topProducts[0].revenue > 0 ? (product.revenue / analyticsData.topProducts[0].revenue) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {analyticsData.topProducts[0].revenue > 0 ? ((product.revenue / analyticsData.topProducts[0].revenue) * 100).toFixed(0) : 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No product data available</p>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Revenue Trend:</strong> {analyticsData.ordersByMonth.length > 1 ? 
                    (analyticsData.ordersByMonth[analyticsData.ordersByMonth.length - 1].revenue > 
                     analyticsData.ordersByMonth[analyticsData.ordersByMonth.length - 2].revenue ? 
                     'Increasing' : 'Decreasing') : 'Stable'} over the selected period
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Customer Acquisition:</strong> {analyticsData.customerGrowth.length > 1 ? 
                    `+${analyticsData.customerGrowth[analyticsData.customerGrowth.length - 1].count - 
                      analyticsData.customerGrowth[analyticsData.customerGrowth.length - 2].count} new customers` : 
                    'No new customer data'} in the latest month
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalyticsPage;
