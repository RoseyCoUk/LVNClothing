import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useBundlePricing } from '../hooks/useBundlePricing';

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
}

interface Product {
  id: string;
  priceId: string;
  name: string;
  price: number;
}

interface BundleContent {
  name: string;
  variant: string;
  image: string;
}

interface Bundle {
  id: number;
  name: string;
  originalPrice: string;
  bundlePrice: number;
  savings: string;
  image: string;
  urgency: string;
  popular: boolean;
  product: Product;
  items: BundleItem[];
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

type BundleKey = 'starter' | 'champion' | 'activist';
type BundleSelections = {
  [key in BundleKey]: Record<string, { size?: string; color?: string }>;
};

// Add type for product options
type ProductType = 'hoodie' | 'tshirt' | 'cap';
type ProductOptions = {
  [key in ProductType]: {
    sizes?: readonly string[];
    colors: Color[];
  };
};

const ProductBundles = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [activeBundle, setActiveBundle] = useState<BundleKey>('starter');
  const [isLoading, setIsLoading] = useState(false);

  // Get bundle pricing from the new system
  const { bundlePricing, loading: pricingLoading, error: pricingError } = useBundlePricing();

  // Variant selection states for each bundle
  const [bundleSelections, setBundleSelections] = useState<BundleSelections>({
    starter: {
      tshirt: { size: 'M', color: 'Black' },
      cap: { color: 'Black' },
    },
    champion: {
      hoodie: { size: 'M', color: 'Black' },
      cap: { color: 'Black' },
    },
    activist: {
      hoodie: { size: 'M', color: 'Black' },
      tshirt: { size: 'M', color: 'White' },
      cap: { color: 'Blue' },
    }
  });

