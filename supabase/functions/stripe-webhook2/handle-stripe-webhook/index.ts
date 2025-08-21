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

        try {
          // Parse items from metadata or use empty array
          let items = []
          if (session.metadata?.items) {
            try {
              items = JSON.parse(session.metadata.items)
            } catch (parseError) {
              console.warn('Failed to parse items metadata:', parseError)
              items = []
            }
          }

          // Insert order into database
          const { data, error } = await supabase
            .from('orders')
            .insert({
              stripe_session_id: session.id,
              customer_email: session.customer_details?.email || 'unknown@example.com',
              items: items,
              customer_details: {
                name: session.customer_details?.name || null,
                email: session.customer_details?.email || null,
                phone: session.customer_details?.phone || null,
                address: {
                  city: session.customer_details?.address?.city || null,
                  line1: session.customer_details?.address?.line1 || null,
                  line2: session.customer_details?.address?.line2 || null,
                  state: session.customer_details?.address?.state || null,
                  country: session.customer_details?.address?.country || null,
                  postal_code: session.customer_details?.address?.postal_code || null,
                },
                tax_ids: session.customer_details?.tax_ids || [],
                tax_exempt: session.customer_details?.tax_exempt || 'none'
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