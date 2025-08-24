import { useState, useEffect } from 'react';
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
  Clock,
  Loader2
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { createCheckoutSession } from '../../lib/stripe';
import { supabase } from '../../lib/supabase';
import OrderOverviewModal from '../OrderOverviewModal';
import { usePrintfulProduct } from '../../hooks/usePrintfulProducts';
import { useVariantSelection } from '../../hooks/useVariantSelection';
import { useStickerAddons, getAvailableStickers } from '../../hooks/useStickerAddons';
import StickerAddonSelector from '../StickerAddonSelector';
import type { PrintfulProduct, PrintfulVariant } from '../../types/printful';

// Enhanced TypeScript interfaces for Printful integration
interface Color {
  name: string;
  value: string;
  border?: boolean;
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

// Default product data for fallback (when Printful data is loading)
const defaultProductData = {
  id: 2,
  name: "Reform UK T-Shirt",
  description: "Comfortable cotton t-shirt featuring the Reform UK logo. Made from premium cotton for all-day comfort and durability. A classic fit that works for any occasion.",
  features: ["100% premium cotton", "Classic fit", "Reinforced seams", "Pre-shrunk fabric", "Tagless for comfort", "Screen-printed logo"],
  careInstructions: "Machine wash cold. Tumble dry low. Do not bleach.",
  materials: "100% cotton",
  category: 'apparel',
  shipping: "Ships in 48H",
  variantDetails: {
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    colors: [
        { name: 'Black', value: '#000000', border: true }, 
        { name: 'White', value: '#FFFFFF', border: true }, 
        { name: 'Navy', value: '#0B4C8A', border: true }
    ] as Color[]
  }
};

interface TShirtPageProps {
  onBack: () => void;
}

const TShirtPage = ({ onBack }: TShirtPageProps) => {
  const { addToCart, addToCartAndGetUpdated } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderOverview, setShowOrderOverview] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderToConfirm | null>(null);
  const navigate = useNavigate();
  
  // Printful integration - using a sample t-shirt product ID
  // In production, you'd get this from your product catalog
  const { product: printfulProduct, loading: printfulLoading, error: printfulError } = usePrintfulProduct(1);
  
  // Use Printful data if available, otherwise fall back to default data
  const productData = printfulProduct || defaultProductData;
  
  // Variant selection hook
  const {
    selection,
    availableColors,
    availableSizes,
    selectedVariant,
    setColor,
    setSize,
    isVariantAvailable,
    getVariantPrice,
    resetSelection
  } = useVariantSelection(printfulProduct?.variants || []);
  
  // Get fallback colors and sizes when Printful fails
  const fallbackColors = defaultProductData.variantDetails.colors.map(c => c.name);
  const fallbackSizes = defaultProductData.variantDetails.sizes;
  
  // Use Printful data if available, otherwise fall back to default data
  const effectiveColors = availableColors.length > 0 ? availableColors : fallbackColors;
  const effectiveSizes = availableSizes.length > 0 ? availableSizes : fallbackSizes;
  
  // Fallback function for checking variant availability when Printful fails
  const isVariantAvailableFallback = (color: string, size: string) => {
    if (printfulProduct?.variants && printfulProduct.variants.length > 0) {
      return isVariantAvailable(color, size);
    }
    // When using fallback data, all combinations are available
    return fallbackColors.includes(color) && fallbackSizes.includes(size);
  };

  // Initialize selection with first available color and size if not set
  useEffect(() => {
    if (!selection.color && effectiveColors.length > 0) {
      setColor(effectiveColors[0]);
    }
    if (!selection.size && effectiveSizes.length > 0) {
      setSize(effectiveSizes[0]);
    }
  }, [effectiveColors, effectiveSizes, selection.color, selection.size, setColor, setSize]);

  // State
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Sticker add-ons
  const {
    selectedStickers,
    updateStickerQuantity,
    getTotalStickerPrice
  } = useStickerAddons();

  // Available stickers for t-shirts
  const availableStickers = getAvailableStickers('tshirt');

  // Get current product images (use Printful variant image or fallback)
  const currentImages = selectedVariant?.image 
    ? [selectedVariant.image]
    : (() => {
        // Fallback to default images based on selected color
        const colorImageMap: Record<string, string> = {
          'Black': '/Tshirt/Men/ReformMenTshirtBlack1.webp',
          'White': '/Tshirt/Men/ReformMenTshirtWhite1.webp',
          'Navy': '/Tshirt/Men/ReformMenTshirtBlue1.webp'
        };
        return [colorImageMap[selection.color] || '/Tshirt/Men/ReformMenTshirtBlack1.webp'];
      })();

  // Helper function to get default color codes for colors
  const getDefaultColorCode = (color: string): string => {
    const colorMap: Record<string, string> = {
      'Black': '#000000',
      'White': '#FFFFFF',
      'Navy': '#0B4C8A',
      'Charcoal': '#333333',
      'Light Grey': '#E5E5E5',
      'Ash Grey': '#B0B0B0',
      'Royal Blue': '#0B4C8A',
      'Red': '#B31217'
    };
    return colorMap[color] || '#CCCCCC';
  };

