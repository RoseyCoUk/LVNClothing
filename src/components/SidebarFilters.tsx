import React from 'react';
import { Search, RotateCcw, X, Filter, ChevronRight } from 'lucide-react';

interface SidebarFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  categories: Array<{ id: string; name: string; count: number }>;
  tags: Array<{ id: string; name: string; color: string }>;
  hasActiveFilters: boolean;
  clearFilters: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategories,
  setSelectedCategories,
  priceRange,
  setPriceRange,
  selectedTags,
  setSelectedTags,
  categories,
  tags,
  hasActiveFilters,
  clearFilters,
  isOpen = true,
  onToggle
}) => {
  const toggleCategory = (categoryId: string) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      setSelectedCategories((prev: string[]) => {
        const filtered = prev.filter((c: string) => c !== 'all');
        if (filtered.includes(categoryId)) {
          const newCategories = filtered.filter((c: string) => c !== categoryId);
          return newCategories.length === 0 ? ['all'] : newCategories;
        }
        return [...filtered, categoryId];
      });
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev: string[]) => 
      prev.includes(tagId) ? prev.filter((t: string) => t !== tagId) : [...prev, tagId]
    );
  };

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 bg-lvn-white rounded-none shadow-sm border border-lvn-black/10"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <span className="font-semibold text-lvn-black">Filters</span>
            {hasActiveFilters && (
              <span className="bg-lvn-maroon text-lvn-white text-xs px-2 py-1 rounded-none">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilters();
                }}
                className="text-sm text-lvn-maroon hover:text-lvn-black"
              >
                Clear
              </button>
            )}
            <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </div>
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="bg-lvn-white rounded-none shadow-sm p-6 lg:sticky lg:top-24 border border-lvn-black/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lvn-black">Filters</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters} 
                className="text-sm text-lvn-maroon hover:text-lvn-black flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear all</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-lvn-black mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-lvn-black/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-lvn-black/20 rounded-none focus:outline-none focus:border-lvn-maroon bg-lvn-white"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-lvn-black mb-3">Categories</label>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="mr-3 w-4 h-4 text-lvn-maroon border-lvn-black/20 rounded-none focus:ring-lvn-maroon focus:ring-2"
                    />
                    <span className="text-sm text-lvn-black group-hover:text-lvn-maroon transition-colors">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs text-lvn-black/60 bg-lvn-off-white px-2 py-1 rounded-none">
                    {category.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-lvn-black mb-3">Price Range</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-lvn-black/70">£{(priceRange[0] / 100).toFixed(0)}</span>
                <span className="text-lvn-black/70">£{(priceRange[1] / 100).toFixed(0)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full h-2 bg-lvn-black/20 rounded-none appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #800000 0%, #800000 ${(priceRange[1] / 20000) * 100}%, #e5e7eb ${(priceRange[1] / 20000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex items-center justify-between text-xs text-lvn-black/60">
                <span>£0</span>
                <span>£200+</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-lvn-black mb-3">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-none transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-lvn-maroon text-lvn-white'
                      : 'bg-lvn-off-white text-lvn-black hover:bg-lvn-black hover:text-lvn-white'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="border-t border-lvn-black/10 pt-4">
              <h4 className="text-sm font-medium text-lvn-black mb-2">Active Filters:</h4>
              <div className="space-y-1">
                {selectedCategories.length > 0 && selectedCategories[0] !== 'all' && (
                  <div className="flex items-center justify-between text-xs text-lvn-black/70">
                    <span>Categories: {selectedCategories.join(', ')}</span>
                  </div>
                )}
                {searchQuery && (
                  <div className="flex items-center justify-between text-xs text-lvn-black/70">
                    <span>Search: "{searchQuery}"</span>
                  </div>
                )}
                {selectedTags.length > 0 && (
                  <div className="flex items-center justify-between text-xs text-lvn-black/70">
                    <span>Tags: {selectedTags.join(', ')}</span>
                  </div>
                )}
                {priceRange[1] < 20000 && (
                  <div className="flex items-center justify-between text-xs text-lvn-black/70">
                    <span>Max Price: £{(priceRange[1] / 100).toFixed(0)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SidebarFilters; 