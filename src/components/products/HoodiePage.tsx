import React, { useState, useEffect } from 'react';
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

// --- Data defined once, outside the component ---
const baseProductData = {
  id: 1,
  name: "Reform UK Hoodie",
  description: "Premium quality hoodie made from 100% organic cotton. Features the Reform UK logo prominently displayed on the front with a comfortable kangaroo pocket and adjustable drawstring hood. Perfect for showing your support while staying warm and comfortable.",
  features: ["100% organic cotton fleece", "Kangaroo pocket", "Adjustable drawstring hood", "Ribbed cuffs and hem", "Machine washable", "Ethically sourced materials"],
  careInstructions: "Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed.",
  materials: "80% organic cotton, 20% recycled polyester",
  category: 'apparel',
  shipping: "Ships in 24H",
  defaultVariant: 105, // Default to Men's Black
  variantDetails: {
    genders: ['Men', 'Women'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
        { name: 'White', value: '#FFFFFF', border: true }, { name: 'Light Grey', value: '#E5E5E5', border: true }, { name: 'Ash Grey', value: '#B0B0B0' }, { name: 'Charcoal', value: '#333333' }, { name: 'Black', value: '#000000' }, { name: 'Royal Blue', value: '#0B4C8A' }, { name: 'Red', value: '#B31217' }
    ]
  },
  variants: {} // Variants will be generated below
};

// --- FIX: Programmatically generate all variants to prevent typos and ensure consistency ---
const generateVariants = () => {
    const variants = {};
    let menIdCounter = 101;
    let womenIdCounter = 111;

    baseProductData.variantDetails.genders.forEach(gender => {
        baseProductData.variantDetails.colors.forEach(color => {
            const id = gender === 'Men' ? menIdCounter++ : womenIdCounter++;
            const imageCount = gender === 'Men' ? 6 : 5;
            // Systematically remove spaces for filenames, e.g., "Light Grey" -> "LightGrey"
            const colorFileName = color.name === 'Royal Blue' ? 'Blue' : color.name.replace(/\s/g, '');

            variants[id] = {
                id,
                gender,
                color: color.name,
                price: 49.99,
                inStock: true,
                stockCount: gender === 'Men' ? 15 : 12,
                rating: 5,
                reviews: gender === 'Men' ? 127 : 115,
                images: Array.from({ length: imageCount }, (_, i) => `Hoodie/${gender}/Reform${gender}Hoodie${colorFileName}${i + 1}.webp`)
            };
        });
    });
    return variants;
};

const productData = {
    ...baseProductData,
    variants: generateVariants()
};


interface HoodiePageProps {
  onBack: () => void;
}

const HoodiePage = ({ onBack }: HoodiePageProps) => {
  const { addToCart } = useCart();

  const defaultVariant = productData.variants[productData.defaultVariant];

  // State
  const [currentVariant, setCurrentVariant] = useState(defaultVariant);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState(defaultVariant.color);
  const [selectedGender, setSelectedGender] = useState(defaultVariant.gender);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Effect to update the variant when color or gender changes
  useEffect(() => {
    const newVariant = Object.values(productData.variants).find(
      variant => variant.gender === selectedGender && variant.color === selectedColor
    );
    if (newVariant && newVariant.id !== currentVariant.id) {
      setCurrentVariant(newVariant);
      setSelectedImage(0);
    }
  }, [selectedColor, selectedGender, currentVariant.id]);

  const handleAddToCart = () => {
    if (!selectedColor) { alert('Please select a color.'); return; }
    if (!selectedSize) { alert('Please select a size.'); return; }
    
    const itemToAdd = {
      id: `${currentVariant.id}-${selectedSize}`,
      name: `${productData.name} - ${currentVariant.gender}'s ${currentVariant.color} (Size: ${selectedSize})`,
      price: currentVariant.price,
      image: currentVariant.images[0],
      size: selectedSize,
      quantity: quantity
    };
    addToCart(itemToAdd);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % currentVariant.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + currentVariant.images.length) % currentVariant.images.length);
  };
  
  const reviews = [ { id: 1, name: "Sarah M.", rating: 5, date: "2 weeks ago", comment: "Excellent quality and fast shipping. Love the design!", verified: true }, { id: 2, name: "James T.", rating: 5, date: "1 month ago", comment: "Perfect fit and great material. Highly recommend!", verified: true }, { id: 3, name: "Emma L.", rating: 4, date: "3 weeks ago", comment: "Good quality, exactly as described. Will order again.", verified: true } ];

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                key={currentVariant.images[selectedImage]}
                src={currentVariant.images[selectedImage]}
                alt={`${productData.name} - ${currentVariant.color} - ${currentVariant.gender} - Image ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />
              
              {currentVariant.images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10" aria-label="Previous image"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10" aria-label="Next image"><ChevronRight className="w-5 h-5" /></button>
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

            {currentVariant.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {currentVariant.images.map((image, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-[#009fe3]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <img src={image} alt={`${productData.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
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
                  {[...Array(5)].map((_, i) => (<Star key={i} className={`w-5 h-5 ${i < currentVariant.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}
                </div>
                <span className="text-gray-600">({currentVariant.reviews} reviews)</span>
              </div>
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-[#009fe3]">£{currentVariant.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-2 text-green-600 mb-6">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{productData.shipping}</span>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Color: <span className="font-semibold text-gray-900">{selectedColor}</span></label>
              <div className="flex flex-wrap gap-3">
                {productData.variantDetails.colors.map((color) => (
                  <button key={color.name} onClick={() => setSelectedColor(color.name)} className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${selectedColor === color.name ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2' : color.border ? 'border-gray-300 hover:border-gray-400' : 'border-gray-200 hover:border-gray-300'}`} style={{ backgroundColor: color.value }} title={color.name}>
                    {selectedColor === color.name && (<div className="absolute inset-0 flex items-center justify-center"><Check className={`w-5 h-5 ${color.name === 'White' || color.name === 'Light Grey' ? 'text-gray-600' : 'text-white'}`} /></div>)}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
              <div className="flex gap-3">
                {productData.variantDetails.genders.map((gender) => (
                  <button key={gender} onClick={() => setSelectedGender(gender)} className={`px-6 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${selectedGender === gender ? 'border-[#009fe3] bg-[#009fe3] text-white' : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'}`}>
                    {gender}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Size</label>
              <div className="flex flex-wrap gap-2">
                {productData.variantDetails.sizes.map((size) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${selectedSize === size ? 'border-[#009fe3] bg-[#009fe3] text-white' : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
              <div className="flex items-center space-x-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Add to Cart & Actions */}
            <div className="space-y-3 pt-4">
              <button onClick={handleAddToCart} className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart - £{(currentVariant.price * quantity).toFixed(2)}</span>
              </button>
              <div className="flex space-x-3">
                <button onClick={() => setIsWishlisted(!isWishlisted)} className={`flex-1 border-2 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 ${isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'}`}>
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
                </button>
                <button className="border-2 border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3] font-semibold p-3 rounded-lg transition-colors flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['description', 'features', 'reviews', 'care'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab ? 'border-[#009fe3] text-[#009fe3]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
          <div className="py-8">
            {/* Tab Content */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoodiePage;