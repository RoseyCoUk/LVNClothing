import { createClient } from 'npm:@supabase/supabase-js';
import { generateIdempotencyKey } from './idempotency.ts';

export interface OrderData {
  id: string;
  customer_email: string;
  items: Array<{
    product_id: string;
    printful_variant_id?: string;
    quantity: number;
    price: number;
    product_name?: string;
  }>;
  shipping_address: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state_code?: string;
    country_code: string;
    zip: string;
  };
  shipping_cost: number;
  subtotal: number;
  total_amount: number;
}

export interface PrintfulOrderResponse {
  success: boolean;
  printful_order_id?: string;
  error?: string;
}

/**
 * Create a Printful order for fulfillment
 * This function handles the creation of orders in Printful's system for print-on-demand fulfillment
 * @param orderData - Order data from our system
 * @returns Promise with success status and Printful order ID
 */
export async function createPrintfulFulfillment(orderData: OrderData): Promise<PrintfulOrderResponse> {
  const printfulToken = Deno.env.get('PRINTFUL_TOKEN');
  const printfulStoreId = Deno.env.get('PRINTFUL_STORE_ID');

  if (!printfulToken) {
    console.warn('PRINTFUL_TOKEN not configured - skipping fulfillment');
    return { success: false, error: 'Printful not configured' };
  }

  try {
    // Filter items that have printful_variant_id
    const printfulItems = orderData.items
      .filter(item => item.printful_variant_id && item.printful_variant_id.trim() !== '')
      .map(item => ({
        sync_variant_id: parseInt(item.printful_variant_id!),
        quantity: item.quantity,
        retail_price: item.price.toFixed(2)
      }));

    if (printfulItems.length === 0) {
      console.error('No items with printful_variant_id found for order', orderData.id);
      return { success: false, error: 'No fulfillable items found' };
    }

    // Create Printful order payload
    const printfulOrder = {
      external_id: orderData.id,
      recipient: {
        name: orderData.shipping_address.name,
        address1: orderData.shipping_address.address1,
        address2: orderData.shipping_address.address2 || '',
        city: orderData.shipping_address.city,
        state_code: orderData.shipping_address.state_code || '',
        country_code: orderData.shipping_address.country_code || 'GB',
        zip: orderData.shipping_address.zip,
        email: orderData.customer_email
      },
      items: printfulItems,
      retail_costs: {
        currency: 'GBP',
        subtotal: orderData.subtotal.toFixed(2),
        shipping: orderData.shipping_cost.toFixed(2),
        total: orderData.total_amount.toFixed(2)
      }
    };

    console.log('Creating Printful order:', {
      external_id: printfulOrder.external_id,
      item_count: printfulItems.length,
      total: printfulOrder.retail_costs.total
    });

    // Use idempotency key for Printful API call
    const idempotencyKey = generateIdempotencyKey('printful_order', orderData.id);

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${printfulToken}`,
      'Content-Type': 'application/json',
      'X-PF-Store-Id': printfulStoreId || '',
      'Idempotency-Key': idempotencyKey
    };

    const response = await fetch('https://api.printful.com/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(printfulOrder)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Printful API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return {
        success: false,
        error: `Printful API error: ${response.status} - ${errorText}`
      };
    }

    const result = await response.json();
    
    if (!result.result || !result.result.id) {
      console.error('Invalid Printful response:', result);
      return {
        success: false,
        error: 'Invalid response from Printful API'
      };
    }

    const printfulOrderId = result.result.id.toString();
    console.log('Printful order created successfully:', {
      external_id: orderData.id,
      printful_order_id: printfulOrderId
    });

    // Record fulfillment in our database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error: dbError } = await supabase
      .from('fulfillments')
      .insert({
        order_id: orderData.id,
        printful_order_id: printfulOrderId,
        status: 'submitted',
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Error recording fulfillment in database:', dbError);
      // Don't fail the whole operation - Printful order was created successfully
    }

    return {
      success: true,
      printful_order_id: printfulOrderId
    };

  } catch (error) {
    console.error('Exception in createPrintfulFulfillment:', error);
    return {
      success: false,
      error: `Fulfillment failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Update fulfillment status based on Printful webhook
 * @param printfulOrderId - Printful order ID
 * @param status - New status from Printful
 * @param trackingData - Tracking information if available
 */
export async function updateFulfillmentStatus(
  printfulOrderId: string,
  status: string,
  trackingData?: {
    tracking_number?: string;
    tracking_url?: string;
    shipped_at?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    };

    if (trackingData) {
      if (trackingData.tracking_number) {
        updateData.tracking_number = trackingData.tracking_number;
      }
      if (trackingData.tracking_url) {
        updateData.tracking_url = trackingData.tracking_url;
      }
      if (trackingData.shipped_at) {
        updateData.shipped_at = trackingData.shipped_at;
      }
    }

    const { error } = await supabase
      .from('fulfillments')
      .update(updateData)
      .eq('printful_order_id', printfulOrderId);

    if (error) {
      console.error('Error updating fulfillment status:', error);
      return { success: false, error: error.message };
    }

    console.log('Fulfillment status updated:', {
      printful_order_id: printfulOrderId,
      status: status
    });

    return { success: true };

  } catch (error) {
    console.error('Exception updating fulfillment status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}