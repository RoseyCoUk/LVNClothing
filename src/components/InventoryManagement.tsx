import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Edit3,
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Bell
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface InventoryItem {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  reorder_point: number;
  max_stock: number;
  cost_price: number;
  selling_price: number;
  category: string;
  supplier: string;
  location: string;
  last_restocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  movement_history: StockMovement[];
}

interface StockMovement {
  id: string;
  type: 'restock' | 'sale' | 'adjustment' | 'return' | 'damage';
  quantity: number;
  reason: string;
  created_at: string;
  created_by: string;
}

interface InventoryAlert {
  id: string;
  product_id: string;
  product_name: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expired';
  current_level: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  acknowledged: boolean;
}

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'status' | 'last_restocked'>('name');
  const [showStockAdjustment, setShowStockAdjustment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'alerts' | 'analytics' | 'settings'>('inventory');

  // Mock inventory data for demonstration
  const mockInventory: InventoryItem[] = [
    {
      id: '1',
      product_id: 'prod_1',
      product_name: 'Kingdom Leaven Hoodie - Black - M',
      sku: 'LVN-HOOD-BLK-M',
      current_stock: 15,
      reserved_stock: 3,
      available_stock: 12,
      reorder_point: 10,
      max_stock: 50,
      cost_price: 35.00,
      selling_price: 89.99,
      category: 'Hoodies',
      supplier: 'Premium Textile Co.',
      location: 'Warehouse A1',
      last_restocked: '2024-01-10T00:00:00Z',
      status: 'in_stock',
      movement_history: []
    },
    {
      id: '2',
      product_id: 'prod_2',
      product_name: 'Faith Warrior T-Shirt - White - L',
      sku: 'LVN-TSHIRT-WHT-L',
      current_stock: 8,
      reserved_stock: 2,
      available_stock: 6,
      reorder_point: 15,
      max_stock: 40,
      cost_price: 12.00,
      selling_price: 34.99,
      category: 'T-Shirts',
      supplier: 'Christian Apparel Ltd.',
      location: 'Warehouse B2',
      last_restocked: '2024-01-08T00:00:00Z',
      status: 'low_stock',
      movement_history: []
    },
    {
      id: '3',
      product_id: 'prod_3',
      product_name: 'Gospel Guardian Cap - Navy',
      sku: 'LVN-CAP-NVY',
      current_stock: 0,
      reserved_stock: 0,
      available_stock: 0,
      reorder_point: 12,
      max_stock: 30,
      cost_price: 8.50,
      selling_price: 29.99,
      category: 'Caps',
      supplier: 'Headwear Solutions',
      location: 'Warehouse C1',
      last_restocked: '2023-12-15T00:00:00Z',
      status: 'out_of_stock',
      movement_history: []
    },
    {
      id: '4',
      product_id: 'prod_4',
      product_name: 'Kingdom Starter Bundle',
      sku: 'LVN-BUNDLE-STARTER',
      current_stock: 25,
      reserved_stock: 5,
      available_stock: 20,
      reorder_point: 8,
      max_stock: 20,
      cost_price: 75.00,
      selling_price: 149.99,
      category: 'Bundles',
      supplier: 'LVN Assembly',
      location: 'Warehouse A2',
      last_restocked: '2024-01-12T00:00:00Z',
      status: 'in_stock',
      movement_history: []
    },
    {
      id: '5',
      product_id: 'prod_5',
      product_name: 'Psalm 91 Protection Hoodie - Women - S',
      sku: 'LVN-HOOD-P91-W-S',
      current_stock: 4,
      reserved_stock: 1,
      available_stock: 3,
      reorder_point: 8,
      max_stock: 25,
      cost_price: 38.00,
      selling_price: 94.99,
      category: 'Hoodies',
      supplier: 'Premium Textile Co.',
      location: 'Warehouse A1',
      last_restocked: '2024-01-05T00:00:00Z',
      status: 'low_stock',
      movement_history: []
    }
  ];

  const mockAlerts: InventoryAlert[] = [
    {
      id: '1',
      product_id: 'prod_2',
      product_name: 'Faith Warrior T-Shirt - White - L',
      alert_type: 'low_stock',
      current_level: 6,
      threshold: 15,
      severity: 'medium',
      created_at: '2024-01-15T08:30:00Z',
      acknowledged: false
    },
    {
      id: '2',
      product_id: 'prod_3',
      product_name: 'Gospel Guardian Cap - Navy',
      alert_type: 'out_of_stock',
      current_level: 0,
      threshold: 12,
      severity: 'critical',
      created_at: '2024-01-14T14:22:00Z',
      acknowledged: false
    },
    {
      id: '3',
      product_id: 'prod_5',
      product_name: 'Psalm 91 Protection Hoodie - Women - S',
      alert_type: 'low_stock',
      current_level: 3,
      threshold: 8,
      severity: 'high',
      created_at: '2024-01-15T10:15:00Z',
      acknowledged: false
    }
  ];

  useEffect(() => {
    loadInventoryData();
    loadAlerts();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      refreshInventoryData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      // In real implementation, load from Supabase
      setInventory(mockInventory);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      // In real implementation, load from Supabase
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const refreshInventoryData = async () => {
    try {
      // Silently refresh data without loading state
      // In real implementation, this would sync with live data
      console.log('Refreshing inventory data...');
    } catch (error) {
      console.error('Error refreshing inventory:', error);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const adjustStock = async (itemId: string, adjustment: number, reason: string) => {
    try {
      setInventory(prev => prev.map(item => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.current_stock + adjustment);
          const newAvailable = Math.max(0, newStock - item.reserved_stock);
          let newStatus = item.status;
          
          if (newStock === 0) {
            newStatus = 'out_of_stock';
          } else if (newStock <= item.reorder_point) {
            newStatus = 'low_stock';
          } else {
            newStatus = 'in_stock';
          }

          return {
            ...item,
            current_stock: newStock,
            available_stock: newAvailable,
            status: newStatus
          };
        }
        return item;
      }));
      
      setShowStockAdjustment(null);
    } catch (error) {
      console.error('Error adjusting stock:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      case 'discontinued': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.product_name.localeCompare(b.product_name);
      case 'stock':
        return b.current_stock - a.current_stock;
      case 'status':
        return a.status.localeCompare(b.status);
      case 'last_restocked':
        return new Date(b.last_restocked).getTime() - new Date(a.last_restocked).getTime();
      default:
        return 0;
    }
  });

  const inventoryStats = {
    total_items: inventory.length,
    low_stock_items: inventory.filter(item => item.status === 'low_stock').length,
    out_of_stock_items: inventory.filter(item => item.status === 'out_of_stock').length,
    total_value: inventory.reduce((sum, item) => sum + (item.current_stock * item.cost_price), 0),
    unacknowledged_alerts: alerts.filter(alert => !alert.acknowledged).length
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="w-8 h-8 text-lvn-maroon mr-3" />
              Inventory Management
            </h1>
            <p className="text-gray-600 mt-1">
              Real-time stock tracking and automated alerts
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={refreshInventoryData}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            
            <button className="bg-lvn-maroon text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-lvn-maroon/90 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryStats.total_items}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{inventoryStats.low_stock_items}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{inventoryStats.out_of_stock_items}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-green-600">£{inventoryStats.total_value.toFixed(0)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{inventoryStats.unacknowledged_alerts}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'inventory', label: 'Inventory', icon: Package },
              { id: 'alerts', label: 'Alerts', icon: Bell, count: inventoryStats.unacknowledged_alerts },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
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
                  {tab.count && tab.count > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products or SKUs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                >
                  <option value="all">All Status</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                >
                  <option value="name">Sort by Name</option>
                  <option value="stock">Sort by Stock</option>
                  <option value="status">Sort by Status</option>
                  <option value="last_restocked">Sort by Last Restocked</option>
                </select>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Restocked
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">{item.available_stock}</span> available
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.current_stock} total ({item.reserved_stock} reserved)
                          </div>
                          {item.current_stock <= item.reorder_point && (
                            <div className="text-xs text-orange-600">
                              Reorder at {item.reorder_point}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          £{(item.current_stock * item.cost_price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.last_restocked).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => setShowStockAdjustment(item.id)}
                              className="text-lvn-maroon hover:text-lvn-maroon/80"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {alerts.filter(alert => !alert.acknowledged).length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
                <p className="text-gray-600">No active inventory alerts at this time.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {alerts.filter(alert => !alert.acknowledged).map((alert) => (
                    <div key={alert.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                            {alert.alert_type === 'out_of_stock' ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              <AlertTriangle className="w-5 h-5" />
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900">{alert.product_name}</h4>
                            <p className="text-sm text-gray-600">
                              {alert.alert_type === 'low_stock' && `Stock level (${alert.current_level}) below threshold (${alert.threshold})`}
                              {alert.alert_type === 'out_of_stock' && `Product is out of stock`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          
                          <button
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
                          >
                            Acknowledge
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs would be implemented here */}
        {activeTab === 'analytics' && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inventory Analytics</h3>
            <p className="text-gray-600">Detailed inventory performance metrics and trends coming soon.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Inventory Settings</h3>
            <p className="text-gray-600">Configure reorder points, alerts, and automation rules.</p>
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {showStockAdjustment && (
          <StockAdjustmentModal
            item={inventory.find(item => item.id === showStockAdjustment)!}
            onClose={() => setShowStockAdjustment(null)}
            onAdjust={adjustStock}
          />
        )}
      </div>
    </div>
  );
};

// Stock Adjustment Modal Component
interface StockAdjustmentModalProps {
  item: InventoryItem;
  onClose: () => void;
  onAdjust: (itemId: string, adjustment: number, reason: string) => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ item, onClose, onAdjust }) => {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease'>('increase');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAdjustment = adjustmentType === 'increase' ? Math.abs(adjustment) : -Math.abs(adjustment);
    onAdjust(item.id, finalAdjustment, reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjust Stock Level</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">{item.product_name}</p>
          <p className="text-sm text-gray-500">Current Stock: {item.current_stock}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="increase"
                  checked={adjustmentType === 'increase'}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="mr-2"
                />
                Increase Stock
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="decrease"
                  checked={adjustmentType === 'decrease'}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="mr-2"
                />
                Decrease Stock
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={adjustment}
              onChange={(e) => setAdjustment(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for adjustment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
              required
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-lvn-maroon text-white py-2 px-4 rounded-lg hover:bg-lvn-maroon/90 transition-colors"
            >
              Apply Adjustment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryManagement;
