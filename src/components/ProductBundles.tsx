import React, { useState } from 'react';
import { Tag, Clock, ShoppingCart, Star, AlertTriangle, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { products } from '../stripe-config';
import { createCheckoutSession } from '../lib/stripe';
import { createCheckoutSession } from '../lib/stripe';
import { supabase } from '../lib/supabase';

const ProductBundles = () => {
  const { addToCart } = useCart();
  const [activeBundle, setActiveBundle] = useState('starter');
  const [isLoading, setIsLoading] = useState(false);

  // Variant selection states for each bundle
  const [bundleSelections, setBundleSelections] = useState({
    starter: {
      tshirt: { gender: 'Men', size: 'M', color: 'Black' },
    },
    champion: {
      hoodie: { gender: 'Men', size: 'M', color: 'Black' },
      cap: { color: 'Black' },
    },
    activist: {
      hoodie: { gender: 'Men', size: 'M', color: 'Black' },
      tshirt: { gender: 'Men', size: 'M', color: 'White' },
      cap: { color: 'Blue' },
    }
  });

  // Available options for each product type
  const productOptions = {
    hoodie: {
      genders: ['Men', 'Women'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'White', value: '#FFFFFF', border: true },
        { name: 'Light Grey', value: '#E5E5E5', border: true },
        { name: 'Ash Grey', value: '#B0B0B0' },
        { name: 'Charcoal', value: '#333333' },
        { name: 'Black', value: '#000000' },
        { name: 'Royal Blue', value: '#0B4C8A' },
        { name: 'Red', value: '#B31217' }
      ]
    },
    tshirt: {
      genders: ['Men', 'Women'],
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'White', value: '#FFFFFF', border: true },
        { name: 'Light Grey', value: '#E5E5E5', border: true },
        { name: 'Ash Grey', value: '#B0B0B0' },
        { name: 'Charcoal', value: '#333333' },
        { name: 'Black', value: '#000000' },
        { name: 'Royal Blue', value: '#0B4C8A' },
        { name: 'Red', value: '#B31217' }
      ]
    },
    cap: {
      colors: [
        { name: 'White', value: '#FFFFFF', border: true },
        { name: 'Light Blue', value: '#a6b9c6' },
        { name: 'Charcoal', value: '#393639' },
        { name: 'Navy', value: '#1c2330' },
        { name: 'Black', value: '#000000' },
        { name: 'Red', value: '#8e0a1f' }
      ]
    }
  };

  // Get bundle products from stripe config
  const bundleProducts = {
    starter: products.find(p => p.name === 'Starter Bundle'),
    champion: products.find(p => p.name === 'Champion Bundle'),
    activist: products.find(p => p.name === 'Activist Bundle'),
  };

  const bundles = {
    starter: {
      id: 1,
      name: "Starter Bundle",
      originalPrice: "£39.97",
      bundlePrice: bundleProducts.starter?.price || 34.99,
      savings: "Save £4.98",
      image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Limited Time Offer",
      popular: false,
      product: bundleProducts.starter,
      items: [
        {
          type: 'tshirt',
          name: 'Reform UK T-Shirt',
          customizable: true,
          baseImage: 'Tshirt/Men/ReformMenTshirtBlack1.webp'
        },
        {
          type: 'totebag',
          name: 'Reform UK Tote Bag',
          variant: 'Black',
          customizable: false,
          baseImage: 'StickerToteWater/ReformToteBagBlack1.webp'
        }
      ]
    },
    champion: {
      id: 2,
      name: "Champion Bundle",
      originalPrice: "£95.96",
      bundlePrice: bundleProducts.champion?.price || 139.99,
      savings: "Save £25.97",
      image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Most Popular",
      popular: true,
      product: bundleProducts.champion,
      items: [
        {
          type: 'hoodie',
          name: 'Reform UK Hoodie',
          customizable: true,
          baseImage: 'Hoodie/Men/ReformMenHoodieBlack1.webp'
        },
        {
          type: 'cap',
          name: 'Reform UK Cap',
          customizable: true,
          baseImage: 'Cap/ReformCapBlack1.webp'
        },
        {
          type: 'totebag',
          name: 'Reform UK Tote Bag',
          variant: 'Black',
          customizable: false,
          baseImage: 'StickerToteWater/ReformToteBagBlack1.webp'
        },
        {
          type: 'waterbottle',
          name: 'Reform UK Water Bottle',
          variant: 'White',
          customizable: false,
          baseImage: 'StickerToteWater/ReformWaterBottleWhite1.webp'
        }
      ]
    },
    activist: {
      id: 3,
      name: "Activist Bundle",
      originalPrice: "£299.91",
      bundlePrice: bundleProducts.activist?.price || 199.99,
      savings: "Save £99.92",
      image: "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Best Value",
      popular: false,
      product: bundleProducts.activist,
      items: [
        {
          type: 'hoodie',
          name: 'Reform UK Hoodie',
          customizable: true,
          baseImage: 'Hoodie/Men/ReformMenHoodieBlack1.webp'
        },
        {
          type: 'tshirt',
          name: 'Reform UK T-Shirt',
          customizable: true,
          baseImage: 'Tshirt/Men/ReformMenTshirtWhite1.webp'
        },
        {
          type: 'cap',
          name: 'Reform UK Cap',
          customizable: true,
          baseImage: 'Cap/ReformCapBlue1.webp'
        },
        {
          type: 'totebag',
          name: 'Reform UK Tote Bag',
          variant: 'Black',
          customizable: false,
          baseImage: 'StickerToteWater/ReformToteBagBlack1.webp'
        },
        {
          type: 'waterbottle',
          name: 'Reform UK Water Bottle',
          variant: 'White',
          customizable: false,
          baseImage: 'StickerToteWater/ReformWaterBottleWhite1.webp'
        },
        {
          type: 'mug',
          name: 'Reform UK Mug',
          variant: 'White',
          customizable: false,
          baseImage: 'MugMouse/ReformMug1.webp'
        },
        {
          type: 'stickers',
          name: 'Reform UK Stickers',
          variant: 'Pack of 10',
          customizable: false,
          baseImage: 'StickerToteWater/ReformStickersMain2.webp'
        },
        {
          type: 'mousepad',
          name: 'Reform UK Mouse Pad',
          variant: 'White',
          customizable: false,
          baseImage: 'MugMouse/ReformMousePadWhite1.webp'
        },
        {
          type: 'badges',
          name: 'Reform UK Badge Set',
          variant: 'Set of 5',
          customizable: false,
          baseImage: 'Badge/ReformBadgeSetMain3.webp'
        }
      ]
    }
  };

  const currentBundle = bundles[activeBundle as keyof typeof bundles];
  const currentSelections = bundleSelections[activeBundle as keyof typeof bundleSelections];

  const updateSelection = (itemType: string, field: string, value: string) => {
    setBundleSelections(prev => ({
      ...prev,
      [activeBundle]: {
        ...prev[activeBundle as keyof typeof prev],
        [itemType]: {
          ...prev[activeBundle as keyof typeof prev][itemType as keyof typeof prev[typeof activeBundle]],
          [field]: value
        }
      }
    }));
  };

  const getImageForSelection = (item: any) => {
    if (!item.customizable) return item.baseImage;
    
    const selection = currentSelections[item.type as keyof typeof currentSelections];
    if (!selection) return item.baseImage;
    
    // Generate image path based on selection
    if (item.type === 'hoodie' || item.type === 'tshirt') {
      const productType = item.type === 'hoodie' ? 'Hoodie' : 'Tshirt';
      const gender = selection.gender || 'Men';
      const color = selection.color === 'Royal Blue' ? 'Blue' : (selection.color || 'Black').replace(/\s/g, '');
      return `${productType}/${gender}/Reform${gender}${productType}${color}1.webp`;
    } else if (item.type === 'cap') {
      const color = selection.color === 'Royal Blue' ? 'Blue' : (selection.color || 'Black').replace(/\s/g, '');
      return `Cap/ReformCap${color}1.webp`;
    }
    
    return item.baseImage;
  };

  const getVariantText = (item: any) => {
    if (!item.customizable) return item.variant;
    
    const selection = currentSelections[item.type as keyof typeof currentSelections];
    if (!selection) return '';
    
    if (item.type === 'hoodie' || item.type === 'tshirt') {
      return `${selection.gender}'s ${selection.color} (Size ${selection.size})`;
    } else if (item.type === 'cap') {
      return selection.color;
    }
    
    return '';
  };

  const ColorSwatch = ({ color, isSelected, onClick }: { color: any, isSelected: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`relative w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
        isSelected 
          ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2' 
          : color.border 
            ? 'border-gray-300 hover:border-gray-400' 
            : 'border-gray-200 hover:border-gray-300'
      }`}
      style={{ backgroundColor: color.value }}
      title={color.name}
    >
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${color.name === 'White' || color.name === 'Light Grey' || color.name === 'Light Blue' ? 'bg-gray-600' : 'bg-white'}`} />
        </div>
      )}
    </button>
  );

  const handleBuyNow = async () => {
    if (!currentBundle.product) {
      console.error('Product not found for bundle:', activeBundle);
      return;
    }

    setIsLoading(true);

    try {
      const { url } = await createCheckoutSession({
        price_id: currentBundle.product.priceId,
        success_url: `${window.location.origin}?success=true`,
        cancel_url: window.location.href,
        mode: 'payment',
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

  const handleAddBundleToCart = () => {
    // Generate bundle contents with selected variants
    const bundleContents = currentBundle.items.map(item => ({
      name: item.name,
      variant: getVariantText(item),
      image: getImageForSelection(item)
    }));

    const bundleItem = {
      id: `bundle-${activeBundle}-${Date.now()}`,
      name: currentBundle.name,
      price: currentBundle.bundlePrice,
      image: currentBundle.image,
      quantity: 1,
      isBundle: true,
      bundleContents
    };
    
    addToCart(bundleItem);
  };

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bundle & Save
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get everything you need to show your support while saving money. Choose your preferred options for customizable items.
          </p>
        </div>

        {/* Bundle Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1 flex">
            {Object.entries(bundles).map(([key, bundle]) => (
              <button
                key={key}
                onClick={() => setActiveBundle(key)}
                className={`px-6 py-3 rounded-md font-semibold transition-all duration-200 relative ${
                  activeBundle === key
                    ? 'bg-[#009fe3] text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {bundle.name}
                {bundle.popular && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full font-bold">
                    Popular
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Bundle Display */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white text-gray-900 rounded-lg overflow-hidden shadow-lg relative">
            {currentBundle.popular && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-[#009fe3] text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="md:flex">
              <div className="md:w-1/3 relative">
                <img 
                  src={currentBundle.image} 
                  alt={currentBundle.name}
                  className="w-full h-64 md:h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {currentBundle.urgency}
                  </span>
                </div>
              </div>
              
              <div className="md:w-2/3 p-6">
                <h3 className="text-2xl font-bold mb-4">{currentBundle.name}</h3>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg text-gray-500 line-through">{currentBundle.originalPrice}</span>
                    <span className="text-green-600 font-semibold">{currentBundle.savings}</span>
                  </div>
                  <div className="text-3xl font-bold text-[#009fe3]">£{currentBundle.bundlePrice.toFixed(2)}</div>
                </div>
                
                {/* Bundle Items with Variant Selection */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-4 text-gray-700">Customize Your Bundle:</h4>
                  <div className="space-y-4">
                    {currentBundle.items.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <img 
                            src={getImageForSelection(item)} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-2">{item.name}</h5>
                            
                            {item.customizable ? (
                              <div className="space-y-3">
                                {/* Gender Selection for Hoodies/T-shirts */}
                                {(item.type === 'hoodie' || item.type === 'tshirt') && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                                    <div className="flex gap-2">
                                      {productOptions[item.type].genders.map((gender) => (
                                        <button
                                          key={gender}
                                          onClick={() => updateSelection(item.type, 'gender', gender)}
                                          className={`px-3 py-1 text-xs border rounded-md transition-colors ${
                                            currentSelections[item.type as keyof typeof currentSelections]?.gender === gender
                                              ? 'border-[#009fe3] bg-[#009fe3] text-white'
                                              : 'border-gray-300 text-gray-700 hover:border-[#009fe3]'
                                          }`}
                                        >
                                          {gender}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Size Selection for Hoodies/T-shirts */}
                                {(item.type === 'hoodie' || item.type === 'tshirt') && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                                    <div className="flex gap-1 flex-wrap">
                                      {productOptions[item.type].sizes.map((size) => (
                                        <button
                                          key={size}
                                          onClick={() => updateSelection(item.type, 'size', size)}
                                          className={`px-2 py-1 text-xs border rounded transition-colors ${
                                            currentSelections[item.type as keyof typeof currentSelections]?.size === size
                                              ? 'border-[#009fe3] bg-[#009fe3] text-white'
                                              : 'border-gray-300 text-gray-700 hover:border-[#009fe3]'
                                          }`}
                                        >
                                          {size}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Color Selection */}
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Color: {currentSelections[item.type as keyof typeof currentSelections]?.color}
                                  </label>
                                  <div className="flex gap-2 flex-wrap">
                                    {productOptions[item.type].colors.map((color) => (
                                      <ColorSwatch
                                        key={color.name}
                                        color={color}
                                        isSelected={currentSelections[item.type as keyof typeof currentSelections]?.color === color.name}
                                        onClick={() => updateSelection(item.type, 'color', color.name)}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">{item.variant}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleBuyNow}
                    disabled={isLoading}
                    className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Buy Now - £{currentBundle.bundlePrice.toFixed(2)}
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleAddBundleToCart}
                    className="w-full border-2 border-[#009fe3] text-[#009fe3] hover:bg-[#009fe3] hover:text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add Bundle to Cart</span>
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Bundle Deal:</strong> All items are included at the bundle price. 
                    Your selected variants will be added to cart as a single bundle item.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductBundles;