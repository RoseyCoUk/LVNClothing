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

const ShopPage: React.FC<ShopPageProps> = ({ onProductClick }) => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popularity')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
  const [priceRange, setPriceRange] = useState([0, 10000]) // Increased to handle prices in pence
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('ShopPage: Starting to fetch products...');
        setLoading(true)
        const productsData = await getProducts()
        console.log('ShopPage: Received products:', productsData);
        setProducts(productsData)
      } catch (err) {
        console.error('ShopPage: Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])



  const formatPrice = (pricePence: number): string => {
    return `£${(pricePence / 100).toFixed(2)}`
  }

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'apparel', name: 'Apparel', count: products.filter(p => p.category === 'apparel').length },
    { id: 'gear', name: 'Gear & Goods', count: products.filter(p => p.category === 'gear').length }
  ];
  
  const tags = [
    { id: 'new', name: 'New', color: 'bg-green-500' },
    { id: 'bestseller', name: 'Bestseller', color: 'bg-[#009fe3]' },
    { id: 'limited', name: 'Limited Edition', color: 'bg-red-500' },
    { id: 'bundle', name: 'Bundle Deals', color: 'bg-purple-500' }
  ];

  const sortOptions = [
    { id: 'popularity', name: 'Most Popular' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'newest', name: 'Newest First' },
    { id: 'rating', name: 'Highest Rated' }
  ];

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };

  const toggleCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories(prev => {
        const filtered = prev.filter(c => c !== 'all');
        if (filtered.includes(categoryId)) {
          const newCategories = filtered.filter(c => c !== categoryId);
          return newCategories.length === 0 ? ['all'] : newCategories;
        }
        return [...filtered, categoryId];
      });
    }
  };

  const clearFilters = () => {
    setSelectedCategories(['all']);
    setSelectedTags([]);
    setPriceRange([0, 10000]);
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return !selectedCategories.includes('all') || selectedTags.length > 0 || priceRange[0] > 0 || priceRange[1] < 10000 || searchQuery !== '';
  };

  // --- FIX: Filtering and Sorting is now done in one step ---
  const sortedAndFilteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategories.includes('all') || (product.category && selectedCategories.includes(product.category));
      const matchesPrice = product.price_pence >= priceRange[0] && product.price_pence <= priceRange[1];
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => product.tags.includes(tag));
      const matchesSearch = searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase()) || (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesPrice && matchesTags && matchesSearch;
    })
    .sort((a, b) => {
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
          <nav className="text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2">
              <span className="hover:text-[#009fe3] cursor-pointer transition-colors">Home</span><span className="text-gray-400">/</span><span className="text-[#009fe3] font-semibold">Shop</span>
            </div>
          </nav>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Filters</h3>
                    {hasActiveFilters() && (<button onClick={clearFilters} className="text-sm text-[#009fe3] hover:text-blue-600 flex items-center space-x-1"><RotateCcw className="w-3 h-3" /><span>Clear</span></button>)}
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent" /></div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="space-y-2">{categories.map(category => (<button key={category.id} onClick={() => toggleCategory(category.id)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategories.includes(category.id) ? 'bg-[#009fe3] text-white' : 'text-gray-700 hover:bg-gray-100'}`}><span>{category.name}</span><span className="float-right text-sm opacity-75">({category.count})</span></button>))}</div>
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range: £{(priceRange[0]/100).toFixed(2)} - £{(priceRange[1]/100).toFixed(2)}</label>
                    <input type="range" min="0" max="10000" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                    <div className="flex flex-wrap gap-2">{tags.map(tag => (<button key={tag.id} onClick={() => toggleTag(tag.id)} className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${selectedTags.includes(tag.id) ? `${tag.color} text-white shadow-lg scale-105` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{tag.name}</button>))}</div>
                </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* ... Your original mobile filter bar and desktop sort bar ... */}
            <div className="lg:hidden mb-6">
              <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4">
                <button onClick={() => setIsFilterOpen(true)} className="flex items-center space-x-2 text-gray-700"><SlidersHorizontal className="w-5 h-5" /><span>Filters</span>{hasActiveFilters() && (<span className="bg-[#009fe3] text-white text-xs px-2 py-1 rounded-full">Active</span>)}</button>
                <div className="flex items-center space-x-4">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">{sortOptions.map(option => (<option key={option.id} value={option.id}>{option.name}</option>))}</select>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden"><button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-[#009fe3] text-white' : 'text-gray-700'}`}><Grid className="w-4 h-4" /></button><button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-[#009fe3] text-white' : 'text-gray-700'}`}><List className="w-4 h-4" /></button></div>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-between bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="text-gray-600">Showing {sortedAndFilteredProducts.length} of {products.length} products</div>
                <div className="flex items-center space-x-4">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">{sortOptions.map(option => (<option key={option.id} value={option.id}>{option.name}</option>))}</select>
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden"><button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-[#009fe3] text-white' : 'text-gray-700'}`}><Grid className="w-4 h-4" /></button><button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-[#009fe3] text-white' : 'text-gray-700'}`}><List className="w-4 h-4" /></button></div>
                </div>
            </div>

            {/* --- NEW: Active Filters Display logic from previous step, now integrated --- */}
            {hasActiveFilters() && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-semibold text-blue-800">Active Filters:</span>
                    {selectedCategories.filter(c => c !== 'all').map(catId => (<span key={catId} className="bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">{categories.find(c => c.id === catId)?.name}<button onClick={() => toggleCategory(catId)} className="ml-1.5"><X className="w-3 h-3" /></button></span>))}
                    {selectedTags.map(tagId => (<span key={tagId} className="bg-purple-200 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">{tags.find(t => t.id === tagId)?.name}<button onClick={() => toggleTag(tagId)} className="ml-1.5"><X className="w-3 h-3" /></button></span>))}
                    {(priceRange[0] > 0 || priceRange[1] < 10000) && (<span className="bg-green-200 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">Price: £{(priceRange[0]/100).toFixed(2)}-£{(priceRange[1]/100).toFixed(2)}<button onClick={() => setPriceRange([0, 10000])} className="ml-1.5"><X className="w-3 h-3" /></button></span>)}
                    {searchQuery && (<span className="bg-yellow-200 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">Search: "{searchQuery}"<button onClick={() => setSearchQuery('')} className="ml-1.5"><X className="w-3 h-3" /></button></span>)}
                </div>
            )}
            
            {/* The rest of your original JSX, now using sortedAndFilteredProducts */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Apparel</h3>
              <div className={`grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
                {sortedAndFilteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200"
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
                          <span className="text-sm font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
                          <span className="ml-2 text-xs text-gray-500">({product.reviews.toLocaleString()})</span>
                        </div>
                        <div className="text-xl font-bold text-[#009fe3] mb-2">{formatPrice(product.price_pence)}</div>
                        <div className="flex items-center text-green-600 text-sm font-medium mb-4">
                          <Truck className="w-4 h-4 mr-1" /> Ships in 48H
                        </div>
                      </div>
                      <Link to={`/product/${product.id}`} className="mt-auto block w-full">
                        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-800 text-base transition-colors">
                          <ChevronRight className="w-5 h-5" /> View Options
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Gear & Goods</h3>
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {sortedAndFilteredProducts.filter(p => p.category === 'gear').map(product => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {/* Product Image Placeholder */}
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {product.name}
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {product.name}
                      </h3>
                      
                      {product.variant && (
                        <p className="text-sm text-gray-600 mb-2">
                          {product.variant}
                        </p>
                      )}
                      
                      {product.description && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(product.price_pence)}
                        </span>
                        
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                          onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }}
                        >
                          Add to Cart
                        </button>
                      </div>

                      {product.category && (
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <div className="flex items-center space-x-3">{hasActiveFilters() && (<button onClick={clearFilters} className="text-sm text-[#009fe3] hover:text-blue-600 flex items-center space-x-1"><RotateCcw className="w-3 h-3" /><span>Clear</span></button>)}<button onClick={() => setIsFilterOpen(false)}><X className="w-6 h-6" /></button></div>
            </div>
            
            {/* Mobile filter content */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        placeholder="Search products..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent" 
                    />
                </div>
            </div>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="space-y-2">
                    {categories.map(category => (
                        <button 
                            key={category.id} 
                            onClick={() => toggleCategory(category.id)} 
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                selectedCategories.includes(category.id) 
                                    ? 'bg-[#009fe3] text-white' 
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <span>{category.name}</span>
                            <span className="float-right text-sm opacity-75">({category.count})</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: £{(priceRange[0]/100).toFixed(2)} - £{(priceRange[1]/100).toFixed(2)}
                </label>
                <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} 
                    className="w-full" 
                />
            </div>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <button 
                            key={tag.id} 
                            onClick={() => toggleTag(tag.id)} 
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                                selectedTags.includes(tag.id) 
                                    ? `${tag.color} text-white shadow-lg scale-105` 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                    {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button 
                        onClick={() => setViewMode('grid')} 
                        className={`flex-1 p-2 ${viewMode === 'grid' ? 'bg-[#009fe3] text-white' : 'text-gray-700'}`}
                    >
                        <Grid className="w-4 h-4 mx-auto" />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')} 
                        className={`flex-1 p-2 ${viewMode === 'list' ? 'bg-[#009fe3] text-white' : 'text-gray-700'}`}
                    >
                        <List className="w-4 h-4 mx-auto" />
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add ProductBundles at the bottom of the page */}
      <ProductBundles />
    </div>
  );
};

export default ShopPage;