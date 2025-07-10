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
  sessionId: string;
  url: string;
}

export async function createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: request,
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }

    if (!data) {
      throw new Error('No data returned from checkout function');
    }

    return data;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
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
      console.error('User not authenticated:', userError);
      return [];
    }

    // Query orders for the authenticated user
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserOrders:', error);
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
      console.error('Error fetching subscription:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
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
      console.error('Error tracking order:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in trackOrderByNumber:', error);
    return null;
  }
}