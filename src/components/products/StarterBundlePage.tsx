import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Check, 
  Plus, 
  Minus, 
  Clock, 
  Truck, 
  Shield, 
  RotateCcw, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { createCheckoutSession } from '../../lib/stripe';
import OrderOverviewModal from '../OrderOverviewModal';
import { usePrintfulProduct } from '../../hooks/usePrintfulProducts';
import { useVariantSelection } from '../../hooks/useVariantSelection';
import { useBundleCalculation } from '../../hooks/useBundleCalculation';
import StickerAddonSelector from '../StickerAddonSelector';
import type { PrintfulProduct, PrintfulVariant, BundleProduct, BundleItem, StickerAddon } from '../../types/printful';

interface BundlePageProps {
  onBack: () => void;
}

const StarterBundlePage = ({ onBack }: BundlePageProps) => {
  const { addToCart, addToCartAndGetUpdated } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderOverview, setShowOrderOverview] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<any>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Bundle products state
  const [bundleProducts, setBundleProducts] = useState<BundleItem[]>([]);
  const [selectedStickers, setSelectedStickers] = useState<Array<{ sticker: StickerAddon; quantity: number }>>([]);

  // Fetch Printful products for the bundle
  const { product: tshirtProduct, loading: tshirtLoading } = usePrintfulProduct(1); // T-shirt
  const { product: stickerProduct, loading: stickerLoading } = usePrintfulProduct(2); // Stickers

  // Bundle calculation hook
  const {
    calculation,
    addItem,
    removeItem,
    updateItemQuantity,
    clearBundle,
    getItemCount
  } = useBundleCalculation(bundleProducts, setBundleProducts);

  // Initialize bundle with products when they load
  useEffect(() => {
    if (tshirtProduct && stickerProduct && bundleProducts.length === 0) {
      // Add default variants to bundle
      const defaultTshirtVariant = tshirtProduct.variants[0];
      const defaultStickerVariant = stickerProduct.variants[0];
      
      if (defaultTshirtVariant && defaultStickerVariant) {
        addItem(tshirtProduct, defaultTshirtVariant, 1);
        addItem(stickerProduct, defaultStickerVariant, 1);
      }
    }
  }, [tshirtProduct, stickerProduct, bundleProducts.length, addItem]);

  // Loading state
  if (tshirtLoading || stickerLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  // Default bundle data
  const bundleData = {
    name: "Starter Bundle",
    description: "Perfect for newcomers to the Reform UK movement. This starter bundle includes our signature T-shirt and a set of stickers, giving you everything you need to show your support.",
    features: [
      "High-quality cotton T-shirt with Reform UK branding",
      "Premium vinyl stickers for multiple surfaces",
      "Great value bundle with significant savings",
      "Perfect introduction to Reform UK merchandise",
      "Free UK shipping included",
      "30-day money-back guarantee"
    ],
    careInstructions: "Machine wash T-shirt at 30°C. Stickers can be applied to clean, dry surfaces.",
    materials: "Premium cotton T-shirt and high-quality vinyl stickers"
  };

  // Get current bundle image
  const currentBundleImage = bundleProducts.length > 0 
    ? bundleProducts[0]?.variant?.image || '/Tshirt/Men/ReformMenTshirtBlack1.webp'
    : '/Tshirt/Men/ReformMenTshirtBlack1.webp';

  // Handle sticker selection
  const handleStickerChange = (sticker: StickerAddon, newQuantity: number) => {
    setSelectedStickers(prev => {
      const existing = prev.find(s => s.sticker.id === sticker.id);
      if (existing) {
        if (newQuantity === 0) {
          return prev.filter(s => s.sticker.id !== sticker.id);
        } else {
          return prev.map(s => 
            s.sticker.id === sticker.id 
              ? { ...s, quantity: newQuantity }
              : s
          );
        }
      } else if (newQuantity > 0) {
        return [...prev, { sticker, quantity: newQuantity }];
      }
      return prev;
    });
  };

  // Calculate total price including stickers
  const totalPrice = (calculation?.totalPrice || 0) + 
    selectedStickers.reduce((sum, item) => sum + (item.sticker.price * item.quantity), 0);

  const handleAddToCart = () => {
    if (bundleProducts.length === 0) {
      alert('Please wait for bundle to load.');
      return;
    }

    // Add bundle items to cart
    bundleProducts.forEach(item => {
      const cartItem = {
        id: `bundle-${item.product.id}-${item.variant.id}`,
        name: `${bundleData.name} - ${item.product.name} (${item.variant.color}, ${item.variant.size})`,
        price: parseFloat(item.variant.price),
        image: item.variant.image || item.product.image || '',
        quantity: item.quantity,
        printful_variant_id: item.variant.printful_variant_id,
        isBundle: true,
        bundleContents: bundleProducts.map(bp => ({
          name: bp.product.name,
          variant: `${bp.variant.color} ${bp.variant.size}`,
          image: bp.variant.image || bp.product.image || ''
        }))
      };
      addToCart(cartItem);
    });

    // Add stickers to cart
    selectedStickers.forEach(item => {
      const cartItem = {
        id: `sticker-${item.sticker.id}`,
        name: `${item.sticker.name} (Add-on)`,
        price: item.sticker.price,
        image: item.sticker.image,
        quantity: item.quantity,
        printful_variant_id: item.sticker.printful_variant_id
      };
      addToCart(cartItem);
    });

    alert('Bundle added to cart!');
  };

  const handleBuyNow = async () => {
    if (bundleProducts.length === 0) {
      alert('Please wait for bundle to load.');
      return;
    }

    setIsLoading(true);
    try {
      // Add bundle to cart first
      const cartItems: any[] = [];
      
      bundleProducts.forEach(item => {
        cartItems.push({
          id: `bundle-${item.product.id}-${item.variant.id}`,
          name: `${bundleData.name} - ${item.product.name} (${item.variant.color}, ${item.variant.size})`,
          price: parseFloat(item.variant.price),
          image: item.variant.image || item.product.image || '',
          quantity: item.quantity,
          printful_variant_id: item.variant.printful_variant_id,
          isBundle: true,
          bundleContents: bundleProducts.map(bp => ({
            name: bp.product.name,
            variant: `${bp.variant.color} ${bp.variant.size}`,
            image: bp.variant.image || bp.product.image || ''
          }))
        });
      });

      // Add stickers
      selectedStickers.forEach(item => {
        cartItems.push({
          id: `sticker-${item.sticker.id}`,
          name: `${item.sticker.name} (Add-on)`,
          price: item.sticker.price,
          image: item.sticker.image,
          quantity: item.quantity,
          printful_variant_id: item.sticker.printful_variant_id
        });
      });

      const checkoutRequest = {
        line_items: cartItems.map(item => ({
          price_data: {
            currency: 'gbp',
            product_data: {
              name: item.name,
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100),
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

  // Available stickers for this bundle
  const availableStickers: StickerAddon[] = [
    {
      id: 'sticker-set-1',
      name: 'Reform UK Sticker Set',
      description: 'High-quality vinyl stickers featuring Reform UK branding',
      price: 4.99,
      image: '/StickerToteWater/ReformStickersMain1.webp',
      printful_variant_id: 1001,
      availableFor: ['tshirt', 'hoodie', 'cap', 'tote']
    },
    {
      id: 'sticker-set-2',
      name: 'Activist Sticker Pack',
      description: 'Additional stickers for maximum impact',
      price: 3.99,
      image: '/StickerToteWater/ReformStickersMain2.webp',
      printful_variant_id: 1002,
      availableFor: ['tshirt', 'hoodie', 'cap', 'tote']
    }
  ];

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
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Shop
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Bundle Details</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bundle Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
              <img
                src={currentBundleImage}
                alt={bundleData.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              {bundleProducts.length > 0 && bundleProducts[0]?.variant?.image && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => Math.min(bundleProducts.length - 1, prev + 1))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bundle Contents Preview */}
            {bundleProducts.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {bundleProducts.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border">
                    <img
                      src={item.variant?.image || item.product.image || ''}
                      alt={item.product.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-600">{item.variant?.color} {item.variant?.size}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bundle Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{bundleData.name}</h1>
              <p className="text-xl text-gray-600 mt-2">{bundleData.description}</p>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              {calculation && (
                <>
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-gray-900">£{totalPrice.toFixed(2)}</span>
                    <span className="text-lg text-gray-500 line-through">£{calculation.individualPrice.toFixed(2)}</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      Save £{calculation.savings.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    You save {calculation.savingsPercentage.toFixed(0)}% compared to buying items separately
                  </p>
                </>
              )}
            </div>

            {/* Bundle Contents */}
            {bundleProducts.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Bundle Contents</h3>
                <div className="space-y-3">
                  {bundleProducts.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.variant?.image || item.product.image || ''}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.variant?.color} {item.variant?.size} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateItemQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateItemQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sticker Add-ons */}
            <StickerAddonSelector
              availableStickers={availableStickers}
              selectedStickers={selectedStickers}
              onStickerChange={handleStickerChange}
            />

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Bundle Quantity</h3>
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

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={bundleProducts.length === 0}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-5 w-5 inline mr-2" />
                Add Bundle to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={bundleProducts.length === 0 || isLoading}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Buy Bundle Now'
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

            {/* Bundle Features */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Bundle Features</h3>
              <ul className="space-y-2">
                {bundleData.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Care Instructions */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Care Instructions</h3>
              <p className="text-gray-600">{bundleData.careInstructions}</p>
            </div>

            {/* Materials */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Materials</h3>
              <p className="text-gray-600">{bundleData.materials}</p>
            </div>
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
            isBundle: true,
            bundleContents: orderToConfirm.bundleContents || []
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

export default StarterBundlePage; 