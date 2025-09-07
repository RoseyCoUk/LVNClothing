export const config = {
  auth: false,
};

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createPrintfulFulfillment, type OrderData } from '../_shared/printful-fulfillment.ts';

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Reform UK Store',
    version: '2.0.0',
  },
  timeout: 30000,
  maxNetworkRetries: 3,
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate readable order ID
function generateReadableOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RUK-${timestamp.slice(-6)}${random}`;
}

// Send order confirmation emails
async function sendOrderEmails(
  orderId: string,
  customerEmail: string,
  items: any[],
  shippingAddress: any,
  orderDetails: {
    subtotal: number;
    shipping_cost: number;
    total_amount: number;
    readable_order_id: string;
  }
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured - skipping email');
    return;
  }

  // Format items for email
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.product_name}</strong>
        ${item.variants ? `<br><small style="color: #6b7280;">${formatVariants(item.variants)}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${(item.unit_price / 100).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${((item.unit_price * item.quantity) / 100).toFixed(2)}</td>
    </tr>
  `).join('');

  // Customer email template
  const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation - Reform UK Store</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #009fe3 0%, #0066cc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0;">Order Confirmation</h1>
    <p style="margin: 10px 0 0 0;">Thank you for your order!</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2>Order #${orderDetails.readable_order_id}</h2>
    <p>Hi ${shippingAddress.name || customerEmail},</p>
    <p>We've received your order and it's being processed. You'll receive another email when your items ship.</p>
    
    <h3>Order Details:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 12px; text-align: left;">Item</th>
          <th style="padding: 12px; text-align: center;">Qty</th>
          <th style="padding: 12px; text-align: right;">Price</th>
          <th style="padding: 12px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Subtotal:</strong></td>
          <td style="padding: 12px; text-align: right;">£${orderDetails.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Shipping:</strong></td>
          <td style="padding: 12px; text-align: right;">£${orderDetails.shipping_cost.toFixed(2)}</td>
        </tr>
        <tr style="background: #f3f4f6;">
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Total:</strong></td>
          <td style="padding: 12px; text-align: right;"><strong>£${orderDetails.total_amount.toFixed(2)}</strong></td>
        </tr>
      </tfoot>
    </table>
    
    <h3>Shipping Address:</h3>
    <p style="background: white; padding: 15px; border-radius: 5px;">
      ${shippingAddress.name}<br>
      ${shippingAddress.address.line1}<br>
      ${shippingAddress.address.line2 ? shippingAddress.address.line2 + '<br>' : ''}
      ${shippingAddress.address.city}, ${shippingAddress.address.state || ''} ${shippingAddress.address.postal_code}<br>
      ${shippingAddress.address.country}
    </p>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
      If you have any questions, please contact us at support@backreform.co.uk
    </p>
  </div>
</body>
</html>
  `;

  // Admin notification email
  const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order - ${orderDetails.readable_order_id}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h1>New Order Received</h1>
  <p><strong>Order ID:</strong> ${orderDetails.readable_order_id}</p>
  <p><strong>Customer:</strong> ${customerEmail}</p>
  <p><strong>Total:</strong> £${orderDetails.total_amount.toFixed(2)}</p>
  
  <h2>Items Ordered:</h2>
  <table border="1" cellpadding="10" style="border-collapse: collapse;">
    <tr>
      <th>Item</th>
      <th>Quantity</th>
      <th>Price</th>
      <th>Total</th>
    </tr>
    ${itemsHtml}
  </table>
  
  <h2>Shipping Details:</h2>
  <p>
    ${shippingAddress.name}<br>
    ${shippingAddress.address.line1}<br>
    ${shippingAddress.address.line2 ? shippingAddress.address.line2 + '<br>' : ''}
    ${shippingAddress.address.city}, ${shippingAddress.address.state || ''} ${shippingAddress.address.postal_code}<br>
    ${shippingAddress.address.country}
  </p>
</body>
</html>
  `;

  try {
    // Send customer email
    const customerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        to: customerEmail,
        from: 'support@backreform.co.uk',
        subject: `Order Confirmation - ${orderDetails.readable_order_id}`,
        html: customerEmailHtml,
      }),
    });

    if (!customerEmailResponse.ok) {
      const error = await customerEmailResponse.text();
      console.error('Failed to send customer email:', error);
    } else {
      console.log('Customer order confirmation email sent to:', customerEmail);
    }

    // Send admin notification
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        to: 'support@backreform.co.uk',
        from: 'support@backreform.co.uk',
        subject: `New Order: ${orderDetails.readable_order_id} - £${orderDetails.total_amount.toFixed(2)}`,
        html: adminEmailHtml,
      }),
    });

    if (!adminEmailResponse.ok) {
      const error = await adminEmailResponse.text();
      console.error('Failed to send admin email:', error);
    } else {
      console.log('Admin notification email sent to support@backreform.co.uk');
    }
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
}

// Format product variants for display
function formatVariants(variants: any): string {
  const parts = [];
  if (variants.color) parts.push(`Color: ${variants.color}`);
  if (variants.size) parts.push(`Size: ${variants.size}`);
  if (variants.gender) parts.push(`Gender: ${variants.gender}`);
  return parts.join(' | ');
}

const handler = async (req: Request) => {
  // Health-check route
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('Stripe webhook received');
  const body = await req.text();

  // Stripe signature verification
  let event: Stripe.Event;
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing Stripe signature header');
      return new Response('Missing Stripe signature', { status: 400 });
    }
    
    event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    console.log('Stripe event parsed successfully:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    // Check if we've already processed this webhook to prevent duplicates
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id, processed')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`Webhook ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ received: true, already_processed: true }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the webhook event for audit trail
    await supabase.from('webhook_events').insert({
      source: 'stripe',
      event_id: event.id,
      event_type: event.type,
      payload: event,
      processed: false,
      created_at: new Date().toISOString()
    });

    console.log(`Processing Stripe event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        return await handlePaymentIntentSucceeded(event);
        
      case 'checkout.session.completed':
        // Legacy support - but payment_intent.succeeded is now primary
        console.log('Received checkout.session.completed - consider migrating to payment_intent.succeeded');
        return await handleLegacyCheckoutSession(event);
        
      default:
        console.log('Unhandled event type:', event.type);
        
        // Mark as processed even for unhandled events
        await supabase
          .from('webhook_events')
          .update({ 
            processed: true, 
            processed_at: new Date().toISOString() 
          })
          .eq('event_id', event.id);
          
        return new Response(
          JSON.stringify({ received: true, message: 'Event type not handled' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Handler error:', error);
    
    // Mark webhook as failed
    await supabase
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      })
      .eq('event_id', event.id);
    
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

async function handlePaymentIntentSucceeded(event: Stripe.Event): Promise<Response> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log(`Processing payment_intent.succeeded: ${paymentIntent.id}`);
  
  try {
    // Check if order already exists to prevent duplicates (idempotency)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, readable_order_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();
      
    if (existingOrder) {
      console.log(`Order already exists for payment intent ${paymentIntent.id}: ${existingOrder.readable_order_id}`);
      
      // Mark webhook as processed
      await supabase
        .from('webhook_events')
        .update({ 
          processed: true, 
          processed_at: new Date().toISOString() 
        })
        .eq('event_id', event.id);
      
      return new Response(JSON.stringify({ 
        success: true, 
        order_id: existingOrder.id,
        message: 'Order already exists'
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Extract data from payment intent metadata
    const metadata = paymentIntent.metadata;
    if (!metadata.customer_email) {
      throw new Error('Missing customer_email in payment intent metadata');
    }
    
    if (!metadata.items) {
      throw new Error('Missing items in payment intent metadata');
    }
    
    let items, shippingAddress;
    try {
      items = JSON.parse(metadata.items);
      shippingAddress = JSON.parse(metadata.shipping_address || '{}');
    } catch (parseError) {
      throw new Error('Invalid JSON in payment intent metadata');
    }
    
    // Create the order
    const readableOrderId = generateReadableOrderId();
    const orderData = {
      stripe_payment_intent_id: paymentIntent.id,
      customer_email: metadata.customer_email,
      user_id: metadata.user_id || null,
      readable_order_id: readableOrderId,
      order_number: readableOrderId, // Required field - use same as readable_order_id
      status: 'paid',
      total_amount: paymentIntent.amount / 100, // Convert from cents to pounds
      currency: paymentIntent.currency.toUpperCase(),
      items: items,
      shipping_address: shippingAddress,
      shipping_cost: parseFloat(metadata.shipping_cost || '0'),
      subtotal: parseFloat(metadata.subtotal || '0'),
      guest_checkout: metadata.guest_checkout === 'true',
      created_at: new Date().toISOString()
    };

    console.log(`Creating order for payment intent ${paymentIntent.id}`);
    
    // Insert order into database
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, readable_order_id')
      .single();
      
    if (orderError) {
      console.error('Order creation failed:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log(`Order created successfully: ${newOrder.readable_order_id} (ID: ${newOrder.id})`);
    
    // Send order confirmation emails (non-blocking)
    sendOrderEmails(newOrder.id, metadata.customer_email, items, shippingAddress, {
      subtotal: parseFloat(metadata.subtotal || '0'),
      shipping_cost: parseFloat(metadata.shipping_cost || '0'),
      total_amount: paymentIntent.amount / 100,
      readable_order_id: newOrder.readable_order_id
    }).then(() => {
      console.log('Order confirmation emails sent successfully');
    }).catch(error => {
      console.error('Failed to send order emails:', error);
      // Don't fail the webhook if email fails - order is already created
    });
    
    // Queue Printful fulfillment asynchronously (non-blocking)
    const fulfillmentData: OrderData = {
      id: newOrder.id,
      customer_email: metadata.customer_email,
      items: items,
      shipping_address: shippingAddress,
      shipping_cost: parseFloat(metadata.shipping_cost || '0'),
      subtotal: parseFloat(metadata.subtotal || '0'),
      total_amount: paymentIntent.amount / 100
    };
    
    // Don't await - let fulfillment happen asynchronously
    createPrintfulFulfillment(fulfillmentData).then(result => {
      if (result.success) {
        console.log(`Printful fulfillment created successfully: ${result.printful_order_id}`);
      } else {
        console.error(`Printful fulfillment failed: ${result.error}`);
      }
    }).catch(error => {
      console.error('Printful fulfillment exception:', error);
    });
    
    // Mark webhook as successfully processed
    await supabase
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('event_id', event.id);

    return new Response(JSON.stringify({
      success: true,
      order_id: newOrder.id,
      readable_order_id: newOrder.readable_order_id,
      message: 'Order created successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
    
    // Mark webhook as failed
    await supabase
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      })
      .eq('event_id', event.id);
      
    throw error; // Re-throw to be caught by main handler
  }
}

// Legacy handler for backwards compatibility
async function handleLegacyCheckoutSession(event: Stripe.Event): Promise<Response> {
  console.log('Processing legacy checkout.session.completed event');
  
  // Mark as processed but don't create orders - payment_intent.succeeded will handle it
  await supabase
    .from('webhook_events')
    .update({ 
      processed: true, 
      processed_at: new Date().toISOString() 
    })
    .eq('event_id', event.id);
  
  return new Response(JSON.stringify({
    received: true,
    message: 'Legacy event processed - payment_intent.succeeded will create order'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

serve(handler);