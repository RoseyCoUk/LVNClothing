export const config = {
  auth: false,
};

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
// supabase/functions/stripe-webhook/index.ts

// Consolidate env vars at the top
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StripeSession {
  id: string
  customer_details: {
    email: string
  }
  metadata: {
    items?: string
  }
}

console.log('✅ Webhook hit');

const handler = async (req: Request) => {
  // Health-check route for Supabase pings
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('Incoming webhook received');
  const body = await req.text();
  console.log('🔧 Raw Body:', body);

  // Stripe signature verification
  let event;
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('❌ Missing Stripe signature header');
      return new Response('Missing Stripe signature', { status: 400 });
    }
    event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    console.log('✅ Stripe event parsed successfully');
    console.log('Event type:', event.type);
    console.log('Event data:', JSON.stringify(event.data));
  } catch (err) {
    console.error('Webhook Error:', err.message, err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Main event handling
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed event');
        
        const sessionId = event.data.object.id;
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['line_items', 'customer'],
        });
        console.log('Session ID:', session.id)
        // Use a single customerEmail fallback
        const customerEmail = session.customer_details?.email || session.customer_email || 'unknown@example.com';
        console.log('Customer email:', customerEmail);
        console.log('Line items:', session.line_items.data);

        try {
          console.log(`[stripe-webhook] Processing checkout session: ${session.id}`);
          console.log(`[stripe-webhook] Customer email: ${customerEmail}`);
          console.log(`[stripe-webhook] Session metadata:`, session.metadata);
          
          // Process product information from metadata to create readable order items
          const processedItems = []
          
          // Extract product names and variants from metadata
          const productNames = {}
          const productVariants = {}
          
          // Parse metadata to get product names and variants
          Object.keys(session.metadata || {}).forEach(key => {
            if (key.startsWith('product_') && key.endsWith('_name')) {
              const productNum = key.replace('product_', '').replace('_name', '')
              productNames[productNum] = session.metadata[key]
            }
            if (key.startsWith('product_') && key.endsWith('_variants')) {
              const productNum = key.replace('product_', '').replace('_variants', '')
              try {
                productVariants[productNum] = JSON.parse(session.metadata[key])
              } catch (e) {
                productVariants[productNum] = {}
              }
            }
          })

          // Process each line item to include product names and variants
          if (session.line_items?.data) {
            session.line_items.data.forEach((item: any, index: number) => {
              const productNum = (index + 1).toString()
              
              // Try to get product name from metadata first, then fall back to Stripe data
              let productName = productNames[productNum];
              if (!productName) {
                // Fall back to Stripe's product data or description
                productName = item.price?.product?.name || item.description || 'Unknown Product';
              }
              
              const variants = productVariants[productNum] || {}
              
              // Create a processed item with readable product information
              const processedItem = {
                id: item.id || `item_${index}`,
                price_data: {
                  currency: item.currency || 'gbp',
                  product_data: {
                    name: productName,
                    description: `${productName}${Object.keys(variants).length > 0 ? ` - ${Object.keys(variants).map(key => `${key}: ${variants[key]}`).join(', ')}` : ''}`
                  },
                  unit_amount: item.amount_unit_price || item.amount_total
                },
                quantity: item.quantity || 1
              }
              
              processedItems.push(processedItem)
            })
          }

          // If no line items were processed, create a fallback item from session data
          if (processedItems.length === 0) {
            console.log('[stripe-webhook] No line items processed, creating fallback item from session data');
            const fallbackItem = {
              id: `fallback_${session.id}`,
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: session.metadata?.product_name || 'Product',
                  description: 'Product purchased via Stripe checkout'
                },
                unit_amount: session.amount_total || 0
              },
              quantity: 1
            };
            processedItems.push(fallbackItem);
          }

          console.log('Processed items:', JSON.stringify(processedItems, null, 2))
          
          // Extract user_id from metadata if provided
          const userId = session.metadata?.user_id || null;
          console.log(`[stripe-webhook] User ID from metadata:`, userId);
          console.log(`[stripe-webhook] Amount total:`, session.amount_total);
          
          const orderInsert = {
            stripe_session_id: session.id,
            customer_email: customerEmail,
            items: processedItems, // Use processed items instead of sanitized items
            customer_details: session.customer_details || null,
            amount_total: session.amount_total || null, // Amount in cents
            user_id: userId, // Link to Supabase user if provided
          };
          console.log('📝 Inserting order into Supabase:', orderInsert);
          
          const { data, error } = await supabase
            .from('orders')
            .insert([orderInsert])
            .select()
            .single();
          
          console.log('🗃️ Supabase insert result:', { data, error });

          if (error) {
            console.error('[stripe-webhook] Database insert error:', error)
            return new Response(
              JSON.stringify({ error: 'Failed to save order' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          console.log(`[stripe-webhook] Order saved successfully with ID: ${data.id}`);
          
          // Create Printful order with shipping rate ID
          try {
            await createPrintfulOrder(session, processedItems, data.id);
          } catch (printfulError) {
            console.error('[stripe-webhook] Failed to create Printful order:', printfulError);
            // Don't fail the webhook - order is still saved in database
            // You might want to implement retry logic or manual order creation
          }
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              order_id: data.id,
              readable_order_id: data.readable_order_id || 'Processing...'
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        } catch (dbError) {
          console.error('Database operation failed:', dbError)
          return new Response(
            JSON.stringify({ error: 'Database operation failed' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

      default:
        console.log('Unhandled event type:', event.type);
        return new Response(
          JSON.stringify({ received: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (err) {
    console.error('Handler Error:', err.message, err);
    return new Response('Handler Error', { status: 500 });
  }
}

// Create Printful order with shipping rate ID from PaymentIntent metadata
async function createPrintfulOrder(session: Stripe.Checkout.Session, processedItems: any[], orderId: string) {
  try {
    console.log('[printful-order] Starting Printful order creation');
    
    // Get the PaymentIntent to extract shipping metadata
    let paymentIntent: Stripe.PaymentIntent | null = null;
    if (session.payment_intent && typeof session.payment_intent === 'string') {
      paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
    }
    
    if (!paymentIntent) {
      throw new Error('No PaymentIntent found in session');
    }
    
    // Extract shipping rate ID from PaymentIntent metadata
    const shippingRateId = paymentIntent.metadata?.printful_shipping_rate_id;
    if (!shippingRateId) {
      console.warn('[printful-order] No shipping rate ID found in PaymentIntent metadata');
      // You might want to use a default shipping method or fail gracefully
      return;
    }
    
    console.log('[printful-order] Shipping rate ID:', shippingRateId);
    
    // Extract customer details from session
    const customerDetails = session.customer_details;
    if (!customerDetails) {
      throw new Error('No customer details found in session');
    }
    
    // Build recipient object for Printful
    const recipient = {
      name: `${customerDetails.name || ''}`,
      address1: customerDetails.address?.line1 || '',
      address2: customerDetails.address?.line2 || '',
      city: customerDetails.address?.city || '',
      state_code: customerDetails.address?.state || '',
      country_code: customerDetails.address?.country || 'GB',
      zip: customerDetails.address?.postal_code || '',
      phone: customerDetails.phone || '',
      email: customerDetails.email || ''
    };
    
    // Convert processed items to Printful format
    const items = processedItems.map(item => {
      // Extract printful_variant_id from item metadata
      const printfulVariantId = item.metadata?.printful_variant_id;
      
      if (!printfulVariantId) {
        console.warn(`[printful-order] No printful_variant_id found for item: ${item.price_data?.product_data?.name}`);
        console.warn(`[printful-order] Item metadata:`, item.metadata);
        console.warn(`[printful-order] Item structure:`, JSON.stringify(item, null, 2));
        
        // You might want to implement a product mapping system or fail gracefully
        // For now, we'll skip items without printful_variant_id
        return null;
      }
      
      return {
        variant_id: parseInt(printfulVariantId),
        quantity: item.quantity
      };
    }).filter(Boolean); // Remove null items
    
    if (items.length === 0) {
      throw new Error('No valid items found for Printful order');
    }
    
    // Prepare order payload for Printful
    const orderPayload = {
      recipient,
      items,
      shipping: {
        rate_id: shippingRateId
      },
      // Optional: Add external_id to link with your database order
      external_id: orderId,
      // Optional: Add retail_costs if you want to override Printful's pricing
      // retail_costs: {
      //   currency: 'GBP',
      //   subtotal: session.amount_subtotal / 100, // Convert from cents
      //   shipping: (session.amount_total - session.amount_subtotal) / 100,
      //   tax: 0
      // }
    };
    
    console.log('[printful-order] Order payload:', JSON.stringify(orderPayload, null, 2));
    
    // Call Printful API through your proxy function
    const printfulResponse = await fetch(`${supabaseUrl}/functions/v1/printful-proxy/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify(orderPayload)
    });
    
    if (!printfulResponse.ok) {
      const errorText = await printfulResponse.text();
      console.error('[printful-order] Printful API error:', printfulResponse.status, errorText);
      throw new Error(`Printful API error: ${printfulResponse.status} - ${errorText}`);
    }
    
    const printfulResult = await printfulResponse.json();
    console.log('[printful-order] Printful order created successfully:', printfulResult);
    
    // Optionally confirm the order immediately
    if (printfulResult.result?.id) {
      const confirmResponse = await fetch(`${supabaseUrl}/functions/v1/printful-proxy/orders/${printfulResult.result.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        }
      });
      
      if (confirmResponse.ok) {
        const confirmResult = await confirmResponse.json();
        console.log('[printful-order] Order confirmed successfully:', confirmResult);
      } else {
        console.warn('[printful-order] Failed to confirm order automatically');
      }
    }
    
    // Update your database order with Printful order ID
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        printful_order_id: printfulResult.result?.id,
        printful_shipping_rate_id: shippingRateId,
        status: 'printful_created'
      })
      .eq('id', orderId);
    
    if (updateError) {
      console.error('[printful-order] Failed to update order with Printful ID:', updateError);
    }
    
    console.log('[printful-order] Printful order creation completed successfully');
    
  } catch (error) {
    console.error('[printful-order] Error creating Printful order:', error);
    throw error;
  }
}

// If using Deno serve:
serve(handler);

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;

      isSubscription = mode === 'subscription';

      console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const session = stripeData as Stripe.Checkout.Session;
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
          customer_email,
        } = session;

        // Insert the order into the stripe_orders table
        const { data: orderData, error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed', // assuming we want to mark it as completed since payment is successful
        }).select().single();

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }
        
        // Send order notification email to support
        try {
          // Call the send-order-email function
          const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
              orderId: orderData.id,
              customerEmail: customer_email || 'Unknown',
            }),
          });
          
          if (!emailResponse.ok) {
            console.error('Failed to send order notification email:', await emailResponse.text());
          }
        } catch (emailError) {
          console.error('Error sending order notification email:', emailError);
        }
        
        console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}