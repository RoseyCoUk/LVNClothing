import { useState, useEffect } from 'react';
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
import { createCheckoutSession } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';
import OrderOverviewModal from '../OrderOverviewModal';

// --- FIX: Cap data is moved OUTSIDE the component to ensure it's a stable constant ---
const productData = {
  id: 3,
  name: "Reform UK Cap",
  description: "Adjustable cap with embroidered Reform UK logo. Features a classic 6-panel design with a curved visor and adjustable strap for the perfect fit.",
  features: ["Embroidered logo", "Adjustable strap", "Curved visor", "6-panel construction", "Breathable fabric", "One size fits most"],
  careInstructions: "Spot clean only. Air dry.",
  materials: "100% cotton twill",
  category: 'apparel',
  shipping: "Ships in 48H",
  defaultVariant: 305, // Default to Black
  variantDetails: {
    // No genders or sizes for this product, only colors.
    colors: [
        { name: 'White', value: '#FFFFFF', border: true }, { name: 'Light Blue', value: '#a6b9c6' }, { name: 'Charcoal', value: '#393639' }, { name: 'Navy', value: '#1c2330' }, { name: 'Black', value: '#000000' }, { name: 'Red', value: '#8e0a1f' }
    ]
  },
  variants: {
    // Each color is a variant. Assuming 3 images per cap color.
    301: { id: 301, color: 'White', price: 19.99, inStock: true, stockCount: 18, rating: 5, reviews: 92, images: Array.from({ length: 7 }, (_, i) => `/Cap/ReformCapWhite${i + 1}.webp`) },
    302: { id: 302, color: 'Light Blue', price: 19.99, inStock: true, stockCount: 18, rating: 5, reviews: 92, images: Array.from({ length: 7 }, (_, i) => `/Cap/ReformCapBlue${i + 1}.webp`) },
    303: { id: 303, color: 'Charcoal', price: 19.99, inStock: true, stockCount: 18, rating: 5, reviews: 92, images: Array.from({ length: 7 }, (_, i) => `/Cap/ReformCapCharcoal${i + 1}.webp`) },
    304: { id: 304, color: 'Navy', price: 19.99, inStock: true, stockCount: 18, rating: 5, reviews: 92, images: Array.from({ length: 7 }, (_, i) => `/Cap/ReformCapNavy${i + 1}.webp`) },
    305: { id: 305, color: 'Black', price: 19.99, inStock: true, stockCount: 18, rating: 5, reviews: 92, images: Array.from({ length: 7 }, (_, i) => `/Cap/ReformCapBlack${i + 1}.webp`) },
    306: { id: 306, color: 'Red', price: 19.99, inStock: true, stockCount: 18, rating: 5, reviews: 92, images: Array.from({ length: 7 }, (_, i) => `/Cap/ReformCapRed${i + 1}.webp`) },
  }
};

interface CapPageProps {
  onBack: () => void;
}

interface OrderToConfirm {
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  priceId: string;
  variants: {
    color: string;
    size: string;
  };
}

const CapPage = ({ onBack }: CapPageProps) => {
  const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderOverview, setShowOrderOverview] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderToConfirm | null>(null);
  
  const defaultVariant = productData.variants[productData.defaultVariant as keyof typeof productData.variants];

  // State
  const [currentVariant, setCurrentVariant] = useState(defaultVariant);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(defaultVariant.color);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Effect to update the variant when color changes
  useEffect(() => {
    const newVariant = Object.values(productData.variants).find(
      variant => variant.color === selectedColor
    );
    // Only update state if the variant has actually changed
    if (newVariant && newVariant.id !== currentVariant.id) {
      setCurrentVariant(newVariant);
      setSelectedImage(0); // Reset to the first image ONLY when the variant changes
    }
  }, [selectedColor, currentVariant.id]);

  const handleAddToCart = () => {
    if (!selectedColor) {
      alert('Please select a color.');
      return;
    }
    
    // Updated the name to include the selected color
    const itemToAdd = {
      id: currentVariant.id,
      name: `${productData.name} (${currentVariant.color})`,
      price: currentVariant.price,
      image: currentVariant.images[0],
      quantity: quantity
    };
    addToCart(itemToAdd);
  };

  const handleBuyNow = () => {
    if (!selectedColor) {
      alert('Please select a color.');
      return;
    }
    // Add to cart
    const itemToAdd = {
      id: currentVariant.id,
      name: `${productData.name} - ${selectedColor}`,
      price: currentVariant.price,
      image: currentVariant.images[0],
      quantity: quantity
    };
    addToCart(itemToAdd);
    // Redirect to checkout
    window.location.href = '/checkout';
  };

  const handleConfirmCheckout = async () => {
    if (!orderToConfirm) {
      console.error('No order to confirm');
      return;
    }
    
    setShowOrderOverview(false);
    setIsLoading(true);
    
    try {
      const { url } = await createCheckoutSession({
        price_id: orderToConfirm.priceId,
        success_url: `${window.location.origin}?success=true`,
        cancel_url: window.location.href,
        mode: 'payment',
        customer_email: await promptForEmail()
      });
      
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      
      // Show a more user-friendly error message
      if (error instanceof Error && error.message.includes('Stripe API key is not configured')) {
        alert('Stripe payment is not configured. This is expected in development environment.');
      } else {
        alert('Failed to start checkout process. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to prompt for email if user is not logged in
  const promptForEmail = async (): Promise<string> => {
    // Check if user is logged in via Supabase
    const { data } = await supabase.auth.getSession();
    if (data.session?.user?.email) {
      return data.session.user.email;
    }
    
    // If not logged in, prompt for email
    const email = prompt('Please enter your email address to receive order confirmation:');
    if (!email) {
      throw new Error('Email is required for checkout');
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    return email;
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % currentVariant.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + currentVariant.images.length) % currentVariant.images.length);
  };

  const reviews = [
    { id: 1, name: "David P.", rating: 5, date: "1 week ago", comment: "Great quality cap, fits perfectly and looks fantastic!", verified: true },
    { id: 2, name: "Sarah L.", rating: 5, date: "2 weeks ago", comment: "Love the embroidered logo, very well made.", verified: true },
    { id: 3, name: "Mark T.", rating: 4, date: "3 weeks ago", comment: "Good cap, adjustable strap works well.", verified: true }
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
                    {selectedColor === color.name && (<div className="absolute inset-0 flex items-center justify-center"><Check className={`w-5 h-5 ${color.name === 'White' || color.name === 'Light Blue' ? 'text-gray-600' : 'text-white'}`} /></div>)}
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

            {/* Selection Summary */}
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Your Selection:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Color: <span className="font-medium text-gray-900">{selectedColor}</span></p>
                <p>Size: <span className="font-medium text-gray-900">One Size</span></p>
                <p>Quantity: <span className="font-medium text-gray-900">{quantity}</span></p>
              </div>
            </div>

            {/* Add to Cart & Actions */}
            <div className="space-y-3">
              <button 
                onClick={handleBuyNow}
                disabled={isLoading}
                className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Buy Now - £{currentVariant.price.toFixed(2)}
                  </>
                )}
              </button>
              
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Instructions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2"><Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" /><p className="text-blue-800">{productData.careInstructions}</p></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      
      {/* Order Overview Modal */}
      {showOrderOverview && orderToConfirm && (
        <OrderOverviewModal
          productDetails={orderToConfirm}
          onClose={() => setShowOrderOverview(false)}
          onConfirm={handleConfirmCheckout}
        />
      )}
    </>
  );
};

export default CapPage;