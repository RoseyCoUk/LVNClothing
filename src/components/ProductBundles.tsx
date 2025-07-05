import { useState } from 'react';
import { ShoppingCart, Star, AlertTriangle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { createCheckoutSession } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import OrderOverviewModal from './OrderOverviewModal';

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
  [key in BundleKey]: Record<string, { gender?: string; size?: string; color?: string }>;
};

// Add type for product options
type ProductType = 'hoodie' | 'tshirt' | 'cap';
type ProductOptions = {
  [key in ProductType]: {
    genders?: readonly string[];
    sizes?: readonly string[];
    colors: Color[];
  };
};

const ProductBundles = () => {
  const { addToCart } = useCart();
  const [activeBundle, setActiveBundle] = useState('starter');
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderOverview, setShowOrderOverview] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderToConfirm | null>(null);

  // Variant selection states for each bundle
  const [bundleSelections, setBundleSelections] = useState<BundleSelections>({
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
  const productOptions: ProductOptions = {
    hoodie: {
      genders: ['Men', 'Women'] as const,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const,
      colors: [
        { name: 'White', value: '#FFFFFF', border: true },
        { name: 'Light Grey', value: '#E5E5E5', border: true },
        { name: 'Ash Grey', value: '#B0B0B0' },
        { name: 'Charcoal', value: '#333333' },
        { name: 'Black', value: '#000000' },
        { name: 'Royal Blue', value: '#0B4C8A' },
        { name: 'Red', value: '#B31217' }
      ] as Color[]
    },
    tshirt: {
      genders: ['Men', 'Women'] as const,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const,
      colors: [
        { name: 'White', value: '#FFFFFF', border: true },
        { name: 'Light Grey', value: '#E5E5E5', border: true },
        { name: 'Ash Grey', value: '#B0B0B0' },
        { name: 'Charcoal', value: '#333333' },
        { name: 'Black', value: '#000000' },
        { name: 'Royal Blue', value: '#0B4C8A' },
        { name: 'Red', value: '#B31217' }
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
      originalPrice: "£44.98",
      bundlePrice: 34.99,
      savings: "Save £9.99",
      image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Limited Time Offer",
      popular: false,
      product: {
        id: 'prod_ScXwG3hpBhqNZW',
        priceId: 'price_1RhIqZ6AAjJ6M3ik16hsTCQ6',
        name: 'Starter Bundle',
        price: 34.99
      },
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
      originalPrice: "£114.96",
      bundlePrice: 99.99,
      savings: "Save £14.97",
      image: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Most Popular",
      popular: true,
      product: {
        id: 'prod_ScXvVATO8FKCvG',
        priceId: 'price_1RhIph6AAjJ6M3ikoGC9C5UC',
        name: 'Champion Bundle',
        price: 99.99
      },
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
      originalPrice: "£194.91",
      bundlePrice: 169.99,
      savings: "Save £24.92",
      image: "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=600",
      urgency: "Best Value",
      popular: false,
      product: {
        id: 'prod_ScXuloowrz4FVk',
        priceId: 'price_1RhIp36AAjJ6M3ikraHGlvUt',
        name: 'Activist Bundle',
        price: 169.99
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
          ...(prev[activeBundle as keyof typeof prev] as Record<string, { gender?: string; size?: string; color?: string }>)[itemType],
          [field]: value
        }
      }
    }));
  };

  const getImageForSelection = (item: BundleItem) => {
    if (!item.customizable) return item.baseImage;
    
    const selection = currentSelections[item.type as keyof typeof currentSelections] as { gender?: string; size?: string; color?: string };
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

  const getVariantText = (item: BundleItem): string => {
    if (!item.customizable) return item.variant || '';
    
    const selection = currentSelections[item.type as keyof typeof currentSelections] as { gender?: string; size?: string; color?: string };
    if (!selection) return '';
    
    if (item.type === 'hoodie' || item.type === 'tshirt') {
      return `${selection.gender || 'Men'}'s ${selection.color || 'Black'} (Size ${selection.size || 'M'})`;
    } else if (item.type === 'cap') {
      return selection.color || 'Black';
    }
    
    return '';
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

  const handleBuyNow = async () => {
    if (!currentBundle.product) {
      return;
    }

    // Generate bundle contents with selected variants
    const bundleContents: BundleContent[] = currentBundle.items.map(item => ({
      name: item.name,
      variant: getVariantText(item),
      image: getImageForSelection(item)
    }));

    // Create a flat variants object for the modal
    const flatVariants: Record<string, string> = {};
    currentBundle.items.forEach(item => {
      if (item.customizable) {
        const selection = currentSelections[item.type as keyof typeof currentSelections] as { gender?: string; size?: string; color?: string };
        if (selection) {
          if (selection.gender) flatVariants[`${item.type}Gender`] = selection.gender;
          if (selection.size) flatVariants[`${item.type}Size`] = selection.size;
          if (selection.color) flatVariants[`${item.type}Color`] = selection.color;
        }
      } else {
        flatVariants[`${item.type}Variant`] = item.variant || '';
      }
    });

    // Set up the order details for confirmation
    setOrderToConfirm({
      productName: currentBundle.name,
      productImage: currentBundle.image,
      price: currentBundle.bundlePrice,
      quantity: 1,
      priceId: currentBundle.product.priceId,
      variants: flatVariants,
      isBundle: true,
      bundleContents
    });
    
    setShowOrderOverview(true);
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
        // Handle development environment gracefully
      } else {
        // Handle checkout error gracefully
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

  const handleAddBundleToCart = () => {
    // Generate bundle contents with selected variants
    const bundleContents: BundleContent[] = currentBundle.items.map(item => ({
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
            
            {/* Image Section - Full Width */}
            <div className="relative">
              <img 
                src={currentBundle.image} 
                alt={currentBundle.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {currentBundle.urgency}
                </span>
              </div>
            </div>
            
            {/* Bundle Information Section */}
            <div className="p-6">
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
                                    {(productOptions[item.type as ProductType]?.genders || []).map((gender) => (
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

export default ProductBundles;