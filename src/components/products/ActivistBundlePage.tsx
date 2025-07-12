import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, Check, Plus, Minus, Clock, Truck, Shield, RotateCcw, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { createCheckoutSession } from '../../lib/stripe';
import OrderOverviewModal from '../OrderOverviewModal';

interface Color {
  name: string;
  value: string;
  border?: boolean;
}

interface BundleItem {
  type: string;
  name: string;
  customizable: boolean;
  baseImage: string;
  variant?: string;
  images?: string[];
}

interface BundleContent {
  name: string;
  variant: string;
  image: string;
}

interface OrderToConfirm {
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  priceId: string;
  variants: Record<string, string>;
  isBundle: boolean;
  bundleContents: BundleContent[];
}

interface ActivistBundlePageProps {
  onBack: () => void;
}

const ActivistBundlePage = ({ onBack }: ActivistBundlePageProps) => {
  const { addToCart, addToCartAndGetUpdated } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderOverview, setShowOrderOverview] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderToConfirm | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Hoodie customization options
  const [selectedGender, setSelectedGender] = useState('Men');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');

  // T-shirt customization options
  const [tshirtGender, setTshirtGender] = useState('Men');
  const [tshirtSize, setTshirtSize] = useState('M');
  const [tshirtColor, setTshirtColor] = useState('Black');

  // Cap customization options
  const [capColor, setCapColor] = useState('Black');

  // Quantity options
  const stickerSetSizes = [10, 25, 50, 100];
  const badgeSetSizes = [5, 10, 25, 50];
  const [stickerSetSize, setStickerSetSize] = useState(stickerSetSizes[0]);
  const [badgeSetSize, setBadgeSetSize] = useState(badgeSetSizes[0]);

  // Image browsing state
  const [selectedItem, setSelectedItem] = useState('hoodie');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productData = {
    name: "Activist Bundle",
    originalPrice: "£194.91",
    bundlePrice: 169.99,
    savings: "Save £24.92",
    description: "The ultimate bundle for Reform UK activists. This comprehensive collection includes a premium hoodie, T-shirt, cap, tote bag, water bottle, mug, stickers, mouse pad, and badge set - everything you need to make a statement and show your commitment to the movement.",
    shipping: "Free UK Shipping",
    urgency: "Limited Time Offer",
    popular: false,
    rating: 4.9,
    reviews: 156,
    materials: "Premium cotton hoodie and T-shirt, adjustable cap, durable canvas tote bag, stainless steel water bottle, ceramic mug, vinyl stickers, neoprene mouse pad, and embroidered badge set",
    careInstructions: "Machine wash hoodie and T-shirt at 30°C. Cap can be hand washed. Tote bag spot clean. Water bottle dishwasher safe. Mug dishwasher safe. Stickers are weather-resistant.",
    features: [
      "Premium cotton hoodie with Reform UK branding",
      "Comfortable cotton T-shirt for everyday wear",
      "Adjustable cap for perfect fit",
      "Durable canvas tote bag for daily use",
      "Stainless steel water bottle keeps drinks cold for 24 hours",
      "Ceramic mug perfect for home or office",
      "High-quality vinyl stickers for any surface",
      "Neoprene mouse pad for desk setup",
      "Embroidered badge set for jackets and bags",
      "Complete activist starter kit",
      "Excellent value bundle with significant savings",
      "Free UK shipping included",
      "30-day money-back guarantee"
    ],
    bundleItems: [
      {
        type: 'hoodie',
        name: 'Reform UK Hoodie',
        customizable: true,
        baseImage: '/Hoodie/Men/ReformMenHoodieBlack1.webp',
        description: 'Premium cotton hoodie featuring the Reform UK logo and branding.',
        images: [
          '/Hoodie/Men/ReformMenHoodieBlack1.webp',
          '/Hoodie/Men/ReformMenHoodieBlack2.webp',
          '/Hoodie/Men/ReformMenHoodieBlack3.webp',
          '/Hoodie/Men/ReformMenHoodieBlack4.webp',
          '/Hoodie/Men/ReformMenHoodieBlack5.webp',
          '/Hoodie/Men/ReformMenHoodieBlack6.webp'
        ]
      },
      {
        type: 'tshirt',
        name: 'Reform UK T-Shirt',
        customizable: true,
        baseImage: '/Tshirt/Men/ReformMenTshirtBlack1.webp',
        description: 'Premium cotton T-shirt featuring the Reform UK logo and branding.',
        images: [
          '/Tshirt/Men/ReformMenTshirtBlack1.webp',
          '/Tshirt/Men/ReformMenTshirtBlack2.webp',
          '/Tshirt/Men/ReformMenTshirtBlack3.webp',
          '/Tshirt/Men/ReformMenTshirtBlack4.webp',
          '/Tshirt/Men/ReformMenTshirtBlack5.webp'
        ]
      },
      {
        type: 'cap',
        name: 'Reform UK Cap',
        customizable: true,
        baseImage: '/Cap/ReformCapBlack1.webp',
        description: 'Adjustable cap with embroidered Reform UK logo.',
        images: [
          '/Cap/ReformCapBlack1.webp',
          '/Cap/ReformCapBlack2.webp',
          '/Cap/ReformCapBlack3.webp',
          '/Cap/ReformCapBlack4.webp',
          '/Cap/ReformCapBlack5.webp',
          '/Cap/ReformCapBlack6.webp',
          '/Cap/ReformCapBlack7.webp'
        ]
      },
      {
        type: 'totebag',
        name: 'Reform UK Tote Bag',
        customizable: false,
        baseImage: '/StickerToteWater/ReformToteBagBlack1.webp',
        description: 'Durable canvas tote bag perfect for shopping, work, or daily use.',
        images: [
          '/StickerToteWater/ReformToteBagBlack1.webp',
          '/StickerToteWater/ReformToteBagBlack2.webp',
          '/StickerToteWater/ReformToteBagBlack3.webp'
        ]
      },
      {
        type: 'waterbottle',
        name: 'Reform UK Water Bottle',
        customizable: false,
        baseImage: '/StickerToteWater/ReformWaterBottleWhite1.webp',
        description: 'Stainless steel water bottle with Reform UK branding.',
        images: [
          '/StickerToteWater/ReformWaterBottleWhite1.webp',
          '/StickerToteWater/ReformWaterBottleWhite2.webp',
          '/StickerToteWater/ReformWaterBottleWhite3.webp',
          '/StickerToteWater/ReformWaterBottleWhite4.webp'
        ]
      },
      {
        type: 'mug',
        name: 'Reform UK Mug',
        customizable: false,
        baseImage: '/MugMouse/ReformMug1.webp',
        description: 'Ceramic mug with Reform UK branding.',
        images: [
          '/MugMouse/ReformMug1.webp',
          '/MugMouse/ReformMug2.webp',
          '/MugMouse/ReformMug3.webp',
          '/MugMouse/ReformMug4.webp',
          '/MugMouse/ReformMug5.webp'
        ]
      },
      {
        type: 'stickers',
        name: 'Reform UK Stickers',
        customizable: true,
        baseImage: '/StickerToteWater/ReformStickersMain1.webp',
        description: 'High-quality vinyl stickers with Reform UK branding.',
        images: [
          '/StickerToteWater/ReformStickersMain1.webp',
          '/StickerToteWater/ReformStickersMain2.webp',
          '/StickerToteWater/ReformStickersMain3.webp',
          '/StickerToteWater/ReformStickersMain4.webp',
          '/StickerToteWater/ReformStickersMain5.webp',
          '/StickerToteWater/ReformStickersMain6.webp'
        ]
      },
      {
        type: 'mousepad',
        name: 'Reform UK Mouse Pad',
        customizable: false,
        baseImage: '/MugMouse/ReformMousePadWhite1.webp',
        description: 'Neoprene mouse pad with Reform UK branding.',
        images: [
          '/MugMouse/ReformMousePadWhite1.webp',
          '/MugMouse/ReformMousePadWhite2.webp'
        ]
      },
      {
        type: 'badgeset',
        name: 'Reform UK Badge Set',
        customizable: true,
        baseImage: '/Badge/ReformBadgeSetMain1.webp',
        description: 'Embroidered badge set with Reform UK branding.',
        images: [
          '/Badge/ReformBadgeSetMain1.webp',
          '/Badge/ReformBadgeSetMain2.webp',
          '/Badge/ReformBadgeSetMain3.webp',
          '/Badge/ReformBadgeSetMain4.webp',
          '/Badge/ReformBadgeSetMain5.webp'
        ]
      }
    ],
    image: "/activistbundle.png",
  };

  const colorOptions: Color[] = [
    { name: 'White', value: '#FFFFFF', border: true },
    { name: 'Light Grey', value: '#E5E5E5', border: true },
    { name: 'Ash Grey', value: '#B0B0B0' },
    { name: 'Charcoal', value: '#333333' },
    { name: 'Black', value: '#000000' },
    { name: 'Royal Blue', value: '#0B4C8A' },
    { name: 'Red', value: '#B31217' }
  ];

  const genderOptions = ['Men', 'Women'];
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const getHoodieImages = () => {
    const color = selectedColor === 'Royal Blue' ? 'Blue' : selectedColor.replace(/\s/g, '');
    return [
      `/Hoodie/${selectedGender}/Reform${selectedGender}Hoodie${color}1.webp`,
      `/Hoodie/${selectedGender}/Reform${selectedGender}Hoodie${color}2.webp`,
      `/Hoodie/${selectedGender}/Reform${selectedGender}Hoodie${color}3.webp`,
      `/Hoodie/${selectedGender}/Reform${selectedGender}Hoodie${color}4.webp`,
      `/Hoodie/${selectedGender}/Reform${selectedGender}Hoodie${color}5.webp`,
      `/Hoodie/${selectedGender}/Reform${selectedGender}Hoodie${color}6.webp`
    ];
  };

  const getTshirtImages = () => {
    const color = tshirtColor === 'Royal Blue' ? 'Blue' : tshirtColor.replace(/\s/g, '');
    return [
      `/Tshirt/${tshirtGender}/Reform${tshirtGender}Tshirt${color}1.webp`,
      `/Tshirt/${tshirtGender}/Reform${tshirtGender}Tshirt${color}2.webp`,
      `/Tshirt/${tshirtGender}/Reform${tshirtGender}Tshirt${color}3.webp`,
      `/Tshirt/${tshirtGender}/Reform${tshirtGender}Tshirt${color}4.webp`,
      `/Tshirt/${tshirtGender}/Reform${tshirtGender}Tshirt${color}5.webp`
    ];
  };

  const getCapImages = () => {
    const color = capColor === 'Royal Blue' ? 'Blue' : capColor.replace(/\s/g, '');
    return [
      `/Cap/ReformCap${color}1.webp`,
      `/Cap/ReformCap${color}2.webp`,
      `/Cap/ReformCap${color}3.webp`,
      `/Cap/ReformCap${color}4.webp`,
      `/Cap/ReformCap${color}5.webp`,
      `/Cap/ReformCap${color}6.webp`,
      `/Cap/ReformCap${color}7.webp`
    ];
  };

  const getCurrentImages = () => {
    if (selectedItem === 'hoodie') {
      return getHoodieImages();
    } else if (selectedItem === 'tshirt') {
      return getTshirtImages();
    } else if (selectedItem === 'cap') {
      return getCapImages();
    } else {
      const item = productData.bundleItems.find(item => item.type === selectedItem);
      return item?.images || [];
    }
  };

  const getCurrentImage = () => {
    const images = getCurrentImages();
    return images[currentImageIndex] || images[0] || '';
  };

  const getVariantText = (item: BundleItem): string => {
    if (item.type === 'hoodie') {
      return `${selectedGender}'s ${selectedColor} (Size ${selectedSize})`;
    }
    if (item.type === 'tshirt') {
      return `${tshirtGender}'s ${tshirtColor} (Size ${tshirtSize})`;
    }
    if (item.type === 'cap') {
      return `${capColor} Cap`;
    }
    if (item.type === 'stickers') {
      return `${stickerSetSize} Pack`;
    }
    if (item.type === 'badgeset') {
      return `${badgeSetSize} Set`;
    }
    return item.variant || '';
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

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setCurrentImageIndex(0);
  };

  const handleGenderChange = (gender: string) => {
    setSelectedGender(gender);
    setCurrentImageIndex(0);
  };

  const handleAddToCart = () => {
    const bundleContents: BundleContent[] = productData.bundleItems.map(item => ({
      name: item.name,
      variant: getVariantText(item),
      image: item.type === 'hoodie' ? getHoodieImages()[0] : item.baseImage
    }));

    const variants: Record<string, string> = {
      hoodieGender: selectedGender,
      hoodieSize: selectedSize,
      hoodieColor: selectedColor,
      tshirtGender: tshirtGender,
      tshirtSize: tshirtSize,
      tshirtColor: tshirtColor,
      capColor: capColor,
      stickerSetSize: stickerSetSize.toString(),
      badgeSetSize: badgeSetSize.toString()
    };

    addToCart({
      id: 'activist-bundle',
      name: productData.name,
      price: productData.bundlePrice,
      image: productData.bundleItems[0].baseImage,
      isBundle: true,
      bundleContents: bundleContents
    });
  };

  const handleBuyNow = () => {
    // Add bundle to cart
    const bundleContents = [
      { name: 'Reform UK Hoodie', variant: `${selectedGender}'s ${selectedColor} (Size: ${selectedSize})`, image: getHoodieImages()[0] },
      { name: 'Reform UK T-Shirt', variant: `${tshirtGender}'s ${tshirtColor} (Size: ${tshirtSize})`, image: getTshirtImages()[0] },
      { name: 'Reform UK Cap', variant: `${capColor}`, image: getCapImages()[0] },
      { name: 'Reform UK Tote Bag', variant: 'Black', image: '/StickerToteWater/ReformToteBagBlack1.webp' },
      { name: 'Reform UK Water Bottle', variant: 'White', image: '/StickerToteWater/ReformWaterBottleWhite1.webp' },
      { name: 'Reform UK Mug', variant: 'White', image: '/MugMouse/ReformMug1.webp' },
      { name: 'Reform UK Stickers', variant: `${stickerSetSize} pack`, image: '/StickerToteWater/ReformStickersMain1.webp' },
      { name: 'Reform UK Mouse Pad', variant: 'White', image: '/MugMouse/ReformMousePadWhite1.webp' },
      { name: 'Reform UK Badge Set', variant: `${badgeSetSize} pack`, image: '/Badge/ReformBadgeSetMain1.webp' }
    ];

    const itemToAdd = {
      id: 'activist-bundle',
      name: 'Activist Bundle',
      price: productData.bundlePrice,
      image: productData.bundleItems[0].baseImage,
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

  const handleConfirmCheckout = async () => {
    if (!orderToConfirm) return;

    setIsLoading(true);
    try {
      const email = await promptForEmail();
      if (!email) {
        setIsLoading(false);
        return;
      }

      const session = await createCheckoutSession({
        price_id: orderToConfirm.priceId,
        success_url: `${window.location.origin}?success=true`,
        cancel_url: window.location.href,
        mode: 'payment',
        customer_email: email
      });

      if (session?.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsLoading(false);
      setShowOrderOverview(false);
    }
  };

  const promptForEmail = async (): Promise<string> => {
    return new Promise((resolve) => {
      const email = prompt('Please enter your email address to continue with checkout:');
      resolve(email || '');
    });
  };

  const reviews = [
    {
      id: 1,
      name: "Robert M.",
      rating: 5,
      date: "2 days ago",
      comment: "Incredible bundle! Everything is top quality and the variety is perfect for any Reform UK activist. The hoodie is my favorite piece.",
      verified: true
    },
    {
      id: 2,
      name: "Emma L.",
      rating: 5,
      date: "1 week ago",
      comment: "This is the ultimate activist kit! The stickers are high quality and the badges are beautifully embroidered. Excellent value.",
      verified: true
    },
    {
      id: 3,
      name: "David K.",
      rating: 4,
      date: "2 weeks ago",
      comment: "Great comprehensive bundle. The water bottle keeps drinks cold all day and the mouse pad is perfect for my desk setup.",
      verified: true
    }
  ];

  const currentImages = getCurrentImages();
  const hasMultipleImages = currentImages.length > 1;
  const selectedItemData = productData.bundleItems.find(item => item.type === selectedItem);

  return (
    <>
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
                  alt={productData.name} 
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
                    {productData.urgency}
                  </span>
                </div>

                {/* Viewing Indicator */}
                {selectedItemData && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      Viewing: {selectedItemData.name}
                      {selectedItem === 'hoodie' && ` - ${selectedColor}`}
                      {selectedItem === 'tshirt' && ` - ${tshirtColor}`}
                      {selectedItem === 'cap' && ` - ${capColor}`}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Bundle Items Grid - Clickable Thumbnails */}
              <div className="grid grid-cols-3 gap-4">
                {productData.bundleItems.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleItemClick(item.type)}
                    className={`text-center transition-all duration-200 ${
                      selectedItem === item.type 
                        ? 'ring-2 ring-[#009fe3] ring-offset-2' 
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <img 
                      src={
                        item.type === 'hoodie' ? getHoodieImages()[0] : 
                        item.type === 'tshirt' ? getTshirtImages()[0] :
                        item.type === 'cap' ? getCapImages()[0] :
                        item.baseImage
                      } 
                      alt={item.name} 
                      className={`w-full object-cover rounded-lg border-2 transition-all duration-200 aspect-square ${
                        selectedItem === item.type 
                          ? 'border-[#009fe3]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    <p className={`text-xs mt-2 font-medium ${
                      selectedItem === item.type 
                        ? 'text-[#009fe3]' 
                        : 'text-gray-600'
                    }`}>
                      {item.name}
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{productData.name}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < productData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">({productData.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl font-bold text-[#009fe3]">£{productData.bundlePrice.toFixed(2)}</span>
                  <span className="text-lg text-gray-500 line-through">{productData.originalPrice}</span>
                  <span className="text-lg font-semibold text-green-600">{productData.savings}</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600 mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">{productData.shipping}</span>
                </div>
              </div>

              {/* Hoodie Customization */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your Hoodie</h3>
                
                {/* Gender Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                  <div className="flex gap-3">
                    {genderOptions.map((gender) => (
                      <button 
                        key={gender} 
                        onClick={() => handleGenderChange(gender)} 
                        className={`px-6 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedGender === gender 
                            ? 'border-[#009fe3] bg-[#009fe3] text-white' 
                            : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color: <span className="font-semibold text-gray-900">{selectedColor}</span></label>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button 
                        key={color.name} 
                        onClick={() => handleColorChange(color.name)} 
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
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
                    {sizeOptions.map((size) => (
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
              </div>

              {/* T-shirt Customization */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your T-shirt</h3>
                
                {/* Gender Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                  <div className="flex gap-3">
                    {genderOptions.map((gender) => (
                      <button 
                        key={gender} 
                        onClick={() => setTshirtGender(gender)} 
                        className={`px-6 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                          tshirtGender === gender 
                            ? 'border-[#009fe3] bg-[#009fe3] text-white' 
                            : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color: <span className="font-semibold text-gray-900">{tshirtColor}</span></label>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button 
                        key={color.name} 
                        onClick={() => setTshirtColor(color.name)} 
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
                            <Check className={`w-5 h-5 ${color.name === 'White' || color.name === 'Light Grey' ? 'text-gray-600' : 'text-white'}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

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
                    {sizeOptions.map((size) => (
                      <button 
                        key={size} 
                        onClick={() => setTshirtSize(size)} 
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
              </div>

              {/* Cap Customization */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your Cap</h3>
                
                {/* Color Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color: <span className="font-semibold text-gray-900">{capColor}</span></label>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button 
                        key={color.name} 
                        onClick={() => setCapColor(color.name)} 
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

              {/* Stickers Set Size */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stickers Pack Size</h3>
                <div className="flex gap-3 flex-wrap">
                  {stickerSetSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setStickerSetSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                        stickerSetSize === size ? 'border-[#009fe3] bg-[#009fe3] text-white' : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
                      }`}
                    >
                      {size} Pack
                  </button>
                  ))}
                </div>
              </div>

              {/* Badge Set Size */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Badge Set Size</h3>
                <div className="flex gap-3 flex-wrap">
                  {badgeSetSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setBadgeSetSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                        badgeSetSize === size ? 'border-[#009fe3] bg-[#009fe3] text-white' : 'border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3]'
                      }`}
                    >
                      {size} Set
                  </button>
                  ))}
                </div>
              </div>

              {/* Bundle Contents */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Bundle Contents:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• {productData.bundleItems[0].name}: <span className="font-medium text-gray-900">{getVariantText(productData.bundleItems[0])}</span></p>
                  <p>• {productData.bundleItems[1].name}: <span className="font-medium text-gray-900">{getVariantText(productData.bundleItems[1])}</span></p>
                  <p>• {productData.bundleItems[2].name}: <span className="font-medium text-gray-900">{getVariantText(productData.bundleItems[2])}</span></p>
                  <p>• {productData.bundleItems[3].name}: <span className="font-medium text-gray-900">Black</span></p>
                  <p>• {productData.bundleItems[4].name}: <span className="font-medium text-gray-900">White</span></p>
                  <p>• {productData.bundleItems[5].name}: <span className="font-medium text-gray-900">White</span></p>
                  <p>• {productData.bundleItems[6].name}: <span className="font-medium text-gray-900">{getVariantText(productData.bundleItems[6])}</span></p>
                  <p>• {productData.bundleItems[7].name}: <span className="font-medium text-gray-900">White</span></p>
                  <p>• {productData.bundleItems[8].name}: <span className="font-medium text-gray-900">{getVariantText(productData.bundleItems[8])}</span></p>
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
                  disabled={isLoading}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Buy Now - £{productData.bundlePrice.toFixed(2)}
                    </>
                  )}
                </button>
                
                <button onClick={handleAddToCart} className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart - £{(productData.bundlePrice * quantity).toFixed(2)}</span>
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
                  <p className="text-xs text-gray-600">Free UK Shipping Over £30</p>
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
                  <p className="text-gray-700 leading-relaxed">{productData.description}</p>
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Materials:</h4>
                    <p className="text-gray-700">{productData.materials}</p>
                  </div>
                </div>
              )}
              {activeTab === 'features' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bundle Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {productData.features.map((feature, index) => (
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
                          <Star key={i} className={`w-4 h-4 ${i < productData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({productData.reviews} reviews)</span>
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

export default ActivistBundlePage; 