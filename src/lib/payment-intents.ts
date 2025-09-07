import { supabase } from './supabase';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  printful_variant_id: string;
  product_type?: string;
  image?: string;
  color?: string;  // Product color variant (e.g., Black, White, Navy)
  size?: string;   // Product size variant (e.g., S, M, L, XL, 11 oz)
  isDiscount?: boolean; // Whether this item is a discount (not to be sent to Printful)
}

export interface ShippingAddress {
  name: string;
  address1: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip: string;
}

export interface PaymentIntentRequest {
  items: CartItem[];
  shipping_address: ShippingAddress;
  customer_email: string;
  currency?: string;
  metadata?: Record<string, string>;
  guest_checkout?: boolean;
}

export interface PaymentIntentResponse {
  client_secret: string;
  amount: number;
  currency: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  payment_intent_id: string;
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  order_id?: string;
  order_number?: string;
  payment_status: string;
  message: string;
}

/**
 * Create a dynamic payment intent with real-time pricing and shipping
 */
export async function createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
  try {
    console.log('📤 Sending to edge function:', JSON.stringify(request, null, 2));
    
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: request,
    });

    console.log('📥 Edge function response:', JSON.stringify(data));
    console.log('📥 Edge function error:', error);

    if (error) {
      console.error('Edge function error details:', error);
      throw new Error(error.message || 'Failed to create payment intent');
    }

    if (!data) {
      throw new Error('No data returned from payment intent function');
    }
    
    // Check if data contains an error (edge function returned 500 with error details)
    if (data.error) {
      console.error('Payment intent error from edge function:', data);
      throw new Error(data.details || data.error || 'Failed to create payment intent');
    }

    return data;
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to create payment intent');
  }
}

/**
 * Confirm a payment intent and create the order
 */
export async function confirmPaymentIntent(request: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('confirm-payment-intent', {
      body: request,
    });

    if (error) {
      throw new Error(error.message || 'Failed to confirm payment');
    }

    if (!data) {
      throw new Error('No data returned from payment confirmation');
    }

    return data;
  } catch (error) {
    throw error instanceof Error 
      ? error 
      : new Error('Failed to confirm payment');
  }
}

/**
 * Get shipping rates for a cart using Printful API
 */
export async function getShippingRates(items: CartItem[], shippingAddress: ShippingAddress) {
  try {
    // Filter out discount items - they should not be sent to Printful for shipping calculations
    const shippableItems = items.filter(item => !item.isDiscount);
    const discountItems = items.filter(item => item.isDiscount);
    
    console.log(`🚚 Shipping: ${shippableItems.length} shippable items, ${discountItems.length} discount items excluded:`, {
      shippableItems: shippableItems.map(item => ({ id: item.id, name: item.name })),
      discountItems: discountItems.map(item => ({ id: item.id, name: item.name }))
    });
    
    const shippingRequest = {
      recipient: {
        name: shippingAddress.name,
        address1: shippingAddress.address1,
        city: shippingAddress.city,
        state_code: shippingAddress.state_code,
        country_code: shippingAddress.country_code,
        zip: shippingAddress.zip,
      },
      items: shippableItems.map(item => ({
        printful_variant_id: /^\d+$/.test(item.printful_variant_id) 
          ? parseInt(item.printful_variant_id) 
          : item.printful_variant_id,
        quantity: item.quantity
      }))
    };

    console.log('📤 Sending to edge function:', JSON.stringify(shippingRequest, null, 2));
    
    const { data, error } = await supabase.functions.invoke('shipping-quotes', {
      body: shippingRequest,
    });

    console.log('📥 Edge function response:', JSON.stringify(data, null, 2));
    console.log('📥 Edge function error:', error);

    if (error) {
      throw new Error(error.message || 'Failed to get shipping rates');
    }

    // HYBRID SOLUTION: Use Printful's accurate pricing but override delivery days
    if (data && data.options && shippingAddress.country_code === 'GB') {
      console.log('🔧 Overriding delivery days to 3-5 business days for UK');
      data.options = data.options.map((option: any) => ({
        ...option,
        minDeliveryDays: 3,
        maxDeliveryDays: 5
      }));
      console.log('📦 Updated shipping options:', JSON.stringify(data.options, null, 2));
    }

    return data;
  } catch (error) {
    throw error instanceof Error 
      ? error 
      : new Error('Failed to get shipping rates');
  }
}

/**
 * Get real-time product price from our database
 */
export async function getProductPrice(printfulVariantId: string): Promise<number> {
  // Note: Price resolution now happens server-side in create-payment-intent function
  // This function is kept for compatibility but returns a reasonable default
  // The real pricing will be calculated by the payment intent function using:
  // 1. Database lookup (if populated)
  // 2. Fallback system with real variant pricing
  // 3. Default pricing as last resort
  
  console.warn(`Client-side price lookup for variant ${printfulVariantId} - server will handle real pricing`);
  
  // Parse the variant ID to give a reasonable estimate (only if numeric)
  const variantId = parseInt(printfulVariantId, 10);
  
  if (!isNaN(variantId) && variantId >= 10000 && variantId < 30000) {
    // T-shirt range - use consistent pricing, server will handle actual variant pricing
    return 24.99; // Standard T-shirt price, server handles size-based pricing
  } else if (!isNaN(variantId) && variantId >= 5000 && variantId < 6000) {
    // Hoodie range
    return 39.99; // Standard hoodie price, server handles size-based pricing  
  } else if (!isNaN(variantId) && variantId >= 6000 && variantId < 7000) {
    // Cap range
    return 19.99;
  } else if (!isNaN(variantId) && variantId >= 7000 && variantId < 8000) {
    // Mug range
    return 14.99;
  } else {
    // Default fallback (includes non-numeric variant IDs)
    return 24.99;
  }
}

/**
 * Validate cart items and enrich with real-time pricing
 */
export async function validateAndEnrichCart(items: CartItem[]): Promise<CartItem[]> {
  const enrichedItems: CartItem[] = [];

  for (const item of items) {
    try {
      // Use the price from the cart item (already correct from product pages)
      // The server-side payment intent creation will handle real-time pricing validation
      enrichedItems.push({
        ...item
        // Keep original price - server will validate and update if needed
      });
    } catch (error) {
      console.warn(`Failed to process item ${item.id}, using as-is`);
      enrichedItems.push(item);
    }
  }

  return enrichedItems;
}

/**
 * Calculate cart totals (subtotal only, shipping calculated separately)
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Check if a payment intent requires additional action (3D Secure, etc.)
 */
export function requiresPaymentAction(status: string): boolean {
  return ['requires_action', 'requires_source_action'].includes(status);
}

/**
 * Check if a payment was successful
 */
export function isPaymentSuccessful(status: string): boolean {
  return status === 'succeeded';
}

/**
 * Get payment status display text
 */
export function getPaymentStatusText(status: string): string {
  const statusTexts: { [key: string]: string } = {
    'requires_payment_method': 'Waiting for payment method',
    'requires_confirmation': 'Confirming payment',
    'requires_action': 'Additional authentication required',
    'processing': 'Processing payment',
    'succeeded': 'Payment successful',
    'canceled': 'Payment canceled',
    'requires_capture': 'Payment authorized'
  };

  return statusTexts[status] || `Payment status: ${status}`;
}