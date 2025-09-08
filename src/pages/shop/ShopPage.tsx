import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductBundles from '../../components/ProductBundles';
import SidebarFilters from '../../components/SidebarFilters';
import ProductCard from '../../components/ui/ProductCard';
import BundleCard from '../../components/ui/BundleCard';
import { getProducts, getProductVariants, Product } from '../../lib/api';
import { useMergedProducts, MergedProduct } from '../../hooks/useMergedProducts';
import { useBundlePricing } from '../../hooks/useBundlePricing';
import { useCart } from '../../contexts/CartContext';
import { BUNDLES } from '../../lib/bundle-pricing';
import {
  Search,
  Grid,
  List,
  Star,
  Heart,
  Eye,
  X,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
  Truck,
  ChevronRight,
  Filter
} from 'lucide-react';

interface ShopPageProps {
  onProductClick: (productId: string) => void;
}

const CATEGORY_DEFS = [
  { id: 'all', label: 'All Products' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'gear', label: 'Gear & Goods' },
  { id: 'bundles', label: 'Bundles' },
];

const TAG_DEFS = [
  { id: 'new', name: 'New', color: 'bg-green-500' },
  { id: 'bestseller', name: 'Bestseller', color: 'bg-orange-500' },
  { id: 'limited', name: 'Limited Edition', color: 'bg-red-500' },
  { id: 'bundle', name: 'Bundle Deals', color: 'bg-purple-500' },
];

const getCategoryForProduct = (product: MergedProduct | Product) => {
  // Handle merged products
  if ('baseProduct' in product) {
    const cat = product.category?.toLowerCase() || '';
    const name = product.name.toLowerCase() || '';
    if (name.includes('hoodie') || name.includes('t-shirt') || name.includes('tshirt') || name.includes('cap') || name.includes('hat')) return 'apparel';
    if (name.includes('mug') || name.includes('keychain') || name.includes('tote') || name.includes('bottle') || name.includes('pad') || name.includes('mouse')) return 'gear';
    if (cat.includes('apparel')) return 'apparel';
    return 'gear'; // Default to gear if not matched
  }
  
  // Handle regular products (fallback)
  const cat = product.category?.toLowerCase() || '';
  const tags = ('tags' in product ? (product.tags || []).map((t: string) => t.toLowerCase()) : []);
  if (cat.includes('bundle') || tags.includes('bundle')) return 'bundles';
  if (cat.includes('apparel') || tags.includes('apparel') || ['t-shirt','tshirt','hoodie','cap','hat'].some(type => cat.includes(type) || tags.includes(type))) return 'apparel';
  if (cat.includes('gear') || tags.includes('gear')) return 'gear';
  // Fallbacks for known gear types
  if (['mug','keychain','tote','bottle','pad','mouse'].some(type => cat.includes(type) || tags.includes(type))) return 'gear';
  return 'gear'; // Default to gear if not matched
};

// Helper function to convert MergedProduct to Product format for compatibility
const convertToProductFormat = (mergedProduct: MergedProduct): Product => {
  // Generate slug that matches existing route patterns
  const generateSlug = (productName: string, categoryKey: string) => {
    // Handle known merged products to match existing routes
    if (categoryKey === 'tshirt') return 'reform-uk-tshirt';
    if (categoryKey === 'hoodie') return 'reform-uk-hoodie';
    
    // For individual products, use the base product's slug if available
    if (categoryKey.startsWith('individual-') && mergedProduct.baseProduct?.slug) {
      const slug = mergedProduct.baseProduct.slug;
      // If it's not a UUID, use it
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug)) {
        return slug;
      }
    }
    
    // Generate slug from product name as fallback
    return productName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  };

  // Calculate proper price from variants (avoid $0 issue)
  const calculatePrice = () => {
    const validPrices = mergedProduct.variants
      .map(v => v.price)
      .filter(p => p && p > 0);
    
    if (validPrices.length === 0) {
      // Fallback to baseProduct price if available
      const basePrice = mergedProduct.baseProduct?.price_pence;
      return basePrice || 1999; // £19.99 as last resort fallback
    }
    
    return Math.round(Math.min(...validPrices) * 100);
  };

  // Get proper rating from base product or fallback
  const getRating = () => {
    return mergedProduct.baseProduct?.rating || 5.0;
  };

  // Get proper review count from base product or calculate from variants
  const getReviews = () => {
    const baseReviews = mergedProduct.baseProduct?.reviews;
    if (baseReviews && baseReviews > 0) return baseReviews;
    return Math.max(mergedProduct.variants.length * 8, 50); // At least 50 reviews
  };

  return {
    id: mergedProduct.id,
    name: mergedProduct.name,
    variant: null, // Add missing variant field
    description: mergedProduct.description,
    category: mergedProduct.category,
    price_pence: calculatePrice(),
    image_url: mergedProduct.image_url,
    slug: generateSlug(mergedProduct.name, mergedProduct.id),
    dateAdded: mergedProduct.baseProduct?.dateAdded || new Date().toISOString(),
    created_at: mergedProduct.baseProduct?.created_at || new Date().toISOString(),
    updated_at: mergedProduct.baseProduct?.updated_at || new Date().toISOString(),
    rating: getRating(),
    reviews: getReviews(),
    tags: mergedProduct.baseProduct?.tags || [],
    // Preserve variants for cart functionality
    variants: mergedProduct.variants
  } as Product & { variants: typeof mergedProduct.variants };
};

