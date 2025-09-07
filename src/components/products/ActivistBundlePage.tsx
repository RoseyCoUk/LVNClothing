import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Star, Check, Plus, Minus, Clock, Truck, Shield, RotateCcw, Info, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { createCheckoutSession } from '../../lib/stripe';
import OrderOverviewModal from '../OrderOverviewModal';
import { useBundleCalculation } from '../../hooks/useBundleCalculation';
import { useBundlePricing } from '../../hooks/useBundlePricing';
import { useMergedProducts } from '../../hooks/useMergedProducts';
import { findHoodieVariant } from '../../hooks/hoodie-variants-merged-fixed';
import { useTshirtVariants, colorDesignMapping } from '../../hooks/tshirt-variants-merged-fixed';
import { findCapVariantByColor } from '../../hooks/cap-variants';
import { WaterbottleVariants } from '../../hooks/waterbottle-variants';
import { MousepadVariants } from '../../hooks/mousepad-variants';
import { TotebagVariants } from '../../hooks/totebag-variants';
import { MugVariants } from '../../hooks/mug-variants';
import type { PrintfulProduct, PrintfulVariant, BundleProduct, BundleItem } from '../../types/printful';
import { Toast, useToast } from '../../components/ui/Toast';

interface Color {
  name: string;
  value: string;
  border?: boolean;
}



interface BundleItemLocal {
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
  const { addToCart, addToCartAndGetUpdated, clearCart, cartItems: getCartItems, addMultipleToCart } = useCart();
  const { isVisible, message, showToast, hideToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderOverview, setShowOrderOverview] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderToConfirm | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Bundle products state
  const [bundleProducts, setBundleProducts] = useState<BundleItem[]>([]);

  // Get bundle pricing from the new system
  const { bundlePricing } = useBundlePricing();
  const activistPricing = bundlePricing.activist;

  // Use the same merged products system as individual product pages
  const { getProductByCategory, isLoading: mergedLoading, error: mergedError } = useMergedProducts();
  const tshirtVariantsHook = useTshirtVariants();
  const findTshirtVariant = tshirtVariantsHook?.findTshirtVariant;
  
  // Helper functions to find variants for each product type
  const findCapVariant = (color: string) => {
    return findCapVariantByColor(color);
  };
  
  const findTotebagVariant = () => {
    return TotebagVariants[0]; // Only one tote bag variant available
  };
  
  // Get products using the same method as individual pages
  const hoodieProduct = getProductByCategory('hoodie');
  const tshirtProduct = getProductByCategory('tshirt');
  const capProduct = getProductByCategory('cap');
  const totebagProduct = getProductByCategory('tote');
  const waterbottleProduct = getProductByCategory('water-bottle');
  const mugProduct = getProductByCategory('mug');
  const mousepadProduct = getProductByCategory('mouse-pad');

  // Bundle calculation hook
  const {
    calculation,
    addItem,
    removeItem,
    clearBundle,
    getItemCount
  } = useBundleCalculation(bundleProducts, setBundleProducts);

  // Hoodie customization options
  const [hoodieSize, setHoodieSize] = useState('M');
  const [hoodieColor, setHoodieColor] = useState('Black');
  
  // T-shirt customization options
  const [tshirtSize, setTshirtSize] = useState('M');
  const [tshirtColor, setTshirtColor] = useState('Pink');
  
  // Cap customization options
  const [capColor, setCapColor] = useState('Black');

  // Helper function to convert size names for variant lookup
  const convertSizeForVariant = (size: string): string => {
    // T-shirt/Hoodie variants use "2XL" but UI shows "XXL"
    if (size === 'XXL') return '2XL';
    return size;
  };

  // Track variant selections
  const [selectedTshirtVariant, setSelectedTshirtVariant] = useState<any>(null);
  const [selectedCapVariant, setSelectedCapVariant] = useState<any>(null);

