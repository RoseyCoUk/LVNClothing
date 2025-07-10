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
          className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-md border"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <span className="font-semibold">Filters</span>
            {hasActiveFilters && (
              <span className="bg-[#009fe3] text-white text-xs px-2 py-1 rounded-full">
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
                className="text-sm text-[#009fe3] hover:text-blue-600"
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
        <div className="bg-white rounded-lg shadow-md p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters} 
                className="text-sm text-[#009fe3] hover:text-blue-600 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Search */}
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

          {/* Category */}
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

          {/* Price Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range: £{(priceRange[0]/100).toFixed(2)} - £{(priceRange[1]/100).toFixed(2)}
            </label>
            <input 
              type="range" 
              min="0" 
              max="20000" 
              value={priceRange[1]} 
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} 
              className="w-full" 
            />
          </div>

          {/* Tags */}
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
        </div>
      </div>
    </>
  );
};

export default SidebarFilters; 