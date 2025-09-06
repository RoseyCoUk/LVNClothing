import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
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
import { useBundleCalculation } from '../../hooks/useBundleCalculation';
import { useBundlePricing } from '../../hooks/useBundlePricing';
import { useMergedProducts } from '../../hooks/useMergedProducts';
import { useTshirtVariants } from '../../hooks/tshirt-variants-merged-fixed';
import { findCapVariantByColor } from '../../hooks/cap-variants';
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
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);

  // Bundle products state
  const [bundleProducts, setBundleProducts] = useState<BundleItem[]>([]);

  // Image browsing state
  const [selectedItem, setSelectedItem] = useState('tshirt');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use the same merged products system as individual product pages
  const { getProductByCategory, isLoading: mergedLoading, error: mergedError } = useMergedProducts();
  const tshirtVariantsHook = useTshirtVariants();
  const findTshirtVariant = tshirtVariantsHook?.findTshirtVariant;
  
  // Get products using the same method as individual pages
  const tshirtProduct = getProductByCategory('tshirt');
  const capProduct = getProductByCategory('cap');
  const mugProduct = getProductByCategory('mug');
  
  // Track variant selections
  const [tshirtSize, setTshirtSize] = useState('M');
  const [tshirtColor, setTshirtColor] = useState('Black');
  const [capColor, setCapColor] = useState('Black');
  const [selectedTshirtVariant, setSelectedTshirtVariant] = useState<any>(null);
  const [selectedCapVariant, setSelectedCapVariant] = useState<any>(null);
  const [selectedMugVariant, setSelectedMugVariant] = useState<any>(null);

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

  // Initialize bundle products when merged products are available
  useEffect(() => {
    if (tshirtProduct && capProduct && mugProduct && bundleProducts.length === 0) {
      // Create bundle items from merged products
      const tshirtBundleItem = {
        product: {
          id: tshirtProduct.id,
          name: tshirtProduct.name,
          category: 'tshirt',
          image: tshirtProduct.image_url,
          images: tshirtProduct.baseProduct?.images || [],
          variants: tshirtProduct.variants || []
        },
        variant: selectedTshirtVariant || tshirtProduct.variants?.[0] || {
          id: 'tshirt-default',
          color: tshirtColor,
          size: tshirtSize,
          price: tshirtProduct.priceRange?.min || '14.99',
          image: getTshirtImages()[0]
        }
      };
      
      const capBundleItem = {
        product: {
          id: capProduct.id,
          name: capProduct.name,
          category: 'cap',
          image: capProduct.image_url,
          images: capProduct.baseProduct?.images || [],
          variants: capProduct.variants || []
        },
        variant: selectedCapVariant || capProduct.variants?.[0] || {
          id: 'cap-default',
          color: capColor,
          price: capProduct.priceRange?.min || '12.99',
          image: getCapImages()[0]
        }
      };
      
      const mugBundleItem = {
        product: {
          id: mugProduct.id,
          name: mugProduct.name,
          category: 'mug',
          image: mugProduct.image_url,
          images: mugProduct.baseProduct?.images || [],
          variants: mugProduct.variants || []
        },
        variant: selectedMugVariant || mugProduct.variants?.[0] || {
          id: 'mug-default',
          color: 'White',
          price: mugProduct.priceRange?.min || '9.99',
          image: getMugImages()[0]
        }
      };
      
      setBundleProducts([tshirtBundleItem, capBundleItem, mugBundleItem]);
    }
  }, [tshirtProduct, capProduct, mugProduct, bundleProducts.length, selectedTshirtVariant, selectedCapVariant, selectedMugVariant]);

  // Update t-shirt variant when color/size changes
  useEffect(() => {
    if (tshirtColor && tshirtSize && findTshirtVariant) {
      const variant = findTshirtVariant('DARK', tshirtSize, tshirtColor) || 
                     findTshirtVariant('LIGHT', tshirtSize, tshirtColor);
      setSelectedTshirtVariant(variant);
    }
  }, [tshirtColor, tshirtSize, findTshirtVariant]);

  // Update cap variant when color changes
  useEffect(() => {
    if (capColor) {
      const variant = findCapVariantByColor(capColor);
      if (variant) {
        setSelectedCapVariant(variant);
      }
    }
  }, [capColor]);

  // Loading state
  if (mergedLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#009fe3]" />
          <p className="text-gray-600">Loading bundle details...</p>
        </div>
      </div>
    );
  }

  // Default bundle data - HARDCODED FOR IMMEDIATE FIX
  // TODO: Fix the pricing calculation issue causing £58.99 display
  const bundleData = {
    name: "Starter Bundle",
    originalPrice: "£54.97",
    bundlePrice: 49.99,  // MUST match Stripe price_1RhsUsGDbOGEgNLw2LAVZoGb
    savings: "Save £4.98",
    description: "Perfect for newcomers to the Reform UK movement. This starter bundle includes our signature T-shirt, cap, and mug, giving you everything you need to show your support.",
    shipping: "Fast UK Shipping",
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
      "Fast UK shipping available",
      "30-day money-back guarantee"
    ],
    careInstructions: "Machine wash T-shirt at 30°C. Hand wash cap and mug. Mug is dishwasher and microwave safe.",
    materials: "Premium cotton T-shirt, adjustable cap, and ceramic mug"
  };

  // Get T-shirt images based on selected color (same logic as TShirtPage)
  const getTshirtImages = () => {
    if (!tshirtProduct?.baseProduct?.images || tshirtProduct.baseProduct.images.length === 0) {
      return ['/BackReformLogo.png'];
    }
    
    const mergedImages = tshirtProduct.baseProduct.images;
    
    if (tshirtColor) {
      const selectedColorLower = tshirtColor.toLowerCase();
      
      // Try exact color match first
      const exactColorImages = mergedImages.filter(img => 
        img.variant_type === 'color' && 
        img.color?.toLowerCase() === selectedColorLower
      );
      
      if (exactColorImages.length > 0) {
        return exactColorImages
          .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          .map(img => img.image_url);
      }
    }
    
    // Fall back to general images
    const generalImages = mergedImages.filter(img => 
      img.variant_type === 'product' || img.variant_type === null
    );
    
    return generalImages.length > 0 
      ? generalImages.map(img => img.image_url)
      : [tshirtProduct.image_url || '/BackReformLogo.png'];
  };
  
  // Get Cap images (same logic as CapPage for consistent ordering)
  const getCapImages = () => {
    if (!capProduct?.baseProduct?.images || capProduct.baseProduct.images.length === 0) {
      return ['/BackReformLogo.png'];
    }
    
    const mergedImages = capProduct.baseProduct.images;
    
    // If a color is selected, try to get color-specific images first
    if (capColor) {
      const selectedColorLower = capColor.toLowerCase();
      
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
      return primaryImages
        .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
        .map(img => img.image_url);
    }
    
    // Priority 5: All available images as final fallback
    return mergedImages.length > 0 
      ? mergedImages
          .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          .map(img => img.image_url)
      : [capProduct.image_url || '/BackReformLogo.png'];
  };
  
  // Get Mug images
  const getMugImages = () => {
    if (!mugProduct?.baseProduct?.images || mugProduct.baseProduct.images.length === 0) {
      return ['/BackReformLogo.png'];
    }
    return mugProduct.baseProduct.images.map(img => img.image_url);
  };

  const getCurrentImages = () => {
    if (selectedItem === 'tshirt') {
      return getTshirtImages();
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

  const getVariantText = (category: string): string => {
    if (category === 'tshirt') {
      return `${tshirtColor} (Size ${tshirtSize})`;
    }
    if (category === 'cap') {
      return `${capColor} Cap`;
    }
    if (category === 'mug') {
      return `White Mug`;
    }
    return '';
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

  // Handle variant changes for t-shirt
  const handleTshirtVariantChange = (variantType: 'color' | 'size', value: string) => {
    if (variantType === 'color') {
      setTshirtColor(value);
    } else {
      setTshirtSize(value);
    }
    setCurrentImageIndex(0);
  };
  
  // Handle cap color change
  const handleCapColorChange = (color: string) => {
    setCapColor(color);
    // Use the cap variants hook to find the correct variant
    const capVariant = findCapVariantByColor(color);
    if (capVariant) {
      setSelectedCapVariant(capVariant);
    }
    setCurrentImageIndex(0);
  };

  const handleAddToCart = () => {
    if (!tshirtProduct || !capProduct || !mugProduct || bundleProducts.length === 0) {
      showToast('Please wait for bundle to load.');
      return;
    }

    console.log('DEBUG: Starting handleAddToCart');
    console.log('DEBUG: bundleProducts.length:', bundleProducts.length);
    console.log('DEBUG: bundleProducts:', bundleProducts);

    const bundlePrice = starterPricing?.price || bundleData.bundlePrice;
    console.log('DEBUG: bundlePrice:', bundlePrice);
    
    // Add each product in the bundle individually with proper variant IDs
    bundleProducts.forEach((item, index) => {
      console.log(`DEBUG: Processing item ${index}:`, item);
      
      // Get the variant ID - check multiple possible fields
      let variantId = item.variant.printful_variant_id || 
                     item.variant.external_id || 
                     item.variant.id;
      
      // For cap, use the specific cap variant
      if (item.product.category === 'cap' && selectedCapVariant) {
        variantId = selectedCapVariant.catalogVariantId || selectedCapVariant.externalId;
      }
      
      // For t-shirt, use the specific t-shirt variant
      if (item.product.category === 'tshirt' && selectedTshirtVariant) {
        variantId = selectedTshirtVariant.catalogVariantId || selectedTshirtVariant.externalId;
      }
      
      const cartItem = {
        id: `starter-bundle-${item.product.category}-${index}`,
        name: item.product.name,
        price: index === 0 ? bundlePrice : 0, // Only charge for the first item
        image: item.variant.image || item.product.image || '/BackReformLogo.png',
        quantity: quantity,
        printful_variant_id: variantId,
        external_id: item.variant.external_id || item.variant.sku || item.variant.id,
        size: item.variant.size,
        color: item.variant.color,
        isPartOfBundle: true,
        bundleName: 'Starter Bundle',
        bundleId: 'starter-bundle'
      };
      
      console.log(`DEBUG: Adding cart item ${index}:`, cartItem);
      addToCart(cartItem);
    });
    
    console.log('DEBUG: Finished forEach loop');
    // Show success message - don't redirect to checkout
    showToast(`Starter Bundle (${bundleProducts.length} items) added to cart!`);
  };

  const handleBuyNow = () => {
    if (bundleProducts.length === 0) {
      alert('Please wait for bundle to load.');
      return;
    }

    const bundleContents = [
      {
        name: tshirtProduct?.name || 'Reform UK T-shirt',
        variant: getVariantText('tshirt'),
        image: getTshirtImages()[0] || '/BackReformLogo.png'
      },
      {
        name: capProduct?.name || 'Reform UK Cap',
        variant: getVariantText('cap'),
        image: getCapImages()[0] || '/BackReformLogo.png'
      },
      {
        name: mugProduct?.name || 'Reform UK Mug',
        variant: getVariantText('mug'),
        image: getMugImages()[0] || '/BackReformLogo.png'
      }
    ];

    const itemToAdd = {
      id: 'starter-bundle',
      name: 'Starter Bundle',
      price: bundleData.bundlePrice,
      image: getTshirtImages()[0] || '/BackReformLogo.png',
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
  const selectedItemData = selectedItem === 'tshirt' ? tshirtProduct : 
                           selectedItem === 'cap' ? capProduct : 
                           selectedItem === 'mug' ? mugProduct : null;

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
                      Viewing: {selectedItemData?.name}
                      {selectedItem === 'tshirt' && ` - ${tshirtColor}`}
                      {selectedItem === 'cap' && ` - ${capColor}`}
                      {selectedItem === 'mug' && ` - White`}
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
                        item.product.category === 'tshirt' ? getTshirtImages()[0] :
                        item.product.category === 'cap' ? getCapImages()[0] :
                        item.product.category === 'mug' ? getMugImages()[0] :
                        '/BackReformLogo.png'
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
                        alt={`${selectedItemData?.name} thumbnail ${index + 1}`} 
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
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-pink-800">
                      <strong>Women's Fit Recommendation:</strong> It is recommended women size down one size for a better fit.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button 
                        key={size} 
                        onClick={() => handleTshirtVariantChange('size', size)} 
                        className={`px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                          tshirtSize === size 
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
                    {tshirtColor}
                  </span></label>
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      // LIGHT design colors
                      { name: 'White', value: '#ffffff', border: true },
                      { name: 'Ash', value: '#f0f1ea' },
                      { name: 'Heather Prism Peach', value: '#f3c2b2' },
                      { name: 'Heather Dust', value: '#e5d9c9' },
                      { name: 'Athletic Heather', value: '#cececc' },
                      { name: 'Yellow', value: '#ffd667' },
                      { name: 'Pink', value: '#fdbfc7' },
                      { name: 'Mustard', value: '#eda027' },
                      // DARK design colors
                      { name: 'Mauve', value: '#bf6e6e' },
                      { name: 'Steel Blue', value: '#668ea7' },
                      { name: 'Heather Deep Teal', value: '#447085' },
                      { name: 'Olive', value: '#47452b' },
                      { name: 'Navy', value: '#212642' },
                      { name: 'Asphalt', value: '#52514f' },
                      { name: 'Army', value: '#5f5849' },
                      { name: 'Autumn', value: '#c85313' },
                      { name: 'Dark Grey Heather', value: '#3e3c3d' },
                      { name: 'Red', value: '#df1f26' },
                      { name: 'Black Heather', value: '#0b0b0b' },
                      { name: 'Black', value: '#0c0c0c' }
                    ].map((color) => (
                      <button 
                        key={color.name} 
                        onClick={() => handleTshirtVariantChange('color', color.name)} 
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          tshirtColor === color.name 
                            ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2' 
                            : color.border 
                              ? 'border-gray-300 hover:border-gray-400' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        style={{ backgroundColor: color.value }} 
                        title={color.name}
                      >
                        {tshirtColor === color.name && (
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
                    {capColor}
                  </span></label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { name: 'White', value: '#ffffff', border: true },
                      { name: 'Stone', value: '#e5e3df' },
                      { name: 'Khaki', value: '#b6a593' },
                      { name: 'Dark Grey', value: '#484848' },
                      { name: 'Black', value: '#0c0c0c' },
                      { name: 'Light Blue', value: '#a2ccd4' },
                      { name: 'Navy', value: '#1f2937' },
                      { name: 'Pink', value: '#ffb6c1' }
                    ].map((color) => (
                      <button 
                        key={color.name} 
                        onClick={() => handleCapColorChange(color.name)} 
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          capColor === color.name 
                            ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2' 
                            : color.border 
                              ? 'border-gray-300 hover:border-gray-400' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        style={{ backgroundColor: color.value }} 
                        title={color.name}
                      >
                        {capColor === color.name && (
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
                    {tshirtColor} (Size {tshirtSize})
                  </span></p>
                  <p>• Reform UK Cap: <span className="font-medium text-gray-900">
                    {capColor}
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
                      Buy Now - £{bundleData.bundlePrice.toFixed(2)}
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleAddToCart} 
                  disabled={bundleProducts.length === 0}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart - £{(bundleData.bundlePrice * quantity).toFixed(2)}</span>
                </button>
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