import { supabase } from './supabase'
import { handleError, logError, APIError } from './error-handler'

export interface Product {
  id: string
  name: string
  variant: string | null
  description: string | null
  price_pence: number
  category: string | null
  tags: string[]
  reviews: number
  rating: number
  dateAdded: string
  created_at: string
  updated_at: string
  image_url?: string
  slug?: string // Add slug property
}

/**
 * Fetches all products from the products table
 * @returns Promise<Product[]> Array of product objects
 * @throws Error if the database query fails
 */
export async function getProducts(): Promise<Product[]> {
  try {
    console.log('🛍️ Fetching products...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('❌ Failed to fetch products:', error);
      throw handleError(error, 'product-fetch');
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} products`);

    // Map database fields to Product interface and filter out stickers and badges
    const mappedProducts = (data || [])
      .filter(product => {
        // Filter out stickers and badges from the shop page
        const excludedProducts = ['Reform UK Stickers', 'Reform UK Badge Set'];
        return !excludedProducts.includes(product.name);
      })
      .map(product => {
        const mappedProduct = {
          id: product.id,
          name: product.name,
          variant: product.variant,
          description: product.description,
          price_pence: Math.round(Number(product.price) * 100) || 0, // Convert pounds to pence
          category: product.category || 'gear', // Default to 'gear' if no category
          tags: product.tags || [], // Use database tags or empty array
          reviews: product.reviews || 0, // Use database reviews or default
          rating: product.rating || 4.5, // Use database rating or default
          dateAdded: product.created_at, // Use created_at as dateAdded
          created_at: product.created_at,
          updated_at: product.updated_at,
          image_url: product.image_url, // Map image_url
          slug: product.slug // Map slug
        };
        
        // Activist Bundle price conversion handled automatically
        
        return mappedProduct;
      });

    return mappedProducts;
  } catch (error) {
    logError(error, 'getProducts');
    throw error;
  }
} 

/**
 * Fetches product variants for a specific product
 * @param productId The product ID to get variants for
 * @returns Promise<any[]> Array of variant objects
 * @throws Error if the database query fails
 */
export async function getProductVariants(productId: string): Promise<any[]> {
  try {
    console.log(`🔍 Fetching variants for product: ${productId}`);
    
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('description', { ascending: true })

    if (error) {
      console.error('❌ Failed to fetch product variants:', error);
      throw handleError(error, 'product-variants-fetch');
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} variants for product ${productId}`);
    return data || [];
  } catch (error) {
    logError(error, 'getProductVariants', { productId });
    throw error;
  }
} 

export async function cancelOrder(orderId: string, reason?: string) {
  try {
    console.log(`🚫 Attempting to cancel order: ${orderId}`);
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ User authentication failed:', userError);
      throw new APIError('User not authenticated. Please log in again.', {
        context: 'order-cancellation',
        status: 401
      });
    }

    console.log(`✅ User authenticated: ${user.email}`);

    // First, update the order status in our database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancel_reason: reason || 'Cancelled by customer'
      })
      .eq('id', orderId)
      .eq('user_id', user.id) // Ensure user can only cancel their own orders
      .select()
      .single();

    if (orderError) {
      console.error('❌ Failed to cancel order in database:', orderError);
      throw handleError(orderError, 'order-cancellation');
    }

    console.log('✅ Order cancelled successfully in database');

    // If the order has a Stripe payment intent, attempt to refund it
    if (orderData.stripe_session_id) {
      try {
        console.log('💳 Processing Stripe refund...');
        const refundResponse = await fetch('/api/refund-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            orderId,
            reason: reason || 'Order cancelled by customer'
          })
        });

        if (!refundResponse.ok) {
          console.warn('⚠️ Failed to process refund, but order was cancelled:', await refundResponse.text());
        } else {
          console.log('✅ Stripe refund processed successfully');
        }
      } catch (refundError) {
        console.warn('⚠️ Refund processing failed, but order was cancelled:', refundError);
      }
    }

    return orderData;
  } catch (error) {
    logError(error, 'cancelOrder', { orderId, reason });
    throw error;
  }
} 