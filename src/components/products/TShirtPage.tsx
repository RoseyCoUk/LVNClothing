import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  Clock
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { 
  TshirtVariants, 
  findTshirtVariant,
  tshirtSizes,
  tshirtColors
} from '../../hooks/tshirt-variants-merged';
import { Toast, useToast } from '../../components/ui/Toast';

// Fix: Add proper TypeScript interfaces
interface Color {
  name: string;
  hex: string;
  border?: boolean;
}

interface TshirtPageProps {
  onBack: () => void;
}

const TshirtPage = ({ onBack }: TshirtPageProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { isVisible, message, showToast, hideToast } = useToast();
  
  // State
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('White');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Product data with merged variant structure
  const productData = {
    id: 1,
    name: "Reform UK T-Shirt",
    description: "Comfortable cotton t-shirt featuring the Reform UK logo. Available in 20 beautiful colors with 5 size options. Made from premium cotton for all-day comfort and durability. A classic fit that works for any occasion.",
    features: ["100% premium cotton", "Classic fit", "Reinforced seams", "Pre-shrunk fabric", "Tagless for comfort", "Screen-printed logo", "20 color options"],
    careInstructions: "Machine wash cold. Tumble dry low. Do not bleach.",
    materials: "100% cotton",
    category: 'apparel',
    shipping: "Ships in 48H",
    defaultVariant: 201, // Default to M White
    variantDetails: {
      sizes: tshirtSizes,
      colors: tshirtColors
    }
  };

  // Set initial selections
  useEffect(() => {
    if (tshirtColors.length > 0 && !selectedColor) {
      setSelectedColor(tshirtColors[0].name);
    }
    if (tshirtSizes.length > 0 && !selectedSize) {
      setSelectedSize(tshirtSizes[0]);
    }
  }, [tshirtColors, tshirtSizes]);

  // Find the selected variant
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = findTshirtVariant('DARK', selectedSize, selectedColor) || 
                     findTshirtVariant('LIGHT', selectedSize, selectedColor);
      setSelectedVariant(variant);
    }
  }, [selectedColor, selectedSize]);

  // Generate variant data for display
  const getVariantData = () => {
    if (!selectedVariant) return null;
    
    const colorKey = selectedColor.replace(/\s+/g, '');
    const design = selectedVariant.design;
    const imagePrefix = design === 'DARK' ? 'ReformMenTshirt' : 'ReformMenTshirtLight';
    
    return {
      id: selectedVariant.catalogVariantId,
      color: selectedColor,
      price: parseFloat(selectedVariant.price),
      inStock: true,
      stockCount: 25,
      rating: 5,
      reviews: 156,
      images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/${imagePrefix}${colorKey}${i + 1}.webp`),
      size: selectedSize,
      design: design
    };
  };

  const variantData = getVariantData();



  // Loading state
  if (!selectedVariant || !variantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#009fe3] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize || !selectedVariant) {
      alert('Please select a size and color');
      return;
    }

    console.log('🛒 Adding to cart:', { selectedColor, selectedSize });
    
    const cartItem = {
      id: `tshirt-${selectedSize}-${selectedColor}`,
      name: `${productData.name} - ${selectedColor}`,
      price: variantData.price,
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      image: variantData.images[0],
      printful_variant_id: selectedVariant.externalId,
      external_id: selectedVariant.externalId
    };

    addToCart(cartItem);
    
    // Show success message
    showToast(`Added to cart!`);
  };

  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      alert('Please select a size and color');
      return;
    }

    // Add to cart first
    handleAddToCart();
    
    // Navigate to checkout
    navigate('/checkout');
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % variantData.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + variantData.images.length) % variantData.images.length);
  };

  const handleSizeChange = (size: string) => {
    console.log('📏 Size selected:', size);
    setSelectedSize(size);
  };

  const handleColorChange = (color: string) => {
    console.log('🎨 Color selected:', color);
    setSelectedColor(color);
  };







  const reviews = [
    { id: 1, name: "David P.", rating: 5, date: "1 week ago", comment: "Great quality t-shirt, fits perfectly and looks fantastic!", verified: true },
    { id: 2, name: "Sarah L.", rating: 5, date: "2 weeks ago", comment: "Love the design, very well made and comfortable.", verified: true },
    { id: 3, name: "Mark T.", rating: 4, date: "3 weeks ago", comment: "Good t-shirt, material is soft and durable.", verified: true }
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
                <span className="text-[#009fe3] font-semibold">{productData.name}</span>
              </div>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div key={variantData.id} className="space-y-4">
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                <img
                  src={variantData.images[selectedImage]}
                  alt={`${productData.name} - ${variantData.color} - Image ${selectedImage + 1}`}
                  className="w-full h-full object-cover aspect-square"
                />
                
                {variantData.images.length > 1 && (
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
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${variantData.stockCount <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {variantData.stockCount <= 10 ? `Only ${variantData.stockCount} left` : 'In Stock'}
                  </span>
                </div>
                
                {variantData.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs z-10">
                    {selectedImage + 1} / {variantData.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {variantData.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {variantData.images.map((image, index) => (
                    <button key={index} onClick={() => setSelectedImage(index)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-[#009fe3]' : 'border-gray-200 hover:border-gray-300'}`}>
                      <img src={image} alt={`${productData.name} thumbnail ${index + 1}`} className="w-full h-full object-cover aspect-square" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{productData.name}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < variantData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">({variantData.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl font-bold text-[#009fe3]">£{variantData.price.toFixed(2)}</span>
                  <span className="text-lg text-gray-500 line-through">£29.99</span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    Save £5.00
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-green-600 mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">{productData.shipping}</span>
                </div>
              </div>



              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color: <span className="font-semibold text-gray-900">{selectedColor}</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {tshirtColors.map((color) => (
                    <button 
                      key={color.name} 
                      onClick={() => handleColorChange(color.name)} 
                      className={`relative w-14 h-14 border-2 rounded-full transition-all duration-200 hover:scale-105 ${
                        selectedColor === color.name
                          ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2'
                          : 'border-gray-300 hover:border-[#009fe3]'
                      }`}
                      title={color.name}
                    >
                      <div 
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: color.hex }}
                      />
                      {selectedColor === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-lg" />
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
                    className="text-sm text-[#009fe3] hover:text-blue-600 underline"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {tshirtSizes.map((size) => (
                    <button 
                      key={size} 
                      onClick={() => handleSizeChange(size)} 
                      className={`px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedSize === size 
                          ? 'border-[#009fe3] bg-[#009fe3] text-white' 
                          : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
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
                  className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <span>Buy Now - £{(variantData.price * quantity).toFixed(2)}</span>
                </button>
                
                <button 
                  onClick={handleAddToCart} 
                  className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart - £{(variantData.price * quantity).toFixed(2)}</span>
                </button>
                
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setIsWishlisted(!isWishlisted)} 
                    className={`flex-1 border-2 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      isWishlisted 
                        ? 'border-red-500 text-red-500 bg-red-50' 
                        : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
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
                  <p className="text-xs text-gray-600">Best Shipping Rates</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-[#009fe3] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Secure Checkout</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-[#009fe3] mx-auto mb-2" />
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
                      activeTab === tab 
                        ? 'border-[#009fe3] text-[#009fe3]' 
                        : 'border-transparent text-gray-500 hover:text-gray-700'
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
                  <p className="text-gray-700 leading-relaxed">{productData.description}</p>
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Materials:</h4>
                    <p className="text-gray-700">{productData.materials}</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'features' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {productData.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
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
                          <Star key={i} className={`w-4 h-4 ${i < variantData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                                              <span className="text-sm text-gray-600">({variantData.reviews} reviews)</span>
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
                      <p className="text-blue-800">{productData.careInstructions}</p>
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

export default TshirtPage; 