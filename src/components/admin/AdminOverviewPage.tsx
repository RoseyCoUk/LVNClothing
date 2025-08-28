import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Eye,
  Package
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import InventoryAlerts from './InventoryAlerts';

interface Metrics {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: number;
}

interface WeeklySales {
  date: string;
  sales: number;
}

const AdminOverviewPage = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalSales: 156,
    totalOrders: 24,
    totalCustomers: 89,
    revenue: 3240,
  });
  const [weeklySales, setWeeklySales] = useState<WeeklySales[]>([
    { date: 'Mon', sales: 320 },
    { date: 'Tue', sales: 450 },
    { date: 'Wed', sales: 280 },
    { date: 'Thu', sales: 520 },
    { date: 'Fri', sales: 680 },
    { date: 'Sat', sales: 590 },
    { date: 'Sun', sales: 390 },
  ]);
  const [loading, setLoading] = useState(false); // Start with false to avoid loading state

  useEffect(() => {
    fetchMetrics();
    fetchWeeklySales();
  }, []);

  const fetchMetrics = async () => {
    try {
      // Fetch orders data
      const { data: orders } = await supabase
        .from('orders')
        .select('*');

      // Fetch customers data (unique emails)
      const { data: customers } = await supabase
        .from('newsletter_subscribers')
        .select('*');

      if (orders) {
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        });
        
        setMetrics({
          totalSales: orders.length,
          totalOrders: todayOrders.length,
          totalCustomers: customers?.length || 0,
          revenue: totalRevenue,
        });
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklySales = async () => {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_amount')
        .gte('created_at', weekAgo.toISOString())
        .lte('created_at', today.toISOString());
      
      if (orders) {
        // Group orders by day and calculate sales
        const salesByDay = new Map();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Initialize all days with 0 sales
        dayNames.forEach(day => salesByDay.set(day, 0));
        
        orders.forEach(order => {
          const orderDate = new Date(order.created_at);
          const dayName = dayNames[orderDate.getDay()];
          const currentSales = salesByDay.get(dayName) || 0;
          salesByDay.set(dayName, currentSales + (order.total_amount || 0));
        });
        
        const weekData: WeeklySales[] = dayNames.map(day => ({
          date: day,
          sales: salesByDay.get(day) || 0
        }));
        
        setWeeklySales(weekData);
      }
    } catch (error) {
      console.error('Error fetching weekly sales:', error);
      // Fallback to demo data if error
      const weekData: WeeklySales[] = [
        { date: 'Mon', sales: 0 },
        { date: 'Tue', sales: 0 },
        { date: 'Wed', sales: 0 },
        { date: 'Thu', sales: 0 },
        { date: 'Fri', sales: 0 },
        { date: 'Sat', sales: 0 },
        { date: 'Sun', sales: 0 },
      ];
      setWeeklySales(weekData);
    }
  };

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `£${metrics.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Orders Today',
      value: metrics.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Customers',
      value: metrics.totalCustomers.toString(),
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Sales',
      value: metrics.totalSales.toString(),
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lvn-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-base font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-xs text-gray-500">LVN Clothing admin dashboard</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-1">
        {metricCards.map((metric) => (
          <div key={metric.title} className="bg-white p-2 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{metric.title}</p>
                <p className="text-base font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className={`p-1 rounded-full ${metric.color}`}>
                <metric.icon className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-1">
        {/* Weekly Sales Chart */}
        <div className="lg:col-span-2 bg-white p-2 rounded border">
          <h3 className="text-xs font-semibold text-gray-900 mb-1">Weekly Sales</h3>
          <div className="space-y-1">
            {weeklySales.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 w-6">{day.date}</span>
                <div className="flex items-center space-x-1 flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-1 mx-1">
                    <div 
                      className="bg-lvn-maroon h-1 rounded-full"
                      style={{ width: `${Math.max((day.sales / Math.max(...weeklySales.map(d => d.sales), 100)) * 100, 2)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-900 w-12 text-right">
                    £{day.sales}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-2 rounded border">
          <h3 className="text-xs font-semibold text-gray-900 mb-1">Activity</h3>
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-2 h-2 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 truncate">Order #1234</p>
                <p className="text-xs text-gray-500">£89.99</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-2 h-2 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 truncate">New customer</p>
                <p className="text-xs text-gray-500">john@example.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-2 h-2 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-900 truncate">Hoodie updated</p>
                <p className="text-xs text-gray-500">Stock: 15</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-2 rounded border">
          <h3 className="text-xs font-semibold text-gray-900 mb-1">Actions</h3>
          <div className="grid grid-cols-2 gap-1">
            <button className="p-1 bg-lvn-maroon text-white rounded hover:bg-lvn-maroon/90 text-center">
              <Package className="w-3 h-3 mx-auto mb-0.5" />
              <span className="text-xs">Add</span>
            </button>
            <button className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-center">
              <ShoppingCart className="w-3 h-3 mx-auto mb-0.5" />
              <span className="text-xs">Orders</span>
            </button>
            <button className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-center">
              <Users className="w-3 h-3 mx-auto mb-0.5" />
              <span className="text-xs">Users</span>
            </button>
            <button className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-center">
              <TrendingUp className="w-3 h-3 mx-auto mb-0.5" />
              <span className="text-xs">Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Alerts - Compact */}
      <div className="bg-white p-2 rounded border">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-gray-900">Inventory Status</h3>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-red-50 p-1 rounded border border-red-200 text-center">
            <div className="text-sm font-bold text-red-600">0</div>
            <div className="text-xs text-red-700">Out</div>
          </div>
          <div className="bg-orange-50 p-1 rounded border border-orange-200 text-center">
            <div className="text-sm font-bold text-orange-600">2</div>
            <div className="text-xs text-orange-700">Low</div>
          </div>
          <div className="bg-yellow-50 p-1 rounded border border-yellow-200 text-center">
            <div className="text-sm font-bold text-yellow-600">5</div>
            <div className="text-xs text-yellow-700">Medium</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
