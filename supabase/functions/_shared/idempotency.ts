import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js';

/**
 * Generate an idempotency key for preventing duplicate operations
 * @param prefix - Operation prefix (e.g., 'pi' for payment intent, 'printful' for printful orders)
 * @param parts - Parts to include in the key (customer_email, timestamp, etc.)
 * @returns Formatted idempotency key
 */
export function generateIdempotencyKey(prefix: string, ...parts: string[]): string {
  // Remove any empty or null parts
  const cleanParts = parts.filter(part => part && part.trim().length > 0);
  return `${prefix}_${cleanParts.join('_')}`;
}

/**
 * Check if an idempotency key has been used before
 * @param supabase - Supabase client
 * @param key - Idempotency key to check
 * @returns True if key exists (already processed), false if new
 */
export async function checkIdempotency(
  supabase: SupabaseClient,
  key: string
): Promise<{ exists: boolean; result?: any }> {
  try {
    const { data, error } = await supabase
      .from('idempotency_keys')
      .select('result')
      .eq('key', key)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking idempotency:', error);
      return { exists: false };
    }

    return {
      exists: !!data,
      result: data?.result
    };
  } catch (error) {
    console.error('Exception checking idempotency:', error);
    return { exists: false };
  }
}

/**
 * Record an idempotency key with its result to prevent duplicate operations
 * @param supabase - Supabase client
 * @param key - Idempotency key
 * @param result - Result to store for future duplicate requests
 * @returns Success/failure status
 */
export async function recordIdempotency(
  supabase: SupabaseClient,
  key: string,
  result: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('idempotency_keys')
      .insert({
        key,
        result,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });

    if (error) {
      console.error('Error recording idempotency:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Exception recording idempotency:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Create a hash from cart contents and customer data for idempotency
 * Useful for creating consistent idempotency keys from complex data
 * @param data - Data to hash
 * @returns Hash string
 */
export async function createDataHash(data: any): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data, Object.keys(data).sort());
  const dataBuffer = encoder.encode(dataString);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate an idempotency key based on cart contents and customer email
 * This ensures the same cart + customer combination always generates the same key
 * @param customerEmail - Customer email
 * @param items - Cart items
 * @param shippingAddress - Shipping address
 * @returns Idempotency key
 */
export async function generateCartIdempotencyKey(
  customerEmail: string,
  items: any[],
  shippingAddress: any
): Promise<string> {
  const cartData = {
    customer_email: customerEmail,
    items: items.map(item => ({
      id: item.id || item.product_id,
      printful_variant_id: item.printful_variant_id,
      quantity: item.quantity,
      price: item.price,
      color: item.color,
      size: item.size
    })).sort((a, b) => (a.id || '').localeCompare(b.id || '')),
    shipping: {
      address1: shippingAddress.address1,
      city: shippingAddress.city,
      country_code: shippingAddress.country_code,
      zip: shippingAddress.zip
    },
    timestamp: Date.now() // Add timestamp to make each request unique
  };
  
  const hash = await createDataHash(cartData);
  return `cart_${hash.substring(0, 16)}`;
}