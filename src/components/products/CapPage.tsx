import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingCart,
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
import { CapVariants, findCapVariantByCatalogId, capColors, findCapVariantByColor } from '../../hooks/cap-variants';
import { useMergedProducts } from '../../hooks/useMergedProducts';
import { Toast, useToast } from '../../components/ui/Toast';
import { sortColorsByBrightness } from '../../lib/colorUtils';

// --- FIX: Cap data is moved OUTSIDE the component to ensure it's a stable constant ---
const getCapProductData = (mergedProduct: any) => ({
  id: mergedProduct?.id || 3,
  name: mergedProduct?.name || "Reform UK Cap",
  description: mergedProduct?.description || "Adjustable cap with embroidered Reform UK logo. Features a classic 6-panel design with a curved visor and adjustable strap for the perfect fit.",
  features: ["Embroidered logo", "Adjustable strap", "Curved visor", "6-panel construction", "Breathable fabric", "One size fits most"],
  careInstructions: "Spot clean only. Air dry.",
  materials: "100% cotton twill",
  category: mergedProduct?.category || 'apparel',
  shipping: "Fast UK Delivery",
  defaultVariant: 301, // Default to first variant
  variantDetails: {
    // Use database colors if available, fallback to static colors
    colors: mergedProduct?.colorOptions || capColors
  }
});

// Create variants from Printful data
const createCapVariants = () => {
  const variants: { [key: number]: any } = {};
  let variantId = 300;
  
  CapVariants.forEach((variant) => {
    variantId++;
    
    variants[variantId] = {
      id: variantId,
      color: variant.color,
      price: parseFloat(variant.price || '19.99'),
      inStock: true,
      stockCount: 18,
      rating: 5,
      reviews: 92,
      printful_variant_id: variant.catalogVariantId, // Real Printful external ID for ordering
      external_id: variant.externalId,
      images: Array.from({ length: 7 }, (_, i) => `/Cap/ReformCap${variant.color.replace(/\s+/g, '')}${i + 1}.webp`)
    };
  });
  
  return variants;
};

