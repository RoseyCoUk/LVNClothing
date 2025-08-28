import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, SlidersHorizontal, Star, Tag } from 'lucide-react';
import { getProducts, Product } from '../lib/api';

interface ProductSearchProps {
  onProductSelect?: (product: Product) => void;
  onSearchResults?: (results: Product[]) => void;
  placeholder?: string;
  className?: string;
}

interface SearchFilters {
  category: string;
  priceRange: [number, number];
  minRating: number;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'rating' | 'popularity';
  inStock: boolean | null;
  tags: string[];
  colors: string[];
  sizes: string[];
  brands: string[];
}

const ProductSearch: React.FC<ProductSearchProps> = ({
  onProductSelect,
  onSearchResults,
  placeholder = "Search for products...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    priceRange: [0, 200],
    minRating: 0,
    sortBy: 'popularity',
    inStock: null,
    tags: [],
    colors: [],
    sizes: [],
    brands: []
  });

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'hoodies', label: 'Hoodies' },
    { value: 't-shirts', label: 'T-Shirts' },
    { value: 'caps', label: 'Caps' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'bundles', label: 'Bundles' }
  ];

  const availableTags = ['premium', 'christian', 'faith', 'kingdom', 'streetwear', 'comfort', 'scripture'];
  const availableColors = ['Black', 'White', 'Navy', 'Maroon', 'Grey', 'Blue'];
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableBrands = ['LVN Clothing', 'Kingdom Collection', 'Faith Wear'];

  // Load all products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };
    loadProducts();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    const searchTimeout = setTimeout(() => {
      performSearch();
    }, 300); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [query, filters]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = () => {
    const searchTerms = query.toLowerCase().split(' ');
    
    let filteredProducts = allProducts.filter(product => {
      // Text search
      const searchableText = `${product.name} ${product.description} ${product.category} ${product.tags?.join(' ')}`.toLowerCase();
      const matchesSearch = searchTerms.every(term => searchableText.includes(term));
      
      // Category filter
      const matchesCategory = filters.category === 'all' || 
        product.category?.toLowerCase().includes(filters.category) ||
        product.tags?.some(tag => tag.toLowerCase().includes(filters.category));
      
      // Price filter
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      
      // Rating filter
      const matchesRating = (product.rating || 0) >= filters.minRating;
      
      // Stock filter
      const matchesStock = filters.inStock === null || 
        (filters.inStock === true && (product.stock_quantity || 0) > 0) ||
        (filters.inStock === false && (product.stock_quantity || 0) === 0);
      
      // Tags filter
      const matchesTags = filters.tags.length === 0 ||
        filters.tags.every(tag => product.tags?.some(productTag => productTag.toLowerCase().includes(tag.toLowerCase())));
      
      // Colors filter (assuming product has colors array or color property)
      const matchesColors = filters.colors.length === 0 ||
        filters.colors.some(color => 
          product.name?.toLowerCase().includes(color.toLowerCase()) ||
          product.description?.toLowerCase().includes(color.toLowerCase())
        );
      
      // Sizes filter (assuming product has sizes array or size property)
      const matchesSizes = filters.sizes.length === 0 ||
        filters.sizes.some(size => 
          product.name?.toLowerCase().includes(size.toLowerCase()) ||
          product.description?.toLowerCase().includes(size.toLowerCase())
        );
      
      // Brands filter (assuming product has brand property)
      const matchesBrands = filters.brands.length === 0 ||
        filters.brands.some(brand => 
          product.name?.toLowerCase().includes(brand.toLowerCase()) ||
          product.description?.toLowerCase().includes(brand.toLowerCase())
        );
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating && 
             matchesStock && matchesTags && matchesColors && matchesSizes && matchesBrands;
    });

    // Sort results
    switch (filters.sortBy) {
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popularity':
        filteredProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
    }

    setResults(filteredProducts);
    setShowResults(true);
    setIsLoading(false);

    // Notify parent component
    if (onSearchResults) {
      onSearchResults(filteredProducts);
    }
  };

  const handleProductClick = (product: Product) => {
    setQuery('');
    setShowResults(false);
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent bg-white"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
          {query && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`text-gray-400 hover:text-gray-600 ${showFilters ? 'text-lvn-maroon' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

              {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range: £{filters.priceRange[0]} - £{filters.priceRange[1]}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Stock Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === null}
                      onChange={() => setFilters(prev => ({ ...prev, inStock: null }))}
                      className="mr-2"
                    />
                    All Products
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === true}
                      onChange={() => setFilters(prev => ({ ...prev, inStock: true }))}
                      className="mr-2"
                    />
                    In Stock Only
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === false}
                      onChange={() => setFilters(prev => ({ ...prev, inStock: false }))}
                      className="mr-2"
                    />
                    Out of Stock
                  </label>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <div className="flex space-x-1">
                  {[0, 1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                      className={`${
                        rating <= filters.minRating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      title={rating === 0 ? 'All ratings' : `${rating}+ stars`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag) 
                          ? prev.tags.filter(t => t !== tag)
                          : [...prev.tags, tag]
                      }))}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        filters.tags.includes(tag)
                          ? 'bg-lvn-maroon text-white border-lvn-maroon'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                <div className="space-y-2">
                  {availableColors.map(color => (
                    <label key={color} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          colors: e.target.checked
                            ? [...prev.colors, color]
                            : prev.colors.filter(c => c !== color)
                        }))}
                        className="mr-2"
                      />
                      {color}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                <div className="flex flex-wrap gap-1">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        sizes: prev.sizes.includes(size) 
                          ? prev.sizes.filter(s => s !== size)
                          : [...prev.sizes, size]
                      }))}
                      className={`px-2 py-1 rounded text-sm border transition-colors ${
                        filters.sizes.includes(size)
                          ? 'bg-lvn-maroon text-white border-lvn-maroon'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                >
                  <option value="popularity">Popularity</option>
                  <option value="name">Name A-Z</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {results.length} product{results.length !== 1 ? 's' : ''} found
              </div>
              <button
                onClick={() => setFilters({
                  category: 'all',
                  priceRange: [0, 200],
                  minRating: 0,
                  sortBy: 'popularity',
                  inStock: null,
                  tags: [],
                  colors: [],
                  sizes: [],
                  brands: []
                })}
                className="text-sm text-lvn-maroon hover:text-lvn-maroon/80 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-40 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lvn-maroon mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-600">
                  {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </p>
              </div>
              
              {results.slice(0, 8).map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="w-full px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 text-left"
                >
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {highlightText(product.name, query)}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {product.category}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm font-semibold text-lvn-maroon">
                        £{product.price.toFixed(2)}
                      </span>
                      {product.rating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {product.tags?.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
              
              {results.length > 8 && (
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-600">
                    +{results.length - 8} more results. Refine your search for better results.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600">No products found for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
