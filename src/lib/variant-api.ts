import { supabase } from './supabase';

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  printful_variant_id: string;
  price: number;
  in_stock: boolean;
  is_available: boolean;
  color?: string;
  color_hex?: string;
  design?: string;
  size?: string;
  created_at: string;
  updated_at: string;
}

export interface VariantUpdateData {
  in_stock?: boolean;
  is_available?: boolean;
  price?: number;
  custom_price?: number;
}

/**
 * Fetch all variants for a specific product
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    console.log(`🔍 Fetching variants for product: ${productId}`);
    
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('name', { ascending: true })
      .order('value', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch product variants:', error);
      throw new Error(`Failed to fetch variants: ${error.message}`);
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} variants for product ${productId}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching product variants:', error);
    throw error;
  }
}

/**
 * Fetch all variants across all products
 */
export async function getAllVariants(): Promise<ProductVariant[]> {
  try {
    console.log('🔍 Fetching all variants...');
    
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .order('product_id', { ascending: true })
      .order('name', { ascending: true })
      .order('value', { ascending: true });

    if (error) {
      console.error('❌ Failed to fetch all variants:', error);
      throw new Error(`Failed to fetch variants: ${error.message}`);
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} total variants`);
    return data || [];
  } catch (error) {
    console.error('Error fetching all variants:', error);
    throw error;
  }
}

/**
 * Update a specific variant
 */
export async function updateVariant(variantId: string, updates: VariantUpdateData): Promise<ProductVariant> {
  try {
    console.log(`🔧 Updating variant ${variantId}:`, updates);
    
    const { data, error } = await supabase
      .from('product_variants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', variantId)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update variant:', error);
      throw new Error(`Failed to update variant: ${error.message}`);
    }

    console.log(`✅ Successfully updated variant ${variantId}`);
    return data;
  } catch (error) {
    console.error('Error updating variant:', error);
    throw error;
  }
}

/**
 * Bulk update multiple variants
 */
export async function bulkUpdateVariants(updates: Array<{ id: string; updates: VariantUpdateData }>): Promise<ProductVariant[]> {
  try {
    console.log(`🔧 Bulk updating ${updates.length} variants...`);
    
    const results: ProductVariant[] = [];
    
    for (const { id, updates: variantUpdates } of updates) {
      try {
        const updatedVariant = await updateVariant(id, variantUpdates);
        results.push(updatedVariant);
      } catch (error) {
        console.error(`Failed to update variant ${id}:`, error);
        // Continue with other variants
      }
    }

    console.log(`✅ Successfully updated ${results.length}/${updates.length} variants`);
    return results;
  } catch (error) {
    console.error('Error in bulk variant update:', error);
    throw error;
  }
}

/**
 * Get variant statistics for a product
 */
export async function getVariantStats(productId: string): Promise<{
  total: number;
  available: number;
  inStock: number;
  outOfStock: number;
  unavailable: number;
}> {
  try {
    const variants = await getProductVariants(productId);
    
    const stats = {
      total: variants.length,
      available: variants.filter(v => v.is_available).length,
      inStock: variants.filter(v => v.in_stock).length,
      outOfStock: variants.filter(v => !v.in_stock).length,
      unavailable: variants.filter(v => !v.is_available).length
    };

    console.log(`📊 Variant stats for product ${productId}:`, stats);
    return stats;
  } catch (error) {
    console.error('Error getting variant stats:', error);
    throw error;
  }
}

/**
 * Search variants by criteria
 */
export async function searchVariants(criteria: {
  productId?: string;
  name?: string;
  value?: string;
  inStock?: boolean;
  isAvailable?: boolean;
}): Promise<ProductVariant[]> {
  try {
    console.log('🔍 Searching variants with criteria:', criteria);
    
    let query = supabase
      .from('product_variants')
      .select('*');

    if (criteria.productId) {
      query = query.eq('product_id', criteria.productId);
    }
    
    if (criteria.name) {
      query = query.ilike('name', `%${criteria.name}%`);
    }
    
    if (criteria.value) {
      query = query.ilike('value', `%${criteria.value}%`);
    }
    
    if (criteria.inStock !== undefined) {
      query = query.eq('in_stock', criteria.inStock);
    }
    
    if (criteria.isAvailable !== undefined) {
      query = query.eq('is_available', criteria.isAvailable);
    }

    const { data, error } = await query
      .order('product_id', { ascending: true })
      .order('name', { ascending: true })
      .order('value', { ascending: true });

    if (error) {
      console.error('❌ Failed to search variants:', error);
      throw new Error(`Failed to search variants: ${error.message}`);
    }

    console.log(`✅ Found ${data?.length || 0} variants matching criteria`);
    return data || [];
  } catch (error) {
    console.error('Error searching variants:', error);
    throw error;
  }
}
