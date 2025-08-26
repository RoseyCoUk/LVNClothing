import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

// Define CORS headers locally
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface GuestCheckoutRequest {
  customer_email: string
  customer_name: string
  shipping_address: {
    address1: string
    city: string
    country_code: string
    zip: string
  }
  items: Array<{
    name: string
    quantity: number
    unit_amount: number
    printful_variant_id?: string
  }>
  shipping_option?: {
    id: string
    rate: string
    currency: string
  }
}

interface GuestCheckoutResponse {
  success: boolean
  checkout_session_id?: string
  checkout_url?: string
  error?: string
  test_mode: boolean
  guest_checkout: boolean
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method === 'POST') {
      const body: GuestCheckoutRequest = await req.json()
      
      // Validate required fields
      if (!body.customer_email || !body.customer_name || !body.shipping_address || !body.items) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Missing required fields: customer_email, customer_name, shipping_address, items',
            test_mode: true,
            guest_checkout: true
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.customer_email)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid email format',
            test_mode: true,
            guest_checkout: true
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Validate items
      if (!Array.isArray(body.items) || body.items.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'At least one item is required',
            test_mode: true,
            guest_checkout: true
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Validate shipping address
      if (!body.shipping_address.address1 || !body.shipping_address.city || 
          !body.shipping_address.country_code || !body.shipping_address.zip) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Complete shipping address is required',
            test_mode: true,
            guest_checkout: true
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Simulate successful guest checkout (in test mode)
      const mockCheckoutSessionId = `cs_test_guest_${Date.now()}`
      const mockCheckoutUrl = `https://checkout.stripe.com/pay/${mockCheckoutSessionId}#fid=guest_checkout`

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500))

      const response: GuestCheckoutResponse = {
        success: true,
        checkout_session_id: mockCheckoutSessionId,
        checkout_url: mockCheckoutUrl,
        test_mode: true,
        guest_checkout: true
      }

      return new Response(
        JSON.stringify(response),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } else if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          message: 'Guest Checkout Test Function',
          description: 'This function simulates guest checkout without authentication requirements',
          features: [
            'No authentication required',
            'Email validation',
            'Address validation',
            'Item validation',
            'Mock checkout session creation',
            'Guest checkout simulation'
          ],
          test_mode: true,
          guest_checkout: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed',
          test_mode: true,
          guest_checkout: true
        }), 
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        test_mode: true,
        guest_checkout: true
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
