import React, { useState, useEffect, useRef } from 'react';
import { useAdminProducts } from '../admin/contexts/AdminProductsContext';
import { 
  X, 
  Save, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Package,
  Search,
  GripVertical,
  Minus,
  Plus as PlusIcon,
  AlertCircle,
  CheckCircle,
  DollarSign,
  ShoppingBag
} from 'lucide-react';

interface BundleProduct {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  custom_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products: BundleProduct[];
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  retail_price: number;
  printful_cost: number;
  image_url?: string;
  category: string;
}

interface BundleManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const BundleManagement: React.FC<BundleManagementProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    getBundles, 
    createBundle, 
    updateBundle, 
    deleteBundle,
    getBundleItems,
    createBundleItem,
    updateBundleItem,
    deleteBundleItem,
    getProductOverrides
  } = useAdminProducts();

  // State management
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showBundleEditor, setShowBundleEditor] = useState(false);
  const [showBundlePreview, setShowBundlePreview] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [previewingBundle, setPreviewingBundle] = useState<Bundle | null>(null);
  
  // Bundle editor state
  const [bundleForm, setBundleForm] = useState({
    name: '',
    description: '',
    custom_price: 0,
    is_active: true
  });
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    product: ProductData;
    quantity: number;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load data on component mount
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Load bundles and products data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load bundles
      const bundlesData = await getBundles();
      const bundlesWithProducts = await Promise.all(
        bundlesData.map(async (bundle) => {
          const bundleItems = await getBundleItems(bundle.id);
          return {
            ...bundle,
            products: bundleItems
          };
        })
      );
      
      setBundles(bundlesWithProducts);
      
      // Load products for selection
      const productsData = await getProductOverrides();
      setProducts(productsData);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Handle bundle form changes
  const handleBundleFormChange = (field: string, value: string | number | boolean) => {
    setBundleForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle product selection
  const handleProductSelect = (product: ProductData) => {
    const existingProduct = selectedProducts.find(p => p.product.id === product.id);
    if (existingProduct) {
      setSelectedProducts(prev => prev.map(p => 
        p.product.id === product.id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      setSelectedProducts(prev => [...prev, { product, quantity: 1 }]);
    }
  };

  // Handle product quantity change
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedProducts(prev => prev.filter(p => p.product.id !== productId));
    } else {
      setSelectedProducts(prev => prev.map(p => 
        p.product.id === productId 
          ? { ...p, quantity: newQuantity }
          : p
      ));
    }
  };

  // Remove product from selection
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.product.id !== productId));
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.product.retail_price * item.quantity);
    }, 0);
  };

  // Calculate savings
  const calculateSavings = () => {
    const totalCost = calculateTotalCost();
    const bundlePrice = bundleForm.custom_price;
    return totalCost - bundlePrice;
  };

  // Save bundle
  const handleSaveBundle = async () => {
    if (!bundleForm.name.trim()) {
      setError('Bundle name is required');
      return;
    }
    
    if (selectedProducts.length === 0) {
      setError('At least one product must be selected');
      return;
    }
    
    if (bundleForm.custom_price <= 0) {
      setError('Bundle price must be greater than 0');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      let bundleId: string;
      
      if (editingBundle) {
        // Update existing bundle
        const updatedBundle = await updateBundle(editingBundle.id, {
          name: bundleForm.name,
          description: bundleForm.description,
          custom_price: bundleForm.custom_price,
          is_active: bundleForm.is_active
        });
        bundleId = updatedBundle.id;
        
        // Remove existing bundle items
        for (const item of editingBundle.products) {
          await deleteBundleItem(item.id);
        }
      } else {
        // Create new bundle
        const newBundle = await createBundle({
          name: bundleForm.name,
          description: bundleForm.description,
          custom_price: bundleForm.custom_price,
          is_active: bundleForm.is_active
        });
        bundleId = newBundle.id;
      }
      
      // Create bundle items
      for (const item of selectedProducts) {
        await createBundleItem({
          bundle_id: bundleId,
          product_id: item.product.id,
          quantity: item.quantity
        });
      }
      
      // Close editor and refresh data
      setShowBundleEditor(false);
      setEditingBundle(null);
      setBundleForm({ name: '', description: '', custom_price: 0, is_active: true });
      setSelectedProducts([]);
      await loadData();
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save bundle');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit bundle
  const handleEditBundle = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setBundleForm({
      name: bundle.name,
      description: bundle.description,
      custom_price: bundle.custom_price,
      is_active: bundle.is_active
    });
    
    // Load selected products
    const selectedProductsData = bundle.products.map(item => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        return {
          product,
          quantity: item.quantity
        };
      }
      return null;
    }).filter(Boolean) as Array<{ product: ProductData; quantity: number }>;
    
    setSelectedProducts(selectedProductsData);
    setShowBundleEditor(true);
  };

  // Delete bundle
  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteBundle(bundleId);
      await loadData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete bundle');
    }
  };

  // Preview bundle
  const handlePreviewBundle = (bundle: Bundle) => {
    setPreviewingBundle(bundle);
    setShowBundlePreview(true);
  };

  // Create new bundle
  const handleCreateBundle = () => {
    setEditingBundle(null);
    setBundleForm({ name: '', description: '', custom_price: 0, is_active: true });
    setSelectedProducts([]);
    setShowBundleEditor(true);
  };

  // Filtered products for search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Bundle Management
                </h3>
                <p className="text-sm text-gray-500">
                  Manage product bundles and pricing
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCreateBundle}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Bundle
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading bundles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadData}
                  className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bundles List */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Current Bundles</h4>
                  
                  {bundles.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No bundles created yet</p>
                      <p className="text-sm text-gray-400">Create your first bundle to get started</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {bundles.map((bundle) => (
                        <div key={bundle.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h5 className="text-lg font-medium text-gray-900">{bundle.name}</h5>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  bundle.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {bundle.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{bundle.description}</p>
                              <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Bundle Price: £{bundle.custom_price.toFixed(2)}
                                </span>
                                <span className="flex items-center">
                                  <ShoppingBag className="h-4 w-4 mr-1" />
                                  {bundle.products.length} product{bundle.products.length !== 1 ? 's' : ''}
                                </span>
                                <span>
                                  Updated: {new Date(bundle.updated_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handlePreviewBundle(bundle)}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                                title="Preview bundle"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditBundle(bundle)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-md transition-colors"
                                title="Edit bundle"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBundle(bundle.id)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                                title="Delete bundle"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bundle Editor Modal */}
      {showBundleEditor && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Editor Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingBundle ? 'Edit Bundle' : 'Create New Bundle'}
                  </h3>
                  <button
                    onClick={() => setShowBundleEditor(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bundle Details */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Bundle Information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bundle Name
                      </label>
                      <input
                        type="text"
                        value={bundleForm.name}
                        onChange={(e) => handleBundleFormChange('name', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Starter Bundle"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={bundleForm.description}
                        onChange={(e) => handleBundleFormChange('description', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe what customers will receive..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bundle Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">£</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={bundleForm.custom_price}
                          onChange={(e) => handleBundleFormChange('custom_price', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={bundleForm.is_active}
                          onChange={(e) => handleBundleFormChange('is_active', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          Bundle is active and available for purchase
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Product Selection</h4>
                    
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Search products..."
                      />
                    </div>

                    {/* Product List */}
                    <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">£{product.retail_price.toFixed(2)}</p>
                            </div>
                          </div>
                          <PlusIcon className="h-4 w-4 text-blue-600" />
                        </div>
                      ))}
                    </div>

                    {/* Selected Products */}
                    {selectedProducts.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Selected Products</h5>
                        <div className="space-y-2">
                          {selectedProducts.map((item) => (
                            <div key={item.product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                  {item.product.image_url ? (
                                    <img
                                      src={item.product.image_url}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover rounded-md"
                                    />
                                  ) : (
                                    <Package className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">£{item.product.retail_price.toFixed(2)} each</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-sm font-medium text-gray-900 w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                  className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                                >
                                  <PlusIcon className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleRemoveProduct(item.product.id)}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Summary */}
                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Value:</span>
                            <span className="font-medium">£{calculateTotalCost().toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Bundle Price:</span>
                            <span className="font-medium">£{bundleForm.custom_price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium text-green-600">
                            <span>Customer Savings:</span>
                            <span>£{calculateSavings().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>

              {/* Editor Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowBundleEditor(false)}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBundle}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Bundle
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bundle Preview Modal */}
      {showBundlePreview && previewingBundle && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Preview Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Bundle Preview: {previewingBundle.name}
                  </h3>
                  <button
                    onClick={() => setShowBundlePreview(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="space-y-6">
                  {/* Bundle Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{previewingBundle.name}</h4>
                    <p className="text-gray-600 mb-4">{previewingBundle.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Bundle Price:</span>
                        <p className="text-2xl font-bold text-blue-600">£{previewingBundle.custom_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Status:</span>
                        <p className={`text-sm font-medium ${
                          previewingBundle.is_active ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {previewingBundle.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">What Customers Will Receive</h4>
                    
                    {previewingBundle.products.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No products in this bundle</p>
                    ) : (
                      <div className="space-y-4">
                        {previewingBundle.products.map((item) => {
                          const product = products.find(p => p.id === item.product_id);
                          if (!product) return null;
                          
                          return (
                            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {product.image_url ? (
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <Package className="h-8 w-8 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-lg font-medium text-gray-900">{product.name}</h5>
                                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span className="text-gray-500">
                                      Quantity: <span className="font-medium">{item.quantity}</span>
                                    </span>
                                    <span className="text-gray-500">
                                      Price: <span className="font-medium">£{product.retail_price.toFixed(2)} each</span>
                                    </span>
                                    <span className="text-gray-500">
                                      Total: <span className="font-medium">£{(product.retail_price * item.quantity).toFixed(2)}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Value Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Value Summary</h4>
                    
                    {(() => {
                      const totalValue = previewingBundle.products.reduce((total, item) => {
                        const product = products.find(p => p.id === item.product_id);
                        return total + (product ? product.retail_price * item.quantity : 0);
                      }, 0);
                      
                      const savings = totalValue - previewingBundle.custom_price;
                      const savingsPercentage = (savings / totalValue) * 100;
                      
                      return (
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-sm text-gray-500">Total Value</p>
                            <p className="text-2xl font-bold text-gray-900">£{totalValue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Bundle Price</p>
                            <p className="text-2xl font-bold text-blue-600">£{previewingBundle.custom_price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Customer Savings</p>
                            <p className="text-2xl font-bold text-green-600">£{savings.toFixed(2)}</p>
                            <p className="text-sm text-green-600">({savingsPercentage.toFixed(0)}% off)</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowBundlePreview(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BundleManagement;