const variants = createCapVariants();

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
  const { addToCart, addToCartAndGetUpdated } = useCart();
  const { isVisible, message, showToast, hideToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderOverview, setShowOrderOverview] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderToConfirm | null>(null);
  const navigate = useNavigate();
  
  // Use merged products hook to get database colors
  const { mergedProducts, isLoading: productsLoading, error, getProductByCategory } = useMergedProducts();
  
  // Get cap product from merged products
  const capProduct = getProductByCategory('cap') || getProductByCategory('individual-cap');
  const productData = getCapProductData(capProduct);
  
  // Get product images based on selected color from database (same pattern as working Hoodie page)
  const getProductImages = () => {
    if (!capProduct?.baseProduct?.images || capProduct.baseProduct.images.length === 0) {
      // Fallback to logo if no images in merged product
      return ['/BackReformLogo.png'];
    }
    
    const mergedImages = capProduct.baseProduct.images;
    
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
      : [capProduct.image_url || '/BackReformLogo.png'];
  };
  
  // State for product display and selection
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('description');
    // Initialize selected color when colors are available
  React.useEffect(() => {
    if (!selectedColor && productData.variantDetails.colors.length > 0) {
      setSelectedColor(productData.variantDetails.colors[0].name);
    }
  }, [productData.variantDetails.colors, selectedColor]);

  // Get current variant based on selected color
  const getCurrentVariant = () => {
    if (!selectedColor) {
      return variants[productData.defaultVariant as keyof typeof variants];
    }
    const variant = Object.values(variants).find(
      variant => variant.color === selectedColor
    );
    return variant || variants[productData.defaultVariant as keyof typeof variants];
  };
  
  const currentVariant = getCurrentVariant();
  
  // Effect to reset image when color changes
  useEffect(() => {
    setSelectedImage(0); // Reset to the first image when color changes
  }, [selectedColor]);

  const handleAddToCart = () => {
    if (!selectedColor) {
      alert('Please select a color.');
      return;
    }
    
    // Find the correct variant for the selected color
    const selectedVariant = findCapVariantByColor(selectedColor);
    if (!selectedVariant) {
      alert('Selected color variant not found.');
      return;
    }
    
    const itemToAdd = {
      id: currentVariant.id,
      name: `${productData.name} (${selectedColor})`,
      price: currentVariant.price,
      image: getProductImages()[0] || '/BackReformLogo.png',
      quantity: quantity,
      printful_variant_id: selectedVariant.catalogVariantId
    };
    addToCart(itemToAdd);
    
    // Show success message
    showToast(`Added to cart!`);
  };

  const handleBuyNow = () => {
    if (!selectedColor) {
      alert('Please select a color.');
      return;
    }
    
    // Find the correct variant for the selected color
    const selectedVariant = findCapVariantByColor(selectedColor);
    if (!selectedVariant) {
      alert('Selected color variant not found.');
      return;
    }
    
    // Add to cart and get updated cart items
    const itemToAdd = {
      id: `${currentVariant.id}-${selectedColor}`,
      name: `${productData.name} - ${selectedColor}`,
      price: currentVariant.price,
      image: getProductImages()[0] || '/BackReformLogo.png',
      color: selectedColor,
      quantity: quantity,
      printful_variant_id: selectedVariant.catalogVariantId
    };
    
    const updatedCartItems = addToCartAndGetUpdated(itemToAdd);
    
    // Store cart items in sessionStorage to ensure they're available on checkout page
    sessionStorage.setItem('tempCartItems', JSON.stringify(updatedCartItems));
    
    // Navigate to checkout
    navigate('/checkout');
  };

  const handleConfirmCheckout = async () => {
    if (!orderToConfirm) {
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
    const images = getProductImages();
    if (images.length > 1) {
      setSelectedImage((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = getProductImages();
    if (images.length > 1) {
      setSelectedImage((prev) => (prev + 1 + images.length) % images.length);
    }
  };

  const reviews = [
    { id: 1, name: "David P.", rating: 5, date: "1 week ago", comment: "Great quality cap, fits perfectly and looks fantastic!", verified: true },
    { id: 2, name: "Sarah L.", rating: 5, date: "2 weeks ago", comment: "Love the embroidered logo, very well made.", verified: true },
    { id: 3, name: "Mark T.", rating: 4, date: "3 weeks ago", comment: "Good cap, adjustable strap works well.", verified: true }
  ];

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    // Reset image to first when color changes (handled by useEffect)
  };

  // Loading state
  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#009fe3] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Cap details...</p>
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
          <div key={`${currentVariant.id}-${selectedColor}`} className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                src={getProductImages()[selectedImage] || getProductImages()[0] || '/BackReformLogo.png'}
                alt={`${productData.name} - ${selectedColor || currentVariant.color} - Image ${selectedImage + 1}`}
                className="w-full h-full object-cover aspect-square"
              />
              
              {getProductImages().length > 1 && (
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
              
              {getProductImages().length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs z-10">
                  {selectedImage + 1} / {getProductImages().length}
                </div>
              )}
            </div>

            {getProductImages().length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {getProductImages().map((image, index) => (
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
                {sortColorsByBrightness(productData.variantDetails.colors).map((color) => (
                  <button key={color.name} onClick={() => handleColorSelect(color.name)} className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${selectedColor === color.name ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2' : color.border ? 'border-gray-300 hover:border-gray-400' : 'border-gray-200 hover:border-gray-300'}`} style={{ backgroundColor: color.hex }} title={color.name}>
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
              
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center"><Truck className="w-6 h-6 text-[#009fe3] mx-auto mb-2" /><p className="text-xs text-gray-600">Fast UK Shipping</p></div>
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