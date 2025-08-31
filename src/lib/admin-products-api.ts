import { supabase } from './supabase';

// Types for admin products management
export interface ProductOverride {
  id: string;
  printful_product_id: string;
  custom_retail_price?: number;
  custom_description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  is_thumbnail: boolean;
  variant_type: 'product' | 'color' | 'size';
  color?: string;
  size?: string;
  created_at: string;
}

export interface Bundle {
  id: string;
  name: string;
  description?: string;
  retail_price: number;
  original_price?: number;
  bundle_type?: string;
  image_url?: string;
  slug?: string;
  shipping_info?: string;
  urgency_text?: string;
  rating?: number;
  review_count?: number;
  features?: string[];
  care_instructions?: string;
  materials?: string;
  popular?: boolean;
  sort_order?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BundleItem {
  id: string;
  bundle_id: string;
  product_id: string;
  quantity: number;
  is_customizable?: boolean;
  allowed_colors?: string[];
  allowed_sizes?: string[];
  default_color?: string;
  default_size?: string;
  custom_price?: number;
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export interface BundleImage {
  id: string;
  bundle_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  alt_text?: string;
  created_at: string;
}

export interface BundleReview {
  id: string;
  bundle_id: string;
  customer_name: string;
  rating: number;
  comment?: string;
  verified_purchase: boolean;
  review_date: string;
  created_at: string;
}

export interface BundleDetails extends Bundle {
  items: (BundleItem & { product_name?: string; product_category?: string })[];
  images: BundleImage[];
  reviews: BundleReview[];
  savings?: {
    original_total: number;
    bundle_price: number;
    savings_amount: number;
    savings_percentage: number;
  };
}

export interface PrintfulSyncStatus {
  product_id: string;
  last_synced: string;
  sync_status: 'pending' | 'syncing' | 'completed' | 'failed';
  error_message?: string;
}

export interface ImageUploadResult {
  path: string;
  url: string;
  size: number;
  mime_type: string;
}

// Admin Products API Client
export class AdminProductsAPI {
  
  // ===== PRODUCTS =====
  
  async getProducts(): Promise<any[]> {
    try {
      // Get products with their admin overrides and images
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          slug,
          category,
          tags,
          reviews,
          rating,
          in_stock,
          stock_count,
          created_at,
          updated_at,
          printful_product_id,
          printful_cost,
          retail_price,
          is_available,
          product_overrides (
            id,
            printful_product_id,
            custom_retail_price,
            custom_description,
            custom_name,
            custom_category,
            custom_tags,
            is_active
          ),
          product_images (
            id,
            image_url,
            image_order,
            is_primary,
            is_thumbnail,
            variant_type,
            color,
            size
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
      
      // Transform the data to include admin overrides
      const transformedProducts = (data || []).map(product => {
        const override = product.product_overrides?.[0];
        const images = product.product_images || [];
        
              // Debug logging to see what's happening with printful_product_id
      console.log('Product data:', {
        id: product.id,
        name: product.name,
        original_printful_id: product.printful_product_id,
        override_printful_id: override?.printful_product_id,
        has_override: !!override,
        override_active: override?.is_active
      });
      
      const finalPrintfulId = override?.printful_product_id || product.printful_product_id;
      
      console.log('Final printful_product_id:', finalPrintfulId);
      
      // Log the complete transformed product for debugging
      const transformedProduct = {
        ...product,
        // Use override values if available, otherwise use original values
        display_name: override?.custom_name || product.name,
        display_description: override?.custom_description || product.description,
        display_price: override?.custom_retail_price || product.retail_price || product.price,
        display_category: override?.custom_category || product.category,
        display_tags: override?.custom_tags || product.tags,
        printful_product_id: finalPrintfulId,
        has_override: !!override,
        override_active: override?.is_active ?? false,
        // Image management
        primary_image: images.find(img => img.is_primary)?.image_url || product.image_url,
        thumbnail_image: images.find(img => img.is_thumbnail)?.image_url || images.find(img => img.is_primary)?.image_url || product.image_url,
        all_images: images.sort((a, b) => a.image_order - b.image_order),
        image_count: images.length,
        // Ensure printful_cost is handled properly
        printful_cost: product.printful_cost || null,
        retail_price: product.retail_price || product.price,
        // Sync status - temporarily set to unknown since sync_status table is disabled
        sync_status: 'unknown',
        last_synced: null
      };
      
      console.log('Complete transformed product:', transformedProduct);
      
      return transformedProduct;
        
        return transformedProduct;
      });
      
      return transformedProducts;
    } catch (error) {
      console.error('Error in getProducts:', error);
      return [];
    }
  }
  
  async createProduct(product: any): Promise<any> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
    
    return data;
  }
  
  async updateProduct(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
    
    return data;
  }
  
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }
  
  // ===== PRODUCT OVERRIDES =====
  
  async getProductOverrides(printfulProductId?: string): Promise<ProductOverride[]> {
    let query = supabase
      .from('product_overrides')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (printfulProductId) {
      query = query.eq('printful_product_id', printfulProductId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching product overrides:', error);
      throw new Error(`Failed to fetch product overrides: ${error.message}`);
    }
    
    return data || [];
  }
  
  async createProductOverride(override: Omit<ProductOverride, 'id' | 'created_at' | 'updated_at'>): Promise<ProductOverride> {
    const { data, error } = await supabase
      .from('product_overrides')
      .insert(override)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product override:', error);
      throw new Error(`Failed to create product override: ${error.message}`);
    }
    
    return data;
  }
  
  async updateProductOverride(id: string, updates: Partial<ProductOverride>): Promise<ProductOverride> {
    const { data, error } = await supabase
      .from('product_overrides')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product override:', error);
      throw new Error(`Failed to update product override: ${error.message}`);
    }
    
    return data;
  }
  
