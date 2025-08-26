import { useState, useEffect } from 'react';
import { pf } from '../lib/printful/client';
import type { PrintfulProduct, PrintfulVariant } from '../types/printful';
import { tshirtVariants } from './tshirt-variants';

// Mock data for when Printful API is not available
const mockProducts: PrintfulProduct[] = [
  {
    id: 1,
    name: "Reform UK T-Shirt",
    description: "Premium cotton t-shirt with Reform UK branding",
    category: 'tshirt',
    variants: tshirtVariants.map(variant => ({
      ...variant,
      image: `https://files.cdn.printful.com/products/71/${variant.color.toLowerCase().replace(/\s+/g, '_')}_tshirt_${variant.size.toLowerCase()}_mockup.jpg`
    })),
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
    variants: [
      // Black variants
      {
        id: 201,
        name: "Black Hoodie - S",
        color: "Black",
        size: "S",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 4016,
        color_code: "#000000",
        image: "https://files.cdn.printful.com/products/71/black_hoodie_s_mockup.jpg"
      },
      {
        id: 202,
        name: "Black Hoodie - M",
        color: "Black",
        size: "M",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 4017,
        color_code: "#000000",
        image: "https://files.cdn.printful.com/products/71/black_hoodie_m_mockup.jpg"
      },
      {
        id: 203,
        name: "Black Hoodie - L",
        color: "Black",
        size: "L",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 4018,
        color_code: "#000000",
        image: "https://files.cdn.printful.com/products/71/black_hoodie_l_mockup.jpg"
      },
      {
        id: 204,
        name: "Black Hoodie - XL",
        color: "Black",
        size: "XL",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 4019,
        color_code: "#000000",
        image: "https://files.cdn.printful.com/products/71/black_hoodie_xl_mockup.jpg"
      },
      {
        id: 205,
        name: "Black Hoodie - 2XL",
        color: "Black",
        size: "2XL",
        price: "41.99",
        in_stock: true,
        printful_variant_id: 4020,
        color_code: "#000000",
        image: "https://files.cdn.printful.com/products/71/black_hoodie_2xl_mockup.jpg"
      },
      // White variants
      {
        id: 206,
        name: "White Hoodie - S",
        color: "White",
        size: "S",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 4016,
        color_code: "#FFFFFF",
        image: "https://files.cdn.printful.com/products/71/white_hoodie_s_mockup.jpg"
      },
      {
        id: 207,
        name: "White Hoodie - M",
        color: "White",
        size: "M",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 4017,
        color_code: "#FFFFFF",
        image: "https://files.cdn.printful.com/products/71/white_hoodie_m_mockup.jpg"
      },
      {
        id: 208,
        name: "White Hoodie - L",
        color: "White",
        size: "L",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 4018,
        color_code: "#FFFFFF",
        image: "https://files.cdn.printful.com/products/71/white_hoodie_l_mockup.jpg"
      },
      {
        id: 209,
        name: "White Hoodie - XL",
        color: "White",
        size: "XL",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 4019,
        color_code: "#FFFFFF",
        image: "https://files.cdn.printful.com/products/71/white_hoodie_xl_mockup.jpg"
      },
      {
        id: 210,
        name: "White Hoodie - 2XL",
        color: "White",
        size: "2XL",
        price: "41.99",
        in_stock: true,
        printful_variant_id: 4020,
        color_code: "#FFFFFF",
        image: "https://files.cdn.printful.com/products/71/white_hoodie_2xl_mockup.jpg"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: true,
    image: "https://files.cdn.printful.com/products/71/black_hoodie_m_mockup.jpg",
    brand: "Reform UK",
    model: "Premium Cotton",
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
      console.warn('VITE_SUPABASE_ANON_KEY not available');
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
        console.warn('Printful API not available, using mock data');
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
      console.warn('Printful API failed, using mock data:', err);
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
        console.warn('Printful API not available, using mock data');
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
      console.warn('Printful API failed, using mock data:', err);
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
        console.warn('Printful API not available, using mock data');
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
      console.warn('Printful API failed, using mock data:', err);
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
