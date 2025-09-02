import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Star, 
  Check, 
  Truck, 
  Shield, 
  RefreshCw, 
  Plus, 
  Minus, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Clock, 
  Info 
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { 
  HoodieVariants, 
  findHoodieVariant,
  hoodieSizes
} from '../../hooks/hoodie-variants-merged-fixed';
import { useMergedProducts } from '../../hooks/useMergedProducts';
import { Toast, useToast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabase';
import { sortColorsByBrightness } from '../../lib/colorUtils';

interface HoodiePageProps {
  onBack: () => void;
}

interface ColorOption {
  name: string;
  hex: string;
  border?: boolean;
}

interface SizeOption {
  name: string;
  available: boolean;
}

const HoodiePage: React.FC<HoodiePageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isVisible, message, showToast, hideToast } = useToast();
  
  // Use merged products hook
  const { mergedProducts, isLoading, error, getProductByCategory } = useMergedProducts();
  
  // State for variant selection
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Get merged hoodie product
  const hoodieProduct = getProductByCategory('hoodie');

  // Product data from merged products
  const productData = hoodieProduct ? {
    id: hoodieProduct.id,
    name: hoodieProduct.name,
    description: hoodieProduct.description || "Premium cotton blend hoodie featuring the Reform UK logo. Available in multiple beautiful colors and sizes. Made from high-quality materials for comfort and durability. Perfect for casual wear and outdoor activities.",
    features: ["Premium cotton blend", "Classic fit", "Reinforced seams", "Pre-shrunk fabric", "Kangaroo pocket", "Screen-printed logo", `${hoodieProduct.colorOptions.length} color options`],
    careInstructions: "Machine wash cold. Tumble dry low. Do not bleach.",
    materials: "80% cotton, 20% polyester",
    category: hoodieProduct.category || 'apparel',
    shipping: "Ships in 48H",
    priceRange: hoodieProduct.priceRange,
    variantDetails: {
      sizes: hoodieProduct.sizeOptions,
      colors: hoodieProduct.colorOptions
    }
  } : null;

  // Set initial selections when merged product is available
  useEffect(() => {
    if (hoodieProduct && hoodieProduct.colorOptions.length > 0) {
      if (!selectedColor) {
        setSelectedColor(hoodieProduct.colorOptions[0].name);
      }
    }
    if (hoodieProduct && hoodieProduct.sizeOptions.length > 0) {
      if (!selectedSize) {
        setSelectedSize(hoodieProduct.sizeOptions[0]);
      }
    }
  }, [hoodieProduct, selectedColor, selectedSize]);

  // Find the selected variant
  useEffect(() => {
    if (selectedColor && selectedSize) {
      // Try to find variant in both designs
      const variant = findHoodieVariant('DARK', selectedSize, selectedColor) ||
                     findHoodieVariant('LIGHT', selectedSize, selectedColor);
      setSelectedVariant(variant);
    }
  }, [selectedColor, selectedSize]);

  // Get available sizes for selected color
  const getAvailableSizesForColor = (color: string) => {
    return HoodieVariants
      .filter(variant => variant.color === color)
      .map(variant => variant.size)
      .filter((size, index, arr) => arr.indexOf(size) === index);
  };

  // Get available colors
  const getAvailableColors = () => {
    return hoodieProduct?.colorOptions.map(color => color.name) || [];
  };

  // Check if size is available for selected color
  const isSizeAvailableForColor = (sizeName: string, color: string) => {
    if (!hoodieProduct) return false;
    
    // If database variants exist, check if variant exists (ignore stock for availability)
    if (hoodieProduct.variants && hoodieProduct.variants.length > 0) {
      const hasVariant = hoodieProduct.variants.some(variant => 
        variant.size === sizeName && variant.color === color
        // REMOVED stock check - variant existence is enough for availability
      );
      return hasVariant;
    }
    
    // Fallback to static variant data when database is empty
    const staticVariant = findHoodieVariant('DARK', sizeName, color) ||
                         findHoodieVariant('LIGHT', sizeName, color);
    return !!staticVariant;
  };

  // Check if color is available
  const isColorAvailable = (colorName: string) => {
    return hoodieProduct?.colorOptions.some(c => c.name === colorName) || false;
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Reset to first image when color changes
    setCurrentImageIndex(0);
  };



  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      alert('Please select a size and color');
      return;
    }

    // Find the exact variant using the merged variant data
    const printfulVariant = findHoodieVariant('DARK', selectedSize, selectedColor) ||
                            findHoodieVariant('LIGHT', selectedSize, selectedColor);
    
    if (!printfulVariant) {
      alert('Selected variant not found');
      return;
    }

    const cartItem = {
      id: `hoodie-${selectedSize}-${selectedColor}`,
      name: `${productData.name} - ${selectedColor}`,
      price: parseFloat(printfulVariant.price),
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      image: getProductImages()[0] || '/BackReformLogo.png',
      printful_variant_id: printfulVariant.catalogVariantId, // Real Printful catalog ID for ordering
      external_id: printfulVariant.externalId
    };

    addToCart(cartItem);
    
    // Show success message
    showToast(`Added to cart!`);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    
    // Add to cart first
    handleAddToCart();
    
    // Navigate to checkout
    navigate('/checkout');
  };

  // Get product images based on selected color from database
  const getProductImages = () => {
    if (!hoodieProduct?.baseProduct?.images || hoodieProduct.baseProduct.images.length === 0) {
      // Fallback to logo if no images in merged product
      return ['/BackReformLogo.png'];
    }
    
    const mergedImages = hoodieProduct.baseProduct.images;
    
    // If a color is selected, try to get color-specific images first
    if (selectedColor) {
      const selectedColorLower = selectedColor.toLowerCase();
      
      // Priority 1: Exact color match with variant_type = 'color'
      const exactColorImages = mergedImages.filter(img => 
        img.variant_type === 'color' && 
        img.color?.toLowerCase() === selectedColorLower
      );
      
      if (exactColorImages.length > 0) {
        return exactColorImages
          .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          .map(img => img.image_url);
      }
      
      // Priority 2: Look for images with color field matching (any variant_type)
      const colorFieldImages = mergedImages.filter(img => 
        img.color?.toLowerCase() === selectedColorLower
      );
      
      if (colorFieldImages.length > 0) {
        return colorFieldImages
          .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          .map(img => img.image_url);
      }
    }
    
    // Priority 3: General product images (variant_type = 'product' or null)
    const generalImages = mergedImages.filter(img => 
      img.variant_type === 'product' || img.variant_type === null || img.variant_type === undefined
    );
    
    if (generalImages.length > 0) {
      return generalImages
        .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
        .map(img => img.image_url);
    }
    
    // Priority 4: Primary image if available
    const primaryImages = mergedImages.filter(img => img.is_primary === true);
    if (primaryImages.length > 0) {
      return primaryImages.map(img => img.image_url);
    }
    
    // Priority 5: All available images as final fallback
    return mergedImages.length > 0 
      ? mergedImages
          .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          .map(img => img.image_url)
      : [hoodieProduct.image_url || '/BackReformLogo.png'];
  };

  const nextImage = () => {
    const images = getProductImages();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = getProductImages();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1 + images.length) % images.length);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Hoodie details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load product data</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // No product found
  if (!hoodieProduct || !productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
        </div>
      </div>
    );
  }

  const images = getProductImages();
  const currentImage = images[currentImageIndex] || images[0] || '/Hoodie/Men/ReformMenHoodieBlack1.webp';

  // Mock reviews data
  const reviews = [
    { id: 1, name: "David P.", rating: 5, date: "1 week ago", comment: "Great quality hoodie, fits perfectly and looks fantastic!", verified: true },
    { id: 2, name: "Sarah L.", rating: 5, date: "2 weeks ago", comment: "Love the design, very well made and comfortable.", verified: true },
    { id: 3, name: "Mark T.", rating: 4, date: "3 weeks ago", comment: "Good hoodie, material is soft and durable.", verified: true }
  ];

  return (
    <>
      <Toast 
        message={message}
        isVisible={isVisible}
        onClose={hideToast}
        duration={3000}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <button onClick={onBack} className="hover:text-[#009fe3] transition-colors">Home</button>
                <span className="text-gray-400">/</span>
                <button onClick={onBack} className="hover:text-[#009fe3] transition-colors">Shop</button>
                <span className="text-gray-400">/</span>
                <span className="text-[#009fe3] font-semibold">Reform UK Hoodie</span>
              </div>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                <img
                  src={currentImage}
                  alt={`Reform UK Hoodie - ${selectedColor}`}
                  className="w-full h-full object-cover aspect-square"
                />
                
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10" aria-label="Previous image">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10" aria-label="Next image">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    In Stock
                  </span>
                </div>
                
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs z-10">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-[#009fe3]' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover aspect-square"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reform UK Hoodie</h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(hoodieProduct?.baseProduct?.rating || product?.rating || 4.8) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">({hoodieProduct?.baseProduct?.reviews || product?.reviews || 89} reviews)</span>
                </div>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl font-bold text-[#009fe3]">£{selectedVariant?.price || '39.99'}</span>
                  <span className="text-lg text-gray-500 line-through">£49.99</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    Save £10.00
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-green-600 mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">Ships in 48H</span>
                </div>
              </div>



              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color: <span className="font-semibold text-gray-900">{selectedColor}</span>
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {sortColorsByBrightness(hoodieProduct.colorOptions).map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorChange(color.name)}
                      className={`relative w-12 h-12 border-2 rounded-full transition-all duration-200 hover:scale-110 ${
                        selectedColor === color.name
                          ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2'
                          : `border-gray-300 hover:border-[#009fe3] ${color.border ? 'border-gray-400' : ''}`
                      }`}
                      title={color.name}
                    >
                      <div 
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: color.hex }}
                      />
                      {selectedColor === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className={`w-5 h-5 ${color.name === 'White' || color.name === 'Light Blue' ? 'text-gray-600' : 'text-white'} drop-shadow-lg`} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <button
                    onClick={() => navigate('/size-guide')}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {hoodieProduct.sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      disabled={!isSizeAvailableForColor(size, selectedColor)}
                      className={`px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-[#009fe3] bg-[#009fe3] text-white'
                          : isSizeAvailableForColor(size, selectedColor)
                            ? 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Selection Summary */}
              <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Your Selection:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>Color: <span className="font-medium text-gray-900">{selectedColor}</span></p>
                  <p>Size: <span className="font-medium text-gray-900">{selectedSize}</span></p>
                  <p>Quantity: <span className="font-medium text-gray-900">{quantity}</span></p>
                </div>
              </div>

              {/* Add to Cart & Actions */}
              <div className="space-y-3">
                <button 
                  onClick={handleBuyNow}
                  disabled={!selectedVariant}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <span>Buy Now - £{((selectedVariant?.price || 39.99) * quantity).toFixed(2)}</span>
                </button>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedVariant}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart - £{((selectedVariant?.price || 39.99) * quantity).toFixed(2)}</span>
                </button>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setIsWishlisted(!isWishlisted)} 
                    className={`flex-1 border-2 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                  </button>
                  <button className="border-2 border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3] font-semibold p-3 rounded-lg transition-colors flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-[#009fe3] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Free UK Shipping Over £30</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-[#009fe3] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Secure Checkout</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="w-6 h-6 text-[#009fe3] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information Tabs */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {['description', 'features', 'reviews', 'care'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab ? 'border-[#009fe3] text-[#009fe3]' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="py-8">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    Premium cotton hoodie featuring the Reform UK logo and branding. Made from high-quality materials for comfort and durability. Perfect for everyday wear and casual occasions.
                  </p>
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Materials:</h4>
                    <p className="text-gray-700">100% cotton with reinforced stitching</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'features' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Premium 100% cotton material</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">High-quality screen printing</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Comfortable fit with drawstring hood</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Machine washable at 30°C</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Available in 9 colors and 5 sizes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">Reinforced stitching for durability</span>
                    </li>
                  </ul>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(hoodieProduct?.baseProduct?.rating || product?.rating || 4.8) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({hoodieProduct?.baseProduct?.reviews || product?.reviews || 89} reviews)</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{review.name}</span>
                            {review.verified && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified Purchase</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'care' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Instructions</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-800">Machine wash at 30°C. Do not bleach. Tumble dry low. Iron on low heat if needed.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HoodiePage;
