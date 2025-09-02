// useMergedProducts.ts - Frontend Product Merging Hook
// Created for PR-08: Frontend Color Hex Display & Product Merging
// Implements client-side product merging without backend changes

import { useState, useEffect } from 'react';
import { getProducts, getProductVariants } from '../lib/api';
import { hoodieColors, hoodieSizes } from './hoodie-variants-merged-fixed';
import { tshirtColors, tshirtSizes } from './tshirt-variants-merged-fixed';

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  color_hex?: string;
  size: string;
  price: number;
  stock: number;
  sku?: string;
  printful_variant_id?: number;
  // description doesn't exist in product_variants table
}

export interface MergedProduct {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  baseProduct: any; // First product used as base
  variants: ProductVariant[];
  colorOptions: Array<{
    name: string;
    hex: string;
    border?: boolean;
  }>;
  sizeOptions: string[];
  priceRange: {
    min: number;
    max: number;
  };
  image_url?: string;
}

export interface UseMergedProductsReturn {
  mergedProducts: MergedProduct[];
  isLoading: boolean;
  error: string | null;
  getProductByCategory: (category: string) => MergedProduct | undefined;
}

// Configuration for product merging rules
const MERGE_RULES = {
  hoodie: {
    searchTerms: ['hoodie'], // Will match products with "hoodie" in name
    mergedName: 'Reform UK Hoodie',
    category: 'apparel'
  },
  tshirt: {
    searchTerms: ['t-shirt', 'tshirt'], // Will match products with these terms
    mergedName: 'Reform UK T-Shirt', 
    category: 'apparel'
  },
  cap: {
    searchTerms: ['cap', 'hat'], // Will match products with these terms
    mergedName: 'Reform UK Cap',
    category: 'apparel'
  }
} as const;

export function useMergedProducts(): UseMergedProductsReturn {
  const [mergedProducts, setMergedProducts] = useState<MergedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndMergeProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all products from database
        const allProducts = await getProducts();

        // Group products by merge rules
        const productGroups: { [key: string]: any[] } = {};
        const ungroupedProducts: any[] = [];

        allProducts.forEach(product => {
          let grouped = false;
          
          // Check against each merge rule
          for (const [categoryKey, rule] of Object.entries(MERGE_RULES)) {
            const matchesRule = rule.searchTerms.some(term =>
              product.name.toLowerCase().includes(term.toLowerCase())
            );
            
            if (matchesRule) {
              if (!productGroups[categoryKey]) {
                productGroups[categoryKey] = [];
              }
              productGroups[categoryKey].push(product);
              grouped = true;
              break;
            }
          }
          
          // If no merge rule matched, keep as individual product
          if (!grouped) {
            ungroupedProducts.push(product);
          }
        });


        // Merge grouped products and fetch their variants
        const merged: MergedProduct[] = [];

        // Process grouped products (these get merged)
        for (const [categoryKey, products] of Object.entries(productGroups)) {
          if (products.length > 0) {
            const rule = MERGE_RULES[categoryKey as keyof typeof MERGE_RULES];
            const mergedProduct = await createMergedProduct(products, rule.mergedName, categoryKey);
            merged.push(mergedProduct);
          }
        }

        // Process ungrouped products (these remain individual)
        for (const product of ungroupedProducts) {
          const individual = await createMergedProduct([product], product.name, `individual-${product.id}`);
          merged.push(individual);
        }

        // If no merged products found, create fallback products with static data
        if (merged.length === 0) {
          const fallbackProducts = createFallbackProducts();
          setMergedProducts(fallbackProducts);
        } else {
          setMergedProducts(merged);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndMergeProducts();
  }, []);

  const getProductByCategory = (category: string): MergedProduct | undefined => {
    return mergedProducts.find(product => 
      product.id === category || 
      product.name.toLowerCase().includes(category.toLowerCase())
    );
  };

  return {
    mergedProducts,
    isLoading,
    error,
    getProductByCategory
  };
}

