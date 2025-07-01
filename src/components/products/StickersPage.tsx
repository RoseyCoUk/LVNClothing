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

// --- Data moved OUTSIDE the component to prevent re-creation on render ---
const productData = {
  id: 8,
  name: "Reform UK Stickers",
  description: "Set of weatherproof Reform UK stickers. Perfect for laptops, water bottles, cars, and more. Includes various sizes and designs.",
  features: ["Weatherproof vinyl", "UV resistant", "Strong adhesive", "Various sizes", "Multiple designs", "Easy application"],
  careInstructions: "Apply to clean, dry surface.",
  materials: "Vinyl with permanent adhesive",
  category: 'gear',
  shipping: "Ships in 24H",
  defaultVariant: 801, // Default to the 10-pack
  variantDetails: {
    // Variants are based on pack size for this product
    packSizes: ['10', '25', '50', '100'],
    // Images are the same for all variants, assuming 4 showcase images
    images: Array.from({ length: 6 }, (_, i) => `ReformStickersMain${i + 1}.webp`)
  },
  variants: {
    801: { id: 801, packSize: '10', price: 6.99, inStock: true, stockCount: 100, rating: 5, reviews: 234 },
    802: { id: 802, packSize: '25', price: 14.99, inStock: true, stockCount: 80, rating: 5, reviews: 234 },
    803: { id: 803, packSize: '50', price: 27.99, inStock: true, stockCount: 50, rating: 5, reviews: 234 },
    804: { id: 804, packSize: '100', price: 49.99, inStock: true, stockCount: 30, rating: 5, reviews: 234 },
  }
};

interface StickersPageProps {
  onBack: () => void;
}

const StickersPage = ({ onBack }: StickersPageProps) => {
  const { addToCart } = useCart();
  
  const defaultVariant = productData.variants[productData.defaultVariant];

  // State
  const [currentVariant, setCurrentVariant] = useState(defaultVariant);
  const [selectedPackSize, setSelectedPackSize] = useState(defaultVariant.packSize);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Effect to update the variant when pack size changes
  useEffect(() => {
    const newVariant = Object.values(productData.variants).find(
      variant => variant.packSize === selectedPackSize
    );
    // Only update state if the variant has actually changed
    if (newVariant && newVariant.id !== currentVariant.id) {
      setCurrentVariant(newVariant);
    }
  }, [selectedPackSize, currentVariant.id]);

  const handleAddToCart = () => {
    if (!selectedPackSize) {
      alert('Please select a pack size.');
      return;
    }
    
    const itemToAdd = {
      id: currentVariant.id,
      name: `${productData.name} (Pack of ${currentVariant.packSize})`,
      price: currentVariant.price,
      image: productData.variantDetails.images[0],
      packSize: currentVariant.packSize,
      quantity: quantity
    };
    addToCart(itemToAdd);
  };
  
  // All variants use the same images
  const images = productData.variantDetails.images;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const reviews = [
    { id: 1, name: "Mike D.", rating: 5, date: "1 week ago", comment: "Great quality stickers, stick well and look fantastic on my laptop!", verified: true },
    { id: 2, name: "Sarah J.", rating: 5, date: "2 weeks ago", comment: "Perfect for showing support, weatherproof and durable.", verified: true },
    { id: 3, name: "Tom W.", rating: 5, date: "3 weeks ago", comment: "Good variety of sizes, easy to apply.", verified: true }
  ];

  return (
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
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={images[selectedImage]}
                alt={`${productData.name} - Image ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10" aria-label="Previous image"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10" aria-label="Next image"><ChevronRight className="w-5 h-5" /></button>
                </>
              )}

              <div className="absolute top-4 left-4 z-10">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentVariant.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {currentVariant.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs z-10">
                  {selectedImage + 1} / {images.length}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
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

            {/* Pack Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Pack Size</label>
              <div className="flex flex-wrap gap-2">
                {productData.variantDetails.packSizes.map((packSize) => (
                  <button 
                    key={packSize} 
                    onClick={() => setSelectedPackSize(packSize)} 
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${selectedPackSize === packSize ? 'border-[#009fe3] bg-[#009fe3] text-white' : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'}`}
                  >
                    Pack of {packSize}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Quantity of Packs</label>
              <div className="flex items-center space-x-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            
            {/* Selection Summary */}
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Your Selection:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Pack Size: <span className="font-medium text-gray-900">{currentVariant.packSize} Stickers</span></p>
                <p>Quantity: <span className="font-medium text-gray-900">{quantity} pack{quantity > 1 ? 's' : ''}</span></p>
                <p>Total Stickers: <span className="font-medium text-gray-900">{quantity * parseInt(currentVariant.packSize)}</span></p>
              </div>
            </div>

            {/* Add to Cart & Actions */}
            <div className="space-y-3">
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

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center"><Truck className="w-6 h-6 text-[#009fe3] mx-auto mb-2" /><p className="text-xs text-gray-600">Free UK Shipping Over £30</p></div>
              <div className="text-center"><Shield className="w-6 h-6 text-[#009fe3] mx-auto mb-2" /><p className="text-xs text-gray-600">Secure Checkout</p></div>
              <div className="text-center"><RotateCcw className="w-6 h-6 text-[#009fe3] mx-auto mb-2" /><p className="text-xs text-gray-600">Easy Returns</p></div>
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
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{productData.description}</p>
                <div className="mt-6"><h4 className="font-semibold text-gray-900 mb-2">Materials:</h4><p className="text-gray-700">{productData.materials}</p></div>
              </div>
            )}
            {activeTab === 'features' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Features</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productData.features.map((feature, index) => (<li key={index} className="flex items-center space-x-2"><Check className="w-4 h-4 text-green-500 flex-shrink-0" /><span className="text-gray-700">{feature}</span></li>))}
                </ul>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < currentVariant.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}</div>
                    <span className="text-sm text-gray-600">({currentVariant.reviews} reviews)</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2"><span className="font-semibold text-gray-900">{review.name}</span>{review.verified && (<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified Purchase</span>)}</div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex items-center mb-2">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}</div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'care' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Instructions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2"><Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /><p className="text-blue-800">{productData.careInstructions}</p></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickersPage;