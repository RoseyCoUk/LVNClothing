import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAdminProducts } from '../admin/contexts/AdminProductsContext';
import { 
  X, 
  Save, 
  Package, 
  DollarSign, 
  Edit3, 
  Image as ImageIcon,
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Star,
  Trash2,
  ArrowLeft,
  Eye,
  Settings,
  TrendingUp
} from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  cost: number;
  available: boolean;
  stock: number;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  imageOrder: number;
  isPrimary: boolean;
  isThumbnail: boolean;
}

interface ProductData {
  id: string;
  printful_product_id: string;
  custom_retail_price: number;
  custom_description: string;
  category: string;
  is_active: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
}

interface MobileProductEditorProps {
  productId: string;
  productName: string;
  onSave: (product: Partial<ProductData>) => Promise<void>;
  onClose: () => void;
}

const MobileProductEditor: React.FC<MobileProductEditorProps> = ({
  productId,
  productName,
  onSave,
  onClose
}) => {
  const { getProductOverrides, updateProductOverride, getProductImages } = useAdminProducts();
  
  // State management
  const [productData, setProductData] = useState<Partial<ProductData>>({
    custom_retail_price: 0,
    custom_description: '',
    category: '',
    is_active: true,
    variants: [],
    images: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'variants']));
  const [showImageManager, setShowImageManager] = useState(false);
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({});

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const product = await getProductOverrides(productId);
        if (product) {
          setProductData({
            custom_retail_price: product.custom_retail_price || 0,
            custom_description: product.custom_description || '',
            category: (product as any).category || '',
            is_active: product.is_active ?? true,
            variants: (product as any).variants || [],
            images: []
          });
          
          // Load images
          const images = await getProductImages(productId);
          setProductData(prev => ({ ...prev, images }));
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [productId, getProductOverrides, getProductImages]);

  // Calculate profit margin
  const profitMargin = useMemo(() => {
    if (!productData.custom_retail_price || !productData.variants?.length) return 0;
    
    const totalCost = productData.variants.reduce((sum, variant) => sum + (variant.cost || 0), 0);
    const avgCost = totalCost / productData.variants.length;
    const profit = productData.custom_retail_price - avgCost;
    
    return avgCost > 0 ? (profit / avgCost) * 100 : 0;
  }, [productData.custom_retail_price, productData.variants]);

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

  // Update product data
  const updateProductField = useCallback((field: keyof ProductData, value: any) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Variant management
  const addVariant = useCallback(() => {
    if (!newVariant.name?.trim()) return;
    
    const variant: ProductVariant = {
      id: `temp-${Date.now()}`,
      name: newVariant.name,
      size: newVariant.size || '',
      color: newVariant.color || '',
      material: newVariant.material || '',
      price: newVariant.price || productData.custom_retail_price || 0,
      cost: newVariant.cost || 0,
      available: newVariant.available ?? true,
      stock: newVariant.stock || 0
    };
    
    setProductData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), variant]
    }));
    
    setNewVariant({});
  }, [newVariant, productData.custom_retail_price]);

  const updateVariant = useCallback((variantId: string, field: keyof ProductVariant, value: any) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants?.map(v => 
        v.id === variantId ? { ...v, [field]: value } : v
      ) || []
    }));
  }, []);

  const removeVariant = useCallback((variantId: string) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== variantId) || []
    }));
  }, []);

  const toggleVariantAvailability = useCallback((variantId: string) => {
    updateVariant(variantId, 'available', !productData.variants?.find(v => v.id === variantId)?.available);
  }, [productData.variants, updateVariant]);

  // Save product
  const handleSave = useCallback(async () => {
    if (!productData.custom_description?.trim()) {
      alert('Please enter a product description');
      return;
    }
    
    if (productData.custom_retail_price <= 0) {
      alert('Please enter a valid retail price');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(productData);
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [productData, onSave, onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

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
              <h2 className="text-lg font-semibold text-gray-900">Edit Product</h2>
              <p className="text-sm text-gray-600">{productName}</p>
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
                  Product Description
                </label>
                <textarea
                  value={productData.custom_description}
                  onChange={(e) => updateProductField('custom_description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your product..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={productData.category}
                  onChange={(e) => updateProductField('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Clothing, Accessories"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Retail Price
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={productData.custom_retail_price}
                    onChange={(e) => updateProductField('custom_retail_price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              {/* Profit Margin Display */}
              {profitMargin !== 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Profit Margin</span>
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="mt-1">
                    <span className={`text-lg font-semibold ${
                      profitMargin > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {profitMargin > 0 ? '+' : ''}{profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={productData.is_active}
                  onChange={(e) => updateProductField('is_active', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is-active" className="ml-2 block text-sm text-gray-900">
                  Active (visible to customers)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Variants Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('variants')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <Tag className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">Variants</span>
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                {productData.variants?.length || 0}
              </span>
            </div>
            {expandedSections.has('variants') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('variants') && (
            <div className="px-4 pb-4">
              {/* Add New Variant */}
              <div className="mb-4 p-3 border border-dashed border-gray-300 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Variant</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={newVariant.name || ''}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Variant name"
                  />
                  <input
                    type="text"
                    value={newVariant.size || ''}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, size: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Size (optional)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={newVariant.color || ''}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, color: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Color (optional)"
                  />
                  <input
                    type="text"
                    value={newVariant.material || ''}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, material: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Material (optional)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={newVariant.price || ''}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Price"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={newVariant.cost || ''}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cost"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="number"
                    value={newVariant.stock || ''}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Stock level"
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="new-variant-available"
                      checked={newVariant.available ?? true}
                      onChange={(e) => setNewVariant(prev => ({ ...prev, available: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="new-variant-available" className="ml-2 text-sm text-gray-700">
                      Available
                    </label>
                  </div>
                </div>
                <button
                  onClick={addVariant}
                  disabled={!newVariant.name?.trim()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </button>
              </div>

              {/* Existing Variants */}
              <div className="space-y-3">
                {productData.variants?.map((variant) => (
                  <div key={variant.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900">{variant.name}</h5>
                        {variant.size && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {variant.size}
                          </span>
                        )}
                        {variant.color && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {variant.color}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleVariantAvailability(variant.id)}
                          className={`p-1 rounded-full ${
                            variant.available
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {variant.available ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => removeVariant(variant.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <DollarSign className="h-3 w-3 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Cost</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <DollarSign className="h-3 w-3 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            value={variant.cost}
                            onChange={(e) => updateVariant(variant.id, 'cost', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            variant.available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {variant.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {(!productData.variants || productData.variants.length === 0) && (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No variants yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Add variants to manage different options</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Images Section */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('images')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <ImageIcon className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900">Images</span>
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                {productData.images?.length || 0}
              </span>
            </div>
            {expandedSections.has('images') ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.has('images') && (
            <div className="px-4 pb-4">
              <div className="mb-4">
                <button
                  onClick={() => setShowImageManager(true)}
                  className="w-full inline-flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Manage Images
                </button>
              </div>
              
              {/* Image Preview Grid */}
              {productData.images && productData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {productData.images.map((image, index) => (
                    <div key={image.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.imageUrl}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Primary indicator */}
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        </div>
                      )}
                      
                      {/* Order indicator */}
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-black bg-opacity-50 text-white text-xs font-bold rounded-full">
                          {image.imageOrder + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Empty State */}
              {(!productData.images || productData.images.length === 0) && (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No images yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Add images to showcase your product</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Manager Modal */}
      {showImageManager && (
        <div className="fixed inset-0 z-60 bg-black bg-opacity-50">
          <div className="fixed inset-0 z-70 bg-white">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowImageManager(false)}
                    className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Manage Images</h3>
                    <p className="text-sm text-gray-600">Upload and organize product images</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-center text-gray-500 py-8">
                Image management functionality would be implemented here.
                <br />
                This would include upload, reordering, and deletion capabilities.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProductEditor;