// Helper function to aggregate metadata from all products
function aggregateProductMetadata(products: any[]) {
  // Combine all images with deduplication
  const allImages = new Map();
  products.forEach(product => {
    if (product.images) {
      product.images.forEach(img => {
        if (!allImages.has(img.image_url)) {
          allImages.set(img.image_url, img);
        }
      });
    }
  });
  
  // Aggregate descriptions
  const descriptions = products
    .map(p => p.description)
    .filter(Boolean)
    .join(' | ');
  
  // Calculate weighted average rating from products that have ratings
  const productsWithRatings = products.filter(p => p.rating && p.rating > 0);
  let averageRating = 4.8; // Better default than 5.0
  let totalReviews = 0;
  
  if (productsWithRatings.length > 0) {
    const totalRating = productsWithRatings.reduce((sum, p) => 
      sum + p.rating * (p.reviews || 1), 0);
    totalReviews = productsWithRatings.reduce((sum, p) => 
      sum + (p.reviews || 1), 0);
    averageRating = totalRating / totalReviews;
  }
  
  return {
    images: Array.from(allImages.values()),
    description: descriptions,
    rating: averageRating,
    reviews: totalReviews,
    category: products[0].category, // Use first product's category
    image_url: products[0].image_url || '/BackReformLogo.png'
  };
}

// Helper function to create a merged product from multiple database products
async function createMergedProduct(
  products: any[], 
  mergedName: string, 
  categoryKey: string
): Promise<MergedProduct> {
  // Aggregate metadata from ALL products, not just first one
  const aggregatedMetadata = aggregateProductMetadata(products);
  const baseProduct = products[0]; // Still use first product for fallbacks
  
  // Fetch variants for all products and combine them
  const allVariants: ProductVariant[] = [];
  
  for (const product of products) {
    try {
      const variants = await getProductVariants(product.id);
      
      // Transform database variants to our format
      const transformedVariants = variants.map(variant => ({
        id: variant.id,
        product_id: product.id,
        color: variant.color || 'Unknown',
        color_hex: variant.color_hex || '#CCCCCC',
        size: variant.size || 'M',
        price: variant.price || 0,
        stock: variant.stock || 0,
        sku: variant.sku,
        printful_variant_id: variant.printful_variant_id,
        // description field doesn't exist in product_variants table
      }));
      
      allVariants.push(...transformedVariants);
    } catch (error) {
      // Silently handle variant fetch errors
    }
  }

  // Extract unique colors with hex values
  const uniqueColors = new Map<string, string>();
  allVariants.forEach(variant => {
    if (variant.color && variant.color_hex) {
      uniqueColors.set(variant.color, variant.color_hex);
    }
  });

  const colorOptions = Array.from(uniqueColors.entries()).map(([name, hex]) => ({
    name,
    hex,
    border: name.toLowerCase() === 'white'
  }));

  // Extract unique sizes
  const uniqueSizes = new Set<string>();
  allVariants.forEach(variant => {
    if (variant.size) {
      uniqueSizes.add(variant.size);
    }
  });

  // Sort sizes in typical order
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const sizeOptions = Array.from(uniqueSizes).sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a);
    const bIndex = sizeOrder.indexOf(b);
    
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Calculate price range
  const prices = allVariants.map(v => v.price).filter(p => p > 0);
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0
  };

  return {
    id: categoryKey,
    name: mergedName,
    description: aggregatedMetadata.description || baseProduct.description,
    category: aggregatedMetadata.category,
    baseProduct: {
      ...baseProduct,
      rating: aggregatedMetadata.rating,
      reviews: aggregatedMetadata.reviews,
      images: aggregatedMetadata.images
    },
    variants: allVariants,
    colorOptions,
    sizeOptions,
    priceRange,
    image_url: aggregatedMetadata.image_url
  };
}

