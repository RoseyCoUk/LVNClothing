import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StripeSession {
  id: string
  customer_details: {
    email: string
    name?: string
    phone?: string
    address?: {
      city?: string
      line1?: string
      line2?: string
      state?: string
      country?: string
      postal_code?: string
    }
    tax_ids?: string[]
    tax_exempt?: string
  }
  metadata: {
    items?: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('handle-stripe-webhook function triggered')

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Validate environment variables
    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the raw body for webhook verification
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature header')
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let event: Stripe.Event

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
      console.log('Webhook verified successfully')
    } catch (err) {
      console.error("Webhook Error:", err.message, err);
      return new Response("Webhook Error", { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed event')
        
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Session ID:', session.id)
        console.log('Customer email:', session.customer_details?.email)
        console.log('Full customer details:', JSON.stringify(session.customer_details, null, 2))
        console.log('Session metadata:', JSON.stringify(session.metadata, null, 2))

        try {
          console.log(`[stripe-webhook] Processing checkout session: ${session.id}`);
          console.log(`[stripe-webhook] Customer email: ${session.customer_details?.email}`);
          
          // Retrieve the session with expanded line_items to get full product details
          const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['line_items']
          });
          
          console.log('Expanded session:', JSON.stringify(expandedSession, null, 2));
          
          // Get line items from expanded Stripe session data
          let lineItems = []
          if (expandedSession.line_items?.data) {
            lineItems = expandedSession.line_items.data
            console.log(`[stripe-webhook] Line items from expanded session:`, lineItems);
          } else {
            console.log('[stripe-webhook] No line items found in expanded session data');
          }

          // Process product information from metadata to create readable order items
          const processedItems = []
          
          // Extract product names and variants from metadata
          const productNames = {}
          const productVariants = {}
          
          // Parse metadata to get product names and variants
          Object.keys(expandedSession.metadata).forEach(key => {
            if (key.startsWith('product_') && key.endsWith('_name')) {
              const productNum = key.replace('product_', '').replace('_name', '')
              productNames[productNum] = expandedSession.metadata[key]
            }
            if (key.startsWith('product_') && key.endsWith('_variants')) {
              const productNum = key.replace('product_', '').replace('_variants', '')
              try {
                productVariants[productNum] = JSON.parse(expandedSession.metadata[key])
              } catch (e) {
                productVariants[productNum] = {}
              }
            }
          })

          // Process each line item to include product names and variants
          lineItems.forEach((item, index) => {
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

          // If no line items were processed, create a fallback item from session data
          if (processedItems.length === 0) {
            console.log('[stripe-webhook] No line items processed, creating fallback item from session data');
            const fallbackItem = {
              id: `fallback_${expandedSession.id}`,
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: expandedSession.metadata?.product_name || 'Product',
                  description: 'Product purchased via Stripe checkout'
                },
                unit_amount: expandedSession.amount_total || 0
              },
              quantity: 1
            };
            processedItems.push(fallbackItem);
          }

          console.log('Processed items:', JSON.stringify(processedItems, null, 2))

          // Insert order into database
          const { data, error } = await supabase
            .from('orders')
            .insert({
              stripe_session_id: expandedSession.id,
              customer_email: expandedSession.customer_details?.email || 'unknown@example.com',
              items: processedItems, // Use processed items instead of raw items
              customer_details: {
                name: expandedSession.customer_details?.name || null,
                email: expandedSession.customer_details?.email || null,
                phone: expandedSession.customer_details?.phone || null,
                address: {
                  city: expandedSession.customer_details?.address?.city || null,
                  line1: expandedSession.customer_details?.address?.line1 || null,
                  line2: expandedSession.customer_details?.address?.line2 || null,
                  state: expandedSession.customer_details?.address?.state || null,
                  country: expandedSession.customer_details?.address?.country || null,
                  postal_code: expandedSession.customer_details?.address?.postal_code || null,
                },
                tax_ids: expandedSession.customer_details?.tax_ids || [],
                tax_exempt: expandedSession.customer_details?.tax_exempt || 'none'
              },
              created_at: new Date().toISOString()
            })
            .select()
            .single()

          if (error) {
            console.error('Database insert error:', error)
            return new Response(
              JSON.stringify({ error: 'Failed to save order' }),
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          console.log('Order saved successfully:', data)
          return new Response(
            JSON.stringify({ success: true, order_id: data.id }),
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
        console.log(`Unhandled event type: ${event.type}`)
        return new Response(
          JSON.stringify({ received: true }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Unhandled exception:', JSON.stringify(error, null, 2))
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 