const ShopPage: React.FC<ShopPageProps> = ({ onProductClick }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use merged products hook
  const { mergedProducts, isLoading: loading, error } = useMergedProducts();
  
  // Use bundle pricing hook
  const { bundlePricing, loading: bundleLoading } = useBundlePricing();
  const { addToCart } = useCart();
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]); // £0-£200
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');
    
    if (category && category !== 'all') {
      setSelectedCategories([category]);
    }
    if (search) {
      setSearchQuery(search);
    }
    if (tags) {
      setSelectedTags(tags.split(','));
    }
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (selectedCategories.length === 1 && selectedCategories[0] !== 'all') {
      newParams.set('category', selectedCategories[0]);
    }
    if (searchQuery) {
      newParams.set('search', searchQuery);
    }
    if (selectedTags.length > 0) {
      newParams.set('tags', selectedTags.join(','));
    }
    
    setSearchParams(newParams, { replace: true });
  }, [selectedCategories, searchQuery, selectedTags, setSearchParams]);

  // Products are now fetched via useMergedProducts hook

  // Calculate category counts (including bundles)
  const categoryCounts = CATEGORY_DEFS.map(cat => {
    if (cat.id === 'all') {
      return { id: cat.id, name: cat.label, count: mergedProducts.length + 3 }; // +3 for bundles
    }
    if (cat.id === 'bundles') {
      return { id: cat.id, name: cat.label, count: 3 }; // 3 bundles available
    }
    return {
      id: cat.id,
      name: cat.label,
      count: mergedProducts.filter(product => getCategoryForProduct(product) === cat.id).length
    };
  });

  // Filter merged products
  const filteredProducts = mergedProducts.filter(product => {
    // Category filter
    if (!selectedCategories.includes('all') && !selectedCategories.includes(getCategoryForProduct(product))) {
      return false;
    }
    
    // Search filter
    if (searchQuery && !(
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )) {
      return false;
    }
    
    // Price filter - use price range from merged product
    const productPriceMin = product.priceRange.min * 100; // Convert to pence
    const productPriceMax = product.priceRange.max * 100;
    if (productPriceMax < priceRange[0] || productPriceMin > priceRange[1]) {
      return false;
    }
    
    // Tag filter - merged products don't have tags yet, skip for now
    // TODO: Add tag support to merged products if needed
    
    return true;
  });

  // Sort merged products
  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        // Use number of variants as popularity indicator for merged products
        return b.variants.length - a.variants.length;
      case 'price-low':
        return a.priceRange.min - b.priceRange.min;
      case 'price-high':
        return b.priceRange.max - a.priceRange.max;
      case 'newest':
        // For merged products, use name as fallback for now
        return a.name.localeCompare(b.name);
      case 'rating':
        // No rating for merged products yet, use name as fallback
        return a.name.localeCompare(b.name);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const clearFilters = () => {
    setSelectedCategories(['all']);
    setPriceRange([0, 20000]); // £0-£200
    setSelectedTags([]);
    setSearchQuery('');
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = selectedCategories.length > 1 || 
    priceRange[1] < 20000 || // £200
    selectedTags.length > 0 || 
    searchQuery.length > 0;

  const getCategoryHeading = () => {
    if (selectedCategories.includes('all') || selectedCategories.length === 0) {
      return 'All Products';
    }
    if (selectedCategories.length === 1) {
      return CATEGORY_DEFS.find(cat => cat.id === selectedCategories[0])?.label || 'Products';
    }
    return 'Filtered Products';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lvn-maroon-dark mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">Error: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop Official LVN Clothing Merch</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">Support the movement. Every purchase powers the mission.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80 flex-shrink-0">
            <SidebarFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              categories={categoryCounts}
              tags={TAG_DEFS}
              hasActiveFilters={hasActiveFilters}
              clearFilters={clearFilters}
              isOpen={isMobileFilterOpen}
              onToggle={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{getCategoryHeading()}</h2>
                <p className="text-gray-600">{sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="shop-sort" className="sr-only">Sort by</label>
                <select
                  id="shop-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {sortedProducts.length === 0 && (!selectedCategories.includes('bundles') || bundleLoading) ? (
              <div className="text-center py-16">
                <div className="text-gray-500 mb-4">
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-[lvn-maroon] hover:text-lvn-maroon-dark font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Show bundles first if bundles category is selected */}
                {(selectedCategories.includes('bundles') || selectedCategories.includes('all')) && !bundleLoading && (
                  <>        
                    {(['starter', 'champion', 'activist'] as const).map((bundleKey) => (
                      <BundleCard
                        key={bundleKey}
                        bundleKey={bundleKey}
                        price={bundlePricing[bundleKey].price}
                        originalPrice={bundlePricing[bundleKey].originalPrice}
                        onAddToCart={() => {
                          // Add bundle items to cart
                          const bundle = BUNDLES[bundleKey];
                          bundle.products.forEach(product => {
                            // Add default variant for each product in bundle
                            addToCart({
                              id: `bundle-${bundleKey}-${product.productId}`,
                              name: product.name,
                              price: 0, // Price handled at bundle level
                              image: '',
                              category: 'bundle',
                              quantity: 1
                            });
                          });
                        }}
                      />
                    ))}
                  </>
                )}
                {/* Show regular products if not exclusively bundles */}
                {!selectedCategories.includes('bundles') || selectedCategories.includes('all') ? (
                  sortedProducts.map(mergedProduct => (
                    <ProductCard key={mergedProduct.id} product={convertToProductFormat(mergedProduct)} />
                  ))
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;