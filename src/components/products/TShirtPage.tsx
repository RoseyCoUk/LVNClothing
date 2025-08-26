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
import { usePrintfulProduct, usePrintfulVariants } from '../../hooks/usePrintfulProducts';

// Fix: Add proper TypeScript interfaces
interface Color {
  name: string;
  value: string;
  border?: boolean;
}

interface Variant {
  id: number;
  color: string;
  price: number;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviews: number;
  images: string[];
  printful_variant_id: number;
  size: string;
}

interface Variants {
  [key: number]: Variant;
}

interface TshirtPageProps {
  onBack: () => void;
}

const TshirtPage = ({ onBack }: TshirtPageProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  // Fetch Printful product data
  const { product: printfulProduct, loading: productLoading, error: productError } = usePrintfulProduct(1);
  const { variants: printfulVariants, loading: variantsLoading, error: variantsError } = usePrintfulVariants(1);
  
  // State
  const [currentVariant, setCurrentVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Product data with Printful integration
  const productData = {
    id: 1,
    name: printfulProduct?.name || "Reform UK T-Shirt",
    description: printfulProduct?.description || "Comfortable cotton t-shirt featuring the Reform UK logo. Made from premium cotton for all-day comfort and durability. A classic fit that works for any occasion.",
    features: ["100% premium cotton", "Classic fit", "Reinforced seams", "Pre-shrunk fabric", "Tagless for comfort", "Screen-printed logo"],
    careInstructions: "Machine wash cold. Tumble dry low. Do not bleach.",
    materials: "100% cotton",
    category: 'apparel',
    shipping: "Ships in 48H",
    defaultVariant: 201, // Default to Black
    variantDetails: {
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      colors: [
        { name: 'White', value: '#FFFFFF', border: true },
        { name: 'Light Grey', value: '#E5E5E5', border: true },
        { name: 'Ash Grey', value: '#B0B0B0' },
        { name: 'Charcoal', value: '#333333' },
        { name: 'Black', value: '#000000' },
        { name: 'Navy', value: '#1B365D' },
        { name: 'Red', value: '#B31217' },
        { name: 'Forest Green', value: '#2D5016' },
        { name: 'Burgundy', value: '#800020' },
        { name: 'Orange', value: '#FF8C00' },
        { name: 'Yellow', value: '#FFD667' },
        { name: 'Pink', value: '#FDbfC7' },
        { name: 'Athletic Heather', value: '#CECECC' },
        { name: 'Heather Dust', value: '#E5D9C9' },
        { name: 'Ash', value: '#F0F1EA' },
        { name: 'Mauve', value: '#BF6E6E' },
        { name: 'Steel Blue', value: '#668EA7' },
        { name: 'Mustard', value: '#EDA027' },
        { name: 'Heather Deep Teal', value: '#447085' },
        { name: 'Heather Prism Peach', value: '#F3C2B2' }
      ] as Color[]
    }
  };

  // Create variants from Printful data or fallback to local data
  const createVariants = (): Variants => {
    if (printfulVariants && printfulVariants.length > 0) {
      const variants: Variants = {};
      printfulVariants.forEach((variant, index) => {
        const variantId = 200 + index + 1;
        const colorName = variant.color || 'Black';
        const sizeName = variant.size || 'M';
        variants[variantId] = {
          id: variantId,
          color: colorName,
          price: parseFloat(variant.price),
          inStock: variant.in_stock,
          stockCount: variant.in_stock ? 25 : 0,
          rating: 5,
          reviews: 156,
          images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirt${colorName.replace(/\s+/g, '')}${i + 1}.webp`),
          printful_variant_id: variant.printful_variant_id,
          size: sizeName
        };
      });
      return variants;
    }
    
    // Fallback to local variants if Printful is not available
    return {
      // Black variants - 5 images each
      201: { id: 201, color: 'Black', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtBlack${i + 1}.webp`), printful_variant_id: 4016, size: 'M' },
      202: { id: 202, color: 'White', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtWhite${i + 1}.webp`), printful_variant_id: 4021, size: 'M' },
      203: { id: 203, color: 'Light Grey', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtLightGrey${i + 1}.webp`), printful_variant_id: 4041, size: 'M' },
      204: { id: 204, color: 'Ash Grey', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtAshGrey${i + 1}.webp`), printful_variant_id: 4046, size: 'M' },
      205: { id: 205, color: 'Charcoal', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtCharcoal${i + 1}.webp`), printful_variant_id: 4036, size: 'M' },
      206: { id: 206, color: 'Navy', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtBlue${i + 1}.webp`), printful_variant_id: 4026, size: 'M' },
      207: { id: 207, color: 'Red', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtRed${i + 1}.webp`), printful_variant_id: 4031, size: 'M' },
      208: { id: 208, color: 'Forest Green', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtGreen${i + 1}.webp`), printful_variant_id: 4051, size: 'M' },
      209: { id: 209, color: 'Burgundy', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtBurgundy${i + 1}.webp`), printful_variant_id: 4056, size: 'M' },
      210: { id: 210, color: 'Orange', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtOrange${i + 1}.webp`), printful_variant_id: 4061, size: 'M' },
      211: { id: 211, color: 'Yellow', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtYellow${i + 1}.webp`), printful_variant_id: 4066, size: 'M' },
      212: { id: 212, color: 'Pink', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtPink${i + 1}.webp`), printful_variant_id: 4071, size: 'M' },
      213: { id: 213, color: 'Athletic Heather', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtAthleticHeather${i + 1}.webp`), printful_variant_id: 4076, size: 'M' },
      214: { id: 214, color: 'Heather Dust', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtHeatherDust${i + 1}.webp`), printful_variant_id: 4081, size: 'M' },
      215: { id: 215, color: 'Ash', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtAsh${i + 1}.webp`), printful_variant_id: 4086, size: 'M' },
      216: { id: 216, color: 'Mauve', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtMauve${i + 1}.webp`), printful_variant_id: 4091, size: 'M' },
      217: { id: 217, color: 'Steel Blue', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtSteelBlue${i + 1}.webp`), printful_variant_id: 4096, size: 'M' },
      218: { id: 218, color: 'Mustard', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtMustard${i + 1}.webp`), printful_variant_id: 4101, size: 'M' },
      219: { id: 219, color: 'Heather Deep Teal', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtHeatherDeepTeal${i + 1}.webp`), printful_variant_id: 4106, size: 'M' },
      220: { id: 220, color: 'Heather Prism Peach', price: 24.99, inStock: true, stockCount: 25, rating: 5, reviews: 156, images: Array.from({ length: 5 }, (_, i) => `/Tshirt/Men/ReformMenTshirtHeatherPrismPeach${i + 1}.webp`), printful_variant_id: 4111, size: 'M' }
    } as Variants;
  };

  const variants = createVariants();
  
  // Set initial variant
  useEffect(() => {
    if (variants && Object.keys(variants).length > 0) {
      const defaultVariant = variants[productData.defaultVariant];
      if (defaultVariant) {
        setCurrentVariant(defaultVariant);
        setSelectedColor(defaultVariant.color);
      }
    }
  }, [variants]);

  // Effect to update the variant when color changes
  useEffect(() => {
    if (variants && selectedColor) {
      const newVariant = Object.values(variants).find(
        (variant: Variant) => variant.color === selectedColor
      );
      if (newVariant && newVariant.id !== currentVariant?.id) {
        setCurrentVariant(newVariant);
        setSelectedImage(0); // Reset to the first image when the variant changes
      }
    }
  }, [selectedColor, currentVariant?.id, variants]);

  // Loading state
  if (productLoading || variantsLoading || !currentVariant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#009fe3] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state - fallback to local data instead of showing error
  if (productError || variantsError) {
    console.warn('Printful API error, falling back to local data:', { productError, variantsError });
    // Continue with local data instead of showing error
  }

  const handleAddToCart = () => {
    if (!selectedColor) {
      alert('Please select a color.');
      return;
    }
    if (!selectedSize) {
      alert('Please select a size.');
      return;
    }
    
    const itemToAdd = {
      id: `${currentVariant.id}-${selectedSize}`,
      name: `${productData.name} - ${currentVariant.color} (Size: ${selectedSize})`,
      price: currentVariant.price,
      image: currentVariant.images[0],
      size: selectedSize,
      quantity: quantity,
      printful_variant_id: currentVariant.printful_variant_id
    };
    addToCart(itemToAdd);
  };

  const handleBuyNow = () => {
    if (!selectedColor) {
      alert('Please select a color.');
      return;
    }
    if (!selectedSize) {
      alert('Please select a size.');
      return;
    }
    
    // Add to cart first
    handleAddToCart();
    
    // Navigate to checkout
    navigate('/checkout');
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % currentVariant.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + currentVariant.images.length) % currentVariant.images.length);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const reviews = [
    { id: 1, name: "David P.", rating: 5, date: "1 week ago", comment: "Great quality t-shirt, fits perfectly and looks fantastic!", verified: true },
    { id: 2, name: "Sarah L.", rating: 5, date: "2 weeks ago", comment: "Love the design, very well made and comfortable.", verified: true },
    { id: 3, name: "Mark T.", rating: 4, date: "3 weeks ago", comment: "Good t-shirt, material is soft and durable.", verified: true }
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
                <span className="text-[#009fe3] font-semibold">{productData.name}</span>
              </div>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div key={currentVariant.id} className="space-y-4">
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                <img
                  src={currentVariant.images[selectedImage]}
                  alt={`${productData.name} - ${currentVariant.color} - Image ${selectedImage + 1}`}
                  className="w-full h-full object-cover aspect-square"
                />
                
                {currentVariant.images.length > 1 && (
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
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentVariant.stockCount <= 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {currentVariant.stockCount <= 10 ? `Only ${currentVariant.stockCount} left` : 'In Stock'}
                  </span>
                </div>
                
                {currentVariant.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs z-10">
                    {selectedImage + 1} / {currentVariant.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {currentVariant.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {currentVariant.images.map((image, index) => (
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
                      <Star key={i} className={`w-5 h-5 ${i < currentVariant.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">({currentVariant.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-3 mb-6">
                  <span className="text-3xl font-bold text-[#009fe3]">£{currentVariant.price.toFixed(2)}</span>
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
                <div className="grid grid-cols-10 gap-2">
                  {productData.variantDetails.colors.map((color) => (
                    <button 
                      key={color.name} 
                      onClick={() => handleColorSelect(color.name)} 
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
                          <Check className={`w-5 h-5 ${color.name === 'White' || color.name === 'Light Grey' ? 'text-gray-600' : 'text-white'}`} />
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
                  {productData.variantDetails.sizes.map((size) => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)} 
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
                  <span>Buy Now - £{(currentVariant.price * quantity).toFixed(2)}</span>
                </button>
                
                <button 
                  onClick={handleAddToCart} 
                  className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart - £{(currentVariant.price * quantity).toFixed(2)}</span>
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
                          <Star key={i} className={`w-4 h-4 ${i < currentVariant.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({currentVariant.reviews} reviews)</span>
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