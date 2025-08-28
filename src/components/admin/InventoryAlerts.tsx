import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';

interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  price: number;
  category: string;
}

const InventoryAlerts: React.FC = () => {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, price, category')
        .lte('stock_quantity', 10)
        .order('stock_quantity', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setLowStockProducts(data);
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white p-4 rounded-lg shadow-sm border">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const outOfStockCount = lowStockProducts.filter(p => p.stock_quantity === 0).length;
  const lowStockCount = lowStockProducts.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length;
  const mediumStockCount = lowStockProducts.filter(p => p.stock_quantity > 5 && p.stock_quantity <= 10).length;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Inventory Alerts</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      {lowStockProducts.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p>All products are well stocked!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-red-50 p-2 rounded border border-red-200 text-center">
              <div className="text-lg font-bold text-red-600">{outOfStockCount}</div>
              <div className="text-xs text-red-700">Out</div>
            </div>
            <div className="bg-orange-50 p-2 rounded border border-orange-200 text-center">
              <div className="text-lg font-bold text-orange-600">{lowStockCount}</div>
              <div className="text-xs text-orange-700">Low</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded border border-yellow-200 text-center">
              <div className="text-lg font-bold text-yellow-600">{mediumStockCount}</div>
              <div className="text-xs text-yellow-700">Medium</div>
            </div>
          </div>

          {/* Product List */}
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Requiring Attention</h4>
            {lowStockProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    product.stock_quantity === 0 
                      ? 'bg-red-500' 
                      : product.stock_quantity <= 5 
                        ? 'bg-orange-500' 
                        : 'bg-yellow-500'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-900">
                    {product.stock_quantity}
                  </div>
                </div>
              </div>
            ))}
            
            {lowStockProducts.length > 5 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-lvn-maroon hover:text-lvn-maroon/80">
                  View All {lowStockProducts.length} Products
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex space-x-1">
              <Button size="sm" className="bg-lvn-maroon hover:bg-lvn-maroon/90 text-xs px-2 py-1">
                Reorder
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 text-xs px-2 py-1">
                Export
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
