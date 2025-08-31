import React, { useState, useEffect, useMemo } from 'react';
import { useAdminProducts } from '../contexts/AdminProductsContext';
import { useAdmin } from '../contexts/AdminContext';
import { functionUrls } from '../lib/supabase-functions';
import { 
  Search, 
  Filter, 
  Edit3, 
  Image as ImageIcon, 
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  SortAsc,
  SortDesc,
  Package,
  Activity
} from 'lucide-react';
import ProductEditorModal from './ProductEditorModal';
import EnhancedImageManagement from './EnhancedImageManagement';
import BundleManagement from './admin/BundleManagement';
import PrintfulSyncMonitor from './PrintfulSyncMonitor';
import VariantManagement from './VariantManagement';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  is_thumbnail: boolean;
  created_at: string;
}

interface ProductData {
  id: string;
  printful_product_id?: string;
  name: string;
  description: string;
  retail_price: number;
  printful_cost?: number | null;
  is_available: boolean;
  category: string;
  image_url?: string;
  thumbnail_image?: string;
  custom_retail_price?: number;
  custom_description?: string;
  last_synced?: string;
  sync_status?: 'synced' | 'pending' | 'failed' | 'unknown';
}

const AdminProductsPage: React.FC = () => {
    const { 
    products, 
    productsLoading, 
    productsError,
    productOverrides, 
    syncStatus,
    refreshAll,
    triggerPrintfulSync,
    fetchProductImages,
    productImages
  } = useAdminProducts();
  
  const { canManageProducts, canSyncPrintful } = useAdmin();

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  
  // Image management state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState<ProductData | null>(null);
  
  // Bundle management state
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  
  // Sync monitor state
  const [isSyncMonitorOpen, setIsSyncMonitorOpen] = useState(false);
  
  // Variants management state
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<ProductData | null>(null);
  
  // Printful import state
  const [isPullingFromPrintful, setIsPullingFromPrintful] = useState(false);

  // Handlers
  const handleBundleManagement = () => {
    setIsBundleModalOpen(true);
  };

  const handleSyncMonitor = () => {
    setIsSyncMonitorOpen(true);
  };

  const handleVariantsModalClose = () => {
    setIsVariantsModalOpen(false);
    setSelectedProductForVariants(null);
  };

  // Get custom overrides for products
  const productsWithOverrides = useMemo(() => {
    console.log('=== PRODUCTS WITH OVERRIDES DEBUG ===');
    console.log('Original products count:', products.length);
    console.log('Original products:', products);
    console.log('Product overrides count:', productOverrides.length);
    console.log('Product overrides:', productOverrides);
    console.log('Products loading:', productsLoading);
    console.log('Products error:', productsError);
    
    // Check if products have printful_product_id
    products.forEach((product, index) => {
      console.log(`Product ${index}:`, {
        name: product.name,
        id: product.id,
        printful_product_id: product.printful_product_id,
        has_printful_id: !!product.printful_product_id
      });
    });
    
    return products.map(product => {
      const override = productOverrides.find(o => 
        o.printful_product_id && 
        product.printful_product_id && 
        o.printful_product_id === product.printful_product_id
      );
      
      const result = {
        ...product,
        custom_retail_price: override?.custom_retail_price || product.retail_price,
        custom_description: override?.custom_description || product.description,
        is_active: override?.is_active ?? true
      };
      
      console.log('Product:', product.name, 'printful_product_id:', product.printful_product_id);
      console.log('Result printful_product_id:', result.printful_product_id);
      
      return result;
    });
  }, [products, productOverrides]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    console.log('=== FILTERED PRODUCTS DEBUG ===');
    console.log('productsWithOverrides count:', productsWithOverrides.length);
    console.log('productsWithOverrides:', productsWithOverrides);
    
    let filtered = productsWithOverrides.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || (product.category && product.category === selectedCategory);
      
      // Availability filter
      const matchesAvailability = availabilityFilter === 'all' || 
                                 (availabilityFilter === 'available' && product.is_available) ||
                                 (availabilityFilter === 'unavailable' && !product.is_available);
      
      // Price range filter
      const price = product.custom_retail_price || product.retail_price;
      const matchesPrice = price >= priceRange.min && price <= priceRange.max;
      
      console.log(`Product ${product.name}:`, {
        matchesSearch,
        matchesCategory,
        matchesAvailability,
        matchesPrice,
        printful_product_id: product.printful_product_id
      });
      
      return matchesSearch && matchesCategory && matchesAvailability && matchesPrice;
    });
    
    console.log('Filtered result count:', filtered.length);
    console.log('Filtered result:', filtered);
    console.log('=== END FILTERED PRODUCTS DEBUG ===');
    
    return filtered;

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.custom_retail_price || a.retail_price;
          bValue = b.custom_retail_price || b.retail_price;
          break;
                case 'availability':
          aValue = a.is_available ? 1 : 0;
          bValue = b.is_available ? 1 : 0;
          break;
        case 'last_synced':
          aValue = new Date(a.last_synced || '1970-01-01').getTime();
          bValue = new Date(b.last_synced || '1970-01-01').getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [productsWithOverrides, searchTerm, selectedCategory, availabilityFilter, priceRange, sortBy, sortOrder]);

  // Categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(productsWithOverrides.map(p => p.category).filter(Boolean))];
    return uniqueCategories;
  }, [productsWithOverrides]);

  // Sync status indicator
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

  const getSyncStatusText = (status: string) => {
    switch (status) {
      case 'synced':
        return 'Synced';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  // Handle sync trigger
  const handleSync = async (productId: string) => {
    if (!canSyncPrintful) return;
    
    try {
      await triggerPrintfulSync(productId);
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    await refreshAll();
  };

  // Handle edit product
  const handleEditProduct = (product: ProductData) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    // Refresh data after modal closes
    refreshAll();
  };

  // Handle image management
  const handleImageManagement = async (product: ProductData) => {
    try {
      console.log('🖼️ Opening image management for product:', product.id);
      
      // Fetch images from database before opening modal
      await fetchProductImages(product.id);
      
      // Set the product and open modal
      setSelectedProductForImages(product);
      setIsImageModalOpen(true);
      
      console.log('✅ Images loaded, modal opened');
    } catch (error) {
      console.error('Failed to load images for product:', product.id, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to load images: ${errorMessage}`);
    }
  };

  // Handle image modal close
  const handleImageModalClose = () => {
    setIsImageModalOpen(false);
    setSelectedProductForImages(null);
    // Refresh data after modal closes
    refreshAll();
  };

  // Load images when image modal opens
  useEffect(() => {
    if (selectedProductForImages && isImageModalOpen) {
      console.log('🔄 Loading images for product:', selectedProductForImages.id);
      fetchProductImages(selectedProductForImages.id).catch(error => {
        console.error('Failed to load images in useEffect:', error);
      });
    }
  }, [selectedProductForImages, isImageModalOpen, fetchProductImages]);

  // Handle images update
  const handleImagesUpdate = async (productId: string, images: ProductImage[]) => {
    try {
      console.log('🖼️ Syncing images with database for product:', productId);
      console.log('Images to sync:', images);
      
      // Refresh the product images in the context to reflect any changes
      await fetchProductImages(productId);
      
      console.log('✅ Product images refreshed in context');
      
    } catch (error) {
      console.error('Failed to update images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to save images: ${errorMessage}`);
    }
  };



  // Handle variants management
  const handleVariantsManagement = (product: ProductData) => {
    setSelectedProductForVariants(product);
    setIsVariantsModalOpen(true);
  };

  // Handle sync monitor close
  const handleSyncMonitorClose = () => {
    setIsSyncMonitorOpen(false);
  };

  // Handle pull all products from Printful
  const handlePullAllFromPrintful = async () => {
    if (!canSyncPrintful) return;
    
    setIsPullingFromPrintful(true);
    try {
      console.log('=== PULL ALL FROM PRINTFUL DEBUG ===');
      console.log('Calling triggerPrintfulSync with productId: "all"');
      console.log('productId type:', typeof 'all');
      console.log('productId value:', 'all');
      console.log('=== END DEBUG ===');
      
      // Fetch all products from Printful
      const result = await triggerPrintfulSync('all');
      console.log('Printful import result:', result);
      
      // Refresh the products list
      await refreshAll();
      
      console.log('Successfully pulled all products from Printful');
      alert('Successfully imported all products from Printful!');
      
    } catch (error) {
      console.error('Failed to pull products from Printful:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to import products from Printful: ${errorMessage}`);
    } finally {
      setIsPullingFromPrintful(false);
    }
  };

  // Handle direct import from manual Printful data
  const handleDirectImport = async () => {
    if (!canSyncPrintful) return;
    
    setIsPullingFromPrintful(true);
    try {
      console.log('=== DIRECT IMPORT FROM MANUAL DATA ===');
      
      // Call our new direct import function
      const response = await fetch(functionUrls.directImport, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Direct import result:', result);
      
      if (result.success) {
        // Refresh the products list
        await refreshAll();
        alert(`Successfully imported ${result.productsImported} products and ${result.variantsImported} variants!`);
      } else {
        throw new Error(result.message || 'Import failed');
      }
      
    } catch (error) {
      console.error('Failed to import products directly:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to import products: ${errorMessage}`);
    } finally {
      setIsPullingFromPrintful(false);
    }
  };

  // Handle availability sync
  const handleAvailabilitySync = async () => {
    if (!canSyncPrintful) return;
    
    try {
      console.log('=== SYNCING AVAILABILITY ===');
      
      // Call our availability sync function
      const response = await fetch(functionUrls.syncAvailability, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Availability sync result:', result);
      
      if (result.success) {
        alert(`Successfully synced availability for ${result.variantsUpdated} variants!`);
      } else {
        throw new Error(result.message || 'Sync failed');
      }
      
    } catch (error) {
      console.error('Failed to sync availability:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to sync availability: ${errorMessage}`);
    }
  };

  useEffect(() => {
    console.log('🔄 AdminProductsPage mounted, calling refreshAll()');
    refreshAll().then(() => {
      console.log('✅ refreshAll completed');
    }).catch(error => {
      console.error('❌ refreshAll failed:', error);
    });
  }, [refreshAll]);

  if (!canManageProducts) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to manage products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
            <p className="text-gray-600 mt-2">Manage your product catalog, pricing, and Printful synchronization</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={productsLoading}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${productsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleBundleManagement}
              className="flex items-center px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <Package className="h-4 w-4 mr-2" />
              Manage Bundles
            </button>
            <button
              onClick={handleSyncMonitor}
              className="flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <Activity className="h-4 w-4 mr-2" />
              Sync Monitor
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
            <button
              onClick={handleDirectImport}
              disabled={isPullingFromPrintful}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Package className="h-4 w-4 mr-2" />
              {isPullingFromPrintful ? 'Importing...' : 'Direct Import'}
            </button>
            <button
              onClick={handleAvailabilitySync}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Availability
            </button>
            <button
              onClick={handlePullAllFromPrintful}
              disabled={isPullingFromPrintful}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isPullingFromPrintful ? 'animate-spin' : ''}`} />
              {isPullingFromPrintful ? 'Pulling from Printful...' : 'Pull All from Printful'}
            </button>
          </div>
        </div>

        {/* Sync Status Indicator */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className={`h-5 w-5 ${syncStatus.isSyncing ? 'animate-spin text-blue-500' : 'text-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {syncStatus.isSyncing ? 'Syncing...' : 'Sync Status'}
                </span>
              </div>
              {syncStatus.lastSync && (
                <div className="text-sm text-gray-500">
                  Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {syncStatus.syncErrors.length > 0 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{syncStatus.syncErrors.length} error(s)</span>
                </div>
              )}
              {syncStatus.isSyncing && (
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${syncStatus.syncProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{syncStatus.syncProgress}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Search & Filters</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex space-x-2">
            {[
              { key: 'name', label: 'Name' },
              { key: 'price', label: 'Price' },
              { key: 'availability', label: 'Availability' },
              { key: 'last_synced', label: 'Last Synced' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => {
                  if (sortBy === option.key) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(option.key);
                    setSortOrder('asc');
                  }
                }}
                className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors ${
                  sortBy === option.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label}
                {sortBy === option.key && (
                  sortOrder === 'asc' ? <SortAsc className="h-3 w-3 ml-1" /> : <SortDesc className="h-3 w-3 ml-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {productsLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : productsError ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading products: {productsError}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Products ({filteredProducts.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    {product.thumbnail_image ? (
                      <img
                        src={product.thumbnail_image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/BackReformLogo.png'; // Fallback image
                        }}
                      />
                    ) : product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/BackReformLogo.png'; // Fallback image
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Sync Status Badge */}
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center space-x-1 bg-white bg-opacity-90 rounded-full px-2 py-1">
                        {getSyncStatusIcon(product.sync_status || 'unknown')}
                        <span className="text-xs font-medium text-gray-700">
                          {getSyncStatusText(product.sync_status || 'unknown')}
                        </span>
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <div className="absolute top-2 left-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.is_available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_available ? 'Available' : 'Unavailable'}
                      </div>
                    </div>

                    {/* Thumbnail Indicator */}
                    {product.thumbnail_image && product.thumbnail_image !== product.image_url && (
                      <div className="absolute bottom-2 left-2">
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          👑 Thumbnail
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.custom_description || product.description || 'No description available'}</p>
                    
                    {/* Pricing */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Custom Price:</span>
                        <span className="text-lg font-semibold text-blue-600">
                          £{(product.custom_retail_price || product.retail_price).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Printful Cost:</span>
                        <span>£{product.printful_cost ? product.printful_cost.toFixed(2) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Margin:</span>
                        <span className="font-medium">
                          £{product.printful_cost ? ((product.custom_retail_price || product.retail_price) - product.printful_cost).toFixed(2) : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Category and Sync Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="bg-gray-100 px-2 py-1 rounded">{product.category || 'Uncategorized'}</span>
                      {product.last_synced && (
                        <span>Synced {new Date(product.last_synced).toLocaleDateString()}</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                                             <button 
                         onClick={() => handleEditProduct(product)}
                         className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                       >
                         <Edit3 className="h-4 w-4 mr-2" />
                         Edit
                       </button>
                      <button 
                        onClick={() => handleImageManagement(product)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Images
                      </button>
                      <button 
                        onClick={() => handleVariantsManagement(product)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Variants
                      </button>
                    </div>

                    {/* Sync Button */}
                    {canSyncPrintful && (
                      <button
                        onClick={() => {
                          console.log('=== SYNC BUTTON DEBUG ===');
                          console.log('Product object:', product);
                          console.log('Product ID:', product.id);
                          console.log('Printful Product ID:', product.printful_product_id);
                          console.log('Printful Product ID type:', typeof product.printful_product_id);
                          console.log('Product keys:', Object.keys(product));
                          console.log('Product values:', Object.values(product));
                          console.log('Filtered products count:', filteredProducts.length);
                          console.log('Filtered products:', filteredProducts);
                          
                          // Find the matching product in filteredProducts
                          const matchingProduct = filteredProducts.find(p => p.id === product.id);
                          console.log('Matching product in filteredProducts:', matchingProduct);
                          console.log('Matching product printful_product_id:', matchingProduct?.printful_product_id);
                          
                          console.log('=== END DEBUG ===');
                          
                          // Use the matching product from filteredProducts if available
                          const productToSync = matchingProduct || product;
                          
                          if (productToSync.printful_product_id) {
                            console.log('Calling handleSync with:', productToSync.printful_product_id);
                            handleSync(productToSync.printful_product_id);
                          } else {
                            console.error('No printful_product_id found for product:', productToSync.name);
                            alert('This product is not connected to Printful yet. Please connect it first.');
                          }
                        }}
                        disabled={syncStatus.isSyncing || !product.printful_product_id}
                        className="w-full mt-3 flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
                        {product.printful_product_id ? 'Sync with Printful' : 'Not Connected to Printful'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bundle Management Modal */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Bundle Management</h2>
              <button
                onClick={() => setIsBundleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <BundleManagement />
            </div>
          </div>
        </div>
      )}

      {/* Printful Sync Monitor Modal */}
      <PrintfulSyncMonitor
        isOpen={isSyncMonitorOpen}
        onClose={handleSyncMonitorClose}
      />

      {/* Enhanced Image Management Modal */}
      {selectedProductForImages && (
        <>
          {console.log('🖼️ Rendering EnhancedImageManagement with:', {
            productId: selectedProductForImages.id,
            productName: selectedProductForImages.name,
            currentImages: productImages[selectedProductForImages.id] || [],
            imagesCount: (productImages[selectedProductForImages.id] || []).length,
            allProductImages: productImages
          })}
          <EnhancedImageManagement
            productId={selectedProductForImages.id}
            productName={selectedProductForImages.name}
            currentImages={productImages[selectedProductForImages.id] || []}
            onImagesUpdate={(images) => handleImagesUpdate(selectedProductForImages.id, images)}
            onClose={handleImageModalClose}
            productCategory={selectedProductForImages.category}
          />
        </>
      )}

      {/* Product Editor Modal */}
      <ProductEditorModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={selectedProduct && selectedProduct.printful_product_id ? selectedProduct : null}
      />

      {/* Variants Management Modal */}
      {selectedProductForVariants && isVariantsModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Manage Variants - {selectedProductForVariants.name}
              </h2>
              <button
                onClick={handleVariantsModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <VariantManagement
              productId={selectedProductForVariants.id}
              productName={selectedProductForVariants.name}
              onVariantsUpdated={() => {
                // Refresh products list when variants are updated
                refreshAll();
              }}
            />
          </div>
        </div>
      )}

      {/* Bundle Management Modal */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-7xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Bundle Management</h2>
              <button
                onClick={() => setIsBundleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <BundleManagement />
            </div>
          </div>
        </div>
      )}

      {/* Sync Monitor Modal */}
      {isSyncMonitorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Printful Sync Monitor</h2>
              <button
                onClick={() => setIsSyncMonitorOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              {/* Content will be handled by the PrintfulSyncMonitor modal above */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
