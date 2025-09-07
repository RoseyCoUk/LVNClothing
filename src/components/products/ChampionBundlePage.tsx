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
import { TotebagVariants } from '../../hooks/totebag-variants';
import type { PrintfulProduct, PrintfulVariant, BundleProduct, BundleItem } from '../../types/printful';
import { Toast, useToast } from '../../components/ui/Toast';

interface Color {
  name: string;
  value: string;
  border?: boolean;
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

interface ChampionBundlePageProps {
  onBack: () => void;
}

const ChampionBundlePage = ({ onBack }: ChampionBundlePageProps) => {
  const { addToCart, addToCartAndGetUpdated, addMultipleToCart } = useCart();
  const { isVisible, message, showToast, hideToast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOrderOverview, setShowOrderOverview] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState<OrderToConfirm | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

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

  // Bundle products state
  const [bundleProducts, setBundleProducts] = useState<BundleItem[]>([]);

  // Get bundle pricing from the new system
  const { bundlePricing } = useBundlePricing();
  const championPricing = bundlePricing.champion;

  // Use the same merged products system as individual product pages
  const { getProductByCategory, isLoading: mergedLoading, error: mergedError } = useMergedProducts();
  const tshirtVariantsHook = useTshirtVariants();
  const findTshirtVariant = tshirtVariantsHook?.findTshirtVariant;
  
  // Get products using the same method as individual pages
  const hoodieProduct = getProductByCategory('hoodie');
  const tshirtProduct = getProductByCategory('tshirt');
  const capProduct = getProductByCategory('cap');
  const totebagProduct = getProductByCategory('tote');

  // Bundle calculation hook
  const {
    calculation,
    addItem,
    removeItem,
    clearBundle,
    getItemCount
  } = useBundleCalculation(bundleProducts, setBundleProducts);

  // Initialize bundle products when merged products are available
  useEffect(() => {
    if (hoodieProduct && tshirtProduct && capProduct && totebagProduct && bundleProducts.length === 0) {
      // Create bundle items from merged products
      const hoodieBundleItem = {
        product: {
          id: hoodieProduct.id,
          name: hoodieProduct.name,
          category: 'hoodie',
          image: hoodieProduct.image_url,
          images: hoodieProduct.baseProduct?.images || [],
          variants: hoodieProduct.variants || []
        },
        variant: hoodieProduct.variants?.[0] || {
          id: 'hoodie-default',
          color: hoodieColor,
          size: hoodieSize,
          price: hoodieProduct.priceRange?.min || '24.99',
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
        variant: tshirtProduct.variants?.[0] || {
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
        variant: capProduct.variants?.[0] || {
          id: 'cap-default',
          color: capColor,
          price: capProduct.priceRange?.min || '12.99',
          image: getCapImages()[0]
        }
      };
      
      const totebagBundleItem = {
        product: {
          id: totebagProduct.id,
          name: totebagProduct.name,
          category: 'tote',
          image: totebagProduct.image_url,
          images: totebagProduct.baseProduct?.images || [],
          variants: totebagProduct.variants || []
        },
        variant: totebagProduct.variants?.[0] || {
          id: 'totebag-default',
          color: 'Black',
          price: totebagProduct.priceRange?.min || '9.99',
          image: getTotebagImages()[0]
        }
      };
      
      setBundleProducts([hoodieBundleItem, tshirtBundleItem, capBundleItem, totebagBundleItem]);
    }
  }, [hoodieProduct, tshirtProduct, capProduct, totebagProduct, bundleProducts.length]);

  // Update t-shirt variant when color/size changes
  useEffect(() => {
    if (tshirtColor && tshirtSize && findTshirtVariant) {
      // Determine the correct design based on color
      const design = colorDesignMapping[tshirtColor] || 'DARK';
      const variantSize = convertSizeForVariant(tshirtSize);
      const variant = findTshirtVariant(design, variantSize, tshirtColor);
      setSelectedTshirtVariant(variant);
      console.log(`DEBUG: T-shirt variant lookup - Color: ${tshirtColor}, Design: ${design}, Size: ${tshirtSize}, Variant Size: ${variantSize}, Found variant:`, variant);
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

  const productData = {
    name: "Champion Bundle",
    originalPrice: "£109.96",
    bundlePrice: 93.99,
    savings: "Save £15.97",
    description: "For the dedicated Reform UK supporter. This champion bundle includes a premium hoodie, classic t-shirt, stylish cap, and practical tote bag - everything you need to show your commitment to the movement in style and comfort.",
    shipping: "Fast UK Shipping",
    urgency: "Limited Time Offer",
    popular: true,
    rating: 4.9,
    reviews: 203,
    materials: "Premium cotton hoodie, high-quality cotton t-shirt, adjustable cap, and durable canvas tote bag",
    careInstructions: "Machine wash hoodie and t-shirt at 30°C. Hand wash cap. Tote bag spot clean.",
    features: [
      "Premium cotton hoodie with Reform UK branding",
      "High-quality cotton t-shirt with Reform UK design",
      "Adjustable cap with Reform UK logo",
      "Durable canvas tote bag for daily use",
      "Excellent value bundle with significant savings",
      "Perfect for dedicated supporters",
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
    image: "/championbundle.png",
  };

  const colorOptions: Color[] = [
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

  const sizeOptions = ['S', 'M', 'L', 'XL', 'XXL'];

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
  
  // Get Totebag images
  const getTotebagImages = () => {
    if (!totebagProduct?.baseProduct?.images || totebagProduct.baseProduct.images.length === 0) {
      return ['/BackReformLogo.png'];
    }
    return totebagProduct.baseProduct.images.map(img => img.image_url);
  };
  
  const getCurrentImages = () => {
    if (selectedItem === 'hoodie') {
      return getHoodieImages();
    } else if (selectedItem === 'tshirt') {
      return getTshirtImages();
    } else if (selectedItem === 'cap') {
      return getCapImages();
    } else if (selectedItem === 'tote') {
      return getTotebagImages();
    }
    return [];
  };

  const getCurrentImage = () => {
    const images = getCurrentImages();
    return images[currentImageIndex] || images[0] || '';
  };

  const getVariantText = (category: string): string => {
    if (category === 'hoodie') {
      return `${hoodieColor} (Size ${hoodieSize})`;
    }
    if (category === 'tshirt') {
      return `${tshirtColor} (Size ${tshirtSize})`;
    }
    if (category === 'cap') {
      return `${capColor} Cap`;
    }
    if (category === 'tote') {
      return `Black Tote Bag`;
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
    const capVariant = findCapVariantByColor(color);
    if (capVariant) {
      // Handle cap variant change if needed
    }
    setCurrentImageIndex(0);
  };

  const handleAddToCart = () => {
    if (!hoodieProduct || !tshirtProduct || !capProduct || !totebagProduct || bundleProducts.length === 0) {
      showToast('Please wait for bundle to load.');
      return;
    }

    console.log('DEBUG: Starting handleAddToCart for Champion Bundle');
    console.log('DEBUG: bundleProducts.length:', bundleProducts.length);
    console.log('DEBUG: bundleProducts:', bundleProducts);
    
    const bundlePrice = championPricing?.price || productData.bundlePrice;
    const bundleOriginalPrice = championPricing?.originalPrice || 109.96;
    const bundleSavings = bundleOriginalPrice - bundlePrice;
    console.log('DEBUG: bundlePrice:', bundlePrice);

    // Build array of all bundle items with real individual prices
    const cartItems = bundleProducts.map((item, index) => {
      console.log(`DEBUG: Processing item ${index}:`, item);
      
      // Get the variant ID - check multiple possible fields
      let variantId = item.variant.printful_variant_id || 
                     item.variant.external_id || 
                     item.variant.id;
      
      // For hoodie, use the specific hoodie variant
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
      }
      
      // For t-shirt, use the specific t-shirt variant with correct design
      if (item.product.category === 'tshirt') {
        const design = colorDesignMapping[tshirtColor] || 'DARK';
        const variantSize = convertSizeForVariant(tshirtSize);
        console.log(`🔍 T-shirt lookup - Design: ${design}, Size: ${tshirtSize}, Variant Size: ${variantSize}, Color: ${tshirtColor}`);
        
        let tshirtVariant = findTshirtVariant(design, variantSize, tshirtColor);
        
        if (!tshirtVariant && design === 'LIGHT') {
          console.log('⚠️ LIGHT variant not found, trying DARK');
          tshirtVariant = findTshirtVariant('DARK', variantSize, tshirtColor);
        } else if (!tshirtVariant && design === 'DARK') {
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
      }
      
      // For cap, use the specific cap variant
      if (item.product.category === 'cap') {
        console.log(`🔍 Cap lookup - Color: ${capColor}`);
        const capVariant = selectedCapVariant || findCapVariantByColor(capColor);
        console.log('📦 Cap variant found:', capVariant);
        if (capVariant) {
          variantId = capVariant.catalogVariantId;
          console.log('✅ Cap variant ID:', variantId);
        } else {
          console.error('❌ No cap variant found!');
        }
      }
      
      // For tote bag, use the tote bag variant
      if (item.product.category === 'tote') {
        const totebagVariant = TotebagVariants[0]; // There's only one tote bag variant
        if (totebagVariant) {
          variantId = totebagVariant.catalogVariantId;
        }
      }
      
      // Ensure we have a valid variant ID
      if (!variantId) {
        console.error(`ERROR: No variant ID found for ${item.product.name}`);
        showToast(`Error: Unable to add ${item.product.name} - missing variant information`);
        return null;
      }

      // Get individual prices from bundle configuration
      const championComponents = championPricing?.components || [
        { productId: 2, name: 'Hoodie', price: 39.99 },
        { productId: 1, name: 'T-Shirt', price: 24.99 },
        { productId: 3, name: 'Cap', price: 19.99 },
        { productId: 5, name: 'Tote Bag', price: 24.99 }
      ];
      
      // Get the real individual price for this component
      let individualPrice = 0;
      if (item.product.category === 'hoodie') {
        individualPrice = championComponents.find(c => c.name === 'Hoodie')?.price || 39.99;
      } else if (item.product.category === 'tshirt') {
        individualPrice = championComponents.find(c => c.name === 'T-Shirt')?.price || 24.99;
      } else if (item.product.category === 'cap') {
        individualPrice = championComponents.find(c => c.name === 'Cap')?.price || 19.99;
      } else if (item.product.category === 'tote') {
        individualPrice = championComponents.find(c => c.name === 'Tote Bag')?.price || 24.99;
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
      }

      const cartItem = {
        id: `champion-bundle-${item.product.category}-${index}`,
        name: item.product.name,
        price: itemPrice, // Real individual price
        image: itemImage,
        printful_variant_id: variantId,
        external_id: variantId, // Use the same valid variant ID
        // Only set size for items that actually have sizes (t-shirts and hoodies, not caps or tote bags)
        size: (item.product.category === 'hoodie' || item.product.category === 'tshirt') ? 
              (item.product.category === 'hoodie' ? hoodieSize : tshirtSize) : undefined,
        color: item.product.category === 'hoodie' ? hoodieColor :
               item.product.category === 'tshirt' ? tshirtColor :
               item.product.category === 'cap' ? capColor : 'Black',
        isPartOfBundle: true,
        bundleName: 'Champion Bundle',
        bundleId: 'champion-bundle'
      };
      
      console.log(`DEBUG: Prepared cart item ${index}:`, cartItem);
      console.log(`DEBUG: Variant ID for ${item.product.name}:`, variantId);
      return cartItem;
    }).filter(item => item !== null); // Remove any items with missing variant IDs
    
    console.log(`DEBUG: After filtering, ${cartItems.length} out of ${bundleProducts.length} items remain:`, cartItems);
    
    // Add discount item as the 4th item with negative price
    const discountAmount = bundleSavings; // This is the savings amount (15.97)
    const discountItem = {
      id: `champion-bundle-discount`,
      name: 'Champion Bundle Discount (15%)',
      price: -discountAmount, // Negative price for discount
      image: '/BackReformLogo.png', // Use logo for discount item
      printful_variant_id: 'BUNDLE_DISCOUNT_CHAMPION', // Placeholder that won't break checkout
      external_id: 'BUNDLE_DISCOUNT_CHAMPION',
      isPartOfBundle: true,
      bundleName: 'Champion Bundle',
      bundleId: 'champion-bundle',
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
    
    console.log('DEBUG: Finished adding to cart');
    // Show success message - don't redirect to checkout
    showToast(`Champion Bundle (${cartItems.length} items) added to cart!`);
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
      name: "Michael T.",
      rating: 5,
      date: "1 day ago",
      comment: "Amazing bundle! The hoodie is incredibly comfortable and the water bottle keeps drinks cold all day. Perfect for showing support.",
      verified: true
    },
    {
      id: 2,
      name: "Lisa K.",
      rating: 5,
      date: "3 days ago",
      comment: "Excellent value for money. All items are high quality and the bundle saves a lot compared to buying individually.",
      verified: true
    },
    {
      id: 3,
      name: "James R.",
      rating: 4,
      date: "1 week ago",
      comment: "Great bundle for Reform UK supporters. The hoodie fits perfectly and the cap is adjustable. Highly recommend!",
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
                {selectedItem && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      Viewing: {selectedItem === 'hoodie' ? 'Hoodie' :
                               selectedItem === 'tshirt' ? 'T-shirt' :
                               selectedItem === 'cap' ? 'Cap' :
                               selectedItem === 'tote' ? 'Tote Bag' : ''}
                      {selectedItem === 'hoodie' && ` - ${hoodieColor}`}
                      {selectedItem === 'tshirt' && ` - ${tshirtColor}`}
                      {selectedItem === 'cap' && ` - ${capColor}`}
                      {selectedItem === 'tote' && ` - Black`}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Bundle Items Grid - Clickable Thumbnails */}
              <div className="grid grid-cols-4 gap-4">
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
                        item.product.category === 'hoodie' ? getHoodieImages()[0] :
                        item.product.category === 'tshirt' ? getTshirtImages()[0] :
                        item.product.category === 'cap' ? getCapImages()[0] :
                        item.product.category === 'tote' ? getTotebagImages()[0] :
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
                    {colorOptions.map((color) => (
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
                            <Check className={`w-5 h-5 ${color.name === 'White' || color.name === 'Light Blue' || color.name === 'Light Pink' || color.name === 'Sport Grey' ? 'text-gray-600' : 'text-white'}`} />
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
              {championPricing && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Bundle Savings</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Individual Price: <span className="font-medium">£{championPricing.originalPrice.toFixed(2)}</span></p>
                    <p>• Bundle Price: <span className="font-medium text-green-600">£{championPricing.price.toFixed(2)}</span></p>
                    <p>• You Save: <span className="font-medium text-green-600">£{championPricing.savings.absolute.toFixed(2)} ({championPricing.savings.percentage.toFixed(0)}%)</span></p>
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

export default ChampionBundlePage; 