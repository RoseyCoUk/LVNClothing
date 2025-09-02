import React, { useState, useEffect, useRef } from 'react';
import { useAdminProducts } from '../admin/contexts/AdminProductsContext';
import { 
  X, 
  Save, 
  Upload, 
  Trash2, 
  Eye, 
  Star,
  GripVertical,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  color?: string;
  material?: string;
  printful_variant_id: string;
  retail_price: number;
  custom_price?: number;
  is_available: boolean;
  stock_level: number;
  last_synced?: string;
  sync_status: 'synced' | 'pending' | 'failed' | 'unknown';
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  is_thumbnail: boolean;
  created_at: string;
}

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    printful_product_id: string;
    name: string;
    description: string;
    retail_price: number;
    printful_cost: number;
    is_available: boolean;
    category: string;
    image_url?: string;
    custom_retail_price?: number;
    custom_description?: string;
    last_synced?: string;
    sync_status: 'synced' | 'pending' | 'failed' | 'unknown';
  } | null;
}

const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const {
    createProductOverride,
    updateProductOverride,
    createProductImage,
    updateProductImage,
    deleteProductImage,
    reorderProductImages,
    uploadImage
  } = useAdminProducts();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    custom_retail_price: 0,
    is_available: true
  });

  // Variants state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  // Images state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'images'>('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock variants data - in real implementation, this would come from Printful API
  const mockVariants: ProductVariant[] = [
    {
      id: 'v1',
      name: 'Small - Black - Cotton',
      size: 'S',
      color: 'Black',
      material: 'Cotton',
      printful_variant_id: 'pf-v-001',
      retail_price: 24.99,
      custom_price: 29.99,
      is_available: true,
      stock_level: 50,
      last_synced: '2025-01-27T10:30:00Z',
      sync_status: 'synced'
    },
    {
      id: 'v2',
      name: 'Medium - White - Cotton',
      size: 'M',
      color: 'White',
      material: 'Cotton',
      printful_variant_id: 'pf-v-002',
      retail_price: 24.99,
      custom_price: 29.99,
      is_available: true,
      stock_level: 75,
      last_synced: '2025-01-27T10:30:00Z',
      sync_status: 'synced'
    },
    {
      id: 'v3',
      name: 'Large - Grey - Cotton',
      size: 'L',
      color: 'Grey',
      material: 'Cotton',
      printful_variant_id: 'pf-v-003',
      retail_price: 24.99,
      custom_price: 29.99,
      is_available: false,
      stock_level: 0,
      last_synced: '2025-01-27T09:15:00Z',
      sync_status: 'failed'
    }
  ];

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.custom_description || product.description,
        category: product.category,
        custom_retail_price: product.custom_retail_price || product.retail_price,
        is_available: product.is_available
      });
      
      // Load variants
      setVariants(mockVariants);
      
      // Load images (mock data for now)
      setImages([
        {
          id: 'img1',
          product_id: product.id,
          image_url: product.image_url || '/public/BackReformLogo.png',
          image_order: 0,
          is_primary: true,
          created_at: new Date().toISOString()
        }
      ]);
    }
  }, [product]);

  // Calculate profit margin
  const profitMargin = formData.custom_retail_price - (product?.printful_cost || 0);
  const profitMarginPercentage = product ? (profitMargin / formData.custom_retail_price) * 100 : 0;

  // Handle form input changes
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle variant price change
  const handleVariantPriceChange = (variantId: string, newPrice: number) => {
    setVariants(prev => prev.map(variant => 
      variant.id === variantId 
        ? { ...variant, custom_price: newPrice }
        : variant
    ));
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList) => {
    if (!product) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedImages: ProductImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `products/${product.id}/${Date.now()}-${file.name}`;
        
        // Upload to Supabase Storage
        const result = await uploadImage(file, 'product-images', path);
        
        // Create product image record
        const newImage: Omit<ProductImage, 'id' | 'created_at'> = {
          product_id: product.id,
          image_url: result.url,
          image_order: images.length + i,
          is_primary: false
        };
        
        const createdImage = await createProductImage(newImage);
        uploadedImages.push(createdImage);
        
        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      // Add new images to state
      setImages(prev => [...prev, ...uploadedImages]);
      
    } catch (error) {
      console.error('Failed to upload images:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop reordering
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null) return;
    
    if (dragIndex !== index) {
      const newImages = [...images];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(index, 0, draggedImage);
      
      // Update order numbers
      newImages.forEach((img, idx) => {
        img.image_order = idx;
      });
      
      setImages(newImages);
      setDragIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  // Set primary image
  const handleSetPrimary = async (imageId: string) => {
    try {
      // Update all images to not primary
      const updatedImages = images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      }));
      
      // Update in database
      for (const img of updatedImages) {
        await updateProductImage(img.id, { is_primary: img.is_primary });
      }
      
      setImages(updatedImages);
    } catch (error) {
      console.error('Failed to set primary image:', error);
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    try {
      const imageToDelete = images.find(img => img.id === imageId);
      if (!imageToDelete) return;
      
      // Delete from storage and database
      // Assuming deleteImage is a function from useAdminProducts or elsewhere
      // For now, we'll just remove it from the state
      // In a real app, you'd call a deleteProductImage function
      // await deleteImage('product-images', imageToDelete.image_url); 
      await deleteProductImage(imageId);
      
      // Remove from state
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  // Save product changes
  const handleSave = async () => {
    if (!product) return;
    
    setIsSaving(true);
    
    try {
      // Check if product override exists
      const existingOverride = await createProductOverride({
        printful_product_id: product.printful_product_id,
        custom_retail_price: formData.custom_retail_price,
        custom_description: formData.description,
        is_active: formData.is_available
      });
      
      // Save image order if changed
      if (images.length > 0) {
        const imageIds = images.map(img => img.id);
        await reorderProductImages(product.id, imageIds);
      }
      
      // Close modal on success
      onClose();
      
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get sync status icon
  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get stock level indicator
  const getStockLevelIndicator = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 10) return 'bg-yellow-100 text-yellow-800';
    if (stock < 50) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Product: {product.name}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'basic', label: 'Basic Info' },
                { key: 'variants', label: 'Variants' },
                { key: 'images', label: 'Images' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Pricing Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Pricing Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Custom Retail Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Retail Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">£</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.custom_retail_price}
                          onChange={(e) => handleInputChange('custom_retail_price', parseFloat(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Printful Cost (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Printful Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">£</span>
                        <input
                          type="text"
                          value={product.printful_cost.toFixed(2)}
                          readOnly
                          className="w-full pl-8 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
                        />
                      </div>
                    </div>

                    {/* Profit Margin */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profit Margin
                      </label>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          £{profitMargin.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profitMarginPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => handleInputChange('is_available', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Product is available for purchase
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Variants Tab */}
            {activeTab === 'variants' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">Product Variants</h4>
                  <span className="text-sm text-gray-500">
                    {variants.length} variants
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Variant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sync
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {variants.map((variant) => (
                        <tr key={variant.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {variant.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {variant.size} • {variant.color} • {variant.material}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                Base: £{variant.retail_price}
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.custom_price || variant.retail_price}
                                onChange={(e) => handleVariantPriceChange(variant.id, parseFloat(e.target.value) || 0)}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockLevelIndicator(variant.stock_level)}`}>
                              {variant.stock_level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              variant.is_available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {variant.is_available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getSyncStatusIcon(variant.sync_status)}
                              <span className="text-sm text-gray-500">
                                {variant.last_synced ? new Date(variant.last_synced).toLocaleDateString() : 'Never'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                {/* Upload Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  
                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">Uploading... {uploadProgress.toFixed(0)}%</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Upload Images
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Current Images */}
                {images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Current Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative group border-2 rounded-lg overflow-hidden ${
                            dragIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                        >
                          {/* Drag Handle */}
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                          </div>

                          {/* Order Number */}
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {image.image_order + 1}
                          </div>

                          {/* Primary Badge */}
                          {image.is_primary && (
                            <div className="absolute top-2 left-8 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              <Star className="h-3 w-3 inline mr-1" />
                              Primary
                            </div>
                          )}

                          {/* Image */}
                          <img
                            src={image.image_url}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/public/BackReformLogo.png';
                            }}
                          />

                          {/* Actions Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleSetPrimary(image.id)}
                                disabled={image.is_primary}
                                className={`p-2 rounded-full ${
                                  image.is_primary
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                                title="Set as primary"
                              >
                                <Star className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => window.open(image.image_url, '_blank')}
                                className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
                                title="Preview image"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteImage(image.id)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                title="Delete image"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-500">
                      Drag and drop images to reorder. The first image will be the primary image.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {activeTab === 'basic' && 'Edit product information and pricing'}
                {activeTab === 'variants' && 'Manage product variants and availability'}
                {activeTab === 'images' && 'Upload and organize product images'}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
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
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditorModal;
