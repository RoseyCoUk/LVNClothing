import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  SortAsc,
  SortDesc,
  Package,
  ToggleLeft,
  ToggleRight,
  Image,
  X
} from 'lucide-react';
import EnhancedImageManagement from './EnhancedImageManagement';
import { ProductVariant, VariantUpdateData, getProductVariants, updateVariant, bulkUpdateVariants, getVariantStats } from '../lib/variant-api';
import { useAdminProducts } from '../contexts/AdminProductsContext';

interface VariantManagementProps {
  productId: string;
  productName: string;
  onVariantsUpdated?: () => void;
}

interface VariantStats {
  total: number;
  available: number;
  inStock: number;
  outOfStock: number;
  unavailable: number;
}

const VariantManagement: React.FC<VariantManagementProps> = ({ 
  productId, 
  productName, 
  onVariantsUpdated 
}) => {
  const { fetchProductImages, productImages: contextProductImages } = useAdminProducts();
  // State
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<VariantStats | null>(null);
  
  // Search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'availability' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Bulk operations
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
  const [bulkOperation, setBulkOperation] = useState<string>('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  
  // Individual variant editing (for future use)
  // const [editingVariant, setEditingVariant] = useState<string | null>(null);
  // const [editForm, setEditForm] = useState<VariantUpdateData>({});

  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedVariantForImages, setSelectedVariantForImages] = useState<ProductVariant | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  
  // Get images for this product from context
  const productImages = contextProductImages[productId] || [];
  
  // Variant grouping state
  const [groupVariantsByColor, setGroupVariantsByColor] = useState(false);

  // Load variants on component mount
  useEffect(() => {
    loadVariants();
  }, [productId]);

  // Load variants and stats
  const loadVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [variantsData, statsData] = await Promise.all([
        getProductVariants(productId),
        getVariantStats(productId)
      ]);
      
      setVariants(variantsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load variants');
      console.error('Error loading variants:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted variants
  const filteredAndSortedVariants = useMemo(() => {
    let filtered = variants.filter(variant => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!variant.name.toLowerCase().includes(searchLower) && 
            !variant.value.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Availability filter
      if (availabilityFilter === 'available' && !variant.is_available) return false;
      if (availabilityFilter === 'unavailable' && variant.is_available) return false;
      
      // Stock filter
      if (stockFilter === 'inStock' && !variant.in_stock) return false;
      if (stockFilter === 'outOfStock' && variant.in_stock) return false;
      
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'availability':
          aValue = a.is_available;
          bValue = b.is_available;
          break;
        case 'stock':
          aValue = a.in_stock;
          bValue = b.in_stock;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [variants, searchTerm, availabilityFilter, stockFilter, sortBy, sortOrder]);

  // Handle individual variant update
  const handleVariantUpdate = async (variantId: string, updates: VariantUpdateData) => {
    try {
      const updatedVariant = await updateVariant(variantId, updates);
      
      setVariants(prev => prev.map(v => 
        v.id === variantId ? updatedVariant : v
      ));
      
      // Refresh stats
      const newStats = await getVariantStats(productId);
      setStats(newStats);
      
      onVariantsUpdated?.();
    } catch (err) {
      console.error('Error updating variant:', err);
      setError('Failed to update variant');
    }
  };

  // Handle bulk operations
  const handleBulkOperation = async () => {
    if (selectedVariants.size === 0 || !bulkOperation) return;
    
    try {
      setIsBulkUpdating(true);
      
      const updates: Array<{ id: string; updates: VariantUpdateData }> = [];
      
      for (const variantId of selectedVariants) {
        let updatesData: VariantUpdateData = {};
        
        switch (bulkOperation) {
          case 'makeAvailable':
            updatesData = { is_available: true };
            break;
          case 'makeUnavailable':
            updatesData = { is_available: false };
            break;
          case 'markInStock':
            updatesData = { in_stock: true };
            break;
          case 'markOutOfStock':
            updatesData = { in_stock: false };
            break;
        }
        
        updates.push({ id: variantId, updates: updatesData });
      }
      
      await bulkUpdateVariants(updates);
      
      // Refresh data
      await loadVariants();
      
      // Clear selection
      setSelectedVariants(new Set());
      setBulkOperation('');
      
      onVariantsUpdated?.();
    } catch (err) {
      console.error('Error in bulk operation:', err);
      setError('Failed to perform bulk operation');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Toggle variant selection
  const toggleVariantSelection = (variantId: string) => {
    const newSelection = new Set(selectedVariants);
    if (newSelection.has(variantId)) {
      newSelection.delete(variantId);
    } else {
      newSelection.add(variantId);
    }
    setSelectedVariants(newSelection);
  };

  // Toggle all variants selection
  const toggleAllVariants = () => {
    if (selectedVariants.size === filteredAndSortedVariants.length) {
      setSelectedVariants(new Set());
    } else {
      setSelectedVariants(new Set(filteredAndSortedVariants.map(v => v.id)));
    }
  };

  // Helper functions to extract values from JSONB objects
  const getColorName = (variant: ProductVariant): string => {
    if (!variant.color) return 'Unknown';
    if (typeof variant.color === 'string') return variant.color;
    if (typeof variant.color === 'object') {
      const colorObj = variant.color as any;
      if (colorObj.name) return colorObj.name;
      if (colorObj.value) return colorObj.value;
    }
    return 'Unknown';
  };

  const getSizeName = (variant: ProductVariant): string | null => {
    if (!variant.size) return null;
    if (typeof variant.size === 'string') return variant.size;
    if (typeof variant.size === 'object') {
      const sizeObj = variant.size as any;
      if (sizeObj.name) return sizeObj.name;
      if (sizeObj.value) return sizeObj.value;
    }
    return null;
  };

  // Helper function to format variant display string
  const getVariantDisplayString = (variant: ProductVariant): string => {
    const parts: string[] = [];
    
    // Add variant name if it exists
    if (variant.name && variant.name !== variant.value) {
      parts.push(variant.name);
    }
    
    // Add variant value
    if (variant.value) {
      parts.push(variant.value);
    }
    
    // Add size if it exists
    const sizeName = getSizeName(variant);
    if (sizeName) {
      parts.push(sizeName);
    }
    
    // Add color if it exists
    const colorName = getColorName(variant);
    if (colorName && colorName !== 'Unknown') {
      parts.push(colorName);
    }
    
    return parts.join(' • ');
  };

  // Handle opening image modal for a specific variant
  const handleOpenImageModal = async (variant: ProductVariant) => {
    setSelectedVariantForImages(variant);
    setLoadingImages(true);
    
    try {
      // Fetch all product images
      console.log('🖼️ Fetching product images for modal...', productId);
      await fetchProductImages(productId);
      
      // Images are now available in the AdminProductsContext
      console.log('🖼️ Fetched images:', contextProductImages[productId]);
      setShowImageModal(true);
    } catch (error) {
      console.error('Error fetching product images:', error);
      // Show modal anyway, user can still upload new images
      setShowImageModal(true);
    } finally {
      setLoadingImages(false);
    }
  };

  // Group variants by color for complex products
  const groupVariantsByColorFunction = (variants: ProductVariant[]) => {
    const grouped: Record<string, ProductVariant[]> = {};
    
    variants.forEach(variant => {
      const color = getColorName(variant);
      if (!grouped[color]) {
        grouped[color] = [];
      }
      grouped[color].push(variant);
    });
    
    return grouped;
  };

  // Handle images update callback
  const handleImagesUpdated = async (updatedImages: any[]) => {
    console.log('🔄 Images updated, refreshing...', updatedImages);
    
    try {
      // Refresh images from the server to show the latest
      await fetchProductImages(productId);
      console.log('✅ Images refreshed successfully');
      console.log('🖼️ New images count:', (contextProductImages[productId] || []).length);
      
      // Don't close the modal immediately, let user see the updated images
      // They can close it manually if they want
    } catch (error) {
      console.error('Error refreshing images:', error);
    }
  };

  // Determine if this product has color variants
  const hasColors = (() => {
    const normalized = productName?.toLowerCase() || '';
    // Use includes() to match partial product names like "Reform UK T-Shirt"
    const result = normalized.includes('t-shirt') || 
                   normalized.includes('tshirt') || 
                   normalized.includes('hoodie') || 
                   normalized.includes('cap') || 
                   normalized.includes('tote') ||
                   normalized.includes('water-bottle') ||
                   normalized.includes('mug') ||
                   normalized.includes('mouse-pad') ||
                   normalized.includes('sticker');
    
    console.log(`🎨 Color detection for "${productName}":`, {
      productName,
      normalized,
      hasColors: result
    });
    
    return result;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading variants...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={loadVariants}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Variants for {productName}
          </h3>
          <div className="flex items-center space-x-3">
            {/* Grouping Toggle */}
            {hasColors && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Group by Color:</span>
                <button
                  onClick={() => setGroupVariantsByColor(!groupVariantsByColor)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    groupVariantsByColor ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      groupVariantsByColor ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-500">
                  {groupVariantsByColor ? 'On' : 'Off'}
                </span>
              </div>
            )}
            <button
              onClick={loadVariants}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Variants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.inStock}</div>
              <div className="text-sm text-gray-500">In Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.outOfStock}</div>
              <div className="text-sm text-gray-500">Out of Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.unavailable}</div>
              <div className="text-sm text-gray-500">Unavailable</div>
            </div>
          </div>
        )}
      </div>

      {/* Search and filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search variants..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Availability filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          {/* Stock filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="value">Value</option>
                <option value="availability">Availability</option>
                <option value="stock">Stock</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk operations */}
      {selectedVariants.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedVariants.size} variant(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <select
                value={bulkOperation}
                onChange={(e) => setBulkOperation(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select action...</option>
                <option value="makeAvailable">Make Available</option>
                <option value="makeUnavailable">Make Unavailable</option>
                <option value="markInStock">Mark In Stock</option>
                <option value="markOutOfStock">Mark Out of Stock</option>
              </select>
              <button
                onClick={handleBulkOperation}
                disabled={!bulkOperation || isBulkUpdating}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isBulkUpdating ? 'Updating...' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variants table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedVariants.size === filteredAndSortedVariants.length && filteredAndSortedVariants.length > 0}
                    onChange={toggleAllVariants}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Printful ID
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groupVariantsByColor && hasColors ? (
                // Grouped view - show one row per color
                Object.entries(groupVariantsByColorFunction(filteredAndSortedVariants)).map(([color, colorVariants]) => (
                  <tr key={color} className="hover:bg-gray-50 bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={colorVariants.every(v => selectedVariants.has(v.id))}
                        onChange={() => {
                          if (colorVariants.every(v => selectedVariants.has(v.id))) {
                            // Unselect all variants of this color
                            const newSelection = new Set(selectedVariants);
                            colorVariants.forEach(v => newSelection.delete(v.id));
                            setSelectedVariants(newSelection);
                          } else {
                            // Select all variants of this color
                            const newSelection = new Set(selectedVariants);
                            colorVariants.forEach(v => newSelection.add(v.id));
                            setSelectedVariants(newSelection);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {color}
                      </div>
                      <div className="text-sm text-gray-500">
                        {colorVariants.length} size{colorVariants.length !== 1 ? 's' : ''} available
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {colorVariants.length} variant{colorVariants.length !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        £{colorVariants[0].price?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-gray-500">
                        (same price for all sizes)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          colorVariants.some(v => v.in_stock)
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {colorVariants.some(v => v.in_stock) ? 'Some In Stock' : 'Out of Stock'}
                        </span>
                        <div className="text-xs text-gray-500">
                          {colorVariants.filter(v => v.in_stock).length} of {colorVariants.length} in stock
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          colorVariants.some(v => v.is_available)
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {colorVariants.some(v => v.is_available) ? 'Some Available' : 'Unavailable'}
                        </span>
                        <div className="text-xs text-gray-500">
                          {colorVariants.filter(v => v.is_available).length} of {colorVariants.length} available
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenImageModal({ 
                            id: `color-${color}`, 
                            color: color,
                            product_id: productId,
                            name: color,
                            value: color,
                            printful_variant_id: '',
                            price: 0,
                            in_stock: false,
                            is_available: false,
                            created_at: '',
                            updated_at: ''
                          } as ProductVariant)}
                          className="text-sm text-purple-600 hover:text-purple-800 p-1 rounded"
                          title={`Manage images for ${color}`}
                        >
                          <Image className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            const allAvailable = colorVariants.every(v => v.is_available);
                            const updates = colorVariants.map(v => ({
                              id: v.id,
                              updates: { is_available: !allAvailable }
                            }));
                            // Use bulk update for all variants of this color
                            updates.forEach(({ id, updates }) => handleVariantUpdate(id, updates));
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                          title={colorVariants.every(v => v.is_available) ? 'Make all unavailable' : 'Make all available'}
                        >
                          {colorVariants.every(v => v.is_available) ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => {
                            const allInStock = colorVariants.every(v => v.in_stock);
                            const updates = colorVariants.map(v => ({
                              id: v.id,
                              updates: { in_stock: !allInStock }
                            }));
                            // Use bulk update for all variants of this color
                            updates.forEach(({ id, updates }) => handleVariantUpdate(id, updates));
                          }}
                          className="text-sm text-green-600 hover:text-green-800"
                          title={colorVariants.every(v => v.in_stock) ? 'Mark all out of stock' : 'Mark all in stock'}
                        >
                          {colorVariants.every(v => v.in_stock) ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                // Ungrouped view - show individual variants
                filteredAndSortedVariants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedVariants.has(variant.id)}
                        onChange={() => toggleVariantSelection(variant.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {variant.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getVariantDisplayString(variant)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {variant.printful_variant_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        £{variant.price?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        variant.in_stock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {variant.in_stock ? 'In Stock' : 'Out of Stock'}
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
                        <button
                          onClick={() => handleOpenImageModal(variant)}
                          className="text-sm text-purple-600 hover:text-purple-800 p-1 rounded"
                          title={`Manage images for ${getVariantDisplayString(variant)}`}
                        >
                          <Image className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVariantUpdate(variant.id, { 
                            is_available: !variant.is_available 
                          })}
                          className="text-sm text-blue-600 hover:text-blue-800"
                          title={variant.is_available ? 'Make unavailable' : 'Make available'}
                        >
                          {variant.is_available ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleVariantUpdate(variant.id, { 
                            in_stock: !variant.in_stock 
                          })}
                          className="text-sm text-green-600 hover:text-green-800"
                          title={variant.in_stock ? 'Mark out of stock' : 'Mark in stock'}
                        >
                          {variant.in_stock ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredAndSortedVariants.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No variants found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500 text-center">
        {groupVariantsByColor && hasColors ? (
          <>
            Showing {Object.keys(groupVariantsByColorFunction(filteredAndSortedVariants)).length} colors of {filteredAndSortedVariants.length} variants
            <div className="text-xs text-gray-400 mt-1">
              Grouped by color for easier management
            </div>
          </>
        ) : (
          `Showing ${filteredAndSortedVariants.length} of ${variants.length} variants`
        )}
      </div>

      {/* Image Management Modal */}
      {showImageModal && selectedVariantForImages && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Images - {getVariantDisplayString(selectedVariantForImages)}
                {loadingImages && (
                  <span className="ml-2 text-sm text-blue-600">
                    <RefreshCw className="h-4 w-4 animate-spin inline mr-1" />
                    Loading images...
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <EnhancedImageManagement
              productId={productId}
              productName={productName}
              currentImages={productImages}
              onImagesUpdate={handleImagesUpdated}
              onClose={() => setShowImageModal(false)}
              productCategory={productName}
              variantColor={getColorName(selectedVariantForImages)}
              productVariants={variants}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantManagement;
