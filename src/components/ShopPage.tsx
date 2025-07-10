import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductBundles from './ProductBundles';
import SidebarFilters from './SidebarFilters';
import ProductCard from './ProductCard';
import { getProducts, getProductVariants, Product } from '../lib/api';
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

const getCategoryForProduct = (product: Product) => {
  const cat = product.category?.toLowerCase() || '';
  const tags = (product.tags || []).map((t: string) => t.toLowerCase());
  if (cat.includes('bundle') || tags.includes('bundle')) return 'bundles';
  if (cat.includes('apparel') || tags.includes('apparel') || ['t-shirt','tshirt','hoodie','cap','hat'].some(type => cat.includes(type) || tags.includes(type))) return 'apparel';
  if (cat.includes('gear') || tags.includes('gear')) return 'gear';
  // Fallbacks for known gear types
  if (['mug','keychain','tote','bottle','pad','mouse','sticker'].some(type => cat.includes(type) || tags.includes(type))) return 'gear';
  return 'gear'; // Default to gear if not matched
};

const ShopPage: React.FC<ShopPageProps> = ({ onProductClick }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        
        // Test: Check if product variants exist for the T-Shirt product
        const tshirtProduct = fetchedProducts.find(p => p.name.includes('T-Shirt'));
        if (tshirtProduct) {
          console.log('Testing T-Shirt product variants for product ID:', tshirtProduct.id);
          try {
            const variants = await getProductVariants(tshirtProduct.id);
            console.log('T-Shirt product variants:', variants);
          } catch (variantError) {
            console.error('Error fetching T-Shirt variants:', variantError);
          }
        }
        
        // Debug: Log all product image URLs
        console.log('All product image URLs:');
        fetchedProducts.forEach(product => {
          console.log(`${product.name}: ${product.image_url}`);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Calculate category counts
  const categoryCounts = CATEGORY_DEFS.map(cat => {
    if (cat.id === 'all') {
      return { id: cat.id, name: cat.label, count: products.length };
    }
    return {
      id: cat.id,
      name: cat.label,
      count: products.filter(product => getCategoryForProduct(product) === cat.id).length
    };
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    // Debug logging for Activist Bundle
    if (product.name === 'Activist Bundle') {
      console.log('Filtering Activist Bundle:', {
        product,
        selectedCategories,
        priceRange,
        searchQuery,
        selectedTags,
        categoryMatch: getCategoryForProduct(product)
      });
    }
    
    // Category filter
    if (!selectedCategories.includes('all') && !selectedCategories.includes(getCategoryForProduct(product))) {
      if (product.name === 'Activist Bundle') {
        console.log('Activist Bundle filtered out by category');
      }
      return false;
    }
    
    // Search filter
    if (searchQuery && !(
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )) {
      if (product.name === 'Activist Bundle') {
        console.log('Activist Bundle filtered out by search');
      }
      return false;
    }
    
    // Price filter
    if (product.price_pence < priceRange[0] || product.price_pence > priceRange[1]) {
      if (product.name === 'Activist Bundle') {
        console.log('Activist Bundle filtered out by price:', {
          price: product.price_pence,
          range: priceRange
        });
      }
      return false;
    }
    
    // Tag filter
    if (selectedTags.length > 0) {
      const productTags = (product.tags || []).map((t: string) => t.toLowerCase());
      if (!selectedTags.some(tag => productTags.includes(tag))) {
        if (product.name === 'Activist Bundle') {
          console.log('Activist Bundle filtered out by tags');
        }
        return false;
      }
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return (b.reviews || 0) - (a.reviews || 0);
      case 'price-low':
        return a.price_pence - b.price_pence;
      case 'price-high':
        return b.price_pence - a.price_pence;
      case 'newest':
        return new Date(b.dateAdded || '').getTime() - new Date(a.dateAdded || '').getTime();
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop Official Reform UK Merch</h1>
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
            {sortedProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-500 mb-4">
                  <p className="text-lg font-medium">No products found</p>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-[#009fe3] hover:text-blue-600 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {sortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;