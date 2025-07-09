import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductBundles from './ProductBundles'
import { getProducts, Product } from '../lib/api'
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
  ChevronRight
} from 'lucide-react'

interface ShopPageProps {
  onProductClick: (productId: string) => void;
}

const CATEGORY_DEFS = [
  { id: 'all', label: 'All Products' },
  { id: 'apparel', label: 'Apparel' },
  { id: 'gear', label: 'Gear & Goods' },
  { id: 'bundles', label: 'Bundles' },
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
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popularity')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const productsData = await getProducts()
        setProducts(productsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Filter by category
  const filteredProducts = products.filter(product => {
    if (activeCategory === 'all') return true;
    return getCategoryForProduct(product) === activeCategory;
  }).filter(product => {
    // Search filter
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Sort (keep as before)
  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.reviews - a.reviews;
      case 'price-low':
        return a.price_pence - b.price_pence;
      case 'price-high':
        return b.price_pence - a.price_pence;
      case 'newest':
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

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
    )
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
    )
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
          {/* Category Filter Tabs */}
          <div className="flex overflow-x-auto gap-2 sm:gap-4 mb-6 border-b border-gray-200 pb-2">
            {CATEGORY_DEFS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 whitespace-nowrap rounded-t-lg font-semibold text-base transition-all duration-150
                  ${activeCategory === cat.id ? 'text-[#009fe3] border-b-2 border-[#009fe3] bg-blue-50' : 'text-gray-700 hover:bg-gray-100'}`}
                aria-current={activeCategory === cat.id ? 'page' : undefined}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex-1">
            <label htmlFor="shop-search" className="sr-only">Search products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="shop-search"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="shop-sort" className="sr-only">Sort by</label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
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
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-16">
              No products found in this category.
            </div>
          )}
          {sortedProducts.map(product => {
            const productUrl = (product as any).slug ? `/product/${(product as any).slug}` : `/product/${product.id}`;
            return (
              <Link
                key={product.id}
                to={productUrl}
                className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200 focus:outline-none focus:ring-2 focus:ring-[#009fe3]"
                aria-label={`View details for ${product.name}`}
              >
                {/* Product Image */}
                <div className="bg-gray-100 aspect-w-1 aspect-h-1 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="object-cover w-full h-64" />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                {/* Product Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#facc15" />
                      <span className="text-sm font-semibold text-gray-700">{product.rating?.toFixed(1) ?? '5.0'}</span>
                      <span className="ml-2 text-xs text-gray-500">({product.reviews?.toLocaleString() ?? 0})</span>
                    </div>
                    <div className="text-xl font-bold text-[#009fe3] mb-2">£{(product.price_pence / 100).toFixed(2)}</div>
                    <div className="flex items-center text-green-600 text-sm font-medium mb-4">
                      <Truck className="w-4 h-4 mr-1" /> Ships in 48H
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-800 text-base transition-colors mt-auto">
                    <ChevronRight className="w-5 h-5" /> View Options
                  </button>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Official Merchandise Banner */}
        <div className="my-12 bg-gradient-to-r from-[#009fe3] to-blue-600 text-white rounded-lg p-8 text-center relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Official Reform UK Merchandise — Shop Our Best Sellers</h3>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">High-quality gear. Fast shipping. Worn with pride.</p>
            <Link 
              to="/shop" 
              className="inline-flex items-center space-x-2 bg-white text-[#009fe3] hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <span>Browse All Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      {/* Add ProductBundles at the bottom of the page */}
      <ProductBundles />
    </div>
  );
};

export default ShopPage;