  // Available options for each product type
  const productOptions: ProductOptions = {
    hoodie: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'] as const,
      colors: [
        { name: 'White', value: '#FFFFFF', border: true },
        { name: 'Light Grey', value: '#E5E5E5', border: true },
        { name: 'Ash Grey', value: '#B0B0B0' },
        { name: 'Charcoal', value: '#333333' },
        { name: 'Black', value: '#000000' },
        { name: 'Navy', value: '#131928' },
        { name: 'Red', value: '#B31217' },
        { name: 'Dark Heather', value: '#47484d' },
        { name: 'Indigo Blue', value: '#395d82' },
        { name: 'Sport Grey', value: '#9b969c' },
        { name: 'Light Blue', value: '#a1c5e1' },
        { name: 'Light Pink', value: '#f3d4e3' }
      ] as Color[]
    },
    tshirt: {
      sizes: ['S', 'M', 'L', 'XL', 'XXL'] as const,
      colors: [
        { name: 'White', value: '#FFFFFF', border: true },
        { name: 'Light Grey', value: '#E5E5E5', border: true },
        { name: 'Ash Grey', value: '#B0B0B0' },
        { name: 'Charcoal', value: '#333333' },
        { name: 'Black', value: '#000000' },
        { name: 'Navy', value: '#1B365D' },
        { name: 'Red', value: '#B31217' },
        { name: 'Forest Green', value: '#2D5016' },
        { name: 'Burgundy', value: '#800020' },
        { name: 'Orange', value: '#FF8C00' },
        { name: 'Yellow', value: '#FFD667' },
        { name: 'Pink', value: '#FDbfC7' },
        { name: 'Athletic Heather', value: '#CECECC' },
        { name: 'Heather Dust', value: '#E5D9C9' },
        { name: 'Ash', value: '#F0F1EA' },
        { name: 'Mauve', value: '#BF6E6E' },
        { name: 'Steel Blue', value: '#668EA7' },
        { name: 'Mustard', value: '#EDA027' },
        { name: 'Heather Deep Teal', value: '#447085' },
        { name: 'Heather Prism Peach', value: '#F3C2B2' }
      ] as Color[]
    },
    cap: {
      colors: [
        { name: 'White', value: '#FFFFFF', border: true },
        { name: 'Light Blue', value: '#a6b9c6' },
        { name: 'Charcoal', value: '#393639' },
        { name: 'Navy', value: '#1c2330' },
        { name: 'Black', value: '#000000' },
        { name: 'Red', value: '#8e0a1f' }
      ] as Color[]
    }
  };

  // Get bundle products from stripe config
  const bundles: Record<string, Bundle> = {
    starter: {
      id: 1,
      name: "Starter Bundle",
      originalPrice: pricingLoading ? "..." : `£${bundlePricing.starter?.originalPrice.toFixed(2) || '54.97'}`,
      bundlePrice: pricingLoading ? 0 : bundlePricing.starter?.price || 49.99,
      savings: pricingLoading ? "..." : `Save £${bundlePricing.starter?.savings.absolute.toFixed(2) || '4.98'}`,
      image: "/starterbundle.png",
      urgency: "Limited Time Offer",
      popular: false,
      product: {
        id: 'prod_ScXwG3hpBhqNZW',
        priceId: 'price_1RhsUsGDbOGEgNLw2LAVZoGb',
        name: 'Starter Bundle',
        price: pricingLoading ? 0 : bundlePricing.starter?.price || 49.99
      },
      items: [
        {
          type: 'tshirt',
          name: 'Reform UK T-Shirt',
          customizable: true,
          baseImage: 'Tshirt/Men/ReformMenTshirtBlack1.webp'
        },
        {
          type: 'cap',
          name: 'Reform UK Cap',
          customizable: true,
          baseImage: 'Cap/ReformCapBlack1.webp'
        },
        {
          type: 'mug',
          name: 'Reform UK Mug',
          customizable: false,
          baseImage: 'MugMouse/ReformMug1.webp'
        }
      ]
    },
    champion: {
      id: 2,
      name: "Champion Bundle",
      originalPrice: pricingLoading ? "..." : `£${bundlePricing.champion?.originalPrice.toFixed(2) || '104.96'}`,
      bundlePrice: pricingLoading ? 0 : bundlePricing.champion?.price || 89.99,
      savings: pricingLoading ? "..." : `Save £${bundlePricing.champion?.savings.absolute.toFixed(2) || '14.97'}`,
      image: "/championbundle.png",
      urgency: "Most Popular",
      popular: true,
      product: {
        id: 'prod_ScXvVATO8FKCvG',
        priceId: 'price_1RhsW8GDbOGEgNLwahSqdPDz',
        name: 'Champion Bundle',
        price: pricingLoading ? 0 : bundlePricing.champion?.price || 89.99
      },
      items: [
        {
          type: 'hoodie',
          name: 'Reform UK Hoodie',
          customizable: true,
          baseImage: 'Hoodie/Men/ReformMenHoodieBlack1.webp'
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
          type: 'mousepad',
          name: 'Reform UK Mouse Pad',
          variant: 'White',
          customizable: false,
          baseImage: 'MugMouse/ReformMousePadWhite1.webp'
        }
      ]
    },
    activist: {
      id: 3,
      name: "Activist Bundle",
      originalPrice: pricingLoading ? "..." : `£${bundlePricing.activist?.originalPrice.toFixed(2) || '159.93'}`,
      bundlePrice: pricingLoading ? 0 : bundlePricing.activist?.price || 127.99,
      savings: pricingLoading ? "..." : `Save £${bundlePricing.activist?.savings.absolute.toFixed(2) || '31.94'}`,
      image: "/activistbundle.png",
      urgency: "Best Value",
      popular: false,
      product: {
        id: 'prod_ScXuloowrz4FVk',
        priceId: 'price_1RhsXRGDbOGEgNLwiiZNVuie',
        name: 'Activist Bundle',
        price: pricingLoading ? 0 : bundlePricing.activist?.price || 127.99
      },
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
          type: 'mousepad',
          name: 'Reform UK Mouse Pad',
          variant: 'White',
          customizable: false,
          baseImage: 'MugMouse/ReformMousePadWhite1.webp'
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
          ...(prev[activeBundle as keyof typeof prev] as Record<string, { size?: string; color?: string }>)[itemType],
          [field]: value
        }
      }
    }));
  };

  const getProductImage = (item: BundleItem) => {
    if (!item.customizable) {
      return item.baseImage;
    }

    const selection = currentSelections[item.type as keyof typeof currentSelections] as { size?: string; color?: string };
    const color = selection.color || 'Black';
    
    if (item.type === 'hoodie') {
      // Map color names to image file names
      const colorMap: { [key: string]: string } = {
        'Black': 'Black',
        'Navy': 'Blue', // Using Blue images for Navy
        'Red': 'Red',
        'Dark Heather': 'Charcoal', // Using Charcoal images for Dark Heather
        'Indigo Blue': 'Blue',
        'Sport Grey': 'LightGrey',
        'Light Blue': 'Blue', // Using Blue images for Light Blue
        'Light Pink': 'Red', // Using Red images for Light Pink
        'White': 'White',
        'Light Grey': 'LightGrey',
        'Ash Grey': 'AshGrey',
        'Charcoal': 'Charcoal'
      };
      
      const colorKey = colorMap[color] || color;
      return `Hoodie/Men/ReformMenHoodie${colorKey}1.webp`;
    } else if (item.type === 'tshirt') {
      // Map color names to image file names
      const colorMap: { [key: string]: string } = {
        'Black': 'Black',
        'White': 'White',
        'Light Grey': 'LightGrey',
        'Ash Grey': 'AshGrey',
        'Charcoal': 'Charcoal',
        'Navy': 'Blue', // Using Blue images for Navy
        'Red': 'Red',
        'Forest Green': 'Green',
        'Burgundy': 'Burgundy',
        'Orange': 'Orange',
        'Yellow': 'Yellow',
        'Pink': 'Pink',
        'Athletic Heather': 'AthleticHeather',
        'Heather Dust': 'HeatherDust',
        'Ash': 'Ash',
        'Mauve': 'Mauve',
        'Steel Blue': 'SteelBlue',
        'Mustard': 'Mustard',
        'Heather Deep Teal': 'HeatherDeepTeal',
        'Heather Prism Peach': 'HeatherPrismPeach'
      };
      
      const colorKey = colorMap[color] || color;
      return `Tshirt/Men/ReformMenTshirt${colorKey}1.webp`;
    }
    
    return item.baseImage;
  };

  const getVariantDescription = (item: BundleItem): string => {
    if (!item.customizable) {
      return item.variant || '';
    }

    const selection = currentSelections[item.type as keyof typeof currentSelections] as { size?: string; color?: string };
    
    if (item.type === 'hoodie' || item.type === 'tshirt') {
      return `${selection.color || 'Black'} (Size ${selection.size || 'M'})`;
    }
    
    return selection.color || 'Default';
  };

  const ColorSwatch = ({ color, isSelected, onClick }: { color: Color, isSelected: boolean, onClick: () => void }) => (
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

  const handleBuyNow = () => {
    // Generate bundle contents with selected variants
    const bundleContents: BundleContent[] = currentBundle.items.map(item => ({
      name: item.name,
      variant: getVariantDescription(item),
      image: getProductImage(item)
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
    
    // Store detailed variant selections in sessionStorage for checkout
    const variantSelections = {
      bundleId: activeBundle,
      selections: bundleSelections[activeBundle as keyof typeof bundleSelections],
      timestamp: Date.now()
    };
    sessionStorage.setItem('bundleVariantSelections', JSON.stringify(variantSelections));
    
    addToCart(bundleItem);
    navigate('/checkout');
  };

  const handleAddBundleToCart = () => {
    // Generate bundle contents with selected variants
    const bundleContents: BundleContent[] = currentBundle.items.map(item => ({
      name: item.name,
      variant: getVariantDescription(item),
      image: getProductImage(item)
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
    
    // Store detailed variant selections in sessionStorage for checkout
    const variantSelections = {
      bundleId: activeBundle,
      selections: bundleSelections[activeBundle as keyof typeof bundleSelections],
      timestamp: Date.now()
    };
    sessionStorage.setItem('bundleVariantSelections', JSON.stringify(variantSelections));
    
    addToCart(bundleItem);
    navigate('/checkout');
  };

  // Render bundle card with updated pricing and free shipping badge
  const renderBundleCard = (bundleKey: BundleKey) => {
    const bundle = bundles[bundleKey];
    const pricing = bundlePricing[bundleKey];
    const isActive = activeBundle === bundleKey;

    return (
      <div
        key={bundleKey}
        onClick={() => setActiveBundle(bundleKey)}
        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
          isActive
            ? 'border-[#009fe3] bg-blue-50 shadow-lg'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }`}
      >
        {/* Popular badge */}
        {bundle.popular && (
          <div className="absolute -top-2 -right-2 bg-[#009fe3] text-white text-xs font-bold px-2 py-1 rounded-full">
            POPULAR
          </div>
        )}

        {/* Bundle image */}
        <div className="mb-4">
          <img
            src={bundle.image}
            alt={bundle.name}
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>

        {/* Bundle info */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-gray-900">{bundle.name}</h3>
          <p className="text-sm text-gray-600">{bundle.urgency}</p>
          
          {/* Pricing section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 line-through">
                {bundle.originalPrice}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-[#009fe3]">
                  £{bundle.bundlePrice.toFixed(2)}
                </span>

              </div>
            </div>
            
            {/* Savings */}
            <div className="text-sm text-green-600 font-medium">
              {bundle.savings}
              {pricing && ` (${pricing.savings.percentage.toFixed(0)}%)`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
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
                onClick={() => setActiveBundle(key as BundleKey)}
                className={`px-6 py-3 rounded-md font-semibold transition-all duration-200 relative ${
                  activeBundle === key as BundleKey
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

        {/* Bundle Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {renderBundleCard('starter')}
          {renderBundleCard('champion')}
          {renderBundleCard('activist')}
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
            
            {/* Bundle Information Section */}
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4">{currentBundle.name}</h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg text-gray-500 line-through">{currentBundle.originalPrice}</span>
                  <span className="text-green-600 font-semibold">{currentBundle.savings}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-[#009fe3]">£{currentBundle.bundlePrice.toFixed(2)}</span>

                </div>
                {/* Show savings percentage if available */}
                {bundlePricing[activeBundle] && (
                  <div className="text-sm text-green-600 mt-1">
                    You save {bundlePricing[activeBundle].savings.percentage.toFixed(0)}% on this bundle!
                  </div>
                )}
              </div>
              
              {/* Bundle Items with Variant Selection */}
              <div className="mb-6">
                <h4 className="font-semibold mb-4 text-gray-700">Customize Your Bundle:</h4>
                <div className="space-y-4">
                  {currentBundle.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <img 
                          src={getProductImage(item)} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-2">{item.name}</h5>
                          
                          {item.customizable ? (
                            <div className="space-y-3">
                              {/* Size Selection for Hoodies/T-shirts */}
                              {(item.type === 'hoodie' || item.type === 'tshirt') && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
                                  <div className="flex gap-1 flex-wrap">
                                    {(productOptions[item.type as ProductType]?.sizes || []).map((size) => (
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
                                  {(productOptions[item.type as ProductType]?.colors || []).map((color: Color) => (
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
    </section>
    </>
  );
};

export default ProductBundles;