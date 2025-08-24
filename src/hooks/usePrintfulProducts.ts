import { useState, useEffect } from 'react';
import { pf } from '../lib/printful/client';
import type { PrintfulProduct, PrintfulVariant } from '../types/printful';

// Mock data for when Printful API is not available
const mockProducts: PrintfulProduct[] = [
  {
    id: 1,
    name: "Reform UK T-Shirt",
    description: "Premium cotton t-shirt with Reform UK branding",
    category: 'tshirt',
    variants: [
      // Black variants
      {
        id: 101,
        name: "Black T-Shirt - XS",
        color: "Black",
        size: "XS",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1001,
        color_code: "#000000",
        image: "/Tshirt/Men/ReformMenTshirtBlack1.webp"
      },
      {
        id: 102,
        name: "Black T-Shirt - S",
        color: "Black",
        size: "S",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1002,
        color_code: "#000000",
        image: "/Tshirt/Men/ReformMenTshirtBlack1.webp"
      },
      {
        id: 103,
        name: "Black T-Shirt - M",
        color: "Black",
        size: "M",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1003,
        color_code: "#000000",
        image: "/Tshirt/Men/ReformMenTshirtBlack1.webp"
      },
      {
        id: 104,
        name: "Black T-Shirt - L",
        color: "Black",
        size: "L",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1004,
        color_code: "#000000",
        image: "/Tshirt/Men/ReformMenTshirtBlack1.webp"
      },
      {
        id: 105,
        name: "Black T-Shirt - XL",
        color: "Black",
        size: "XL",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1005,
        color_code: "#000000",
        image: "/Tshirt/Men/ReformMenTshirtBlack1.webp"
      },
      {
        id: 106,
        name: "Black T-Shirt - 2XL",
        color: "Black",
        size: "2XL",
        price: "26.99",
        in_stock: true,
        printful_variant_id: 1006,
        color_code: "#000000",
        image: "/Tshirt/Men/ReformMenTshirtBlack1.webp"
      },
      // White variants
      {
        id: 107,
        name: "White T-Shirt - XS",
        color: "White",
        size: "XS",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1007,
        color_code: "#FFFFFF",
        image: "/Tshirt/Men/ReformMenTshirtWhite1.webp"
      },
      {
        id: 108,
        name: "White T-Shirt - S",
        color: "White",
        size: "S",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1008,
        color_code: "#FFFFFF",
        image: "/Tshirt/Men/ReformMenTshirtWhite1.webp"
      },
      {
        id: 109,
        name: "White T-Shirt - M",
        color: "White",
        size: "M",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1009,
        color_code: "#FFFFFF",
        image: "/Tshirt/Men/ReformMenTshirtWhite1.webp"
      },
      {
        id: 110,
        name: "White T-Shirt - L",
        color: "White",
        size: "L",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1010,
        color_code: "#FFFFFF",
        image: "/Tshirt/Men/ReformMenTshirtWhite1.webp"
      },
      {
        id: 111,
        name: "White T-Shirt - XL",
        color: "White",
        size: "XL",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1011,
        color_code: "#FFFFFF",
        image: "/Tshirt/Men/ReformMenTshirtWhite1.webp"
      },
      {
        id: 112,
        name: "White T-Shirt - 2XL",
        color: "White",
        size: "2XL",
        price: "26.99",
        in_stock: true,
        printful_variant_id: 1012,
        color_code: "#FFFFFF",
        image: "/Tshirt/Men/ReformMenTshirtWhite1.webp"
      },
      // Navy variants
      {
        id: 113,
        name: "Navy T-Shirt - XS",
        color: "Navy",
        size: "XS",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1013,
        color_code: "#0B4C8A",
        image: "/Tshirt/Men/ReformMenTshirtBlue1.webp"
      },
      {
        id: 114,
        name: "Navy T-Shirt - S",
        color: "Navy",
        size: "S",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1014,
        color_code: "#0B4C8A",
        image: "/Tshirt/Men/ReformMenTshirtBlue1.webp"
      },
      {
        id: 115,
        name: "Navy T-Shirt - M",
        color: "Navy",
        size: "M",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1015,
        color_code: "#0B4C8A",
        image: "/Tshirt/Men/ReformMenTshirtBlue1.webp"
      },
      {
        id: 116,
        name: "Navy T-Shirt - L",
        color: "Navy",
        size: "L",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1016,
        color_code: "#0B4C8A",
        image: "/Tshirt/Men/ReformMenTshirtBlue1.webp"
      },
      {
        id: 117,
        name: "Navy T-Shirt - XL",
        color: "Navy",
        size: "XL",
        price: "24.99",
        in_stock: true,
        printful_variant_id: 1017,
        color_code: "#0B4C8A",
        image: "/Tshirt/Men/ReformMenTshirtBlue1.webp"
      },
      {
        id: 118,
        name: "Navy T-Shirt - 2XL",
        color: "Navy",
        size: "2XL",
        price: "26.99",
        in_stock: true,
        printful_variant_id: 1018,
        color_code: "#0B4C8A",
        image: "/Tshirt/Men/ReformMenTshirtBlue1.webp"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: true,
    image: "/Tshirt/Men/ReformMenTshirtBlack1.webp",
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
        name: "Black Hoodie - XS",
        color: "Black",
        size: "XS",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2001,
        color_code: "#000000",
        image: "/Hoodie/Men/ReformMenHoodieBlack1.webp"
      },
      {
        id: 202,
        name: "Black Hoodie - S",
        color: "Black",
        size: "S",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2002,
        color_code: "#000000",
        image: "/Hoodie/Men/ReformMenHoodieBlack1.webp"
      },
      {
        id: 203,
        name: "Black Hoodie - M",
        color: "Black",
        size: "M",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2003,
        color_code: "#000000",
        image: "/Hoodie/Men/ReformMenHoodieBlack1.webp"
      },
      {
        id: 204,
        name: "Black Hoodie - L",
        color: "Black",
        size: "L",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2004,
        color_code: "#000000",
        image: "/Hoodie/Men/ReformMenHoodieBlack1.webp"
      },
      {
        id: 205,
        name: "Black Hoodie - XL",
        color: "Black",
        size: "XL",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2005,
        color_code: "#000000",
        image: "/Hoodie/Men/ReformMenHoodieBlack1.webp"
      },
      {
        id: 206,
        name: "Black Hoodie - 2XL",
        color: "Black",
        size: "2XL",
        price: "41.99",
        in_stock: true,
        printful_variant_id: 2006,
        color_code: "#000000",
        image: "/Hoodie/Men/ReformMenHoodieBlack1.webp"
      },
      // White variants
      {
        id: 207,
        name: "White Hoodie - XS",
        color: "White",
        size: "XS",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2007,
        color_code: "#FFFFFF",
        image: "/Hoodie/Men/ReformMenHoodieWhite1.webp"
      },
      {
        id: 208,
        name: "White Hoodie - S",
        color: "White",
        size: "S",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2008,
        color_code: "#FFFFFF",
        image: "/Hoodie/Men/ReformMenHoodieWhite1.webp"
      },
      {
        id: 209,
        name: "White Hoodie - M",
        color: "White",
        size: "M",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2009,
        color_code: "#FFFFFF",
        image: "/Hoodie/Men/ReformMenHoodieWhite1.webp"
      },
      {
        id: 210,
        name: "White Hoodie - L",
        color: "White",
        size: "L",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2010,
        color_code: "#FFFFFF",
        image: "/Hoodie/Men/ReformMenHoodieWhite1.webp"
      },
      {
        id: 211,
        name: "White Hoodie - XL",
        color: "White",
        size: "XL",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2011,
        color_code: "#FFFFFF",
        image: "/Hoodie/Men/ReformMenHoodieWhite1.webp"
      },
      {
        id: 212,
        name: "White Hoodie - 2XL",
        color: "White",
        size: "2XL",
        price: "41.99",
        in_stock: true,
        printful_variant_id: 2012,
        color_code: "#FFFFFF",
        image: "/Hoodie/Men/ReformMenHoodieWhite1.webp"
      },
      // Red variants
      {
        id: 213,
        name: "Red Hoodie - XS",
        color: "Red",
        size: "XS",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2013,
        color_code: "#B31217",
        image: "/Hoodie/Men/ReformMenHoodieRed1.webp"
      },
      {
        id: 214,
        name: "Red Hoodie - S",
        color: "Red",
        size: "S",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2014,
        color_code: "#B31217",
        image: "/Hoodie/Men/ReformMenHoodieRed1.webp"
      },
      {
        id: 215,
        name: "Red Hoodie - M",
        color: "Red",
        size: "M",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2015,
        color_code: "#B31217",
        image: "/Hoodie/Men/ReformMenHoodieRed1.webp"
      },
      {
        id: 216,
        name: "Red Hoodie - L",
        color: "Red",
        size: "L",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2016,
        color_code: "#B31217",
        image: "/Hoodie/Men/ReformMenHoodieRed1.webp"
      },
      {
        id: 217,
        name: "Red Hoodie - XL",
        color: "Red",
        size: "XL",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2017,
        color_code: "#B31217",
        image: "/Hoodie/Men/ReformMenHoodieRed1.webp"
      },
      {
        id: 218,
        name: "Red Hoodie - 2XL",
        color: "Red",
        size: "2XL",
        price: "41.99",
        in_stock: true,
        printful_variant_id: 2018,
        color_code: "#B31217",
        image: "/Hoodie/Men/ReformMenHoodieRed1.webp"
      },
      // Blue variants
      {
        id: 219,
        name: "Royal Blue Hoodie - XS",
        color: "Royal Blue",
        size: "XS",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2019,
        color_code: "#0B4C8A",
        image: "/Hoodie/Men/ReformMenHoodieBlue1.webp"
      },
      {
        id: 220,
        name: "Royal Blue Hoodie - S",
        color: "Royal Blue",
        size: "S",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2020,
        color_code: "#0B4C8A",
        image: "/Hoodie/Men/ReformMenHoodieBlue1.webp"
      },
      {
        id: 221,
        name: "Royal Blue Hoodie - M",
        color: "Royal Blue",
        size: "M",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2021,
        color_code: "#0B4C8A",
        image: "/Hoodie/Men/ReformMenHoodieBlue1.webp"
      },
      {
        id: 222,
        name: "Royal Blue Hoodie - L",
        color: "Royal Blue",
        size: "L",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2022,
        color_code: "#0B4C8A",
        image: "/Hoodie/Men/ReformMenHoodieBlue1.webp"
      },
      {
        id: 223,
        name: "Royal Blue Hoodie - XL",
        color: "Royal Blue",
        size: "XL",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2023,
        color_code: "#0B4C8A",
        image: "/Hoodie/Men/ReformMenHoodieBlue1.webp"
      },
      {
        id: 224,
        name: "Royal Blue Hoodie - 2XL",
        color: "Royal Blue",
        size: "2XL",
        price: "41.99",
        in_stock: true,
        printful_variant_id: 2024,
        color_code: "#0B4C8A",
        image: "/Hoodie/Men/ReformMenHoodieBlue1.webp"
      },
      // Charcoal variants
      {
        id: 225,
        name: "Charcoal Hoodie - XS",
        color: "Charcoal",
        size: "XS",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2025,
        color_code: "#333333",
        image: "/Hoodie/Men/ReformMenHoodieCharcoal1.webp"
      },
      {
        id: 226,
        name: "Charcoal Hoodie - S",
        color: "Charcoal",
        size: "S",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2026,
        color_code: "#333333",
        image: "/Hoodie/Men/ReformMenHoodieCharcoal1.webp"
      },
      {
        id: 227,
        name: "Charcoal Hoodie - M",
        color: "Charcoal",
        size: "M",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2027,
        color_code: "#333333",
        image: "/Hoodie/Men/ReformMenHoodieCharcoal1.webp"
      },
      {
        id: 228,
        name: "Charcoal Hoodie - L",
        color: "Charcoal",
        size: "L",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2028,
        color_code: "#333333",
        image: "/Hoodie/Men/ReformMenHoodieCharcoal1.webp"
      },
      {
        id: 229,
        name: "Charcoal Hoodie - XL",
        color: "Charcoal",
        size: "XL",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2029,
        color_code: "#333333",
        image: "/Hoodie/Men/ReformMenHoodieCharcoal1.webp"
      },
      {
        id: 230,
        name: "Charcoal Hoodie - 2XL",
        color: "Charcoal",
        size: "2XL",
        price: "41.99",
        in_stock: true,
        printful_variant_id: 2030,
        color_code: "#333333",
        image: "/Hoodie/Men/ReformMenHoodieCharcoal1.webp"
      },
      // Light Grey variants
      {
        id: 231,
        name: "Light Grey Hoodie - XS",
        color: "Light Grey",
        size: "XS",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2031,
        color_code: "#E5E5E5",
        image: "/Hoodie/Men/ReformMenHoodieLightGrey1.webp"
      },
      {
        id: 232,
        name: "Light Grey Hoodie - S",
        color: "Light Grey",
        size: "S",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2032,
        color_code: "#E5E5E5",
        image: "/Hoodie/Men/ReformMenHoodieLightGrey1.webp"
      },
      {
        id: 233,
        name: "Light Grey Hoodie - M",
        color: "Light Grey",
        size: "M",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2033,
        color_code: "#E5E5E5",
        image: "/Hoodie/Men/ReformMenHoodieLightGrey1.webp"
      },
      {
        id: 234,
        name: "Light Grey Hoodie - L",
        color: "Light Grey",
        size: "L",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2034,
        color_code: "#E5E5E5",
        image: "/Hoodie/Men/ReformMenHoodieLightGrey1.webp"
      },
      {
        id: 235,
        name: "Light Grey Hoodie - XL",
        color: "Light Grey",
        size: "XL",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2035,
        color_code: "#E5E5E5",
        image: "/Hoodie/Men/ReformMenHoodieLightGrey1.webp"
      },
      {
        id: 236,
        name: "Light Grey Hoodie - 2XL",
        color: "Light Grey",
        size: "2XL",
        price: "41.99",
        in_stock: true,
        printful_variant_id: 2036,
        color_code: "#E5E5E5",
        image: "/Hoodie/Men/ReformMenHoodieLightGrey1.webp"
      },
      // Ash Grey variants
      {
        id: 237,
        name: "Ash Grey Hoodie - XS",
        color: "Ash Grey",
        size: "XS",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2037,
        color_code: "#B0B0B0",
        image: "/Hoodie/Men/ReformMenHoodieAshGrey1.webp"
      },
      {
        id: 238,
        name: "Ash Grey Hoodie - S",
        color: "Ash Grey",
        size: "S",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2038,
        color_code: "#B0B0B0",
        image: "/Hoodie/Men/ReformMenHoodieAshGrey1.webp"
      },
      {
        id: 239,
        name: "Ash Grey Hoodie - M",
        color: "Ash Grey",
        size: "M",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2039,
        color_code: "#B0B0B0",
        image: "/Hoodie/Men/ReformMenHoodieAshGrey1.webp"
      },
      {
        id: 240,
        name: "Ash Grey Hoodie - L",
        color: "Ash Grey",
        size: "L",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2040,
        color_code: "#B0B0B0",
        image: "/Hoodie/Men/ReformMenHoodieAshGrey1.webp"
      },
      {
        id: 241,
        name: "Ash Grey Hoodie - XL",
        color: "Ash Grey",
        size: "XL",
        price: "39.99",
        in_stock: true,
        printful_variant_id: 2041,
        color_code: "#B0B0B0",
        image: "/Hoodie/Men/ReformMenHoodieAshGrey1.webp"
      },
      {
        id: 242,
        name: "Ash Grey Hoodie - 2XL",
        color: "Ash Grey",
        size: "2XL",
        price: "41.99",
        in_stock: true,
        printful_variant_id: 2042,
        color_code: "#B0B0B0",
        image: "/Hoodie/Men/ReformMenHoodieAshGrey1.webp"
      }
    ],
    isUnisex: true,
    hasDarkLightVariants: true,
    image: "/Hoodie/Men/ReformMenHoodieBlack1.webp",
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
    return !!(pf && (pf as any).h);
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
