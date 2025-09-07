import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DBProductVariant {
  id: string; // UUID from database
  product_id: string;
  name: string;
  value: string;
  printful_variant_id: string; // The actual Printful ID we need
  price: number;
  in_stock: boolean;
  is_available: boolean;
  color?: string;
  color_hex?: string;
  design?: string;
  size?: string;
  color_name?: string;
  size_name?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch real product variants from the database
 * This ensures we use the correct printful_variant_id for order fulfillment
 */
export function useProductVariantsFromDB(productName?: string) {
  const [variants, setVariants] = useState<DBProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVariants() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('product_variants')
          .select('*');

        // If productName is provided, filter by product
        if (productName) {
          // First get the product ID
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id')
            .ilike('name', `%${productName}%`)
            .single();

          if (productError || !product) {
            throw new Error(`Product not found: ${productName}`);
          }

          query = query.eq('product_id', product.id);
        }

        const { data, error: variantError } = await query
          .order('name', { ascending: true })
          .order('size_name', { ascending: true });

        if (variantError) {
          throw variantError;
        }

        setVariants(data || []);
      } catch (err) {
        console.error('Error fetching variants from DB:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch variants');
      } finally {
        setLoading(false);
      }
    }

    fetchVariants();
  }, [productName]);

  // Helper function to find a specific variant
  const findVariant = (color: string, size?: string, design?: string): DBProductVariant | null => {
    return variants.find(v => {
      const colorMatch = v.color?.toLowerCase() === color.toLowerCase() ||
                        v.color_name?.toLowerCase() === color.toLowerCase();
      
      if (size) {
        const sizeMatch = v.size === size || v.size_name === size;
        if (design) {
          const designMatch = v.design === design || v.name.includes(design);
          return colorMatch && sizeMatch && designMatch;
        }
        return colorMatch && sizeMatch;
      }
      
      return colorMatch;
    }) || null;
  };

  // Helper function to find T-shirt variant specifically
  const findTshirtVariant = (design: 'DARK' | 'LIGHT', size: string, color: string): DBProductVariant | null => {
    return variants.find(v => {
      // Check if it's a T-shirt variant
      const isTshirt = v.name.includes('t-shirt') || v.name.includes('T-shirt');
      if (!isTshirt) return false;

      // Check design
      const designMatch = v.name.includes(design) || v.design === design;
      
      // Check color
      const colorMatch = v.color?.toLowerCase() === color.toLowerCase() ||
                        v.color_name?.toLowerCase() === color.toLowerCase();
      
      // Check size
      const sizeMatch = v.size === size || v.size_name === size;
      
      return designMatch && colorMatch && sizeMatch;
    }) || null;
  };

  // Helper function to find Hoodie variant
  const findHoodieVariant = (design: 'DARK' | 'LIGHT', size: string, color: string): DBProductVariant | null => {
    return variants.find(v => {
      // Check if it's a Hoodie variant
      const isHoodie = v.name.includes('Hoodie') || v.name.includes('hoodie');
      if (!isHoodie) return false;

      // Check design
      const designMatch = v.name.includes(design) || v.design === design;
      
      // Check color
      const colorMatch = v.color?.toLowerCase() === color.toLowerCase() ||
                        v.color_name?.toLowerCase() === color.toLowerCase();
      
      // Check size
      const sizeMatch = v.size === size || v.size_name === size;
      
      return designMatch && colorMatch && sizeMatch;
    }) || null;
  };

  // Helper function to find Cap variant
  const findCapVariant = (color: string): DBProductVariant | null => {
    return variants.find(v => {
      // Check if it's a Cap variant
      const isCap = v.name.includes('Cap') || v.name.includes('cap');
      if (!isCap) return false;

      // Check color
      const colorMatch = v.color?.toLowerCase() === color.toLowerCase() ||
                        v.color_name?.toLowerCase() === color.toLowerCase();
      
      return colorMatch;
    }) || null;
  };

  // Helper function to get single-variant items
  const getSingleVariantItem = (productType: 'mug' | 'tote' | 'water' | 'mouse' | 'sticker'): DBProductVariant | null => {
    const typeMap: Record<string, string[]> = {
      'mug': ['Mug', 'mug'],
      'tote': ['Tote', 'tote', 'Bag'],
      'water': ['Water', 'water', 'Bottle'],
      'mouse': ['Mouse', 'mouse', 'Pad'],
      'sticker': ['Sticker', 'sticker']
    };

    const keywords = typeMap[productType] || [];
    
    return variants.find(v => {
      return keywords.some(keyword => v.name.includes(keyword));
    }) || null;
  };

  return {
    variants,
    loading,
    error,
    findVariant,
    findTshirtVariant,
    findHoodieVariant,
    findCapVariant,
    getSingleVariantItem
  };
}

