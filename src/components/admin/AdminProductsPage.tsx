import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Eye, Edit, Package, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import ProductEditModal from './ProductEditModal';

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  description: string;
  image_url: string;
  category: string;
  stock_quantity: number;
  tags: string[];
  rating: number;
  review_count: number;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          stock_quantity: product.stock_quantity,
          tags: product.tags
        })
        .eq('id', product.id);

      if (error) throw error;
      
      await fetchProducts();
      setEditingProduct(null);
      console.log('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const createProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: product.name,
          price: product.price,
          slug: product.name.toLowerCase().replace(/\s+/g, '-'),
          description: product.description,
          image_url: product.image_url,
          category: product.category,
          stock_quantity: product.stock_quantity,
          tags: product.tags,
          rating: 0,
          review_count: 0
        }]);

      if (error) throw error;
      
      await fetchProducts();
      setShowAddModal(false);
      console.log('Product created successfully');
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return { color: 'text-red-600', bg: 'bg-red-100', text: 'Out of Stock' };
    } else if (quantity <= 5) {
      return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'Low Stock' };
    } else {
      return { color: 'text-green-600', bg: 'bg-green-100', text: 'In Stock' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lvn-maroon"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-lvn-maroon hover:bg-lvn-maroon/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="apparel">Apparel</option>
              <option value="gear">Gear</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-lvn-maroon text-white' : 'bg-white text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-lvn-maroon text-white' : 'bg-white text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {products.length === 0 ? 'Get started by adding your first product' : 'No products match your search criteria'}
          </p>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }
        `}>
          {filteredProducts.map((product) => (
            <div key={product.id} className={`
              bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow
              ${viewMode === 'list' ? 'flex' : ''}
            `}>
              {/* Product Image */}
              <div className={`
                ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'}
                bg-gray-100 flex items-center justify-center
              `}>
                <img
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className={`
                    ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-full'}
                    object-cover
                  `}
                />
              </div>

              {/* Product Info */}
              <div className={`
                p-4
                ${viewMode === 'list' ? 'flex-1' : ''}
              `}>
                <h3 className="font-medium text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-gray-900">
                    £{product.price?.toFixed(2) || '0.00'}
                  </span>
                  <span className={`
                    px-2 py-1 text-xs font-medium rounded-full
                    ${getStockStatus(product.stock_quantity || 0).bg}
                    ${getStockStatus(product.stock_quantity || 0).color}
                  `}>
                    {getStockStatus(product.stock_quantity || 0).text}
                  </span>
                </div>

                {viewMode === 'list' && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Stock: {product.stock_quantity || 0}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {product.rating && (
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                      ({product.review_count || 0})
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
          <div className="text-sm text-gray-600">
            Total Value: £{filteredProducts.reduce((sum, product) => sum + (product.price * (product.stock_quantity || 0)), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <ProductEditModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={updateProduct}
      />

      {/* Add Product Modal */}
      <ProductEditModal
        product={null}
        isOpen={showAddModal}
        isNewProduct={true}
        onClose={() => setShowAddModal(false)}
        onSave={createProduct}
      />
    </div>
  );
};

export default AdminProductsPage;