  async deleteProductOverride(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_overrides')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product override:', error);
      throw new Error(`Failed to delete product override: ${error.message}`);
    }
  }
  
  // ===== PRODUCT IMAGES =====
  
  async getProductImages(productId: string): Promise<ProductImage[]> {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('image_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching product images:', error);
      throw new Error(`Failed to fetch product images: ${error.message}`);
    }
    
    return data || [];
  }
  
  async createProductImage(image: Omit<ProductImage, 'id' | 'created_at'>): Promise<ProductImage> {
    const { data, error } = await supabase
      .from('product_images')
      .insert(image)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product image:', error);
      throw new Error(`Failed to create product image: ${error.message}`);
    }
    
    return data;
  }
  
  async updateProductImage(id: string, updates: Partial<ProductImage>): Promise<ProductImage> {
    const { data, error } = await supabase
      .from('product_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product image:', error);
      throw new Error(`Failed to update product image: ${error.message}`);
    }
    
    return data;
  }
  
  async deleteProductImage(id: string): Promise<void> {
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product image:', error);
      throw new Error(`Failed to delete product image: ${error.message}`);
    }
  }
  
  async reorderProductImages(productId: string, imageIds: string[]): Promise<void> {
    // Update image order for all images
    const updates = imageIds.map((id, index) => ({
      id,
      image_order: index
    }));
    
    const { error } = await supabase
      .from('product_images')
      .upsert(updates);
    
    if (error) {
      console.error('Error reordering product images:', error);
      throw new Error(`Failed to reorder product images: ${error.message}`);
    }
  }
  
  // ===== BUNDLES =====
  
  async getBundles(includeItems: boolean = false): Promise<Bundle[]> {
    try {
      const selectFields = `
        id,
        name,
        description,
        retail_price,
        original_price,
        bundle_type,
        image_url,
        slug,
        shipping_info,
        urgency_text,
        rating,
        review_count,
        features,
        care_instructions,
        materials,
        popular,
        sort_order,
        is_active,
        created_at,
        updated_at${includeItems ? ',bundle_items(id,product_id,quantity,is_customizable,allowed_colors,allowed_sizes,default_color,default_size,custom_price,display_order,created_at,updated_at,products(id,name,category,image_url))' : ''}
      `;

      const { data, error } = await supabase
        .from('bundles')
        .select(selectFields)
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching bundles:', error);
        throw new Error(`Failed to fetch bundles: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getBundles:', error);
      return [];
    }
  }

  async getBundleDetails(bundleId: string): Promise<BundleDetails | null> {
    try {
      console.log('🔍 Calling get_bundle_details with bundleId:', bundleId);
      
      const { data, error } = await supabase
        .rpc('get_bundle_details', { p_bundle_id: bundleId });
      
      console.log('🔍 RPC Response:', { data, error });
      
      if (error) {
        console.error('Error fetching bundle details:', error);
        throw new Error(`Failed to fetch bundle details: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ No bundle found with ID:', bundleId);
        return null;
      }
      
      const result = data[0];
      console.log('✅ Bundle details fetched successfully:', result);
      
      return result;
    } catch (error) {
      console.error('Error in getBundleDetails:', error);
      throw error; // Re-throw instead of returning null to see the actual error
    }
  }

  async getBundleSavings(bundleId: string) {
    try {
      const { data, error } = await supabase
        .rpc('calculate_bundle_savings', { p_bundle_id: bundleId });
      
      if (error) {
        console.error('Error calculating bundle savings:', error);
        throw new Error(`Failed to calculate bundle savings: ${error.message}`);
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error in getBundleSavings:', error);
      return null;
    }
  }
  
  async createBundle(bundle: Omit<Bundle, 'id' | 'created_at' | 'updated_at'>, items?: Omit<BundleItem, 'id' | 'bundle_id' | 'created_at'>[]): Promise<Bundle> {
    // Start a transaction
    const { data: bundleData, error: bundleError } = await supabase
      .from('bundles')
      .insert(bundle)
      .select()
      .single();
    
    if (bundleError) {
      console.error('Error creating bundle:', bundleError);
      throw new Error(`Failed to create bundle: ${bundleError.message}`);
    }
    
    // Add bundle items if provided
    if (items && items.length > 0) {
      const bundleItems = items.map(item => ({
        ...item,
        bundle_id: bundleData.id
      }));
      
      const { error: itemsError } = await supabase
        .from('bundle_items')
        .insert(bundleItems);
      
      if (itemsError) {
        console.error('Error creating bundle items:', itemsError);
        throw new Error(`Failed to create bundle items: ${itemsError.message}`);
      }
    }
    
    return bundleData;
  }
  
  async updateBundle(id: string, updates: Partial<Bundle>): Promise<Bundle> {
    const { data, error } = await supabase
      .from('bundles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bundle:', error);
      throw new Error(`Failed to update bundle: ${error.message}`);
    }
    
    return data;
  }
  
  async deleteBundle(id: string): Promise<void> {
    const { error } = await supabase
      .from('bundles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting bundle:', error);
      throw new Error(`Failed to delete bundle: ${error.message}`);
    }
  }
  
  // ===== BUNDLE ITEMS =====
  
  async getBundleItems(bundleId: string): Promise<BundleItem[]> {
    const { data, error } = await supabase
      .from('bundle_items')
      .select(`
        *,
        products (
          id,
          name,
          category,
          image_url,
          price
        )
      `)
      .eq('bundle_id', bundleId)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching bundle items:', error);
      throw new Error(`Failed to fetch bundle items: ${error.message}`);
    }
    
    return data || [];
  }

  // ===== BUNDLE IMAGES =====
  
  async getBundleImages(bundleId: string): Promise<BundleImage[]> {
    const { data, error } = await supabase
      .from('bundle_images')
      .select('*')
      .eq('bundle_id', bundleId)
      .order('image_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching bundle images:', error);
      throw new Error(`Failed to fetch bundle images: ${error.message}`);
    }
    
    return data || [];
  }

  async addBundleImage(image: Omit<BundleImage, 'id' | 'created_at'>): Promise<BundleImage> {
    const { data, error } = await supabase
      .from('bundle_images')
      .insert(image)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding bundle image:', error);
      throw new Error(`Failed to add bundle image: ${error.message}`);
    }
    
    return data;
  }

  async updateBundleImage(id: string, updates: Partial<BundleImage>): Promise<BundleImage> {
    const { data, error } = await supabase
      .from('bundle_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bundle image:', error);
      throw new Error(`Failed to update bundle image: ${error.message}`);
    }
    
    return data;
  }

  async deleteBundleImage(id: string): Promise<void> {
    const { error } = await supabase
      .from('bundle_images')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting bundle image:', error);
      throw new Error(`Failed to delete bundle image: ${error.message}`);
    }
  }

  // ===== BUNDLE REVIEWS =====
  
  async getBundleReviews(bundleId: string): Promise<BundleReview[]> {
    const { data, error } = await supabase
      .from('bundle_reviews')
      .select('*')
      .eq('bundle_id', bundleId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bundle reviews:', error);
      throw new Error(`Failed to fetch bundle reviews: ${error.message}`);
    }
    
    return data || [];
  }

  async addBundleReview(review: Omit<BundleReview, 'id' | 'created_at'>): Promise<BundleReview> {
    const { data, error } = await supabase
      .from('bundle_reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding bundle review:', error);
      throw new Error(`Failed to add bundle review: ${error.message}`);
    }
    
    return data;
  }

  async updateBundleReview(id: string, updates: Partial<BundleReview>): Promise<BundleReview> {
    const { data, error } = await supabase
      .from('bundle_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bundle review:', error);
      throw new Error(`Failed to update bundle review: ${error.message}`);
    }
    
    return data;
  }

  async deleteBundleReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('bundle_reviews')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting bundle review:', error);
      throw new Error(`Failed to delete bundle review: ${error.message}`);
    }
  }
  
  async addBundleItem(item: Omit<BundleItem, 'id' | 'created_at'>): Promise<BundleItem> {
    const { data, error } = await supabase
      .from('bundle_items')
      .insert(item)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding bundle item:', error);
      throw new Error(`Failed to add bundle item: ${error.message}`);
    }
    
    return data;
  }
  
  async updateBundleItem(id: string, updates: Partial<BundleItem>): Promise<BundleItem> {
    const { data, error } = await supabase
      .from('bundle_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bundle item:', error);
      throw new Error(`Failed to update bundle item: ${error.message}`);
    }
    
    return data;
  }
  
  async removeBundleItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('bundle_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error removing bundle item:', error);
      throw new Error(`Failed to remove bundle item: ${error.message}`);
    }
  }
  
  // ===== IMAGE UPLOAD/DOWNLOAD =====
  
  async uploadImage(file: File, bucket: 'product-images' | 'admin-assets', path: string): Promise<ImageUploadResult> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return {
      path: data.path,
      url: urlData.publicUrl,
      size: file.size,
      mime_type: file.type
    };
  }
  
  async deleteImage(bucket: 'product-images' | 'admin-assets', path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error('Error deleting image:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }
  
  async getImageUrl(bucket: 'product-images' | 'admin-assets', path: string): Promise<string> {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
  
  // ===== PRINTFUL SYNC STATUS =====
  
  async getPrintfulSyncStatus(productId?: string): Promise<PrintfulSyncStatus[]> {
    // Temporarily disabled sync_status table access to fix 400 errors
    console.log('getPrintfulSyncStatus called but sync_status table is disabled');
    return [];
  }
  
  async fetchPrintfulProducts(): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Printful products: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching Printful products:', error);
      throw error;
    }
  }

  async triggerPrintfulSync(productId: string): Promise<any> {
    console.log('=== TRIGGER PRINTFUL SYNC DEBUG ===');
    console.log('triggerPrintfulSync called with productId:', productId);
    console.log('productId type:', typeof productId);
    console.log('productId value:', productId);
    console.log('productId === "all":', productId === 'all');
    console.log('=== END DEBUG ===');
    
    try {
      // Special case: Pull all products from Printful
      if (productId === 'all') {
        console.log('✅ MATCH: productId === "all" - Using comprehensive import function');
        
        // Use the comprehensive import function instead of just fetching
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-import-all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        });
        
        if (!response.ok) {
          throw new Error(`Printful import failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('All Printful products imported:', result);
        return result;
      }
      
      console.log('❌ NO MATCH: productId !== "all" - Using old sync logic');
      
      // Update sync status to syncing - temporarily disabled to fix 400 errors
      // await supabase
      //   .from('sync_status')
      //   .upsert({
      //     product_id: productId,
      //     timestamp: new Date().toISOString(),
      //     is_syncing: true,
      //     sync_progress: 0,
      //     last_sync_status: 'pending'
      //   });
      
      // Trigger sync via Printful API using Supabase Edge Function
      const requestBody = { 
        productId,
        action: 'full_sync'
      };
      console.log('Request body being sent:', requestBody);
      console.log('Request body JSON:', JSON.stringify(requestBody));
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/printful-sync-simple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Printful sync failed: ${response.statusText}`);
      }
      
      console.log(`Printful sync triggered for product: ${productId}`);
      return { success: true, message: `Sync triggered for product: ${productId}` };
    } catch (error) {
      console.error('Error triggering Printful sync:', error);
      
      // Update sync status to failed - temporarily disabled to fix 400 errors
      // await supabase
      //   .from('sync_status')
      //   .upsert({
      //     product_id: productId,
      //     timestamp: new Date().ISOString(),
      //     is_sync: false,
      //     sync_progress: 0,
      //     last_sync_status: 'failed'
      //   });
      
      throw error;
    }
  }

  // ===== REAL-TIME SYNC MONITORING =====
  
  async getRealTimeSyncStatus(): Promise<any> {
    // Temporarily disabled sync_status table access to fix 400 errors
    console.log('getRealTimeSyncStatus called but sync_status table is disabled');
    return {
      isConnected: false,
      connectionHealth: 'disconnected',
      lastSync: null,
      lastSyncStatus: 'unknown',
      errorCount: 0,
      warningCount: 0,
      inventoryChanges: 0,
      dataConflicts: 0
    };
  }
  
  async getSyncErrors(): Promise<any[]> {
    // Temporarily disabled sync_errors table access to fix 400 errors
    console.log('getSyncErrors called but sync_errors table is disabled');
    return [];
  }
  
  async getInventoryChanges(): Promise<any[]> {
    // Temporarily disabled inventory_changes table access to fix 400 errors
    console.log('getInventoryChanges called but inventory_changes table is disabled');
    return [];
  }
  
  async getDataConflicts(): Promise<any[]> {
    // Temporarily disabled data_conflicts table access to fix 400 errors
    console.log('getDataConflicts called but data_conflicts table is disabled');
    return [];
  }
  
  async resolveDataConflict(conflictId: string, resolution: string): Promise<void> {
    // Temporarily disabled data_conflicts table access to fix 400 errors
    console.log('resolveDataConflict called but data_conflicts table is disabled');
  }
  
  async markErrorResolved(errorId: string): Promise<void> {
    // Temporarily disabled sync_errors table access to fix 400 errors
    console.log('markErrorResolved called but sync_errors table is disabled');
  }
  
  async markInventoryChangeProcessed(changeId: string): Promise<void> {
    // Temporarily disabled inventory_changes table access to fix 400 errors
    console.log('markInventoryChangeProcessed called but inventory_changes table is disabled');
  }
  
  // ===== BULK OPERATIONS =====
  
  async bulkUpdateProductOverrides(overrides: Array<{ id: string; updates: Partial<ProductOverride> }>): Promise<void> {
    const updates = overrides.map(({ id, updates }) => ({
      id,
      ...updates
    }));
    
    const { error } = await supabase
      .from('product_overrides')
      .upsert(updates);
    
    if (error) {
      console.error('Error bulk updating product overrides:', error);
      throw new Error(`Failed to bulk update product overrides: ${error.message}`);
    }
  }
  
  async bulkDeleteProductOverrides(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('product_overrides')
      .delete()
      .in('id', ids);
    
    if (error) {
      console.error('Error bulk deleting product overrides:', error);
      throw new Error(`Failed to bulk delete product overrides: ${error.message}`);
    }
  }
}

// Export singleton instance
export const adminProductsAPI = new AdminProductsAPI();