  // Image browsing state
  const [selectedItem, setSelectedItem] = useState('hoodie');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productData = {
    name: "Activist Bundle",
    originalPrice: "£159.93",
    bundlePrice: 127.99,
    savings: "Save £31.94",
    description: "The ultimate bundle for Reform UK activists. This comprehensive collection includes a premium hoodie, T-shirt, cap, tote bag, water bottle, mug, and mouse pad - everything you need to make a statement and show your commitment to the movement.",
    shipping: "Fast UK Shipping",
    urgency: "Limited Time Offer",
    popular: false,
    rating: 4.9,
    reviews: 156,
    materials: "Premium cotton hoodie and T-shirt, adjustable cap, durable canvas tote bag, stainless steel water bottle, ceramic mug, and high-quality mouse pad",
    careInstructions: "Machine wash hoodie and T-shirt at 30°C. Cap can be hand washed. Tote bag spot clean. Water bottle dishwasher safe. Mug dishwasher safe.",
    features: [
      "Premium cotton hoodie with Reform UK branding",
      "Comfortable cotton T-shirt for everyday wear",
      "Adjustable cap for perfect fit",
      "Durable canvas tote bag for daily use",
      "Stainless steel water bottle keeps drinks cold for 24 hours",
      "Ceramic mug perfect for home or office",
      "High-quality mouse pad for desk setup",
      "Complete activist starter kit",
      "Excellent value bundle with significant savings",
      "Fast UK shipping available",
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
        type: 'mousepad',
        name: 'Reform UK Mouse Pad',
        customizable: false,
        baseImage: '/MugMouse/ReformMousePadWhite1.webp',
        description: 'High-quality mouse pad with Reform UK branding.',
        images: [
          '/MugMouse/ReformMousePadWhite1.webp',
          '/MugMouse/ReformMousePadWhite2.webp'
        ]
      }
    ],
    image: "/activistbundle.png",
  };

  // Hoodie colors (9 options from ChampionBundlePage)
  const hoodieColorOptions: Color[] = [
    { name: 'Black', value: '#0b0b0b' },
    { name: 'Navy', value: '#131928' },
    { name: 'Red', value: '#da0a1a' },
    { name: 'Dark Heather', value: '#47484d' },
    { name: 'Indigo Blue', value: '#395d82' },
    { name: 'Sport Grey', value: '#9b969c' },
    { name: 'Light Blue', value: '#a1c5e1' },
    { name: 'Light Pink', value: '#f3d4e3' },
    { name: 'White', value: '#ffffff', border: true }
  ];

  // T-shirt colors will be defined inline like StarterBundlePage

  // Cap colors will be defined inline like StarterBundlePage

  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

  // Initialize bundle with products when they load
  useEffect(() => {
    // Only require the core products that we know exist
    if (hoodieProduct && tshirtProduct && capProduct && totebagProduct && mugProduct) {
      // Create bundle items directly (matching StarterBundlePage approach)
      const hoodieBundleItem = {
        product: {
          id: hoodieProduct.id,
          name: hoodieProduct.name,
          category: 'hoodie',
          image: hoodieProduct.image_url,
          images: hoodieProduct.baseProduct?.images || [],
          variants: hoodieProduct.variants || []
        },
        variant: hoodieProduct.variants?.find(v => v.color === hoodieColor && v.size === hoodieSize) || hoodieProduct.variants?.[0] || {
          id: 'hoodie-default',
          color: hoodieColor,
          size: hoodieSize,
          price: hoodieProduct.priceRange?.min || '39.99',
          image: getHoodieImages()[0]
        }
      };
      
      const tshirtBundleItem = {
        product: {
          id: tshirtProduct.id,
          name: tshirtProduct.name,
          category: 'tshirt',
          image: tshirtProduct.image_url,
          images: tshirtProduct.baseProduct?.images || [],
          variants: tshirtProduct.variants || []
        },
        variant: tshirtProduct.variants?.find(v => v.color === tshirtColor && v.size === tshirtSize) || tshirtProduct.variants?.[0] || {
          id: 'tshirt-default',
          color: tshirtColor,
          size: tshirtSize,
          price: tshirtProduct.priceRange?.min || '24.99',
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
        variant: capProduct.variants?.find(v => v.color === capColor) || capProduct.variants?.[0] || {
          id: 'cap-default',
          color: capColor,
          price: capProduct.priceRange?.min || '19.99',
          image: getCapImages()[0]
        }
      };
      
      const toteBundleItem = {
        product: {
          id: totebagProduct.id,
          name: totebagProduct.name,
          category: 'tote',
          image: totebagProduct.image_url,
          images: totebagProduct.baseProduct?.images || [],
          variants: totebagProduct.variants || []
        },
        variant: totebagProduct.variants?.[0] || {
          id: 'tote-default',
          color: 'Black',
          price: totebagProduct.priceRange?.min || '14.99',
          image: getTotebagImages()[0]
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
        variant: mugProduct.variants?.[0] || {
          id: 'mug-default',
          color: 'White',
          price: mugProduct.priceRange?.min || '9.99',
          image: getMugImages()[0]
        }
      };
      
      // Create water bottle bundle item using actual variant data
      const waterBottleVariant = WaterbottleVariants[0]; // Only one variant available
      const waterBottleBundleItem = {
        product: {
          id: 'water-bottle-product',
          name: 'Reform UK Water Bottle',
          category: 'water-bottle',
          image: '/StickerToteWater/ReformWaterBottleWhite1.webp',
          images: [
            { image_url: '/StickerToteWater/ReformWaterBottleWhite1.webp' },
            { image_url: '/StickerToteWater/ReformWaterBottleWhite2.webp' },
            { image_url: '/StickerToteWater/ReformWaterBottleWhite3.webp' },
            { image_url: '/StickerToteWater/ReformWaterBottleWhite4.webp' }
          ],
          variants: [{
            id: waterBottleVariant.key,
            color: 'White',
            price: parseFloat(waterBottleVariant.price || '24.99'),
            printful_variant_id: waterBottleVariant.catalogVariantId,
            external_id: waterBottleVariant.externalId,
            sku: waterBottleVariant.sku
          }]
        },
        variant: {
          id: waterBottleVariant.key,
          color: 'White',
          price: waterBottleVariant.price || '24.99',
          image: '/StickerToteWater/ReformWaterBottleWhite1.webp',
          printful_variant_id: waterBottleVariant.catalogVariantId,
          external_id: waterBottleVariant.externalId,
          sku: waterBottleVariant.sku
        }
      };
      
      // Create mouse pad bundle item using actual variant data
      const mousepadVariant = MousepadVariants[0]; // Only one variant available
      const mousepadBundleItem = {
        product: {
          id: 'mouse-pad-product',
          name: 'Reform UK Mouse Pad',
          category: 'mouse-pad',
          image: '/MugMouse/ReformMousePadWhite1.webp',
          images: [
            { image_url: '/MugMouse/ReformMousePadWhite1.webp' },
            { image_url: '/MugMouse/ReformMousePadWhite2.webp' }
          ],
          variants: [{
            id: mousepadVariant.key,
            color: 'White',
            price: parseFloat(mousepadVariant.price || '14.99'),
            printful_variant_id: mousepadVariant.catalogVariantId,
            external_id: mousepadVariant.externalId,
            sku: mousepadVariant.sku
          }]
        },
        variant: {
          id: mousepadVariant.key,
          color: 'White',
          price: mousepadVariant.price || '14.99',
          image: '/MugMouse/ReformMousePadWhite1.webp',
          printful_variant_id: mousepadVariant.catalogVariantId,
          external_id: mousepadVariant.externalId,
          sku: mousepadVariant.sku
        }
      };
      
      const newBundleProducts = [
        hoodieBundleItem,
        tshirtBundleItem,
        capBundleItem,
        toteBundleItem,
        waterBottleBundleItem,
        mugBundleItem,
        mousepadBundleItem
      ];
      setBundleProducts(newBundleProducts);
    }
  }, [hoodieProduct, tshirtProduct, capProduct, totebagProduct, mugProduct]);

  // Update t-shirt variant when color/size changes
  useEffect(() => {
    if (tshirtColor && tshirtSize && findTshirtVariant) {
      // Determine the correct design based on color
      const design = colorDesignMapping[tshirtColor] || 'DARK';
      const variantSize = convertSizeForVariant(tshirtSize);
      let variant = findTshirtVariant(design, variantSize, tshirtColor);
      
      // Try fallback design if first attempt fails
      if (!variant) {
        const fallbackDesign = design === 'DARK' ? 'LIGHT' : 'DARK';
        console.log(`DEBUG: Trying fallback design: ${fallbackDesign}`);
        variant = findTshirtVariant(fallbackDesign, variantSize, tshirtColor);
      }
      
      setSelectedTshirtVariant(variant);
      console.log(`DEBUG: T-shirt variant lookup - Color: ${tshirtColor}, Design: ${design}, Size: ${tshirtSize}, Variant Size: ${variantSize}, Found variant:`, variant);
    }
  }, [tshirtColor, tshirtSize, findTshirtVariant]);

  // Update cap variant when color changes
  useEffect(() => {
    if (capColor) {
      const variant = findCapVariant(capColor);
      if (variant) {
        setSelectedCapVariant(variant);
      }
    }
  }, [capColor, findCapVariant]);

  // Update hoodie in bundle when variant changes
  useEffect(() => {
    if (hoodieProduct && bundleProducts.length > 0) {
      const updatedBundleProducts = [...bundleProducts];
      const hoodieIndex = updatedBundleProducts.findIndex(item => item.product.category === 'hoodie');
      if (hoodieIndex !== -1) {
        const hoodieVariant = hoodieProduct.variants?.find(v => v.color === hoodieColor && v.size === hoodieSize);
        if (hoodieVariant) {
          updatedBundleProducts[hoodieIndex] = {
            ...updatedBundleProducts[hoodieIndex],
            variant: hoodieVariant
          };
          setBundleProducts(updatedBundleProducts);
        }
      }
    }
  }, [hoodieColor, hoodieSize]); // Removed hoodieProduct to prevent infinite loop

  // Update t-shirt in bundle when variant changes
  useEffect(() => {
    if (tshirtProduct && bundleProducts.length > 0) {
      const updatedBundleProducts = [...bundleProducts];
      const tshirtIndex = updatedBundleProducts.findIndex(item => item.product.category === 'tshirt');
      if (tshirtIndex !== -1) {
        const tshirtVariant = tshirtProduct.variants?.find(v => v.color === tshirtColor && v.size === tshirtSize);
        if (tshirtVariant) {
          updatedBundleProducts[tshirtIndex] = {
            ...updatedBundleProducts[tshirtIndex],
            variant: tshirtVariant
          };
          setBundleProducts(updatedBundleProducts);
        }
      }
    }
  }, [tshirtColor, tshirtSize]); // Removed tshirtProduct to prevent infinite loop

  // Update cap in bundle when variant changes
  useEffect(() => {
    if (capProduct && bundleProducts.length > 0) {
      const updatedBundleProducts = [...bundleProducts];
      const capIndex = updatedBundleProducts.findIndex(item => item.product.category === 'cap');
      if (capIndex !== -1) {
        const capVariant = capProduct.variants?.find(v => v.color === capColor);
        if (capVariant) {
          updatedBundleProducts[capIndex] = {
            ...updatedBundleProducts[capIndex],
            variant: capVariant
          };
          setBundleProducts(updatedBundleProducts);
        }
      }
    }
  }, [capColor]); // Removed capProduct to prevent infinite loop

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

  // Get Hoodie images based on selected color (same logic as HoodiePage)
  const getHoodieImages = () => {
    if (!hoodieProduct?.baseProduct?.images) return ['/BackReformLogo.png'];
    const mergedImages = hoodieProduct.baseProduct.images;
    
    if (hoodieColor) {
      const colorImages = mergedImages.filter(img => 
        img.color?.toLowerCase() === hoodieColor.toLowerCase()
      );
      if (colorImages.length > 0) {
        return colorImages.sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          .map(img => img.image_url);
      }
    }
    
    const generalImages = mergedImages.filter(img => !img.variant_type || img.variant_type === 'product');
    return generalImages.length > 0 ? generalImages.map(img => img.image_url) : ['/BackReformLogo.png'];
  };
  
  // Get T-shirt images
  const getTshirtImages = () => {
    if (!tshirtProduct?.baseProduct?.images) return ['/BackReformLogo.png'];
    const mergedImages = tshirtProduct.baseProduct.images;
    
    if (tshirtColor) {
      const colorImages = mergedImages.filter(img => 
        img.color?.toLowerCase() === tshirtColor.toLowerCase()
      );
      if (colorImages.length > 0) {
        return colorImages.map(img => img.image_url);
      }
    }
    return mergedImages.map(img => img.image_url).slice(0, 5);
  };
  
  // Get Cap images
  const getCapImages = () => {
    if (!capProduct?.baseProduct?.images) return ['/BackReformLogo.png'];
    const mergedImages = capProduct.baseProduct.images;
    
    if (capColor) {
      const colorImages = mergedImages.filter(img => 
        img.color?.toLowerCase() === capColor.toLowerCase()
      );
      if (colorImages.length > 0) {
        return colorImages.map(img => img.image_url);
      }
    }
    return mergedImages.map(img => img.image_url);
  };
  
  // Get Totebag images
  const getTotebagImages = () => {
    if (!totebagProduct?.baseProduct?.images || totebagProduct.baseProduct.images.length === 0) {
      return ['/BackReformLogo.png'];
    }
    return totebagProduct.baseProduct.images.map(img => img.image_url);
  };
  
  // Get Water Bottle images (hardcoded since not in DB)
  const getWaterbottleImages = () => {
    return [
      '/StickerToteWater/ReformWaterBottleWhite1.webp',
      '/StickerToteWater/ReformWaterBottleWhite2.webp',
      '/StickerToteWater/ReformWaterBottleWhite3.webp',
      '/StickerToteWater/ReformWaterBottleWhite4.webp'
    ];
  };
  
  // Get Mug images
  const getMugImages = () => {
    if (!mugProduct?.baseProduct?.images || mugProduct.baseProduct.images.length === 0) {
      return ['/BackReformLogo.png'];
    }
    return mugProduct.baseProduct.images.map(img => img.image_url);
  };
  
  // Get Mouse Pad images (hardcoded since not in DB)
  const getMousepadImages = () => {
    return [
      '/MugMouse/ReformMousePadWhite1.webp',
      '/MugMouse/ReformMousePadWhite2.webp'
    ];
  };

  const getCurrentImages = () => {
    if (selectedItem === 'hoodie') return getHoodieImages();
    if (selectedItem === 'tshirt') return getTshirtImages();
    if (selectedItem === 'cap') return getCapImages();
    if (selectedItem === 'tote') return getTotebagImages();
    if (selectedItem === 'water-bottle') return getWaterbottleImages();
    if (selectedItem === 'mug') return getMugImages();
    if (selectedItem === 'mouse-pad') return getMousepadImages();
    return ['/BackReformLogo.png'];
  };

  const getCurrentImageForProduct = (category: string): string => {
    if (category === 'hoodie') return getHoodieImages()[0];
    if (category === 'tshirt') return getTshirtImages()[0];
    if (category === 'cap') return getCapImages()[0];
    if (category === 'tote') return getTotebagImages()[0];
    if (category === 'water-bottle') return getWaterbottleImages()[0];
    if (category === 'mug') return getMugImages()[0];
    if (category === 'mouse-pad') return getMousepadImages()[0];
    return '/BackReformLogo.png';
  };

  const getCurrentImage = () => {
    const images = getCurrentImages();
    return images[currentImageIndex] || images[0] || '';
  };

  const getVariantText = (item: BundleItem): string => {
    if (item.product.category === 'hoodie') {
      return `${hoodieColor} (Size ${hoodieSize})`;
    }
    if (item.product.category === 'tshirt') {
      return `${tshirtColor} (Size ${tshirtSize})`;
    }
    if (item.product.category === 'cap') {
      return `${capColor} Cap`;
    }
    if (item.product.category === 'tote') {
      return 'Black Tote Bag';
    }
    if (item.product.category === 'water-bottle') {
      return 'White Water Bottle';
    }
    if (item.product.category === 'mug') {
      return 'White Mug';
    }
    if (item.product.category === 'mouse-pad') {
      return 'White Mouse Pad';
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

  // Handle variant changes for hoodie
  const handleHoodieVariantChange = (variantType: 'color' | 'size', value: string) => {
    if (variantType === 'color') {
      setHoodieColor(value);
      setCurrentImageIndex(0);
    } else {
      setHoodieSize(value);
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
    const capVariant = findCapVariant(color);
    if (capVariant) {
      setSelectedCapVariant(capVariant);
    }
    setCurrentImageIndex(0);
  };



  const handleAddToCart = () => {
    if (bundleProducts.length === 0) {
      showToast('Please wait for bundle to load.');
      return;
    }

    const bundlePrice = activistPricing?.price || productData.bundlePrice;
    const bundleOriginalPrice = activistPricing?.originalPrice || 159.93;
    const bundleSavings = bundleOriginalPrice - bundlePrice;
    console.log('DEBUG: bundlePrice:', bundlePrice);

    // Build array of all bundle items with real individual prices
    const cartItems = bundleProducts.map((item, index) => {
      console.log(`DEBUG: Processing item ${index}:`, item);
      
      // Get variant ID with proper fallbacks
      let variantId = item.variant.printful_variant_id || 
                     item.variant.external_id || 
                     item.variant.sku ||
                     item.variant.id;
      
      // For each product type, ensure we have the correct variant ID
      if (item.product.category === 'hoodie') {
        const variantSize = convertSizeForVariant(hoodieSize);
        // Determine design based on color - DARK design is for darker colors, LIGHT for lighter colors
        const darkColors = ['Black', 'Navy', 'Red', 'Dark Heather', 'Indigo Blue'];
        const design = darkColors.includes(hoodieColor) ? 'DARK' : 'LIGHT';
        console.log(`🔍 Hoodie lookup - Design: ${design}, Size: ${hoodieSize}, Variant Size: ${variantSize}, Color: ${hoodieColor}`);
        const hoodieVariant = findHoodieVariant(design, variantSize, hoodieColor);
        console.log('📦 Hoodie variant found:', hoodieVariant);
        if (hoodieVariant) {
          variantId = hoodieVariant.catalogVariantId;
          console.log('✅ Hoodie variant ID:', variantId);
        } else {
          console.error('❌ No hoodie variant found!');
        }
      } else if (item.product.category === 'tshirt') {
        const design = colorDesignMapping[tshirtColor] || 'DARK';
        const variantSize = convertSizeForVariant(tshirtSize);
        console.log(`🔍 T-shirt lookup - Design: ${design}, Size: ${tshirtSize}, Variant Size: ${variantSize}, Color: ${tshirtColor}`);
        
        let tshirtVariant = findTshirtVariant ? findTshirtVariant(design, variantSize, tshirtColor) : null;
        
        if (!tshirtVariant && design === 'LIGHT' && findTshirtVariant) {
          console.log('⚠️ LIGHT variant not found, trying DARK');
          tshirtVariant = findTshirtVariant('DARK', variantSize, tshirtColor);
        } else if (!tshirtVariant && design === 'DARK' && findTshirtVariant) {
          console.log('⚠️ DARK variant not found, trying LIGHT');
          tshirtVariant = findTshirtVariant('LIGHT', variantSize, tshirtColor);
        }
        
        console.log('📦 T-shirt variant found:', tshirtVariant);
        
        if (tshirtVariant) {
          variantId = tshirtVariant.catalogVariantId;
          console.log('✅ T-shirt variant ID:', variantId);
        } else {
          console.error('❌ No T-shirt variant found!');
        }
      } else if (item.product.category === 'cap') {
        console.log(`🔍 Cap lookup - Color: ${capColor}`);
        const capVariant = selectedCapVariant || findCapVariant(capColor);
        console.log('📦 Cap variant found:', capVariant);
        if (capVariant) {
          variantId = capVariant.catalogVariantId;
          console.log('✅ Cap variant ID:', variantId);
        } else {
          console.error('❌ No cap variant found!');
        }
      } else if (item.product.category === 'tote') {
        // Tote bag has only one variant
        const totebagVariant = findTotebagVariant();
        if (totebagVariant) {
          variantId = totebagVariant.catalogVariantId;
        }
      } else if (item.product.category === 'mug') {
        // Mug has only one variant
        variantId = MugVariants[0].catalogVariantId;
      } else if (item.product.category === 'water-bottle') {
        // Water bottle has only one variant
        variantId = WaterbottleVariants[0].catalogVariantId;
      } else if (item.product.category === 'mouse-pad') {
        // Mouse pad has only one variant
        variantId = MousepadVariants[0].catalogVariantId;
      }
      
      // Ensure we have a valid variant ID
      if (!variantId) {
        console.error(`ERROR: No variant ID found for ${item.product.name}`);
        showToast(`Error: Unable to add ${item.product.name} - missing variant information`);
        return null;
      }

      // Get individual prices from bundle configuration
      const activistComponents = activistPricing?.components || [
        { productId: 2, name: 'Hoodie', price: 39.99 },
        { productId: 1, name: 'T-Shirt', price: 24.99 },
        { productId: 3, name: 'Cap', price: 19.99 },
        { productId: 5, name: 'Tote Bag', price: 24.99 },
        { productId: 6, name: 'Water Bottle', price: 24.99 },
        { productId: 4, name: 'Mug', price: 9.99 },
        { productId: 7, name: 'Mouse Pad', price: 14.99 }
      ];
      
      // Get the real individual price for this component
      let individualPrice = 0;
      if (item.product.category === 'hoodie') {
        individualPrice = activistComponents.find(c => c.name === 'Hoodie')?.price || 39.99;
      } else if (item.product.category === 'tshirt') {
        individualPrice = activistComponents.find(c => c.name === 'T-Shirt')?.price || 24.99;
      } else if (item.product.category === 'cap') {
        individualPrice = activistComponents.find(c => c.name === 'Cap')?.price || 19.99;
      } else if (item.product.category === 'tote') {
        individualPrice = activistComponents.find(c => c.name === 'Tote Bag')?.price || 24.99;
      } else if (item.product.category === 'water-bottle') {
        individualPrice = activistComponents.find(c => c.name === 'Water Bottle')?.price || 24.99;
      } else if (item.product.category === 'mug') {
        individualPrice = activistComponents.find(c => c.name === 'Mug')?.price || 9.99;
      } else if (item.product.category === 'mouse-pad') {
        individualPrice = activistComponents.find(c => c.name === 'Mouse Pad')?.price || 14.99;
      }

      // Get the real individual price for this component
      const itemPrice = individualPrice;

      // Use correct variant images based on selected colors
      let itemImage = '/BackReformLogo.png';
      if (item.product.category === 'hoodie') {
        itemImage = getHoodieImages()[0];
      } else if (item.product.category === 'tshirt') {
        itemImage = getTshirtImages()[0];
      } else if (item.product.category === 'cap') {
        itemImage = getCapImages()[0];
      } else if (item.product.category === 'tote') {
        itemImage = getTotebagImages()[0];
      } else if (item.product.category === 'mug') {
        itemImage = getMugImages()[0];
      } else if (item.product.category === 'water-bottle') {
        itemImage = getWaterbottleImages()[0];
      } else if (item.product.category === 'mouse-pad') {
        itemImage = getMousepadImages()[0];
      }

      const cartItem = {
        id: `activist-bundle-${item.product.category}-${index}`,
        name: item.product.name,
        price: itemPrice, // Real individual price
        image: itemImage,
        printful_variant_id: variantId,
        external_id: variantId, // Use the same valid variant ID
        sku: (() => {
          // Get SKU from the actual variant object based on the category
          if (item.product.category === 'hoodie') {
            const variantSize = convertSizeForVariant(hoodieSize);
            const darkColors = ['Black', 'Navy', 'Red', 'Dark Heather', 'Indigo Blue'];
            const design = darkColors.includes(hoodieColor) ? 'DARK' : 'LIGHT';
            const hoodieVariant = findHoodieVariant(design, variantSize, hoodieColor);
            return hoodieVariant?.sku || hoodieVariant?.externalId || `hoodie-${hoodieColor}-${hoodieSize}`.toLowerCase();
          } else if (item.product.category === 'tshirt' && findTshirtVariant) {
            const design = colorDesignMapping[tshirtColor] || 'DARK';
            const variantSize = convertSizeForVariant(tshirtSize);
            let tshirtVariant = findTshirtVariant(design, variantSize, tshirtColor);
            if (!tshirtVariant) {
              const fallbackDesign = design === 'DARK' ? 'LIGHT' : 'DARK';
              tshirtVariant = findTshirtVariant(fallbackDesign, variantSize, tshirtColor);
            }
            return tshirtVariant?.sku || tshirtVariant?.externalId || `tshirt-${tshirtColor}-${tshirtSize}`.toLowerCase();
          } else if (item.product.category === 'cap') {
            const capVariant = selectedCapVariant || findCapVariant(capColor);
            return capVariant?.sku || capVariant?.externalId || `cap-${capColor}`.toLowerCase();
          } else if (item.product.category === 'tote') {
            const totebagVariant = findTotebagVariant();
            return totebagVariant?.sku || totebagVariant?.externalId || 'tote-black';
          } else if (item.product.category === 'water-bottle') {
            return WaterbottleVariants[0]?.sku || WaterbottleVariants[0]?.externalId || 'waterbottle-white';
          } else if (item.product.category === 'mug') {
            return MugVariants[0]?.sku || MugVariants[0]?.externalId || 'mug-white-11oz';
          } else if (item.product.category === 'mouse-pad') {
            return MousepadVariants[0]?.sku || MousepadVariants[0]?.externalId || 'mousepad-white';
          }
          return item.variant.sku || item.variant.external_id || `${item.product.category}-default`;
        })(),
        // Only set size for items that actually have sizes (t-shirts and hoodies, not caps, mugs, etc.)
        size: (item.product.category === 'hoodie' || item.product.category === 'tshirt') ? 
              (item.product.category === 'hoodie' ? hoodieSize : tshirtSize) : undefined,
        color: item.product.category === 'hoodie' ? hoodieColor :
               item.product.category === 'tshirt' ? tshirtColor :
               item.product.category === 'cap' ? capColor : 
               ['water-bottle', 'mug', 'mouse-pad'].includes(item.product.category) ? 'White' : 
               item.product.category === 'tote' ? 'Black' : undefined,
        // For mug, add volume instead of size
        volume: item.product.category === 'mug' ? '11 oz' : undefined,
        isPartOfBundle: true,
        bundleName: 'Activist Bundle',
        bundleId: 'activist-bundle'
      };
      
      console.log(`DEBUG: Prepared cart item ${index}:`, cartItem);
      console.log(`DEBUG: Variant ID for ${item.product.name}:`, variantId);
      return cartItem;
    }).filter(item => item !== null); // Remove any null items
    
    console.log(`DEBUG: After filtering, ${cartItems.length} out of ${bundleProducts.length} items remain:`, cartItems);
    
    // Add discount item as the 7th item with negative price
    const discountAmount = bundleSavings; // This is the savings amount (31.94)
    const discountItem = {
      id: `activist-bundle-discount`,
      name: 'Activist Bundle Discount (20%)',
      price: -discountAmount, // Negative price for discount
      image: '/BackReformLogo.png', // Use logo for discount item
      printful_variant_id: 'BUNDLE_DISCOUNT_ACTIVIST', // Placeholder that won't break checkout
      external_id: 'BUNDLE_DISCOUNT_ACTIVIST',
      isPartOfBundle: true,
      bundleName: 'Activist Bundle',
      bundleId: 'activist-bundle',
      isDiscount: true // Special flag to identify as discount
    };
    
    // Add the discount item to the cart items
    cartItems.push(discountItem);
    
    if (cartItems.length === 0) {
      console.error('ERROR: No valid items to add to cart');
      showToast('Error: Unable to add bundle - missing product information');
      return;
    }
    
    console.log('DEBUG: Adding all items to cart at once:', cartItems);
    addMultipleToCart(cartItems);
    
    // Show success message - don't redirect to checkout
    showToast(`Activist Bundle (${bundleProducts.length} items) added to cart!`);
  };

  const handleBuyNow = () => {
    // Use the same logic as handleAddToCart to add individual items
    handleAddToCart();
    
    // After adding items, navigate to checkout
    setTimeout(() => {
      navigate('/checkout');
    }, 100);
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
                      {selectedItem === 'hoodie' && ` - ${hoodieColor}`}
                      {selectedItem === 'tshirt' && ` - ${tshirtColor}`}
                      {selectedItem === 'cap' && ` - ${capColor}`}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Bundle Items Grid - Clickable Thumbnails */}
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-4">
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
                      src={getCurrentImageForProduct(item.product.category) || item.variant.image || item.product.image || ''} 
                      alt={item.product.name} 
                      className={`w-full object-cover rounded-lg border-2 transition-all duration-200 aspect-square ${
                        selectedItem === item.product.category 
                          ? 'border-[#009fe3]' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    />
                    <p className={`text-xs mt-1 font-medium ${
                      selectedItem === item.product.category 
                        ? 'text-[#009fe3]' 
                        : 'text-gray-600'
                    }`}>
                      {item.product.name.replace('Reform UK ', '')}
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

                {/* Size Selection */}
                <div className="mb-4">
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
                    {sizeOptions.map((size) => (
                      <button 
                        key={size} 
                        onClick={() => handleHoodieVariantChange('size', size)} 
                        className={`px-4 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                          hoodieSize === size 
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
                  <label className="block text-sm font-medium text-gray-700 mb-3">Color: <span className="font-semibold text-gray-900">{hoodieColor}</span></label>
                  <div className="flex flex-wrap gap-3">
                    {hoodieColorOptions.map((color) => (
                      <button 
                        key={color.name} 
                        onClick={() => handleHoodieVariantChange('color', color.name)} 
                        className={`relative w-12 h-12 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          hoodieColor === color.name 
                            ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2' 
                            : color.border 
                              ? 'border-gray-300 hover:border-gray-400' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        style={{ backgroundColor: color.value }} 
                        title={color.name}
                      >
                        {hoodieColor === color.name && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className={`w-5 h-5 ${color.name === 'White' || color.name === 'Light Pink' ? 'text-gray-600' : 'text-white'}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* T-shirt Customization */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your T-shirt</h3>
                
                {/* Size Selection */}
                <div className="mb-4">
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
                    {sizeOptions.map((size) => (
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
              {activistPricing && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Bundle Savings</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Individual Price: <span className="font-medium">£{activistPricing.originalPrice.toFixed(2)}</span></p>
                    <p>• Bundle Price: <span className="font-medium text-green-600">£{activistPricing.price.toFixed(2)}</span></p>
                    <p>• You Save: <span className="font-medium text-green-600">£{activistPricing.savings.absolute.toFixed(2)} ({activistPricing.savings.percentage.toFixed(0)}%)</span></p>
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Truck className="w-4 h-4" />
                      <span className="font-medium">Best shipping rates applied</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bundle Contents */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Bundle Contents:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Reform UK Hoodie: <span className="font-medium text-gray-900">{hoodieColor} (Size {hoodieSize}) - £39.99</span></p>
                  <p>• Reform UK T-shirt: <span className="font-medium text-gray-900">{tshirtColor} (Size {tshirtSize}) - £24.99</span></p>
                  <p>• Reform UK Cap: <span className="font-medium text-gray-900">{capColor} - £19.99</span></p>
                  <p>• Reform UK Tote Bag: <span className="font-medium text-gray-900">Black - £24.99</span></p>
                  <p>• Reform UK Water Bottle: <span className="font-medium text-gray-900">White - £24.99</span></p>
                  <p>• Reform UK Mug: <span className="font-medium text-gray-900">White - £9.99</span></p>
                  <p>• Reform UK Mouse Pad: <span className="font-medium text-gray-900">White - £14.99</span></p>
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