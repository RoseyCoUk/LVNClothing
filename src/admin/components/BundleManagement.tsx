import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Package, Eye, Star, Settings, Save, X, DollarSign, Image, MessageSquare, Tag, Truck, Zap } from 'lucide-react';
import { useAdminProducts } from '../contexts/AdminProductsContext';
import { Bundle, BundleItem } from '../lib/admin-products-api';
import { Toast, useToast } from '../../components/ui/Toast';

// Move BundleModal outside to prevent re-creation
interface BundleModalProps {
  show: boolean;
  onClose: () => void;
  title: string;
  bundleForm: any;
  setBundleForm: (form: any) => void;
  selectedProducts: any[];
  setSelectedProducts: (products: any[]) => void;
  newFeature: string;
  setNewFeature: (feature: string) => void;
  products: any[];
  isLoading: boolean;
  selectedBundle: Bundle | null;
  onSave: () => void;
  onAddFeature: () => void;
  onRemoveFeature: (index: number) => void;
  onAddProduct: (productId: string) => void;
  onRemoveProduct: (productId: string) => void;
}

const BundleModal: React.FC<BundleModalProps> = ({
  show,
  onClose,
  title,
  bundleForm,
  setBundleForm,
  selectedProducts,
  setSelectedProducts,
  newFeature,
  setNewFeature,
  products,
  isLoading,
  selectedBundle,
  onSave,
  onAddFeature,
  onRemoveFeature,
  onAddProduct,
  onRemoveProduct
}) => {
  if (!show) return null;

  const calculateSavings = () => {
    const savings = bundleForm.original_price - bundleForm.retail_price;
    const percentage = bundleForm.original_price > 0 ? (savings / bundleForm.original_price) * 100 : 0;
    return { savings, percentage };
  };

  const { savings, percentage } = calculateSavings();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Name *
              </label>
              <input
                type="text"
                value={bundleForm.name}
                onChange={(e) => setBundleForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter bundle name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Type
              </label>
              <select
                value={bundleForm.bundle_type}
                onChange={(e) => setBundleForm(prev => ({ ...prev, bundle_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="starter">Starter Bundle</option>
                <option value="champion">Champion Bundle</option>
                <option value="activist">Activist Bundle</option>
                <option value="custom">Custom Bundle</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={bundleForm.description}
              onChange={(e) => setBundleForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bundle description"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Price (£) *
              </label>
              <input
                type="number"
                value={bundleForm.retail_price}
                onChange={(e) => setBundleForm(prev => ({ ...prev, retail_price: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price (£)
              </label>
              <input
                type="number"
                value={bundleForm.original_price}
                onChange={(e) => setBundleForm(prev => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="text-sm text-gray-600">
                Savings: £{savings.toFixed(2)} ({percentage.toFixed(1)}%)
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Shows calculated savings
              </div>
            </div>
          </div>

          {/* Bundle Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bundle Features
            </label>
            <div className="space-y-2">
              {bundleForm.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 text-sm bg-gray-50 px-3 py-2 rounded-md">{feature}</span>
                  <button
                    onClick={() => onRemoveFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onAddFeature()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add new feature"
                />
                <button
                  onClick={onAddFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Bundle Products */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bundle Products
            </label>
            <div className="space-y-3">
              {selectedProducts.map((selectedProduct) => {
                const product = products.find(p => p.id === selectedProduct.product_id);
                return (
                  <div key={selectedProduct.product_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{product?.name || 'Unknown Product'}</span>
                      <span className="text-sm text-gray-500 ml-2">Qty: {selectedProduct.quantity}</span>
                    </div>
                    <button
                      onClick={() => onRemoveProduct(selectedProduct.product_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              
              <div>
                <select
                  onChange={(e) => e.target.value && onAddProduct(e.target.value)}
                  value=""
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select product to add...</option>
                  {products
                    .filter(product => !selectedProducts.find(sp => sp.product_id === product.id))
                    .map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials
              </label>
              <textarea
                value={bundleForm.materials}
                onChange={(e) => setBundleForm(prev => ({ ...prev, materials: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bundle materials description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Care Instructions
              </label>
              <textarea
                value={bundleForm.care_instructions}
                onChange={(e) => setBundleForm(prev => ({ ...prev, care_instructions: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Care instructions"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Info
              </label>
              <input
                type="text"
                value={bundleForm.shipping_info}
                onChange={(e) => setBundleForm(prev => ({ ...prev, shipping_info: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgency Text
              </label>
              <input
                type="text"
                value={bundleForm.urgency_text}
                onChange={(e) => setBundleForm(prev => ({ ...prev, urgency_text: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={bundleForm.sort_order}
                onChange={(e) => setBundleForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bundleForm.popular}
                onChange={(e) => setBundleForm(prev => ({ ...prev, popular: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Popular Bundle</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={bundleForm.is_active}
                onChange={(e) => setBundleForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isLoading || !bundleForm.name || bundleForm.retail_price <= 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {selectedBundle ? 'Update Bundle' : 'Create Bundle'}
          </button>
        </div>
      </div>
    </div>
  );
};

const BundleManagement: React.FC = () => {
  const { 
    bundles, 
    bundlesLoading, 
    bundlesError,
    products,
    fetchBundles, 
    getBundleDetails,
    createBundle, 
    updateBundle, 
    deleteBundle,
    fetchProducts
  } = useAdminProducts();

  const { isVisible, message, showToast, hideToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for bundle creation/editing
  const [bundleForm, setBundleForm] = useState({
    name: '',
    description: '',
    retail_price: 0,
    original_price: 0,
    bundle_type: 'custom',
    shipping_info: 'Free UK Shipping',
    urgency_text: 'Limited Time Offer',
    rating: 4.8,
    features: [] as string[],
    care_instructions: '',
    materials: '',
    popular: false,
    sort_order: 0,
    is_active: true
  });

  const [selectedProducts, setSelectedProducts] = useState<Array<{
    product_id: string;
    quantity: number;
    is_customizable: boolean;
    allowed_colors: string[];
    allowed_sizes: string[];
    default_color?: string;
    default_size?: string;
    display_order: number;
  }>>([]);

  const [newFeature, setNewFeature] = useState('');

  // Load data on mount
  useEffect(() => {
    fetchBundles(true);
    fetchProducts();
  }, [fetchBundles, fetchProducts]);

  // Filter bundles based on search
  const filteredBundles = bundles.filter(bundle =>
    bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bundle.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bundle.bundle_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = useCallback(() => {
    setBundleForm({
      name: '',
      description: '',
      retail_price: 0,
      original_price: 0,
      bundle_type: 'custom',
      shipping_info: 'Free UK Shipping',
      urgency_text: 'Limited Time Offer',
      rating: 4.8,
      features: [],
      care_instructions: '',
      materials: '',
      popular: false,
      sort_order: 0,
      is_active: true
    });
    setSelectedProducts([]);
    setNewFeature('');
  }, []);

  const handleCreateBundle = useCallback(() => {
    resetForm();
    setSelectedBundle(null);
    setShowCreateModal(true);
  }, [resetForm]);

  const handleEditBundle = useCallback(async (bundle: Bundle) => {
    try {
      setIsLoading(true);
      console.log('🔧 Editing bundle:', bundle);
      
      const bundleDetails = await getBundleDetails(bundle.id);
      console.log('📦 Bundle details loaded:', bundleDetails);
      
      if (bundleDetails) {
        setBundleForm({
          name: bundleDetails.bundle_name,
          description: bundleDetails.bundle_description || '',
          retail_price: bundleDetails.bundle_price,
          original_price: bundleDetails.original_price || 0,
          bundle_type: bundleDetails.bundle_type || 'custom',
          shipping_info: bundleDetails.shipping_info || 'Free UK Shipping',
          urgency_text: bundleDetails.urgency_text || 'Limited Time Offer',
          rating: bundleDetails.rating || 4.8,
          features: bundleDetails.features || [],
          care_instructions: bundleDetails.care_instructions || '',
          materials: bundleDetails.materials || '',
          popular: bundleDetails.popular || false,
          sort_order: bundleDetails.sort_order || 0,
          is_active: bundleDetails.is_active
        });

        // Set selected products from bundle items
        const items = Array.isArray(bundleDetails.items) ? bundleDetails.items : [];
        setSelectedProducts(items.map((item, index) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          is_customizable: item.is_customizable || false,
          allowed_colors: item.allowed_colors || [],
          allowed_sizes: item.allowed_sizes || [],
          default_color: item.default_color,
          default_size: item.default_size,
          display_order: item.display_order || index
        })));

        setSelectedBundle(bundle);
        setShowEditModal(true);
        console.log('✅ Bundle edit modal opened');
      } else {
        showToast('Failed to load bundle details', 'error');
      }
    } catch (error) {
      console.error('❌ Error loading bundle details:', error);
      showToast('Failed to load bundle details', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [getBundleDetails, showToast]);

  const handleDeleteBundle = useCallback(async (bundle: Bundle) => {
    if (!confirm(`Are you sure you want to delete "${bundle.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteBundle(bundle.id);
      showToast('Bundle deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete bundle', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [deleteBundle, showToast]);

  const handleSaveBundle = useCallback(async () => {
    if (!bundleForm.name || bundleForm.retail_price <= 0) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      setIsLoading(true);
      
      const bundleData = {
        name: bundleForm.name,
        description: bundleForm.description,
        retail_price: bundleForm.retail_price,
        original_price: bundleForm.original_price,
        bundle_type: bundleForm.bundle_type,
        shipping_info: bundleForm.shipping_info,
        urgency_text: bundleForm.urgency_text,
        rating: bundleForm.rating,
        features: bundleForm.features,
        care_instructions: bundleForm.care_instructions,
        materials: bundleForm.materials,
        popular: bundleForm.popular,
        sort_order: bundleForm.sort_order,
        is_active: bundleForm.is_active
      };

      const bundleItems = selectedProducts.map(product => ({
        product_id: product.product_id,
        quantity: product.quantity,
        is_customizable: product.is_customizable,
        allowed_colors: product.allowed_colors,
        allowed_sizes: product.allowed_sizes,
        default_color: product.default_color,
        default_size: product.default_size,
        display_order: product.display_order
      }));

      if (selectedBundle) {
        // Update existing bundle
        await updateBundle(selectedBundle.id, bundleData);
        showToast('Bundle updated successfully', 'success');
        setShowEditModal(false);
      } else {
        // Create new bundle
        await createBundle(bundleData, bundleItems);
        showToast('Bundle created successfully', 'success');
        setShowCreateModal(false);
      }

      resetForm();
      setSelectedBundle(null);
    } catch (error) {
      console.error('❌ Error saving bundle:', error);
      showToast('Failed to save bundle', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [bundleForm, selectedProducts, selectedBundle, updateBundle, createBundle, showToast, resetForm]);

  const addFeature = useCallback(() => {
    if (newFeature.trim()) {
      setBundleForm(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  }, [newFeature]);

  const removeFeature = useCallback((index: number) => {
    setBundleForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  }, []);

  const addProduct = useCallback((productId: string) => {
    if (!selectedProducts.find(p => p.product_id === productId)) {
      setSelectedProducts(prev => [...prev, {
        product_id: productId,
        quantity: 1,
        is_customizable: false,
        allowed_colors: [],
        allowed_sizes: [],
        display_order: prev.length
      }]);
    }
  }, [selectedProducts]);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    resetForm();
  }, [resetForm]);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSelectedBundle(null);
    resetForm();
  }, [resetForm]);

  if (bundlesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading bundles...</span>
      </div>
    );
  }

  if (bundlesError) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">Error loading bundles: {bundlesError}</div>
        <button
          onClick={() => fetchBundles(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Toast 
        message={message}
        isVisible={isVisible}
        onClose={hideToast}
        duration={3000}
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bundle Management</h1>
            <p className="text-gray-600">Create and manage product bundles with custom pricing and features</p>
          </div>
          <button
            onClick={handleCreateBundle}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Bundle
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bundles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Bundles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBundles.map((bundle) => (
            <div key={bundle.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{bundle.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{bundle.description}</p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">£{bundle.retail_price}</span>
                    </div>
                    {bundle.original_price && bundle.original_price > bundle.retail_price && (
                      <div className="text-sm text-gray-500">
                        <span className="line-through">£{bundle.original_price}</span>
                        <span className="ml-1 text-green-600 font-medium">
                          Save £{(bundle.original_price - bundle.retail_price).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span className="capitalize">{bundle.bundle_type}</span>
                    </div>
                    {bundle.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{bundle.rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bundle.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {bundle.is_active ? 'Active' : 'Inactive'}
                  </span>
                  
                  {bundle.popular && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Popular
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditBundle(bundle)}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteBundle(bundle)}
                    disabled={isLoading}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  {new Date(bundle.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBundles.length === 0 && !bundlesLoading && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No bundles match your search criteria.' : 'Get started by creating your first bundle.'}
            </p>
            <button
              onClick={handleCreateBundle}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Bundle
            </button>
          </div>
        )}

        {/* Modals */}
        <BundleModal 
          show={showCreateModal} 
          onClose={handleCloseCreateModal}
          title="Create New Bundle"
          bundleForm={bundleForm}
          setBundleForm={setBundleForm}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          newFeature={newFeature}
          setNewFeature={setNewFeature}
          products={products}
          isLoading={isLoading}
          selectedBundle={null}
          onSave={handleSaveBundle}
          onAddFeature={addFeature}
          onRemoveFeature={removeFeature}
          onAddProduct={addProduct}
          onRemoveProduct={removeProduct}
        />

        <BundleModal 
          show={showEditModal} 
          onClose={handleCloseEditModal}
          title="Edit Bundle"
          bundleForm={bundleForm}
          setBundleForm={setBundleForm}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          newFeature={newFeature}
          setNewFeature={setNewFeature}
          products={products}
          isLoading={isLoading}
          selectedBundle={selectedBundle}
          onSave={handleSaveBundle}
          onAddFeature={addFeature}
          onRemoveFeature={removeFeature}
          onAddProduct={addProduct}
          onRemoveProduct={removeProduct}
        />
      </div>
    </>
  );
};

export default BundleManagement;