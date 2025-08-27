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
import { useBundlePricing } from '../../hooks/useBundlePricing';
import type { PrintfulProduct, PrintfulVariant, BundleProduct, BundleItem } from '../../types/printful';
import { Toast, useToast } from '../../components/ui/Toast';

interface BundlePageProps {
  onBack: () => void;
}

const StarterBundlePage = ({ onBack }: BundlePageProps) => {
  const { addToCart, addToCartAndGetUpdated } = useCart();
  const { isVisible, message, showToast, hideToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderOverview, setShowOrderOverview] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<any>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);

  // Bundle products state
  const [bundleProducts, setBundleProducts] = useState<BundleItem[]>([]);

  // Image browsing state
  const [selectedItem, setSelectedItem] = useState('tshirt');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch Printful products for the bundle
  const { product: tshirtProduct, loading: tshirtLoading } = usePrintfulProduct(1); // T-shirt
  const { product: capProduct, loading: capLoading } = usePrintfulProduct(3); // Cap
  const { product: mugProduct, loading: mugLoading } = usePrintfulProduct(4); // Mug

  // Bundle calculation hook
  const {
    calculation,
    addItem,
    removeItem,
    clearBundle,
    getItemCount
  } = useBundleCalculation(bundleProducts, setBundleProducts);

  // Get bundle pricing from the new system
  const { bundlePricing } = useBundlePricing();
  const starterPricing = bundlePricing.starter;

  // Initialize bundle with products when they load
  useEffect(() => {
    if (tshirtProduct && capProduct && mugProduct && bundleProducts.length === 0) {
      // Add default variants to bundle
      const defaultTshirtVariant = tshirtProduct.variants[0];
      const defaultCapVariant = capProduct.variants[0];
      const defaultMugVariant = mugProduct.variants[0];
      
      if (defaultTshirtVariant && defaultCapVariant && defaultMugVariant) {
        addItem(tshirtProduct, defaultTshirtVariant);
        addItem(capProduct, defaultCapVariant);
        addItem(mugProduct, defaultMugVariant);
      }
    }
  }, [tshirtProduct, capProduct, mugProduct, bundleProducts.length, addItem]);

  // Loading state
  if (tshirtLoading || capLoading || mugLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#009fe3]" />
          <p className="text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  // Default bundle data
  const bundleData = {
    name: "Starter Bundle",
    originalPrice: "£44.97",
    bundlePrice: 34.99,
    savings: "Save £9.98",
    description: "Perfect for newcomers to the Reform UK movement. This starter bundle includes our signature T-shirt, cap, and mug, giving you everything you need to show your support.",
    shipping: "Free UK Shipping",
    urgency: "Limited Time Offer",
    popular: true,
    rating: 4.8,
    reviews: 156,
    features: [
      "High-quality cotton T-shirt with Reform UK branding",
      "Adjustable cap with Reform UK logo",
      "Ceramic mug with Reform UK branding",
      "Great value bundle with significant savings",
      "Perfect introduction to Reform UK merchandise",
      "Free UK shipping included",
      "30-day money-back guarantee"
    ],
    careInstructions: "Machine wash T-shirt at 30°C. Hand wash cap and mug. Mug is dishwasher and microwave safe.",
    materials: "Premium cotton T-shirt, adjustable cap, and ceramic mug"
  };

  // Get T-shirt images based on selected color
  const getTshirtImages = (color: string) => {
    // Map color names to image paths (same as tshirt page)
    const colorMap: { [key: string]: string } = {
      'White': 'White',
      'Ash': 'AshGrey',
      'Heather Prism Peach': 'AshGrey', // Using AshGrey images for Peach
      'Light Grey': 'LightGrey',
      'Heather Dust': 'AshGrey', // Using AshGrey images for Dust
      'Athletic Heather': 'LightGrey', // Using LightGrey images for Athletic Heather
      'Yellow': 'Yellow',
      'Pink': 'Pink',
      'Ash Grey': 'AshGrey',
      'Orange': 'Orange',
      'Mustard': 'Yellow', // Using Yellow images for Mustard
      'Mauve': 'Red', // Using Red images for Mauve
      'Steel Blue': 'Blue', // Using Blue images for Steel Blue
      'Heather Deep Teal': 'Blue', // Using Blue images for Deep Teal
      'Forest Green': 'Green', // Using Green images for Forest Green
      'Navy': 'Navy',
      'Charcoal': 'Charcoal',
      'Burgundy': 'Red', // Using Red images for Burgundy
      'Red': 'Red',
      'Black': 'Black'
    };
    
    const colorKey = colorMap[color] || color;
    
    return [
      `/Tshirt/Men/ReformMenTshirt${colorKey}1.webp`,
      `/Tshirt/Men/ReformMenTshirt${colorKey}2.webp`,
      `/Tshirt/Men/ReformMenTshirt${colorKey}3.webp`,
      `/Tshirt/Men/ReformMenTshirt${colorKey}4.webp`,
      `/Tshirt/Men/ReformMenTshirt${colorKey}5.webp`,
      `/Tshirt/Men/ReformMenTshirt${colorKey}6.webp`
    ];
  };

  // Get Cap images
  const getCapImages = () => {
    return [
      `/Cap/ReformCapBlack1.webp`,
      `/Cap/ReformCapBlack2.webp`,
      `/Cap/ReformCapBlack3.webp`,
      `/Cap/ReformCapBlack4.webp`,
      `/Cap/ReformCapBlack5.webp`,
      `/Cap/ReformCapBlack6.webp`,
      `/Cap/ReformCapBlack7.webp`
    ];
  };

  // Get Mug images
  const getMugImages = () => {
    return [
      `/MugMouse/ReformMug1.webp`,
      `/MugMouse/ReformMug2.webp`,
      `/MugMouse/ReformMug3.webp`,
      `/MugMouse/ReformMug4.webp`,
      `/MugMouse/ReformMug5.webp`
    ];
  };

  const getCurrentImages = () => {
    if (selectedItem === 'tshirt') {
      const tshirtItem = bundleProducts.find(item => item.product.category === 'tshirt');
      return tshirtItem ? getTshirtImages(tshirtItem.variant.color) : [];
    } else if (selectedItem === 'cap') {
      return getCapImages();
    } else if (selectedItem === 'mug') {
      return getMugImages();
    }
    return [];
  };

  const getCurrentImage = () => {
    const images = getCurrentImages();
    return images[currentImageIndex] || images[0] || '';
  };

  const getVariantText = (item: BundleItem): string => {
    if (item.product.category === 'tshirt') {
      return `${item.variant.color} (Size ${item.variant.size})`;
    }
    if (item.product.category === 'cap') {
      return `${item.variant.color} Cap`;
    }
    if (item.product.category === 'mug') {
      return `${item.variant.color} Mug`;
    }
    return `${item.variant.color} ${item.variant.size}`;
  };

  const handleItemClick = (itemType: string) => {
    setSelectedItem(itemType);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    const images = getCurrentImages();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    const images = getCurrentImages();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  // Handle variant changes for bundle items
  const handleVariantChange = (productId: number, variantType: 'color' | 'size', value: string) => {
    setBundleProducts(prev => 
      prev.map(item => {
        if (item.product.id === productId) {
          // Find a new variant with the updated property
          const newVariant = item.product.variants.find(variant => {
            if (variantType === 'color') {
              // For caps (which only have one size), just match color
              if (item.product.category === 'cap') {
                return variant.color === value;
              }
              // For other products, match both color and size
              return variant.color === value && variant.size === item.variant.size;
            } else if (variantType === 'size') {
              // For caps, size changes are not applicable
              if (item.product.category === 'cap') {
                return false;
              }
              // For other products, match both size and color
              return variant.size === value && variant.color === item.variant.color;
            }
            return false;
          });
          
          if (newVariant) {
            return { ...item, variant: newVariant };
          }
        }
        return item;
      })
    );
    
    // Reset image index when color changes
    if (variantType === 'color') {
      setCurrentImageIndex(0);
    }
  };

  const handleAddToCart = () => {
    if (bundleProducts.length === 0) {
      alert('Please wait for bundle to load.');
      return;
    }

    const bundleContents = bundleProducts.map(item => ({
      name: item.product.name,
      variant: getVariantText(item),
      image: item.variant.image || item.product.image || '/starterbundle.png'
    }));

    addToCart({
      id: 'starter-bundle',
      name: bundleData.name,
      price: calculation?.totalPrice || bundleData.bundlePrice,
      image: bundleProducts[0]?.variant?.image || bundleProducts[0]?.product.image || '/starterbundle.png',
      isBundle: true,
      bundleContents: bundleContents
    });
    
    // Show success message
    showToast(`Added to cart!`);
  };

  const handleBuyNow = () => {
    if (bundleProducts.length === 0) {
      alert('Please wait for bundle to load.');
      return;
    }

    const bundleContents = bundleProducts.map(item => ({
      name: item.product.name,
      variant: getVariantText(item),
      image: item.variant.image || item.product.image || '/starterbundle.png'
    }));

    const itemToAdd = {
      id: 'starter-bundle',
      name: 'Starter Bundle',
      price: calculation?.totalPrice || bundleData.bundlePrice,
      image: bundleProducts[0]?.variant?.image || bundleProducts[0]?.product.image || '/starterbundle.png',
      quantity: quantity,
      isBundle: true,
      bundleContents: bundleContents
    };

    const updatedCartItems = addToCartAndGetUpdated(itemToAdd);
    
    // Store cart items in sessionStorage to ensure they're available on checkout page
    sessionStorage.setItem('tempCartItems', JSON.stringify(updatedCartItems));
    
    // Navigate to checkout
    navigate('/checkout');
  };

  const reviews = [
    {
      id: 1,
      name: "Sarah M.",
      rating: 5,
      date: "2 days ago",
      comment: "Perfect starter bundle! The T-shirt is comfortable and the cap fits great. Great value for money.",
      verified: true
    },
    {
      id: 2,
      name: "David L.",
      rating: 5,
      date: "1 week ago",
      comment: "Excellent quality products. The mug is sturdy and the bundle price is unbeatable. Highly recommend!",
      verified: true
    },
    {
      id: 3,
      name: "Emma R.",
      rating: 4,
      date: "2 weeks ago",
      comment: "Great introduction to Reform UK merchandise. All items arrived quickly and in perfect condition.",
      verified: true
    }
  ];

  const currentImages = getCurrentImages();
  const hasMultipleImages = currentImages.length > 1;
  const selectedItemData = bundleProducts.find(item => item.product.category === selectedItem);

  return (
    <>
      <Toast 
        message={message}
        isVisible={isVisible}
        onClose={hideToast}
        duration={3000}
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image Area */}
              <div className="relative">
                <img 
                  src={getCurrentImage()} 
                  alt={bundleData.name} 
                  className="w-full object-cover rounded-lg shadow-lg aspect-square"
                />
                
                {/* Image Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {currentImages.length}
                  </div>
                )}

                {/* Current Item Indicator */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                    {bundleData.urgency}
                  </span>
                </div>

                {/* Viewing Indicator */}
                {selectedItemData && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      Viewing: {selectedItemData?.product.name}
                      {selectedItem === 'tshirt' && ` - ${selectedItemData.variant.color}`}
                      {selectedItem === 'cap' && ` - ${selectedItemData.variant.color}`}
                      {selectedItem === 'mug' && ` - ${selectedItemData.variant.color}`}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Bundle Items Grid - Clickable Thumbnails */}
              <div className="grid grid-cols-3 gap-4">
                {bundleProducts.map((item) => (
                  <button
                    key={item.product.category}
                    onClick={() => handleItemClick(item.product.category)}
                    className={`text-center transition-all duration-200 ${
                      selectedItem === item.product.category 
                        ? 'ring-2 ring-[#009fe3] ring-offset-2' 
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <img 
                      src={
                        item.product.category === 'tshirt' ? getTshirtImages(item.variant.color)[0] : 
                        item.product.category === 'cap' ? getCapImages()[0] :
                        item.product.category === 'mug' ? getMugImages()[0] :
                        item.variant.image || item.product.image
                      } 
                      alt={item.product.name} 
                      className={`w-full object-cover rounded-lg border-2 transition-all duration-200 aspect-square ${
                        selectedItem === item.product.category 
                          ? 'border-[#009fe3]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    <p className={`text-sm mt-2 font-medium ${
                      selectedItem === item.product.category 
                        ? 'text-[#009fe3]' 
                        : 'text-gray-600'
                    }`}>
                      {item.product.name}
                    </p>
                  </button>
                ))}
              </div>

              {/* Image Thumbnails for Current Item */}
              {hasMultipleImages && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {currentImages.map((image, index) => (
                    <button 
                      key={index} 
                      onClick={() => setCurrentImageIndex(index)} 
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index 
                          ? 'border-[#009fe3]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${selectedItemData?.product.name} thumbnail ${index + 1}`} 
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{bundleData.name}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < bundleData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">({bundleData.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl font-bold text-[#009fe3]">£{bundleData.bundlePrice.toFixed(2)}</span>
                  <span className="text-lg text-gray-500 line-through">{bundleData.originalPrice}</span>
                  <span className="text-lg font-semibold text-green-600">{bundleData.savings}</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600 mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">{bundleData.shipping}</span>
                </div>
              </div>

              {/* T-shirt Customization */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your T-shirt</h3>
                
                {/* Size Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Size</label>
                    <button 
                      onClick={() => navigate('/size-guide')}
                      className="text-sm text-[#009fe3] hover:text-blue-600 underline"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button 
                        key={size} 
                        onClick={() => {
                          const tshirtItem = bundleProducts.find(item => item.product.category === 'tshirt');
                          if (tshirtItem) {
                            handleVariantChange(tshirtItem.product.id, 'size', size);
                          }
                        }} 
                        className={`px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                          bundleProducts.find(item => item.product.category === 'tshirt')?.variant?.size === size 
                            ? 'border-[#009fe3] bg-[#009fe3] text-white' 
                            : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color: <span className="font-semibold text-gray-900">
                    {bundleProducts.find(item => item.product.category === 'tshirt')?.variant?.color || 'Black'}
                  </span></label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { name: 'White', value: '#FFFFFF', border: true },
                      { name: 'Ash', value: '#F0F1EA' },
                      { name: 'Heather Prism Peach', value: '#F3C2B2' },
                      { name: 'Light Grey', value: '#E5E5E5', border: true },
                      { name: 'Heather Dust', value: '#E5D9C9' },
                      { name: 'Athletic Heather', value: '#CECECC' },
                      { name: 'Yellow', value: '#FFD667' },
                      { name: 'Pink', value: '#FDbfC7' },
                      { name: 'Ash Grey', value: '#B0B0B0' },
                      { name: 'Orange', value: '#FF8C00' },
                      { name: 'Mustard', value: '#EDA027' },
                      { name: 'Mauve', value: '#BF6E6E' },
                      { name: 'Steel Blue', value: '#668EA7' },
                      { name: 'Heather Deep Teal', value: '#447085' },
                      { name: 'Forest Green', value: '#2D5016' },
                      { name: 'Navy', value: '#1B365D' },
                      { name: 'Charcoal', value: '#333333' },
                      { name: 'Burgundy', value: '#800020' },
                      { name: 'Red', value: '#B31217' },
                      { name: 'Black', value: '#000000' }
                    ].map((color) => (
                      <button 
                        key={color.name} 
                        onClick={() => {
                          const tshirtItem = bundleProducts.find(item => item.product.category === 'tshirt');
                          if (tshirtItem) {
                            handleVariantChange(tshirtItem.product.id, 'color', color.name);
                          }
                        }} 
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          bundleProducts.find(item => item.product.category === 'tshirt')?.variant?.color === color.name 
                            ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2' 
                            : color.border 
                              ? 'border-gray-300 hover:border-gray-400' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        style={{ backgroundColor: color.value }} 
                        title={color.name}
                      >
                        {bundleProducts.find(item => item.product.category === 'tshirt')?.variant?.color === color.name && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className={`w-5 h-5 ${color.name === 'White' || color.name === 'Light Grey' || color.name === 'Ash' || color.name === 'Athletic Heather' || color.name === 'Heather Dust' || color.name === 'Heather Prism Peach' ? 'text-gray-600' : 'text-white'}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cap Customization */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your Cap</h3>
                
                {/* Color Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color: <span className="font-semibold text-gray-900">
                    {bundleProducts.find(item => item.product.category === 'cap')?.variant?.color || 'Black'}
                  </span></label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'White', value: '#FFFFFF', border: true },
                      { name: 'Light Grey', value: '#E5E5E5', border: true },
                      { name: 'Ash Grey', value: '#B0B0B0' },
                      { name: 'Charcoal', value: '#333333' },
                      { name: 'Black', value: '#000000' },
                      { name: 'Royal Blue', value: '#0B4C8A' },
                      { name: 'Red', value: '#B31217' }
                    ].map((color) => (
                      <button 
                        key={color.name} 
                        onClick={() => {
                          const capItem = bundleProducts.find(item => item.product.category === 'cap');
                          if (capItem) {
                            handleVariantChange(capItem.product.id, 'color', color.name);
                          }
                        }} 
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          bundleProducts.find(item => item.product.category === 'cap')?.variant?.color === color.name 
                            ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2' 
                            : color.border 
                              ? 'border-gray-300 hover:border-gray-400' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        style={{ backgroundColor: color.value }} 
                        title={color.name}
                      >
                        {bundleProducts.find(item => item.product.category === 'cap')?.variant?.color === color.name && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className={`w-5 h-5 ${color.name === 'White' || color.name === 'Light Grey' ? 'text-gray-600' : 'text-white'}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bundle Pricing */}
              {starterPricing && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Bundle Savings</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Individual Price: <span className="font-medium">£{starterPricing.originalPrice.toFixed(2)}</span></p>
                    <p>• Bundle Price: <span className="font-medium text-green-600">£{starterPricing.price.toFixed(2)}</span></p>
                    <p>• You Save: <span className="font-medium text-green-600">£{starterPricing.savings.absolute.toFixed(2)} ({starterPricing.savings.percentage.toFixed(0)}%)</span></p>
                    <p className="text-blue-700">• Shipping: <span className="font-medium">Best rates applied</span></p>
                  </div>
                </div>
              )}

              {/* Bundle Contents */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Bundle Contents:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Reform UK T-shirt: <span className="font-medium text-gray-900">
                    {bundleProducts.find(item => item.product.category === 'tshirt')?.variant?.color || 'Black'} 
                    (Size {bundleProducts.find(item => item.product.category === 'tshirt')?.variant?.size || 'M'})
                  </span></p>
                  <p>• Reform UK Cap: <span className="font-medium text-gray-900">
                    {bundleProducts.find(item => item.product.category === 'cap')?.variant?.color || 'Black'}
                  </span></p>
                  <p>• Reform UK Mug: <span className="font-medium text-gray-900">White</span></p>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart & Actions */}
              <div className="space-y-3">
                <button 
                  onClick={handleBuyNow}
                  disabled={isLoading || bundleProducts.length === 0}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Buy Now - £{(calculation?.totalPrice || bundleData.bundlePrice).toFixed(2)}
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleAddToCart} 
                  disabled={bundleProducts.length === 0}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart - £{((calculation?.totalPrice || bundleData.bundlePrice) * quantity).toFixed(2)}</span>
                </button>
                <div className="flex space-x-3">
                  <button onClick={() => setIsWishlisted(!isWishlisted)} className={`flex-1 border-2 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
                  }`}>
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
                  <p className="text-gray-700 leading-relaxed">{bundleData.description}</p>
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Materials:</h4>
                    <p className="text-gray-700">{bundleData.materials}</p>
                  </div>
                </div>
              )}
              {activeTab === 'features' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {bundleData.features.map((feature, index) => (
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
                          <Star key={i} className={`w-4 h-4 ${i < bundleData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({bundleData.reviews} reviews)</span>
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
                            <Star key={i} className={`w-4 h-4 ${review.rating > i ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
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
                      <p className="text-blue-800">{bundleData.careInstructions}</p>
                    </div>
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
    </>
  );
};

export default StarterBundlePage; 