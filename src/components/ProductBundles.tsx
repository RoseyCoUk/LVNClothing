import React, { useState } from 'react';
import { Tag, Clock, ShoppingCart, Star, AlertTriangle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const ProductBundles = () => {
  const { addToCart } = useCart();
  const [activeBundle, setActiveBundle] = useState('starter');

  const bundles = {
    starter: {
      id: 1,
      name: "Starter Bundle",
      originalPrice: "£39.97",
      bundlePrice: "£29.99",
      savings: "Save £9.98",
      items: [
        "Reform UK T-Shirt (Men's Black, Size M)",
        "Reform UK Mug",
        "Reform UK Stickers (Pack of 10)"
      ],
      image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Limited Time Offer",
      popular: false,
      bundleContents: [
        { name: "Reform UK T-Shirt", variant: "Men's Black (Size M)", image: "Tshirt/Men/ReformMenTshirtBlack1.webp" },
        { name: "Reform UK Mug", variant: "White", image: "MugMouse/ReformMug1.webp" },
        { name: "Reform UK Stickers", variant: "Pack of 10", image: "StickerToteWater/ReformStickersMain2.webp" }
      ]
    },
    champion: {
      id: 2,
      name: "Champion Bundle",
      originalPrice: "£95.96",
      bundlePrice: "£69.99",
      savings: "Save £25.97",
      items: [
        "Reform UK Hoodie (Men's Black, Size M)",
        "Reform UK Cap (Black)",
        "Reform UK Tote Bag (Black)",
        "Reform UK Water Bottle (White)"
      ],
      image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Most Popular",
      popular: true,
      bundleContents: [
        { name: "Reform UK Hoodie", variant: "Men's Black (Size M)", image: "Hoodie/Men/ReformMenHoodieBlack1.webp" },
        { name: "Reform UK Cap", variant: "Black", image: "Cap/ReformCapBlack1.webp" },
        { name: "Reform UK Tote Bag", variant: "Black", image: "StickerToteWater/ReformToteBagBlack1.webp" },
        { name: "Reform UK Water Bottle", variant: "White", image: "StickerToteWater/ReformWaterBottleWhite1.webp" }
      ]
    },
    activist: {
      id: 3,
      name: "Activist Bundle",
      originalPrice: "£159.91",
      bundlePrice: "£99.99",
      savings: "Save £59.92",
      items: [
        "Reform UK Hoodie (Men's Black, Size M)",
        "Reform UK T-Shirt (Men's White, Size M)",
        "Reform UK Cap (Blue)",
        "Reform UK Tote Bag (Black)",
        "Reform UK Water Bottle (White)",
        "Reform UK Mug",
        "Reform UK Stickers (Pack of 10)",
        "Reform UK Mouse Pad",
        "Reform UK Badge Set (Set of 5)"
      ],
      image: "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Best Value",
      popular: false,
      bundleContents: [
        { name: "Reform UK Hoodie", variant: "Men's Black (Size M)", image: "Hoodie/Men/ReformMenHoodieBlack1.webp" },
        { name: "Reform UK T-Shirt", variant: "Men's White (Size M)", image: "Tshirt/Men/ReformMenTshirtWhite1.webp" },
        { name: "Reform UK Cap", variant: "Blue", image: "Cap/ReformCapBlue1.webp" },
        { name: "Reform UK Tote Bag", variant: "Black", image: "StickerToteWater/ReformToteBagBlack1.webp" },
        { name: "Reform UK Water Bottle", variant: "White", image: "StickerToteWater/ReformWaterBottleWhite1.webp" },
        { name: "Reform UK Mug", variant: "White", image: "MugMouse/ReformMug1.webp" },
        { name: "Reform UK Stickers", variant: "Pack of 10", image: "StickerToteWater/ReformStickersMain2.webp" },
        { name: "Reform UK Mouse Pad", variant: "White", image: "MugMouse/ReformMousePadWhite1.webp" },
        { name: "Reform UK Badge Set", variant: "Set of 5", image: "Badge/ReformBadgeSetMain3.webp" }
      ]
    }
  };

  const currentBundle = bundles[activeBundle as keyof typeof bundles];

  const handleAddBundleToCart = () => {
    // Add bundle as a single item with breakdown in the name/description
    const bundleItem = {
      id: `bundle-${activeBundle}-${Date.now()}`,
      name: currentBundle.name,
      price: parseFloat(currentBundle.bundlePrice.replace('£', '')),
      image: currentBundle.image,
      quantity: 1,
      isBundle: true,
      bundleContents: currentBundle.bundleContents
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
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleAddBundleToCart}
                    className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add Bundle to Cart
                  </button>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This bundle contains pre-selected items in our most popular variants. 
                    Individual items can be purchased separately if you need different sizes or colors.
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