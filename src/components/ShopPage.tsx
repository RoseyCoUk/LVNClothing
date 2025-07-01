import React, { useState, useEffect } from 'react';
import {
  Filter,
  Search,
  Grid,
  List,
  Star,
  Heart,
  Eye,
  ChevronDown,
  X,
  SlidersHorizontal,
  Clock,
  ArrowRight,
  Truck,
  Shield,
  Package,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface ShopPageProps {
  onProductClick: (productId: number) => void;
}

// --- Combined and updated product data for the shop grid ---
const apparelProducts = [
  { id: 1, name: "Reform UK Hoodie", price: 34.99, image: "Hoodie/Men/ReformMenHoodieBlack1.webp", hoverImage: "Hoodie/Men/ReformMenHoodieBlack2.webp", rating: 5, reviews: 127, category: 'apparel', tags: ['bestseller'], shipping: "Ships in 24H", description: "Premium quality hoodie", dateAdded: '2025-06-15' },
  { id: 2, name: "Reform UK T-Shirt", price: 19.99, image: "Tshirt/Men/ReformMenTshirtWhite1.webp", hoverImage: "Tshirt/Men/ReformMenTshirtWhite2.webp", rating: 5, reviews: 89, category: 'apparel', tags: ['bestseller'], shipping: "Ships in 24H", description: "Comfortable cotton t-shirt", dateAdded: '2025-06-16' },
  { id: 3, name: "Reform UK Cap", price: 24.99, image: "Cap/ReformCapBlue1.webp", hoverImage: "Cap/ReformCapBlack2.webp", rating: 5, reviews: 92, category: 'apparel', tags: ['new'], shipping: "Ships in 24H", description: "Adjustable cap with logo", dateAdded: '2025-07-01' },
];

const gearProducts = [
  { id: 4, name: "Reform UK Tote Bag", price: 16.99, image: "StickerToteWater/ReformToteBagBlack1.webp", hoverImage: "StickerToteWater/ReformToteBagBlack2.webp", rating: 4, reviews: 156, category: 'gear', tags: [], shipping: "Ships in 24H", description: "Durable tote bag", dateAdded: '2025-06-20' },
  { id: 5, name: "Reform UK Water Bottle", price: 18.99, image: "StickerToteWater/ReformWaterBottleWhite1.webp", hoverImage: "StickerToteWater/ReformWaterBottleWhite2.webp", rating: 5, reviews: 203, category: 'gear', tags: ['new'], shipping: "Ships in 24H", description: "Insulated water bottle", dateAdded: '2025-07-02' },
  { id: 6, name: "Reform UK Mug", price: 12.99, image: "MugMouse/ReformMug1.webp", hoverImage: "MugMouse/ReformMug5.webp", rating: 4, reviews: 156, category: 'gear', tags: ['bestseller'], shipping: "Ships in 24H", description: "Ceramic coffee mug", dateAdded: '2025-05-10' },
  { id: 7, name: "Reform UK Mouse Pad", price: 14.99, image: "MugMouse/ReformMousePadWhite1.webp", hoverImage: "MugMouse/ReformMousePadWhite2.webp", rating: 4, reviews: 78, category: 'gear', tags: [], shipping: "Ships in 24H", description: "High-quality mouse pad", dateAdded: '2025-06-25' },
  { id: 8, name: "Reform UK Stickers", price: 6.99, image: "StickerToteWater/ReformStickersMain1.webp", hoverImage: "StickerToteWater/ReformStickersMain2.webp", rating: 5, reviews: 234, category: 'gear', tags: ['bestseller'], shipping: "Ships in 24H", description: "Weatherproof sticker set", dateAdded: '2025-05-01' },
  { id: 9, name: "Reform UK Badge Set", price: 8.99, image: "ReformBadgeSetMain1.webp", hoverImage: "ReformBadgeSetMain2.webp", rating: 5, reviews: 203, category: 'gear', tags: ['new'], shipping: "Ships in 24H", description: "Premium enamel badges", dateAdded: '2025-07-03' }
];

const allProducts = [...apparelProducts, ...gearProducts];


const ShopPage = ({ onProductClick }: ShopPageProps) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 4, hours: 12, minutes: 35, seconds: 42 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'all', name: 'All Products', count: 9 },
    { id: 'apparel', name: 'Apparel', count: 3 },
    { id: 'gear', name: 'Gear & Goods', count: 6 }
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
    setPriceRange([0, 100]);
    setSearchQuery('');
  };

  const hasActiveFilters = () => {
    return !selectedCategories.includes('all') || selectedTags.length > 0 || priceRange[0] > 0 || priceRange[1] < 100 || searchQuery !== '';
  };

  // --- FIX: Filtering and Sorting is now done in one step ---
  const sortedAndFilteredProducts = allProducts
    .filter(product => {
      const matchesCategory = selectedCategories.includes('all') || selectedCategories.includes(product.category);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => product.tags.includes(tag));
      const matchesSearch = searchQuery === '' || product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesPrice && matchesTags && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.reviews - a.reviews;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const ProductCard = ({ product }: { product: typeof allProducts[0] }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden cursor-pointer" onMouseEnter={() => setHoveredProduct(product.id)} onMouseLeave={() => setHoveredProduct(null)} onClick={() => onProductClick(product.id)}>
      <div className="relative overflow-hidden aspect-square">
        <img src={hoveredProduct === product.id ? product.hoverImage : product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
          <button onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }} className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"><Eye className="w-4 h-4" /></button>
          <button onClick={(e) => e.stopPropagation()} className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"><Heart className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}
          <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
        </div>
        <div className="flex items-center mb-3 text-xs text-green-600">
          <Clock className="w-3 h-3 mr-1" />
          <span>{product.shipping}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-[#009fe3]">£{product.price.toFixed(2)}</span>
          </div>
        </div>
        {/* --- FIX: "Add to Cart" button is now "View Options" --- */}
        <button onClick={() => onProductClick(product.id)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>View Options</span>
        </button>
      </div>
    </div>
  );

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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range: £{priceRange[0]} - £{priceRange[1]}</label>
                    <input type="range" min="0" max="100" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} className="w-full" />
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
                <div className="text-gray-600">Showing {sortedAndFilteredProducts.length} of {allProducts.length} products</div>
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
                    {(priceRange[0] > 0 || priceRange[1] < 100) && (<span className="bg-green-200 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">Price: £{priceRange[0]}-£{priceRange[1]}<button onClick={() => setPriceRange([0, 100])} className="ml-1.5"><X className="w-3 h-3" /></button></span>)}
                    {searchQuery && (<span className="bg-yellow-200 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">Search: "{searchQuery}"<button onClick={() => setSearchQuery('')} className="ml-1.5"><X className="w-3 h-3" /></button></span>)}
                </div>
            )}
            
            {/* The rest of your original JSX, now using sortedAndFilteredProducts */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Apparel</h3>
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {sortedAndFilteredProducts.filter(p => p.category === 'apparel').map(product => (<ProductCard key={product.id} product={product} />))}
              </div>
            </div>
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Gear & Goods</h3>
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {sortedAndFilteredProducts.filter(p => p.category === 'gear').map(product => (<ProductCard key={product.id} product={product} />))}
              </div>
            </div>

            {/* ... Your original promo banners ... */}
            <div className="my-12 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-center space-x-2 mb-3"><Clock className="w-6 h-6 animate-pulse" /><h3 className="text-xl font-bold">🕒 July Drop Ends Soon – Don't Miss Out</h3></div>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2"><div className="text-2xl font-bold">{timeLeft.days}</div><div className="text-xs">Days</div></div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2"><div className="text-2xl font-bold">{timeLeft.hours}</div><div className="text-xs">Hours</div></div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2"><div className="text-2xl font-bold">{timeLeft.minutes}</div><div className="text-xs">Minutes</div></div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2"><div className="text-2xl font-bold">{timeLeft.seconds}</div><div className="text-xs">Seconds</div></div>
                    </div>
                    <p className="mb-4">Limited edition items selling fast. Once they're gone, they're gone!</p>
                    <button className="bg-white text-red-600 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 mx-auto"><span>View Limited Edition Items</span><ArrowRight className="w-4 h-4" /></button>
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
            {/* ... Mobile filter content ... */}
          </div>
        </div>
      )}
      
      {/* Trust Badges Footer */}
      <section className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-6">
                <div className="flex items-center space-x-2 text-sm"><Shield className="w-5 h-5 text-green-400" /><span>Secure Checkout</span></div>
                <div className="flex items-center space-x-2 text-sm"><Truck className="w-5 h-5 text-blue-400" /><span>Free UK Shipping Over £30</span></div>
                <div className="flex items-center space-x-2 text-sm"><Package className="w-5 h-5 text-purple-400" /><span>Easy Returns</span></div>
                <div className="flex items-center space-x-2 text-sm"><span className="text-yellow-400">🇬🇧</span><span>Made in Britain</span></div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default ShopPage;