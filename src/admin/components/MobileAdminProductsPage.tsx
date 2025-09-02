import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAdminProducts } from '../contexts/AdminProductsContext';
import { useAdmin } from '../contexts/AdminContext';
import MobileProductEditor from '../../components/MobileProductEditor';
import MobileImageManagement from '../../components/MobileImageManagement';
import MobileBundleEditor from '../../components/MobileBundleEditor';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  Eye,
  Edit3,
  Image as ImageIcon,
  Tag,
  Trash2,
  MoreVertical,
  Settings,
  Activity,
  ShoppingCart,
  Star,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Product {
  id: string;
  printful_product_id: string;
  custom_retail_price: number;
  custom_description: string;
  category: string;
  is_active: boolean;
  images: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
  }>;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  custom_price: number;
  is_active: boolean;
  items: Array<{
    id: string;
    product_id: string;
    quantity: number;
  }>;
}

const MobileAdminProductsPage: React.FC = () => {
  const { 
    productOverrides, 
    bundles, 
    loading, 
    error,
    getProductOverrides,
    getBundles,
    createProductOverride,
    updateProductOverride,
    deleteProductOverride,
    createBundle,
    updateBundle,
    deleteBundle
  } = useAdminProducts();
  
  const { canManageProducts, canManageBundles, canManageImages } = useAdmin();
  
  // State management
  const [viewMode, setViewMode] = useState<'products' | 'bundles'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());
  
  // Modal states
  const [showProductEditor, setShowProductEditor] = useState(false);
  const [showBundleEditor, setShowBundleEditor] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [managingImagesFor, setManagingImagesFor] = useState<{ id: string; name: string } | null>(null);
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          getProductOverrides(),
          getBundles()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, [getProductOverrides, getBundles]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = productOverrides || [];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.custom_description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        (product as any).category === selectedCategory
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.custom_description;
          bValue = b.custom_description;
          break;
        case 'price':
          aValue = a.custom_retail_price || 0;
          bValue = b.custom_retail_price || 0;
          break;
        case 'category':
          aValue = (a as any).category || '';
          bValue = (b as any).category || '';
          break;
        case 'status':
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [productOverrides, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Filter and sort bundles
  const filteredAndSortedBundles = useMemo(() => {
    let filtered = bundles || [];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(bundle => 
        bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bundle.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.custom_price || 0;
          bValue = b.custom_price || 0;
          break;
        case 'category':
          aValue = 'Bundle';
          bValue = 'Bundle';
          break;
        case 'status':
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [bundles, searchQuery, sortBy, sortOrder]);

  // Toggle filter section
  const toggleFilterSection = useCallback((section: string) => {
    setExpandedFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  // Handle product actions
  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product);
    setShowProductEditor(true);
  }, []);

  const handleManageImages = useCallback((product: Product) => {
    setManagingImagesFor({ id: product.id, name: product.custom_description });
    setShowImageManager(true);
  }, []);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductOverride(productId);
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  }, [deleteProductOverride]);

  // Handle bundle actions
  const handleEditBundle = useCallback((bundle: Bundle) => {
    setEditingBundle(bundle);
    setShowBundleEditor(true);
  }, []);

  const handleDeleteBundle = useCallback(async (bundleId: string) => {
    if (confirm('Are you sure you want to delete this bundle?')) {
      try {
        await deleteBundle(bundleId);
      } catch (error) {
        console.error('Failed to delete bundle:', error);
        alert('Failed to delete bundle. Please try again.');
      }
    }
  }, [deleteBundle]);

  // Save handlers
  const handleSaveProduct = useCallback(async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        await updateProductOverride(editingProduct.id, productData);
      } else {
        await createProductOverride(productData);
      }
      setShowProductEditor(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
      throw error;
    }
  }, [editingProduct, updateProductOverride, createProductOverride]);

  const handleSaveBundle = useCallback(async (bundleData: Partial<Bundle>) => {
    try {
      if (editingBundle) {
        await updateBundle(editingBundle.id, bundleData);
      } else {
        await createBundle(bundleData);
      }
      setShowBundleEditor(false);
      setEditingBundle(null);
    } catch (error) {
      console.error('Failed to save bundle:', error);
      throw error;
    }
  }, [editingBundle, updateBundle, createBundle]);

  // Close modals
  const handleCloseProductEditor = useCallback(() => {
    setShowProductEditor(false);
    setEditingProduct(null);
  }, []);

  const handleCloseBundleEditor = useCallback(() => {
    setShowBundleEditor(false);
    setEditingBundle(null);
  }, []);

  const handleCloseImageManager = useCallback(() => {
    setShowImageManager(false);
    setManagingImagesFor(null);
  }, []);

  // Check permissions
  if (!canManageProducts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage products.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 mb-2">Failed to load products</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Products & Bundles</h1>
            <p className="text-sm text-gray-600">Manage your product catalog</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('products')}
              className={`p-2 rounded-md ${
                viewMode === 'products'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setViewMode('bundles')}
              className={`p-2 rounded-md ${
                viewMode === 'bundles'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Tag className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Search and Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Search ${viewMode === 'products' ? 'products' : 'bundles'}...`}
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-md ${
              showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
          
          {((viewMode === 'products' && canManageProducts) || (viewMode === 'bundles' && canManageBundles)) && (
            <button
              onClick={() => {
                if (viewMode === 'products') {
                  setEditingProduct(null);
                  setShowProductEditor(true);
                } else {
                  setEditingBundle(null);
                  setShowBundleEditor(true);
                }
              }}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {viewMode === 'products' ? 'Product' : 'Bundle'}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="space-y-3">
            {/* Category Filter */}
            <div>
              <button
                onClick={() => toggleFilterSection('category')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-gray-700">Category</span>
                {expandedFilters.has('category') ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {expandedFilters.has('category') && (
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === 'all'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {/* Add more category options as needed */}
                </div>
              )}
            </div>
            
            {/* Sort Options */}
            <div>
              <button
                onClick={() => toggleFilterSection('sort')}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-gray-700">Sort By</span>
                {expandedFilters.has('sort') ? (
                  <ChevronUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {expandedFilters.has('sort') && (
                <div className="mt-2 space-y-2">
                  {[
                    { key: 'name', label: 'Name' },
                    { key: 'price', label: 'Price' },
                    { key: 'category', label: 'Category' },
                    { key: 'status', label: 'Status' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSortBy(option.key as any)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        sortBy === option.key
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-2">
                      <span>Order:</span>
                      {sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {viewMode === 'products' ? (
          /* Products Grid */
          <div className="space-y-4">
            {filteredAndSortedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
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
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.custom_description}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {(product as any).category || 'Uncategorized'}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {canManageProducts && (
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}
                          
                          {canManageImages && (
                            <button
                              onClick={() => handleManageImages(product)}
                              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {canManageProducts && (
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900">
                            ${product.custom_retail_price?.toFixed(2) || '0.00'}
                          </span>
                          
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <span>{product.images?.length || 0} images</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Empty State */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first product'
                  }
                </p>
                {canManageProducts && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductEditor(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Bundles Grid */
          <div className="space-y-4">
            {filteredAndSortedBundles.map((bundle) => (
              <div key={bundle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{bundle.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {bundle.description}
                      </p>
                      
                      <div className="mt-2 flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">
                          ${bundle.custom_price?.toFixed(2) || '0.00'}
                        </span>
                        
                        <span className="text-xs text-gray-500">
                          {bundle.items?.length || 0} products
                        </span>
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          bundle.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bundle.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-3">
                      {canManageBundles && (
                        <button
                          onClick={() => handleEditBundle(bundle)}
                          className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canManageBundles && (
                        <button
                          onClick={() => handleDeleteBundle(bundle.id)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Empty State */}
            {filteredAndSortedBundles.length === 0 && (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bundles found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Get started by creating your first bundle'
                  }
                </p>
                {canManageBundles && (
                  <button
                    onClick={() => {
                      setEditingBundle(null);
                      setShowBundleEditor(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bundle
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showProductEditor && (
        <MobileProductEditor
          productId={editingProduct?.id || 'new'}
          productName={editingProduct?.custom_description || 'New Product'}
          onSave={handleSaveProduct}
          onClose={handleCloseProductEditor}
        />
      )}
      
      {showBundleEditor && (
        <MobileBundleEditor
          bundle={editingBundle}
          onSave={handleSaveBundle}
          onClose={handleCloseBundleEditor}
        />
      )}
      
      {showImageManager && managingImagesFor && (
        <MobileImageManagement
          productId={managingImagesFor.id}
          productName={managingImagesFor.name}
          currentImages={editingProduct?.images || []}
          onImagesUpdate={(images) => {
            if (editingProduct) {
              setEditingProduct({ ...editingProduct, images });
            }
          }}
          onClose={handleCloseImageManager}
        />
      )}
    </div>
  );
};

export default MobileAdminProductsPage;