  // Get current price including stickers
  const basePrice = selectedVariant ? parseFloat(selectedVariant.price) : 24.99;
  const stickerPrice = getTotalStickerPrice();
  const currentPrice = basePrice + stickerPrice;

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setColor(color);
    setSelectedImage(0);
  };

  // Handle size selection
  const handleSizeSelect = (size: string) => {
    setSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select a variant.');
      return;
    }
    
    // Add main product to cart
    const itemToAdd = {
      id: `${selectedVariant.id}-${selection.size}`,
      name: `${productData.name} - ${selection.color} (Size: ${selection.size})`,
      price: basePrice,
      image: currentImages[0],
      quantity: quantity,
      printful_variant_id: selectedVariant.printful_variant_id
    };
    
    addToCart(itemToAdd);
    
    // Add stickers to cart
    selectedStickers.forEach(stickerItem => {
      const stickerCartItem = {
        id: `sticker-${stickerItem.sticker.id}`,
        name: `${stickerItem.sticker.name} (Add-on)`,
        price: stickerItem.sticker.price,
        image: stickerItem.sticker.image,
        quantity: stickerItem.quantity,
        printful_variant_id: stickerItem.sticker.printful_variant_id
      };
      addToCart(stickerCartItem);
    });
    
    // Show success message
    alert('Added to cart!');
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      alert('Please select a variant.');
      return;
    }

    setIsLoading(true);
    try {
      const cartItems = addToCartAndGetUpdated({
        id: `${selectedVariant.id}-${selection.size}`,
        name: `${productData.name} - ${selection.color} (Size: ${selection.size})`,
        price: basePrice,
        image: currentImages[0],
        printful_variant_id: selectedVariant.printful_variant_id
      });

      // Add stickers to cart for checkout
      selectedStickers.forEach(stickerItem => {
        const stickerCartItem = {
          id: `sticker-${stickerItem.sticker.id}`,
          name: `${stickerItem.sticker.name} (Add-on)`,
          price: stickerItem.sticker.price,
          image: stickerItem.sticker.image,
          quantity: stickerItem.quantity,
          printful_variant_id: stickerItem.sticker.printful_variant_id
        };
        addToCart(stickerCartItem);
      });

      const checkoutRequest = {
        line_items: cartItems.map(item => ({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: item.name,
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.quantity,
        })),
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/shop`,
        mode: 'payment' as const,
      };

      const session = await createCheckoutSession(checkoutRequest);
      if (session?.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error creating checkout session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setSelectedImage((prev) => (prev + 1) % currentImages.length);
    } else {
      setSelectedImage((prev) => (prev - 1 + currentImages.length) % currentImages.length);
    }
  };

  // Loading state
  if (printfulLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (printfulError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error loading product</p>
            <p>{printfulError}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to Shop
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={currentImages[selectedImage]}
                alt={`${productData.name} - ${selection.color}`}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageChange('prev')}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleImageChange('next')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {currentImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {currentImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${productData.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{productData.name}</h1>
              <p className="text-xl text-gray-600 mt-2">{productData.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">£{currentPrice.toFixed(2)}</span>
              {selectedVariant && (
                <span className="text-sm text-gray-500">
                  {selectedVariant.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              )}
            </div>

            {/* Variant Selection */}
            <div className="space-y-4">
              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {effectiveColors.map((color) => {
                    // Get the color code for this color
                    const colorCode = getDefaultColorCode(color);
                    const isSelected = selection.color === color;
                    
                    return (
                      <button
                        key={color}
                        onClick={() => handleColorSelect(color)}
                        className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: colorCode }}
                        title={color}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600 mt-2">Selected: <span className="font-medium">{selection.color}</span></p>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {effectiveSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      disabled={!isVariantAvailableFallback(selection.color, size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        selection.size === size
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : isVariantAvailableFallback(selection.color, size)
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || !selectedVariant.in_stock}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5 inline mr-2" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant || !selectedVariant.in_stock || isLoading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Buy Now'
                )}
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex items-center space-x-4 pt-4 border-t">
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isWishlisted
                    ? 'text-red-600 bg-red-50 border border-red-200'
                    : 'text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50">
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>

            {/* Product Features */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Features</h3>
              <ul className="space-y-2">
                {('features' in productData && productData.features) ? 
                  productData.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))
                  : (
                    <li className="flex items-center text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      100% premium cotton
                    </li>
                  )
                }
              </ul>
            </div>

            {/* Care Instructions */}
            {('careInstructions' in productData && productData.careInstructions) && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Care Instructions</h3>
                <p className="text-gray-600">{productData.careInstructions}</p>
              </div>
            )}

            {/* Materials */}
            {('materials' in productData && productData.materials) && (
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Materials</h3>
                <p className="text-gray-600">{productData.materials}</p>
              </div>
            )}

            {/* Sticker Add-ons */}
            <StickerAddonSelector
              availableStickers={availableStickers}
              selectedStickers={selectedStickers}
              onStickerChange={(sticker, quantity) => updateStickerQuantity(sticker.id, quantity)}
              className="pt-6 border-t"
            />
          </div>
        </div>
      </div>

      {/* Order Overview Modal */}
      {showOrderOverview && orderToConfirm && (
        <OrderOverviewModal
          productDetails={{
            productName: orderToConfirm.productName,
            productImage: orderToConfirm.productImage,
            price: orderToConfirm.price,
            quantity: orderToConfirm.quantity,
            priceId: orderToConfirm.priceId,
            variants: orderToConfirm.variants,
            isBundle: false,
            bundleContents: []
          }}
          onClose={() => setShowOrderOverview(false)}
          onConfirm={() => {
            setShowOrderOverview(false);
            navigate('/checkout');
          }}
        />
      )}
    </div>
  );
};

export default TShirtPage;
