import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAdminProducts } from '../admin/contexts/AdminProductsContext';
import { 
  X, 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  Package, 
  Tag, 
  DollarSign,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  Save,
  ArrowLeft,
  Eye
} from 'lucide-react';

interface Product {
  id: string;
  printful_product_id: string;
  custom_retail_price: number;
  custom_description: string;
  is_active: boolean;
  images: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
}

interface BundleItem {
  id: string;
  bundle_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  custom_price: number;
  is_active: boolean;
  items: BundleItem[];
}

interface MobileBundleEditorProps {
  bundle?: Bundle;
  onSave: (bundle: Partial<Bundle>) => Promise<void>;
  onClose: () => void;
}

const MobileBundleEditor: React.FC<MobileBundleEditorProps> = ({
  bundle,
  onSave,
  onClose
}) => {
  const { getProductOverrides, getProductImages, getBundles, getBundleItems } = useAdminProducts();
  
  // State management
  const [bundleData, setBundleData] = useState<Partial<Bundle>>({
    name: bundle?.name || '',
    description: bundle?.description || '',
    custom_price: bundle?.custom_price || 0,
    is_active: bundle?.is_active ?? true,
    items: bundle?.items || []
  });
  
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'products']));
  const [showFilters, setShowFilters] = useState(false);

  // Load available products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getProductOverrides();
        const productsWithImages = await Promise.all(
          products.map(async (product) => {
            const images = await getProductImages(product.id);
            return {
              ...product,
              images
            };
          })
        );
        setAvailableProducts(productsWithImages.filter(p => p.is_active));
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    
    loadProducts();
  }, [getProductOverrides, getProductImages]);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = availableProducts;
    
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.custom_description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      // Assuming products have a category field
      filtered = filtered.filter(product => 
        (product as any).category === selectedCategory
      );
    }
    
    setFilteredProducts(filtered);
  }, [availableProducts, searchQuery, selectedCategory]);

  // Calculate bundle totals
  const bundleTotals = useMemo(() => {
    const totalCost = bundleData.items?.reduce((sum, item) => {
      const product = availableProducts.find(p => p.id === item.product_id);
      return sum + (product?.custom_retail_price || 0) * item.quantity;
    }, 0) || 0;
    
    const savings = totalCost - (bundleData.custom_price || 0);
    const savingsPercentage = totalCost > 0 ? (savings / totalCost) * 100 : 0;
    
    return {
      totalCost,
      savings,
      savingsPercentage,
      itemCount: bundleData.items?.length || 0
    };
  }, [bundleData.items, bundleData.custom_price, availableProducts]);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  // Add product to bundle
  const addProductToBundle = useCallback((product: Product) => {
    const existingItem = bundleData.items?.find(item => item.product_id === product.id);
    
    if (existingItem) {
      // Increase quantity
      setBundleData(prev => ({
        ...prev,
        items: prev.items?.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
    } else {
      // Add new item
      setBundleData(prev => ({
        ...prev,
        items: [...(prev.items || []), {
          id: `temp-${Date.now()}`,
          bundle_id: bundle?.id || 'temp',
          product_id: product.id,
          quantity: 1
        }]
      }));
    }
    
    setShowProductSelector(false);
  }, [bundleData.items, bundle?.id]);

  // Remove product from bundle
  const removeProductFromBundle = useCallback((productId: string) => {
    setBundleData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.product_id !== productId) || []
    }));
  }, []);

  // Update product quantity
  const updateProductQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromBundle(productId);
      return;
    }
    
    setBundleData(prev => ({
      ...prev,
      items: prev.items?.map(item => 
        item.product_id === productId 
          ? { ...item, quantity }
          : item
      ) || []
    }));
  }, [removeProductFromBundle]);

  // Save bundle
  const handleSave = useCallback(async () => {
    if (!bundleData.name?.trim()) {
      alert('Please enter a bundle name');
      return;
    }
    
    if (bundleData.items?.length === 0) {
      alert('Please add at least one product to the bundle');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(bundleData);
      onClose();
    } catch (error) {
      console.error('Failed to save bundle:', error);
      alert('Failed to save bundle. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [bundleData, onSave, onClose]);

  // Get product details for bundle items
  const getProductDetails = useCallback((productId: string) => {
    return availableProducts.find(p => p.id === productId);
  }, [availableProducts]);

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {bundle ? 'Edit Bundle' : 'Create Bundle'}
              </h2>
              <p className="text-sm text-gray-600">
                {bundle ? bundle.name : 'Configure your new bundle'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Basic Info Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">Basic Information</span>
            </div>
            {expandedSections.has('basic') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('basic') && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bundle Name
                </label>
                <input
                  type="text"
                  value={bundleData.name}
                  onChange={(e) => setBundleData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bundle name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={bundleData.description}
                  onChange={(e) => setBundleData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what customers will receive"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bundle Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={bundleData.custom_price}
                    onChange={(e) => setBundleData(prev => ({ ...prev, custom_price: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={bundleData.is_active}
                  onChange={(e) => setBundleData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is-active" className="ml-2 block text-sm text-gray-900">
                  Active (visible to customers)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('products')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">Products</span>
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                {bundleData.items?.length || 0}
              </span>
            </div>
            {expandedSections.has('products') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('products') && (
            <div className="px-4 pb-4">
              {/* Bundle Summary */}
              {bundleData.items && bundleData.items.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Bundle Summary</span>
                    <Tag className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Total Value:</span>
                      <span className="ml-2 font-medium text-blue-900">
                        ${bundleTotals.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Bundle Price:</span>
                      <span className="ml-2 font-medium text-blue-900">
                        ${bundleData.custom_price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Savings:</span>
                      <span className="ml-2 font-medium text-green-600">
                        ${bundleTotals.savings.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Savings %:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {bundleTotals.savingsPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Product Button */}
              <button
                onClick={() => setShowProductSelector(true)}
                className="w-full mb-4 inline-flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button>

              {/* Bundle Items */}
              <div className="space-y-3">
                {bundleData.items?.map((item) => {
                  const product = getProductDetails(item.product_id);
                  if (!product) return null;
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].image_url}
                            alt={product.custom_description}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.custom_description}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${product.custom_retail_price?.toFixed(2)}
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateProductQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center text-sm font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => updateProductQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeProductFromBundle(item.product_id)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {(!bundleData.items || bundleData.items.length === 0) && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No products added</h3>
                  <p className="text-sm text-gray-500 mb-4">Add products to create your bundle</p>
                  <button
                    onClick={() => setShowProductSelector(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Product
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('preview')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">Customer Preview</span>
            </div>
            {expandedSections.has('preview') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('preview') && (
            <div className="px-4 pb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">What customers will see:</h4>
                
                {bundleData.name && (
                  <div className="mb-3">
                    <h5 className="text-lg font-semibold text-gray-900">{bundleData.name}</h5>
                    {bundleData.description && (
                      <p className="text-sm text-gray-600 mt-1">{bundleData.description}</p>
                    )}
                  </div>
                )}
                
                {bundleData.items && bundleData.items.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bundle Price:</span>
                      <span className="font-medium text-gray-900">
                        ${bundleData.custom_price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-medium text-gray-900">
                        ${bundleTotals.totalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">You Save:</span>
                      <span className="font-medium text-green-600">
                        ${bundleTotals.savings.toFixed(2)} ({bundleTotals.savingsPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Selector Modal */}
      {showProductSelector && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50">
          <div className="fixed inset-0 z-70 bg-white">
            {/* Product Selector Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowProductSelector(false)}
                    className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Select Products</h3>
                    <p className="text-sm text-gray-600">Choose products for your bundle</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search products..."
                />
              </div>
              
              {showFilters && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                      selectedCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {/* Add more category filters as needed */}
                </div>
              )}
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 gap-3">
                {filteredProducts.map((product) => {
                  const isInBundle = bundleData.items?.some(item => item.product_id === product.id);
                  
                  return (
                    <div
                      key={product.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        isInBundle
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0].image_url}
                              alt={product.custom_description}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.custom_description}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${product.custom_retail_price?.toFixed(2)}
                          </p>
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={() => addProductToBundle(product)}
                          disabled={isInBundle}
                          className={`p-2 rounded-full transition-colors ${
                            isInBundle
                              ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isInBundle ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No products found</h3>
                  <p className="text-sm text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms' : 'No products available'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileBundleEditor;
