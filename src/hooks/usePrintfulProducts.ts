import { useState, useEffect } from 'react';
import { pf } from '../lib/printful/client';
import type { PrintfulProduct, PrintfulVariant } from '../types/printful';
import { TshirtVariants } from './tshirt-variants-merged';
import { HoodieVariants } from './hoodie-variants-merged';
import { TotebagVariants } from './totebag-variants';
import { WaterbottleVariants } from './waterbottle-variants';
import { MousepadVariants } from './mousepad-variants';

// Mock data for when Printful API is not available
// Debug logging
console.log('🔍 TshirtVariants:', TshirtVariants);
console.log('🔍 TshirtVariants length:', TshirtVariants?.length);
console.log('🔍 First variant:', TshirtVariants?.[0]);
console.log('🔍 TshirtVariants type:', typeof TshirtVariants);
console.log('🔍 TshirtVariants constructor:', TshirtVariants?.constructor?.name);

const mockProducts: PrintfulProduct[] = [
  {
    id: 1,
    name: "Reform UK T-Shirt",
    description: "Premium cotton t-shirt with Reform UK branding",
    category: 'tshirt',
    variants: (() => {
      try {
        console.log('🔍 Attempting to map TshirtVariants...');
        if (!TshirtVariants || !Array.isArray(TshirtVariants)) {
          console.error('❌ TshirtVariants is not an array:', TshirtVariants);
          return [];
        }
        return TshirtVariants.map(variant => {
          console.log('🔍 Processing variant:', variant);
          return {
            ...variant,
            image: `https://files.cdn.printful.com/products/71/tshirt_mockup.jpg`
          };
        });
      } catch (error) {
        console.error('❌ Error mapping TshirtVariants:', error);
        return [];
      }
    })(),
    isUnisex: true,
    hasDarkLightVariants: true,
    image: "https://files.cdn.printful.com/products/71/black_tshirt_m_mockup.jpg",
    brand: "Reform UK",
    model: "Premium Cotton",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 2,
    name: "Reform UK Hoodie",
    description: "Premium cotton hoodie with Reform UK branding",
    category: 'hoodie',
    variants: HoodieVariants.map(variant => ({
      ...variant,
      id: variant.catalogVariantId,
      name: `${variant.color} Hoodie - ${variant.size}`,
      color: variant.color,
      size: variant.size,
      price: variant.price || "39.99",
      in_stock: true,
      printful_variant_id: variant.catalogVariantId,
      color_code: variant.colorHex || "#000000",
      image: `https://files.cdn.printful.com/products/71/${variant.color.toLowerCase().replace(/\s+/g, '_')}_hoodie_${variant.size.toLowerCase()}_mockup.jpg`
    })),
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "https://files.cdn.printful.com/products/71/black_hoodie_m_mockup.jpg",
    brand: "Reform UK",
    model: "Premium Cotton",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 3,
    name: "Reform UK Cap",
    description: "Adjustable cap with Reform UK logo",
    category: 'cap',
    variants: [
      {
        id: 301,
        name: "Black Cap - One Size",
        color: "Black",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6004,
        color_code: "#000000",
        image: "/Cap/ReformCapBlack1.webp"
      },
      {
        id: 302,
        name: "White Cap - One Size",
        color: "White",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6000,
        color_code: "#ffffff",
        image: "/Cap/ReformCapWhite1.webp"
      },
      {
        id: 303,
        name: "Light Blue Cap - One Size",
        color: "Light Blue",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6001,
        color_code: "#a6b9c6",
        image: "/Cap/ReformCapBlue1.webp"
      },
      {
        id: 304,
        name: "Charcoal Cap - One Size",
        color: "Charcoal",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6002,
        color_code: "#393639",
        image: "/Cap/ReformCapCharcoal1.webp"
      },
      {
        id: 305,
        name: "Navy Cap - One Size",
        color: "Navy",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6003,
        color_code: "#1c2330",
        image: "/Cap/ReformCapNavy1.webp"
      },
      {
        id: 306,
        name: "Red Cap - One Size",
        color: "Red",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 6005,
        color_code: "#8e0a1f",
        image: "/Cap/ReformCapRed1.webp"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/Cap/ReformCapBlack1.webp",
    brand: "Reform UK",
    model: "Adjustable Cap",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 4,
    name: "Reform UK Mug",
    description: "Ceramic mug with Reform UK logo",
    category: 'mug',
    variants: [
      {
        id: 401,
        name: "White Mug - One Size",
        color: "White",
        size: "One Size",
        price: "19.99",
        in_stock: true,
        printful_variant_id: 10000,
        color_code: "#FFFFFF",
        image: "/MugMouse/ReformMug1.webp"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/MugMouse/ReformMug1.webp",
    brand: "Reform UK",
    model: "Ceramic Mug",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 5,
    name: "Reform UK Tote Bag",
    description: "Eco-friendly canvas tote bag with Reform UK branding",
    category: 'tote',
    variants: TotebagVariants,
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/StickerToteWater/ReformToteBagBlack1.webp",
    brand: "Reform UK",
    model: "Canvas Tote",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 6,
    name: "Reform UK Water Bottle",
    description: "Stainless steel water bottle with Reform UK logo",
    category: 'water-bottle',
    variants: WaterbottleVariants,
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/StickerToteWater/ReformWaterBottleWhite1.webp",
    brand: "Reform UK",
    model: "Stainless Steel",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  },
  {
    id: 7,
    name: "Reform UK Mouse Pad",
    description: "High-quality mouse pad with Reform UK branding",
    category: 'mouse-pad',
    variants: MousepadVariants,
    isUnisex: true,
    hasDarkLightVariants: false,
    image: "/MugMouse/ReformMousePadWhite1.webp",
    brand: "Reform UK",
    model: "Premium Mouse Pad",
    currency: "GBP",
    is_discontinued: false,
    avg_fulfillment_time: 4.5,
    origin_country: "UK"
  }
];

interface UsePrintfulProductsReturn {
  products: PrintfulProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UsePrintfulProductReturn {
  product: PrintfulProduct | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UsePrintfulVariantsReturn {
  variants: PrintfulVariant[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Helper function to check if Printful API is available
const isPrintfulAvailable = () => {
  try {
    // Check if we have the basic objects
    if (!pf || !(pf as any).h) {
      return false;
    }
    
    // Check if we have the required environment variable
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return false;
    }
    
    // For now, let's assume Printful is not available and use mock data
    // This ensures we always get the correct mock data with proper images
    return false;
  } catch {
    return false;
  }
};

// Hook to fetch all products
export const usePrintfulProducts = (): UsePrintfulProductsReturn => {
  const [products, setProducts] = useState<PrintfulProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Printful API is available
      if (!isPrintfulAvailable()) {
        setProducts(mockProducts);
        setLoading(false);
        return;
      }
      
      const response = await pf.GET('/products', {
        headers: (pf as any).h(),
        params: {
          query: {
            limit: 100, // Adjust based on your needs
          }
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch products');
      }

      if (response.data?.result) {
        const transformedProducts = response.data.result.map((item: any) => ({
          id: item.id,
          name: item.title,
          description: item.description,
          category: mapCategory(item.type_name),
          variants: [], // Will be populated separately
          isUnisex: item.type_name?.toLowerCase().includes('unisex'),
          hasDarkLightVariants: hasDarkLightVariants(item.variants || []),
          image: item.image,
          brand: item.brand,
          model: item.model,
          currency: item.currency,
          is_discontinued: item.is_discontinued,
          avg_fulfillment_time: item.avg_fulfillment_time,
          origin_country: item.origin_country,
        }));
        
        setProducts(transformedProducts);
      }
    } catch (err) {
      setProducts(mockProducts);
      setError('Using mock data - Printful API unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refetch: fetchProducts };
};

// Hook to fetch a single product with variants
export const usePrintfulProduct = (productId: number): UsePrintfulProductReturn => {
  const [product, setProduct] = useState<PrintfulProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Printful API is available
      if (!isPrintfulAvailable()) {
        const mockProduct = mockProducts.find(p => p.id === productId);
        if (mockProduct) {
          setProduct(mockProduct);
        } else {
          setError('Product not found');
        }
        setLoading(false);
        return;
      }
      
      const response = await pf.GET('/products/{id}', {
        headers: (pf as any).h(),
        params: {
          path: { id: productId }
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch product');
      }

      if (response.data?.result) {
        const item = response.data.result;
        const transformedProduct: PrintfulProduct = {
          id: item.id,
          name: item.title,
          description: item.description,
          category: mapCategory(item.type_name),
          variants: (item.variants || []).map((variant: any) => ({
            id: variant.id,
            name: variant.name,
            color: variant.color,
            size: variant.size,
            price: variant.price,
            in_stock: variant.in_stock,
            printful_variant_id: variant.id,
            color_code: variant.color_code,
            image: variant.image
          })),
          isUnisex: item.type_name?.toLowerCase().includes('unisex'),
          hasDarkLightVariants: hasDarkLightVariants(item.variants || []),
          image: item.image,
          brand: item.brand,
          model: item.model,
          currency: item.currency,
          is_discontinued: item.is_discontinued,
          avg_fulfillment_time: item.avg_fulfillment_time,
          origin_country: item.origin_country,
        };
        
        setProduct(transformedProduct);
      }
    } catch (err) {
      const mockProduct = mockProducts.find(p => p.id === productId);
      if (mockProduct) {
        setProduct(mockProduct);
        setError('Using mock data - Printful API unavailable');
      } else {
        setError('Product not found');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  return { product, loading, error, refetch: fetchProduct };
};

// Hook to fetch variants for a specific product
export const usePrintfulVariants = (productId: number): UsePrintfulVariantsReturn => {
  const [variants, setVariants] = useState<PrintfulVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Printful API is available
      if (!isPrintfulAvailable()) {
        const mockProduct = mockProducts.find(p => p.id === productId);
        if (mockProduct) {
          setVariants(mockProduct.variants);
        } else {
          setError('Product not found');
        }
        setLoading(false);
        return;
      }
      
      const response = await pf.GET('/products/{id}', {
        headers: (pf as any).h(),
        params: {
          path: { id: productId }
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch variants');
      }

      if (response.data?.result?.variants) {
        const transformedVariants = response.data.result.variants.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          color: variant.color,
          size: variant.size,
          price: variant.price,
          in_stock: variant.in_stock,
          printful_variant_id: variant.id,
          color_code: variant.color_code,
          image: variant.image
        }));
        
        setVariants(transformedVariants);
      }
    } catch (err) {
      const mockProduct = mockProducts.find(p => p.id === productId);
      if (mockProduct) {
        setVariants(mockProduct.variants);
        setError('Using mock data - Printful API unavailable');
      } else {
        setError('Product not found');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  return { variants, loading, error, refetch: fetchVariants };
};

// Helper function to map Printful category names to our category enum
function mapCategory(typeName: string): PrintfulProduct['category'] {
  const lowerType = typeName?.toLowerCase() || '';
  
  if (lowerType.includes('tshirt') || lowerType.includes('t-shirt')) return 'tshirt';
  if (lowerType.includes('hoodie') || lowerType.includes('sweatshirt')) return 'hoodie';
  if (lowerType.includes('cap') || lowerType.includes('hat')) return 'cap';
  if (lowerType.includes('tote') || lowerType.includes('bag')) return 'tote';
  if (lowerType.includes('water') || lowerType.includes('bottle')) return 'water-bottle';
  if (lowerType.includes('mug') || lowerType.includes('cup')) return 'mug';
  if (lowerType.includes('mouse') || lowerType.includes('pad')) return 'mouse-pad';
  
  return 'tshirt'; // Default fallback
}

// Helper function to determine if a product has dark/light variants
function hasDarkLightVariants(variants: any[]): boolean {
  if (!variants || variants.length === 0) return false;
  
  const colors = variants.map(v => v.color?.toLowerCase() || '');
  const hasDark = colors.some(color => 
    color.includes('black') || color.includes('charcoal') || color.includes('navy') || color.includes('dark')
  );
  const hasLight = colors.some(color => 
    color.includes('white') || color.includes('light') || color.includes('cream') || color.includes('beige')
  );
  
  return hasDark && hasLight;
}