// Create fallback products when database is empty
function createFallbackProducts(): MergedProduct[] {
  
  const fallbackProducts: MergedProduct[] = [];
  
  // Create hoodie fallback product
  const hoodieProduct: MergedProduct = {
    id: 'hoodie',
    name: 'Reform UK Hoodie',
    description: 'Premium cotton blend hoodie featuring the Reform UK logo. Available in multiple beautiful colors and sizes. Made from high-quality materials for comfort and durability.',
    category: 'apparel',
    baseProduct: { 
      id: 'fallback-hoodie', 
      name: 'Reform UK Hoodie',
      rating: 4.8,
      reviews: 89,
      images: [
        // Generate color-specific images for each hoodie color
        ...hoodieColors.flatMap(color => 
          Array.from({ length: 4 }, (_, i) => ({
            id: `hoodie-${color.name.toLowerCase()}-${i+1}`,
            product_id: 'fallback-hoodie',
            image_url: `/Hoodie/Men/ReformMenHoodie${color.name.replace(/\s+/g, '')}${i + 1}.webp`,
            image_order: i,
            is_primary: i === 0,
            variant_type: 'color',
            color: color.name,
            size: null
          }))
        )
      ]
    },
    variants: [],
    colorOptions: hoodieColors,
    sizeOptions: hoodieSizes as any,
    priceRange: { min: 39.99, max: 39.99 },
    image_url: '/BackReformLogo.png'
  };
  
  // Create t-shirt fallback product
  const tshirtProduct: MergedProduct = {
    id: 'tshirt',
    name: 'Reform UK T-Shirt',
    description: 'Comfortable cotton t-shirt featuring the Reform UK logo. Available in multiple beautiful colors and sizes. Made from premium cotton for all-day comfort and durability.',
    category: 'apparel',
    baseProduct: { 
      id: 'fallback-tshirt', 
      name: 'Reform UK T-Shirt',
      rating: 4.8,
      reviews: 156,
      images: [
        // Generate color-specific images for each t-shirt color
        ...tshirtColors.flatMap(color => 
          Array.from({ length: 4 }, (_, i) => ({
            id: `tshirt-${color.name.toLowerCase()}-${i+1}`,
            product_id: 'fallback-tshirt',
            image_url: `/Tshirt/Men/ReformMen${color.name.replace(/\s+/g, '')}${i + 1}.webp`,
            image_order: i,
            is_primary: i === 0,
            variant_type: 'color',
            color: color.name,
            size: null
          }))
        )
      ]
    },
    variants: [],
    colorOptions: tshirtColors,
    sizeOptions: tshirtSizes as any,
    priceRange: { min: 24.99, max: 24.99 },
    image_url: '/BackReformLogo.png'
  };
  
  // Create cap fallback product
  const capProduct: MergedProduct = {
    id: 'cap',
    name: 'Reform UK Cap',
    description: 'Adjustable cap with embroidered Reform UK logo. Features a classic 6-panel design with a curved visor and adjustable strap for the perfect fit.',
    category: 'apparel',
    baseProduct: { 
      id: 'fallback-cap', 
      name: 'Reform UK Cap',
      rating: 4.8,
      reviews: 92,
      images: [
        // Generate color-specific images for each cap color - using cap color structure
        ...['Black', 'Navy', 'White', 'Pink', 'Stone', 'Khaki'].flatMap(color => 
          Array.from({ length: 7 }, (_, i) => ({
            id: `cap-${color.toLowerCase()}-${i+1}`,
            product_id: 'fallback-cap',
            image_url: `/Cap/ReformCap${color.replace(/\s+/g, '')}${i + 1}.webp`,
            image_order: i,
            is_primary: i === 0,
            variant_type: 'color',
            color: color,
            size: null
          }))
        )
      ]
    },
    variants: [],
    colorOptions: [
      { name: 'Black', hex: '#000000' },
      { name: 'Navy', hex: '#001f3f' },
      { name: 'White', hex: '#ffffff', border: true },
      { name: 'Pink', hex: '#FF69B4' },
      { name: 'Stone', hex: '#918F8A' },
      { name: 'Khaki', hex: '#7E7F56' }
    ],
    sizeOptions: ['One Size'],
    priceRange: { min: 19.99, max: 19.99 },
    image_url: '/BackReformLogo.png'
  };

  fallbackProducts.push(hoodieProduct, tshirtProduct, capProduct);
  
  return fallbackProducts;
}