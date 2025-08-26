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
import { usePrintfulProduct } from '../../hooks/usePrintfulProducts';
import { hoodieVariants, getHoodieVariant } from '../../hooks/hoodie-variants';

interface HoodiePageProps {
  onBack: () => void;
}

interface ColorOption {
  name: string;
  value: string;
  border?: boolean;
  availableSizes: string[];
}

interface SizeOption {
  name: string;
  available: boolean;
}

const HoodiePage: React.FC<HoodiePageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { product, loading, error } = usePrintfulProduct(2); // Hoodie product ID
  
  // State for variant selection
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Color options with proper size availability (all unisex, no XS)
  const colorOptions: ColorOption[] = [
    { name: 'Black', value: '#0b0b0b', availableSizes: ['S', 'M', 'L', 'XL', '2XL'] },
    { name: 'Navy', value: '#131928', availableSizes: ['S', 'M', 'L', 'XL', '2XL'] },
    { name: 'Red', value: '#da0a1a', availableSizes: ['S', 'M', 'L', 'XL', '2XL'] },
    { name: 'Dark Heather', value: '#47484d', availableSizes: ['S', 'M', 'L', 'XL', '2XL'] },
    { name: 'Indigo Blue', value: '#395d82', availableSizes: ['S', 'M', 'L', 'XL', '2XL'] },
    { name: 'Sport Grey', value: '#9b969c', availableSizes: ['S', 'M', 'L', 'XL', '2XL'] },
    { name: 'Light Blue', value: '#a1c5e1', availableSizes: ['S', 'M', 'L', 'XL', '2XL'] },
    { name: 'Light Pink', value: '#f3d4e3', availableSizes: ['S', 'M', 'L', 'XL', '2XL'] },
    { name: 'White', value: '#ffffff', border: true, availableSizes: ['S', 'M', 'L', 'XL', '2XL'] }
  ];

  const sizeOptions: SizeOption[] = [
    { name: 'S', available: true },
    { name: 'M', available: true },
    { name: 'L', available: true },
    { name: 'XL', available: true },
    { name: '2XL', available: true }
  ];

  // Set initial selections
  useEffect(() => {
    if (colorOptions.length > 0 && !selectedColor) {
      setSelectedColor(colorOptions[0].name);
    }
    if (sizeOptions.length > 0 && !selectedSize) {
      setSelectedSize(sizeOptions[0].name);
    }
  }, [colorOptions, sizeOptions]);

  // Find the selected variant
  useEffect(() => {
    if (selectedColor && selectedSize) {
      const variant = getHoodieVariant(selectedColor, selectedSize);
      setSelectedVariant(variant);
    }
  }, [selectedColor, selectedSize]);

  // Get available sizes for selected color
  const getAvailableSizesForColor = (colorName: string) => {
    const color = colorOptions.find(c => c.name === colorName);
    return color ? color.availableSizes : [];
  };

  // Check if size is available for selected color
  const isSizeAvailableForColor = (sizeName: string) => {
    const availableSizes = getAvailableSizesForColor(selectedColor);
    return availableSizes.includes(sizeName);
  };

  // Get product images based on selection (all unisex)
  const getProductImages = () => {
    if (!selectedColor) return [];
    
    // Map color names to image paths
    const colorMap: { [key: string]: string } = {
      'Black': 'Black',
      'Navy': 'Blue', // Using Blue images for Navy
      'Red': 'Red',
      'Dark Heather': 'Charcoal', // Using Charcoal images for Dark Heather
      'Indigo Blue': 'Blue',
      'Sport Grey': 'LightGrey',
      'Light Blue': 'Blue', // Using Blue images for Light Blue
      'Light Pink': 'Red', // Using Red images for Light Pink
      'White': 'White'
    };
    
    const colorKey = colorMap[selectedColor] || selectedColor;
    
    return [
      `/Hoodie/Men/ReformMenHoodie${colorKey}1.webp`,
      `/Hoodie/Men/ReformMenHoodie${colorKey}2.webp`,
      `/Hoodie/Men/ReformMenHoodie${colorKey}3.webp`,
      `/Hoodie/Men/ReformMenHoodie${colorKey}4.webp`,
      `/Hoodie/Men/ReformMenHoodie${colorKey}5.webp`,
      `/Hoodie/Men/ReformMenHoodie${colorKey}6.webp`
    ].filter(img => img.includes('undefined') === false);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const productData = {
      id: selectedVariant.id,
      name: `Reform UK Hoodie - ${selectedColor} (${selectedSize})`,
      price: parseFloat(selectedVariant.price),
      price_pence: Math.round(parseFloat(selectedVariant.price) * 100),
      quantity: quantity,
      image: getProductImages()[0] || '/Hoodie/Men/ReformMenHoodieBlack1.webp',
      variants: {
        size: selectedSize,
        color: selectedColor,
        printful_variant_id: selectedVariant.printful_variant_id
      }
    };

    addToCart(productData);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    
    // Add to cart first
    handleAddToCart();
    
    // Navigate to checkout
    navigate('/checkout');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading Hoodie details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading product: {error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
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
                      <Star key={i} className={`w-5 h-5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">(89 reviews)</span>
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
                <div className="grid grid-cols-9 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name);
                        // Reset size if not available for new color
                        if (!color.availableSizes.includes(selectedSize)) {
                          setSelectedSize(color.availableSizes[0] || 'M');
                        }
                      }}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        selectedColor === color.name
                          ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2'
                          : color.border
                            ? 'border-gray-300 hover:border-gray-400'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {selectedColor === color.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className={`w-4 h-4 ${color.name === 'White' ? 'text-gray-600' : 'text-white'}`} />
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
                  {sizeOptions.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      disabled={!isSizeAvailableForColor(size.name)}
                      className={`px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedSize === size.name
                          ? 'border-[#009fe3] bg-[#009fe3] text-white'
                          : !isSizeAvailableForColor(size.name)
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
                      }`}
                    >
                      {size.name}
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
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">(89 reviews)</span>
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