/**
 * Hook to fetch ALL variants from the database at once
 * Useful for bundle pages that need multiple product types
 */
export function useAllProductVariants() {
  const [variants, setVariants] = useState<DBProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllVariants() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: variantError } = await supabase
          .from('product_variants')
          .select('*')
          .order('product_id', { ascending: true })
          .order('name', { ascending: true });

        if (variantError) {
          throw variantError;
        }

        setVariants(data || []);
        console.log(`Loaded ${data?.length || 0} variants from database`);
      } catch (err) {
        console.error('Error fetching all variants from DB:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch variants');
      } finally {
        setLoading(false);
      }
    }

    fetchAllVariants();
  }, []);

  // Helper to find T-shirt variant
  const findTshirtVariant = (design: 'DARK' | 'LIGHT', size: string, color: string): DBProductVariant | null => {
    const result = variants.find(v => {
      const isTshirt = v.name.includes('t-shirt') || v.name.includes('T-shirt');
      if (!isTshirt) return false;

      const designMatch = v.name.includes(design);
      const colorMatch = v.color?.toLowerCase() === color.toLowerCase() ||
                        v.color_name?.toLowerCase() === color.toLowerCase();
      const sizeMatch = v.size === size || v.size_name === size;
      
      return designMatch && colorMatch && sizeMatch;
    }) || null;

    if (result) {
      console.log(`Found T-shirt variant: ${design} ${color} ${size} -> ID: ${result.id}, Printful: ${result.printful_variant_id}`);
    } else {
      console.warn(`No T-shirt variant found for: ${design} ${color} ${size}`);
    }

    return result;
  };

  // Helper to find Hoodie variant
  const findHoodieVariant = (design: 'DARK' | 'LIGHT', size: string, color: string): DBProductVariant | null => {
    const result = variants.find(v => {
      const isHoodie = v.name.includes('Hoodie') || v.name.includes('hoodie');
      if (!isHoodie) return false;

      const designMatch = v.name.includes(design);
      const colorMatch = v.color?.toLowerCase() === color.toLowerCase() ||
                        v.color_name?.toLowerCase() === color.toLowerCase();
      const sizeMatch = v.size === size || v.size_name === size;
      
      return designMatch && colorMatch && sizeMatch;
    }) || null;

    if (result) {
      console.log(`Found Hoodie variant: ${design} ${color} ${size} -> ID: ${result.id}, Printful: ${result.printful_variant_id}`);
    } else {
      console.warn(`No Hoodie variant found for: ${design} ${color} ${size}`);
    }

    return result;
  };

  // Helper to find Cap variant
  const findCapVariant = (color: string): DBProductVariant | null => {
    const result = variants.find(v => {
      const isCap = v.name.includes('Cap') || v.name.includes('cap');
      if (!isCap) return false;

      const colorMatch = v.color?.toLowerCase() === color.toLowerCase() ||
                        v.color_name?.toLowerCase() === color.toLowerCase();
      
      return colorMatch;
    }) || null;

    if (result) {
      console.log(`Found Cap variant: ${color} -> ID: ${result.id}, Printful: ${result.printful_variant_id}`);
    } else {
      console.warn(`No Cap variant found for: ${color}`);
    }

    return result;
  };

  // Helper to get single-variant items
  const getSingleVariantItem = (productType: 'mug' | 'tote' | 'water' | 'mouse' | 'sticker'): DBProductVariant | null => {
    const typeMap: Record<string, string[]> = {
      'mug': ['Mug', 'mug'],
      'tote': ['Tote', 'tote', 'Bag'],
      'water': ['Water', 'water', 'Bottle'],
      'mouse': ['Mouse', 'mouse', 'Pad'],
      'sticker': ['Sticker', 'sticker']
    };

    const keywords = typeMap[productType] || [];
    
    const result = variants.find(v => {
      return keywords.some(keyword => v.name.includes(keyword));
    }) || null;

    if (result) {
      console.log(`Found ${productType} variant -> ID: ${result.id}, Printful: ${result.printful_variant_id}`);
    } else {
      console.warn(`No ${productType} variant found`);
    }

    return result;
  };

  return {
    variants,
    loading,
    error,
    findTshirtVariant,
    findHoodieVariant,
    findCapVariant,
    getSingleVariantItem
  };
}