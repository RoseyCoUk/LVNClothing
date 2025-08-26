import { supabase } from './supabase';

export interface CheckoutSessionRequest {
  price_id?: string;
  line_items?: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
        images?: string[];
      };
      unit_amount: number;
    };
    quantity: number;
  }>;
  metadata?: Record<string, string>;
  success_url: string;
  cancel_url: string;
  mode: 'payment' | 'subscription';
  customer_email?: string;
  shipping_rate_id?: string;
}

export interface CheckoutSessionResponse {
  id: string;           // Stripe returns 'id' for the session ID
  url: string;          // Stripe checkout URL
  sessionId?: string;   // Keep for backward compatibility
}

export async function createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: request,
    });

    if (error) {
      throw new Error(error.message || 'Failed to create checkout session');
    }

    if (!data) {
      throw new Error('No data returned from checkout function');
    }

    return data;
  } catch (error) {
    throw error instanceof Error 
      ? error 
      : new Error('Failed to create checkout session');
  }
}

export async function getUserOrders() {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.warn('getUserOrders: No authenticated user found');
      return [];
    }

    // Query orders for the authenticated user by both user_id and customer_email
    // This handles cases where orders might not have user_id populated yet
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`user_id.eq.${user.id},customer_email.eq.${user.email}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getUserOrders: Error fetching orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('getUserOrders: Unexpected error:', error);
    return [];
  }
}

export async function getUserSubscription() {
  try {
    const { data, error } = await supabase
      .from('stripe_user_subscriptions')
      .select('*')
      .maybeSingle();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

export async function trackOrderByNumber(orderNumber: string, email: string) {
  try {
    // Query order by readable_order_id and customer_email
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('readable_order_id', orderNumber)
      .eq('customer_email', email)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

export async function reorderFromOrder(orderId: string) {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found or access denied');
    }

    // Parse order items
    let orderItems = [];
    try {
      orderItems = Array.isArray(order.items) ? order.items : JSON.parse(order.items);
    } catch (parseError) {
      throw new Error('Invalid order items format');
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      throw new Error('No items found in order');
    }

    // Convert to cart format
    const cartItems = orderItems.map((item: any) => ({
      id: item.printful_variant_id || item.id || `item_${Date.now()}_${Math.random()}`,
      name: item.name || item.product_name || 'Unknown Product',
      price: item.price || (item.price_pence ? item.price_pence / 100 : 0),
      quantity: item.quantity || 1,
      image: item.image || '/placeholder-product.png',
      printful_variant_id: item.printful_variant_id,
      variant: item.variant
    }));

    return {
      success: true,
      items: cartItems,
      orderId: order.id,
      orderNumber: order.readable_order_id
    };
  } catch (error) {
    console.error('Reorder error:', error);
    throw error;
  }
}