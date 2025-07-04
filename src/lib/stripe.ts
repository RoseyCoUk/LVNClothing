import { supabase } from './supabase';

export interface CheckoutSessionRequest {
  price_id: string;
  success_url: string;
  cancel_url: string;
  mode: 'payment'; // only 'payment' is used now
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
  const { data, error } = await supabase
    .from('stripe_user_orders') // make sure this view exists
    .select('*')
    .order('order_date', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}