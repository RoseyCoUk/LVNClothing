import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.17.0?target=deno"

// Initialize Stripe with API key from environment
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
})

// Utility function to convert major units to minor units (e.g., pounds to pence)
function toMinor(amount: string | number, currency = 'GBP'): number {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  // Stripe minor units: GBP/EUR/USD => cents/pence
  return Math.round(n * 100)
}

// CORS headers
function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  }
}

interface ShippingSelectionRequest {
  paymentIntentId: string
  itemsTotal: string | number   // subtotal (excl shipping & tax) in major units
  shipping: { 
    rate_id: string, 
    rate: string, 
    currency: string, 
    name?: string 
  }
  taxTotal?: string | number    // optional if you compute VAT separately
  orderDraftId?: string         // if you persist order draft in DB, update it with rate_id here too
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin")
  const headers = corsHeaders(origin)

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers })
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }), 
      { status: 405, headers: { ...headers, "Content-Type": "application/json" } }
    )
  }

  try {
    const body = await req.json() as ShippingSelectionRequest

    // Validate required fields
    if (!body?.paymentIntentId || 
        !body?.itemsTotal || 
        !body?.shipping?.rate_id || 
        !body?.shipping?.rate) {
      return new Response(
        JSON.stringify({ 
          error: "Invalid payload - missing required fields",
          required: ["paymentIntentId", "itemsTotal", "shipping.rate_id", "shipping.rate"]
        }), 
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    console.log('Processing shipping selection:', {
      paymentIntentId: body.paymentIntentId,
      itemsTotal: body.itemsTotal,
      shipping: body.shipping,
      taxTotal: body.taxTotal
    })

    // Compute new amount for PaymentIntent
    const itemsMinor = toMinor(body.itemsTotal, body.shipping.currency)
    const shippingMinor = toMinor(body.shipping.rate, body.shipping.currency)
    const taxMinor = toMinor(body.taxTotal ?? 0, body.shipping.currency)
    const newAmount = itemsMinor + shippingMinor + taxMinor

    console.log('Amount calculation:', {
      itemsMinor,
      shippingMinor,
      taxMinor,
      newAmount,
      currency: body.shipping.currency
    })

    // Update PaymentIntent
    const paymentIntent = await stripe.paymentIntents.update(body.paymentIntentId, {
      amount: newAmount,
      currency: body.shipping.currency.toLowerCase(),
      // Attach metadata for later order creation
      metadata: {
        printful_shipping_rate_id: body.shipping.rate_id,
        printful_shipping_name: body.shipping.name ?? '',
        tax_minor: String(taxMinor),
        items_minor: String(itemsMinor),
        shipping_minor: String(shippingMinor),
        updated_at: new Date().toISOString(),
      },
    })

    console.log('PaymentIntent updated successfully:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    })

    // TODO: If you have an OrderDraft table, persist `rate_id` & amounts there too.
    // This could be done by calling your database or another edge function

    return Response.json({
      ok: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      breakdown: {
        items: itemsMinor,
        shipping: shippingMinor,
        tax: taxMinor,
        total: newAmount
      }
    }, { headers })

  } catch (error) {
    console.error('Shipping selection error:', error)
    
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return new Response(
        JSON.stringify({ 
          error: 'Stripe error', 
          type: error.type,
          message: error.message,
          code: error.code
        }), 
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    )
  }
})
