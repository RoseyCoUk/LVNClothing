import React, { useState } from 'react';
import { Tag, Clock, ShoppingCart, Star, Settings, AlertTriangle, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const ProductBundles = () => {
  const { addToCart } = useCart();
  const [activeBundle, setActiveBundle] = useState('starter');
  const [bundleSelections, setBundleSelections] = useState({
    starter: {
      tshirtGender: 'Men',
      tshirtColor: 'Black',
      tshirtSize: 'M'
    },
    champion: {
      hoodieGender: 'Men',
      hoodieColor: 'Black',
      hoodieSize: 'M',
      capColor: 'Black'
    },
    activist: {
      hoodieGender: 'Men',
      hoodieColor: 'Black',
      hoodieSize: 'M',
      tshirtGender: 'Men',
      tshirtColor: 'White',
      tshirtSize: 'M',
      capColor: 'Blue'
    }
  });

  const bundles = {
    starter: {
      id: 1,
      name: "Starter Bundle",
      originalPrice: "£39.97",
      bundlePrice: "£29.99",
      savings: "Save £9.98",
      items: [
        { name: "Reform UK T-Shirt", basePrice: 19.99, hasVariants: true },
        { name: "Reform UK Mug", basePrice: 12.99, hasVariants: false },
        { name: "Reform UK Stickers (Pack of 10)", basePrice: 6.99, hasVariants: false }
      ],
      image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Limited Time Offer",
      popular: false
    },
    champion: {
      id: 2,
      name: "Champion Bundle",
      originalPrice: "£95.96",
      bundlePrice: "£69.99",
      savings: "Save £25.97",
      items: [
        { name: "Reform UK Hoodie", basePrice: 34.99, hasVariants: true },
        { name: "Reform UK Cap", basePrice: 24.99, hasVariants: true },
        { name: "Reform UK Tote Bag", basePrice: 16.99, hasVariants: false },
        { name: "Reform UK Water Bottle", basePrice: 18.99, hasVariants: false }
      ],
      image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Most Popular",
      popular: true
    },
    activist: {
      id: 3,
      name: "Activist Bundle",
      originalPrice: "£159.91",
      bundlePrice: "£99.99",
      savings: "Save £59.92",
      items: [
        { name: "Reform UK Hoodie", basePrice: 34.99, hasVariants: true },
        { name: "Reform UK T-Shirt", basePrice: 19.99, hasVariants: true },
        { name: "Reform UK Cap", basePrice: 24.99, hasVariants: true },
        { name: "Reform UK Tote Bag", basePrice: 16.99, hasVariants: false },
        { name: "Reform UK Water Bottle", basePrice: 18.99, hasVariants: false },
        { name: "Reform UK Mug", basePrice: 12.99, hasVariants: false },
        { name: "Reform UK Stickers (Pack of 10)", basePrice: 6.99, hasVariants: false },
        { name: "Reform UK Mouse Pad", basePrice: 14.99, hasVariants: false },
        { name: "Reform UK Badge Set (Set of 5)", basePrice: 8.99, hasVariants: false }
      ],
      image: "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Best Value",
      popular: false
    }
  };

  const currentBundle = bundles[activeBundle as keyof typeof bundles];
  const currentSelections = bundleSelections[activeBundle as keyof typeof bundleSelections];

  const handleSelectionChange = (bundleKey: string, field: string, value: string) => {
    setBundleSelections(prev => ({
      ...prev,
      [bundleKey]: {
        ...prev[bundleKey as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleAddBundleToCart = () => {
    const bundleItems = [];
    
    if (activeBundle === 'starter') {
      // T-Shirt
      bundleItems.push({
        id: `bundle-starter-tshirt-${Date.now()}`,
        name: `Reform UK T-Shirt - ${currentSelections.tshirtGender}'s ${currentSelections.tshirtColor} (Size: ${currentSelections.tshirtSize})`,
        price: 0, // Bundle pricing
        image: "Tshirt/Men/ReformMenTshirtBlack1.webp",
        quantity: 1
      });
      
      // Mug
      bundleItems.push({
        id: `bundle-starter-mug-${Date.now()}`,
        name: "Reform UK Mug",
        price: 0,
        image: "MugMouse/ReformMug1.webp",
        quantity: 1
      });
      
      // Stickers
      bundleItems.push({
        id: `bundle-starter-stickers-${Date.now()}`,
        name: "Reform UK Stickers (Pack of 10)",
        price: 0,
        image: "StickerToteWater/ReformStickersMain2.webp",
        quantity: 1
      });
      
      // Bundle item with total price
      bundleItems.push({
        id: `bundle-starter-total-${Date.now()}`,
        name: "Starter Bundle - Total",
        price: 29.99,
        image: currentBundle.image,
        quantity: 1
      });
      
    } else if (activeBundle === 'champion') {
      // Hoodie
      bundleItems.push({
        id: `bundle-champion-hoodie-${Date.now()}`,
        name: `Reform UK Hoodie - ${currentSelections.hoodieGender}'s ${currentSelections.hoodieColor} (Size: ${currentSelections.hoodieSize})`,
        price: 0,
        image: "Hoodie/Men/ReformMenHoodieBlack1.webp",
        quantity: 1
      });
      
      // Cap
      bundleItems.push({
        id: `bundle-champion-cap-${Date.now()}`,
        name: `Reform UK Cap (${currentSelections.capColor})`,
        price: 0,
        image: "Cap/ReformCapBlack1.webp",
        quantity: 1
      });
      
      // Tote Bag
      bundleItems.push({
        id: `bundle-champion-tote-${Date.now()}`,
        name: "Reform UK Tote Bag (Black)",
        price: 0,
        image: "StickerToteWater/ReformToteBagBlack1.webp",
        quantity: 1
      });
      
      // Water Bottle
      bundleItems.push({
        id: `bundle-champion-bottle-${Date.now()}`,
        name: "Reform UK Water Bottle (White)",
        price: 0,
        image: "StickerToteWater/ReformWaterBottleWhite1.webp",
        quantity: 1
      });
      
      // Bundle total
      bundleItems.push({
        id: `bundle-champion-total-${Date.now()}`,
        name: "Champion Bundle - Total",
        price: 69.99,
        image: currentBundle.image,
        quantity: 1
      });
      
    } else if (activeBundle === 'activist') {
      // All activist bundle items
      const activistItems = [
        {
          id: `bundle-activist-hoodie-${Date.now()}`,
          name: `Reform UK Hoodie - ${currentSelections.hoodieGender}'s ${currentSelections.hoodieColor} (Size: ${currentSelections.hoodieSize})`,
          image: "Hoodie/Men/ReformMenHoodieBlack1.webp"
        },
        {
          id: `bundle-activist-tshirt-${Date.now()}`,
          name: `Reform UK T-Shirt - ${currentSelections.tshirtGender}'s ${currentSelections.tshirtColor} (Size: ${currentSelections.tshirtSize})`,
          image: "Tshirt/Men/ReformMenTshirtWhite1.webp"
        },
        {
          id: `bundle-activist-cap-${Date.now()}`,
          name: `Reform UK Cap (${currentSelections.capColor})`,
          image: "Cap/ReformCapBlue1.webp"
        },
        {
          id: `bundle-activist-tote-${Date.now()}`,
          name: "Reform UK Tote Bag (Black)",
          image: "StickerToteWater/ReformToteBagBlack1.webp"
        },
        {
          id: `bundle-activist-bottle-${Date.now()}`,
          name: "Reform UK Water Bottle (White)",
          image: "StickerToteWater/ReformWaterBottleWhite1.webp"
        },
        {
          id: `bundle-activist-mug-${Date.now()}`,
          name: "Reform UK Mug",
          image: "MugMouse/ReformMug1.webp"
        },
        {
          id: `bundle-activist-stickers-${Date.now()}`,
          name: "Reform UK Stickers (Pack of 10)",
          image: "StickerToteWater/ReformStickersMain2.webp"
        },
        {
          id: `bundle-activist-mousepad-${Date.now()}`,
          name: "Reform UK Mouse Pad",
          image: "MugMouse/ReformMousePadWhite1.webp"
        },
        {
          id: `bundle-activist-badges-${Date.now()}`,
          name: "Reform UK Badge Set (Set of 5)",
          image: "Badge/ReformBadgeSetMain3.webp"
        }
      ];
      
      activistItems.forEach(item => {
        bundleItems.push({
          ...item,
          price: 0,
          quantity: 1
        });
      });
      
      // Bundle total
      bundleItems.push({
        id: `bundle-activist-total-${Date.now()}`,
        name: "Activist Bundle - Total",
        price: 99.99,
        image: currentBundle.image,
        quantity: 1
      });
    }
    
    // Add all bundle items to cart
    bundleItems.forEach(item => {
      addToCart(item);
    });
  };

  const renderVariantSelectors = () => {
    if (activeBundle === 'starter') {
      return (
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-gray-900">Customize Your Bundle:</h4>
          
          {/* T-Shirt Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">T-Shirt Options:</h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={currentSelections.tshirtGender}
                  onChange={(e) => handleSelectionChange('starter', 'tshirtGender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={currentSelections.tshirtColor}
                  onChange={(e) => handleSelectionChange('starter', 'tshirtColor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                  <option value="Royal Blue">Royal Blue</option>
                  <option value="Red">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select
                  value={currentSelections.tshirtSize}
                  onChange={(e) => handleSelectionChange('starter', 'tshirtSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeBundle === 'champion') {
      return (
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-gray-900">Customize Your Bundle:</h4>
          
          {/* Hoodie Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Hoodie Options:</h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={currentSelections.hoodieGender}
                  onChange={(e) => handleSelectionChange('champion', 'hoodieGender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={currentSelections.hoodieColor}
                  onChange={(e) => handleSelectionChange('champion', 'hoodieColor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                  <option value="Royal Blue">Royal Blue</option>
                  <option value="Red">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select
                  value={currentSelections.hoodieSize}
                  onChange={(e) => handleSelectionChange('champion', 'hoodieSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Cap Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Cap Options:</h5>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={currentSelections.capColor}
                onChange={(e) => handleSelectionChange('champion', 'capColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
              >
                <option value="White">White</option>
                <option value="Black">Black</option>
                <option value="Light Blue">Light Blue</option>
                <option value="Navy">Navy</option>
                <option value="Red">Red</option>
              </select>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeBundle === 'activist') {
      return (
        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-gray-900">Customize Your Bundle:</h4>
          
          {/* Hoodie Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Hoodie Options:</h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={currentSelections.hoodieGender}
                  onChange={(e) => handleSelectionChange('activist', 'hoodieGender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={currentSelections.hoodieColor}
                  onChange={(e) => handleSelectionChange('activist', 'hoodieColor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                  <option value="Royal Blue">Royal Blue</option>
                  <option value="Red">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select
                  value={currentSelections.hoodieSize}
                  onChange={(e) => handleSelectionChange('activist', 'hoodieSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* T-Shirt Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">T-Shirt Options:</h5>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={currentSelections.tshirtGender}
                  onChange={(e) => handleSelectionChange('activist', 'tshirtGender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <select
                  value={currentSelections.tshirtColor}
                  onChange={(e) => handleSelectionChange('activist', 'tshirtColor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                  <option value="Royal Blue">Royal Blue</option>
                  <option value="Red">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <select
                  value={currentSelections.tshirtSize}
                  onChange={(e) => handleSelectionChange('activist', 'tshirtSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                >
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Cap Options */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Cap Options:</h5>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <select
                value={currentSelections.capColor}
                onChange={(e) => handleSelectionChange('activist', 'capColor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
              >
                <option value="White">White</option>
                <option value="Black">Black</option>
                <option value="Light Blue">Light Blue</option>
                <option value="Navy">Navy</option>
                <option value="Red">Red</option>
              </select>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bundle & Save
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Get everything you need to show your support while saving money. Perfect for new supporters or as gifts.
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
        <div className="max-w-4xl mx-auto">
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
              <div className="md:w-1/2 relative">
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
              
              <div className="md:w-1/2 p-8">
                <h3 className="text-2xl font-bold mb-4">{currentBundle.name}</h3>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg text-gray-500 line-through">{currentBundle.originalPrice}</span>
                    <span className="text-green-600 font-semibold">{currentBundle.savings}</span>
                  </div>
                  <div className="text-3xl font-bold text-[#009fe3]">{currentBundle.bundlePrice}</div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-gray-700">This bundle includes:</h4>
                  <ul className="space-y-2">
                    {currentBundle.items.map((item, index) => (
                      <li key={index} className="text-gray-600 flex items-center">
                        <Tag className="w-4 h-4 mr-3 text-[#009fe3]" />
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Variant Selectors */}
                {renderVariantSelectors()}
                
                <div className="space-y-3">
                  <button 
                    onClick={handleAddBundleToCart}
                    className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add Bundle to Cart
                  </button>
                  
                  <button className="w-full border-2 border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Customize Your Bundle
                  </button>
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