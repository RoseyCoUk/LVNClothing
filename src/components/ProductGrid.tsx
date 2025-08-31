import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAdminProducts } from '../contexts/AdminProductsContext';
import ProductDisplay from './ProductDisplay';
import BundleDisplay from './BundleDisplay';
import { 
  Grid3X3, 
  List, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';

interface ProductGridProps {
  type: 'products' | 'bundles' | 'all';
  category?: string;
  searchQuery?: string;
  sortBy?: 'name' | 'price' | 'date' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  filters?: {
    priceRange?: [number, number];
    availability?: 'in-stock' | 'out-of-stock' | 'all';
    category?: string[];
  };
  itemsPerPage?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  className?: string;
}

interface ProductItem {
  id: string;
  type: 'product' | 'bundle';
  printfulProductId?: string;
  bundleId?: string;
  name: string;
  description?: string;
  category?: string;
  basePrice?: number;
  imageUrl?: string;
  isAvailable: boolean;
  lastUpdated: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  type = 'products',
  category,
  searchQuery = '',
  sortBy = 'name',
  sortOrder = 'asc',
  filters = {},
  itemsPerPage = 12,
  showFilters = true,
  showPagination = true,
  className = ''
}) => {
  const { 
    getProductOverrides, 
    getBundles,
    getBundleItems,
    getProductImages
  } = useAdminProducts();

  // State management
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Refs for intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Load data with caching
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allItems: ProductItem[] = [];

      // Load products if needed
      if (type === 'products' || type === 'all') {
        const overrides = await getProductOverrides();
        
        for (const override of overrides) {
          try {
            // Get product images
            const images = await getProductImages(override.printful_product_id);
            const primaryImage = images.find(img => img.isPrimary) || images[0];

            allItems.push({
              id: override.id,
              type: 'product',
              printfulProductId: override.printful_product_id,
              name: override.custom_description || `Product ${override.printful_product_id}`,
              description: override.custom_description,
              category: 'Clothing', // Mock category
              basePrice: override.custom_retail_price || 0,
              imageUrl: primaryImage?.imageUrl,
              isAvailable: override.is_active,
              lastUpdated: override.updated_at
            });
          } catch (err) {
            console.error(`Failed to load product ${override.printful_product_id}:`, err);
          }
        }
      }

      // Load bundles if needed
      if (type === 'bundles' || type === 'all') {
        const bundles = await getBundles();
        
        for (const bundle of bundles) {
          try {
            // Get bundle items to check availability
            const bundleItems = await getBundleItems(bundle.id);
            const isAvailable = bundle.is_active && bundleItems.length > 0;

            allItems.push({
              id: bundle.id,
              type: 'bundle',
              bundleId: bundle.id,
              name: bundle.name,
              description: bundle.description,
              category: 'Bundle',
              basePrice: bundle.custom_price,
              imageUrl: undefined, // Bundles don't have single images
              isAvailable,
              lastUpdated: bundle.updated_at
            });
          } catch (err) {
            console.error(`Failed to load bundle ${bundle.id}:`, err);
          }
        }
      }

      setItems(allItems);
      setTotalItems(allItems.length);
      setTotalPages(Math.ceil(allItems.length / itemsPerPage));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [type, getProductOverrides, getBundles, getBundleItems, getProductImages, itemsPerPage]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Apply search filter
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (localFilters.category && localFilters.category.length > 0) {
      filtered = filtered.filter(item => 
        item.category && localFilters.category!.includes(item.category)
      );
    }

    // Apply availability filter
    if (localFilters.availability && localFilters.availability !== 'all') {
      filtered = filtered.filter(item => {
        if (localFilters.availability === 'in-stock') return item.isAvailable;
        if (localFilters.availability === 'out-of-stock') return !item.isAvailable;
        return true;
      });
    }

    // Apply price range filter
    if (localFilters.priceRange) {
      const [minPrice, maxPrice] = localFilters.priceRange;
      filtered = filtered.filter(item => {
        const price = item.basePrice || 0;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.basePrice || 0;
          bValue = b.basePrice || 0;
          break;
        case 'date':
          aValue = new Date(a.lastUpdated).getTime();
          bValue = new Date(b.lastUpdated).getTime();
          break;
        case 'popularity':
          aValue = a.isAvailable ? 1 : 0; // Mock popularity
          bValue = b.isAvailable ? 1 : 0;
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
  }, [items, localSearchQuery, localFilters, sortBy, sortOrder]);

  // Paginate items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, endIndex);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  // Update pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredAndSortedItems.length / itemsPerPage));
  }, [filteredAndSortedItems.length, itemsPerPage]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (loadingRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !loading) {
              // Load more items if needed
              if (currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
              }
            }
          });
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, currentPage, totalPages]);

  // Filter change handlers
  const handleFilterChange = useCallback((key: string, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setLocalSearchQuery(query);
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    // This would be handled by parent component
    console.log('Sort changed:', newSortBy, newSortOrder);
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Action handlers
  const handleAddToCart = useCallback((itemId: string, variantId?: string) => {
    console.log('Add to cart:', itemId, variantId);
  }, []);

  const handleQuickView = useCallback((itemId: string) => {
    console.log('Quick view:', itemId);
  }, []);

  const handleWishlist = useCallback((itemId: string) => {
    console.log('Add to wishlist:', itemId);
  }, []);

  // Loading state
  if (loading && items.length === 0) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && items.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load products</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }

  // No results
  if (filteredAndSortedItems.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">
          {localSearchQuery || Object.keys(localFilters).length > 0
            ? 'Try adjusting your search or filters'
            : 'No products are currently available'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        {/* Results count */}
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} results
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={localSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filter toggle */}
          {showFilters && (
            <button
              onClick={() => setExpandedFilters(!expandedFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && expandedFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={localFilters.category?.[0] || ''}
                onChange={(e) => handleFilterChange('category', e.target.value ? [e.target.value] : [])}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Clothing">Clothing</option>
                <option value="Bundle">Bundle</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            {/* Availability filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={localFilters.availability || 'all'}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Price range filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.priceRange?.[0] || ''}
                  onChange={(e) => handleFilterChange('priceRange', [
                    parseFloat(e.target.value) || 0,
                    localFilters.priceRange?.[1] || 1000
                  ])}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.priceRange?.[1] || ''}
                  onChange={(e) => handleFilterChange('priceRange', [
                    localFilters.priceRange?.[0] || 0,
                    parseFloat(e.target.value) || 1000
                  ])}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'space-y-4'
      }>
        {paginatedItems.map((item) => (
          <div key={item.id} className={viewMode === 'list' ? 'flex space-x-4' : ''}>
            {item.type === 'product' ? (
              <ProductDisplay
                printfulProductId={item.printfulProductId!}
                productName={item.name}
                productDescription={item.description}
                category={item.category}
                basePrice={item.basePrice}
                onAddToCart={handleAddToCart}
                onQuickView={handleQuickView}
                onWishlist={handleWishlist}
                showActions={true}
                className={viewMode === 'list' ? 'flex-1' : ''}
              />
            ) : (
              <BundleDisplay
                bundleId={item.bundleId!}
                bundleName={item.name}
                bundleDescription={item.description}
                basePrice={item.basePrice}
                onAddToCart={handleAddToCart}
                onQuickView={handleQuickView}
                onWishlist={handleWishlist}
                showActions={true}
                className={viewMode === 'list' ? 'flex-1' : ''}
              />
            )}
          </div>
        ))}
      </div>

      {/* Loading indicator for intersection observer */}
      {currentPage < totalPages && (
        <div ref={loadingRef} className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
