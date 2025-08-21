export const config = {
  auth: false,
};

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
import { sendOrderEmail } from '../_shared/email.ts';
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
          
          // Send order confirmation email
          try {
            console.log(`[stripe-webhook] Sending order confirmation email to ${customerEmail}`);
            const emailResponse = await sendOrderEmail(data.id, customerEmail);
            
            if (emailResponse.ok) {
              console.log(`[stripe-webhook] Order confirmation email sent successfully`);
            } else {
              console.error(`[stripe-webhook] Failed to send order confirmation email:`, await emailResponse.text());
            }
          } catch (emailError) {
            console.error(`[stripe-webhook] Error sending order confirmation email:`, emailError);
            // Don't fail the webhook if email fails
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