import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')

if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY environment variable is required')
}

interface PaymentIntentRequest {
  amount: number // Amount in pence
  currency: string
  metadata?: Record<string, string>
  customer_email?: string
  shipping?: {
    name: string
    address: {
      line1: string
      line2?: string
      city: string
      postal_code: string
      country: string
    }
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  try {
    const { amount, currency = 'gbp', metadata = {}, customer_email, shipping }: PaymentIntentRequest = await req.json()

    if (!amount || amount < 50) { // Minimum £0.50
      return new Response(
        JSON.stringify({ error: 'Amount must be at least £0.50' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Create payment intent with Stripe
    const paymentIntentData: any = {
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        source: 'lvn-clothing',
        timestamp: new Date().toISOString(),
      },
    }

    // Add customer email if provided
    if (customer_email) {
      paymentIntentData.receipt_email = customer_email
    }

    // Add shipping if provided
    if (shipping) {
      paymentIntentData.shipping = shipping
    }

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(paymentIntentData).toString(),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Stripe API error:', errorData)
      throw new Error('Failed to create payment intent')
    }

    const paymentIntent = await response.json()

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )

  } catch (error) {
    console.error('Payment intent creation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create payment intent',
        message: error.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  }
})
