import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import types (we'll define them inline for the edge function)
interface Recipient {
  name?: string
  address1: string
  address2?: string
  city: string
  state_code?: string
  country_code: string
  zip: string
  phone?: string
  email?: string
}

interface CartItem {
  printful_variant_id: number | string
  quantity: number
}

interface ShippingQuoteRequest {
  recipient: Recipient
  items: CartItem[]
}

interface ShippingOption {
  id: string
  name: string
  rate: string
  currency: string
  minDeliveryDays?: number
  maxDeliveryDays?: number
  carrier?: string
}

interface ShippingQuoteResponse {
  options: ShippingOption[]
  ttlSeconds: number
}

// Simple in-memory cache for the edge function
type CacheEntry<T> = { value: T; expiresAt: number }
const cache = new Map<string, CacheEntry<any>>()

function cacheGet<T>(key: string): T | undefined {
  const hit = cache.get(key)
  if (!hit) return
  if (Date.now() > hit.expiresAt) { 
    cache.delete(key)
    return 
  }
  return hit.value as T
}

function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
}

function makeCacheKey(body: ShippingQuoteRequest): string {
  const dest = [
    body.recipient.country_code, 
    body.recipient.zip, 
    body.recipient.city, 
    body.recipient.state_code ?? ''
  ].join('|')
  
  const cartSig = body.items
    .map(i => `${i.printful_variant_id}x${i.quantity}`)
    .sort()
    .join(',')
    
  return `pf:rates:${dest}:${cartSig}`
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
    console.log('🚀 Shipping quotes function called')
    
    const body = await req.json() as ShippingQuoteRequest
    console.log('📦 Request body:', JSON.stringify(body, null, 2))

    // Basic validation
    if (!body?.recipient?.country_code || 
        !body?.recipient?.zip || 
        !Array.isArray(body.items) || 
        body.items.length === 0) {
      console.error('❌ Invalid payload:', { 
        hasCountryCode: !!body?.recipient?.country_code,
        hasZip: !!body?.recipient?.zip,
        isItemsArray: Array.isArray(body.items),
        itemsLength: body.items?.length 
      })
      return new Response(
        JSON.stringify({ error: "Invalid payload - missing required fields" }), 
        { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
      )
    }

    // Validate variant IDs
    console.log('🔍 Validating variant IDs...')
    for (const item of body.items) {
      console.log(`  - Item: ${item.printful_variant_id} (quantity: ${item.quantity})`)
      
      const variantId = item.printful_variant_id;
      
      // Accept both numeric and alphanumeric formats (matching frontend validation)
      const isNumeric = typeof variantId === 'number' || /^\d+$/.test(variantId.toString());
      const isAlphanumeric = typeof variantId === 'string' && /^[a-zA-Z0-9\-_]{8,}$/.test(variantId);
      
      if (!isNumeric && !isAlphanumeric) {
        console.error(`❌ Invalid variant ID format: ${variantId}`)
        return new Response(
          JSON.stringify({ 
            error: "Invalid variant ID", 
            message: `Variant ID ${variantId} is not in a valid format`
          }), 
          { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
        )
      }
    }

    // Check cache first
    const cacheKey = makeCacheKey(body)
    const cached = cacheGet<ShippingQuoteResponse>(cacheKey)
    if (cached) {
      console.log('Cache hit for shipping rates:', cacheKey)
      return Response.json(cached, { headers })
    }

    console.log('Fetching shipping rates from Printful for:', {
      recipient: body.recipient,
      itemsCount: body.items.length
    })

    // Get Printful token from environment
    const printfulToken = Deno.env.get('PRINTFUL_TOKEN')
    
    console.log('🔑 PRINTFUL_TOKEN configured:', !!printfulToken)
    console.log('🔑 PRINTFUL_TOKEN length:', printfulToken?.length || 0)
    
    if (!printfulToken) {
      console.error('❌ PRINTFUL_TOKEN not configured - using fallback shipping rates')
      
      // Return fallback shipping options instead of error
      const fallbackOptions: ShippingOption[] = [
        {
          id: 'standard-uk',
          name: 'Standard UK Delivery',
          rate: '4.99',
          currency: 'GBP',
          minDeliveryDays: 3,
          maxDeliveryDays: 5,
          carrier: 'Royal Mail'
        },
        {
          id: 'express-uk',
          name: 'Express UK Delivery',
          rate: '8.99',
          currency: 'GBP',
          minDeliveryDays: 1,
          maxDeliveryDays: 2,
          carrier: 'DHL Express'
        },
        {
          id: 'international-standard',
          name: 'International Standard',
          rate: '12.99',
          currency: 'GBP',
          minDeliveryDays: 7,
          maxDeliveryDays: 14,
          carrier: 'Royal Mail International'
        }
      ];
      
      const fallbackResponse: ShippingQuoteResponse = { 
        options: fallbackOptions, 
        ttlSeconds: 300 // Cache fallback for 5 minutes
      };
      
      return Response.json(fallbackResponse, { headers });
    }

    // Call Printful API
    const printfulPayload = {
      recipient: body.recipient,
      items: body.items.map(i => ({ 
        variant_id: typeof i.printful_variant_id === 'string' && /^\d+$/.test(i.printful_variant_id) 
          ? parseInt(i.printful_variant_id, 10) 
          : i.printful_variant_id, 
        quantity: i.quantity 
      }))
    }
    
    console.log('🌐 Calling Printful API with payload:', JSON.stringify(printfulPayload, null, 2))
    
    const printfulResponse = await fetch('https://api.printful.com/shipping/rates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printfulToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(printfulPayload)
    })

    console.log('📡 Printful API response status:', printfulResponse.status)
    
    if (!printfulResponse.ok) {
      const errorText = await printfulResponse.text()
      console.error('❌ Printful API error:', printfulResponse.status, errorText)
      
      // Return fallback shipping options instead of error
      console.log('❌ Using fallback shipping options due to Printful API failure');
      
      const fallbackOptions: ShippingOption[] = [
        {
          id: 'standard-uk',
          name: 'Standard UK Delivery',
          rate: '4.99',
          currency: 'GBP',
          minDeliveryDays: 3,
          maxDeliveryDays: 5,
          carrier: 'Royal Mail'
        },
        {
          id: 'express-uk',
          name: 'Express UK Delivery',
          rate: '8.99',
          currency: 'GBP',
          minDeliveryDays: 1,
          maxDeliveryDays: 2,
          carrier: 'DHL Express'
        },
        {
          id: 'international-standard',
          name: 'International Standard',
          rate: '12.99',
          currency: 'GBP',
          minDeliveryDays: 7,
          maxDeliveryDays: 14,
          carrier: 'Royal Mail International'
        }
      ];
      
      const fallbackResponse: ShippingQuoteResponse = { 
        options: fallbackOptions, 
        ttlSeconds: 300 // Cache fallback for 5 minutes
      };
      
      return Response.json(fallbackResponse, { headers });
    }

    const printfulData = await printfulResponse.json()
    console.log('📦 Printful API response data:', JSON.stringify(printfulData, null, 2))
    
    if (!printfulData.result) {
      console.error('❌ Invalid Printful response - no result field:', printfulData)
      
      // Return fallback shipping options instead of error
      console.log('❌ Using fallback shipping options due to invalid Printful response');
      
      const fallbackOptions: ShippingOption[] = [
        {
          id: 'standard-uk',
          name: 'Standard UK Delivery',
          rate: '4.99',
          currency: 'GBP',
          minDeliveryDays: 3,
          maxDeliveryDays: 5,
          carrier: 'Royal Mail'
        },
        {
          id: 'express-uk',
          name: 'Express UK Delivery',
          rate: '8.99',
          currency: 'GBP',
          minDeliveryDays: 1,
          maxDeliveryDays: 2,
          carrier: 'DHL Express'
        },
        {
          id: 'international-standard',
          name: 'International Standard',
          rate: '12.99',
          currency: 'GBP',
          minDeliveryDays: 7,
          maxDeliveryDays: 14,
          carrier: 'Royal Mail International'
        }
      ];
      
      const fallbackResponse: ShippingQuoteResponse = { 
        options: fallbackOptions, 
        ttlSeconds: 300 // Cache fallback for 5 minutes
      };
      
      return Response.json(fallbackResponse, { headers });
    }

    // Transform Printful response to our format
    const options: ShippingOption[] = printfulData.result.map((r: any) => ({
      id: r.id,
      name: r.name,
      rate: r.rate,
      currency: r.currency,
      minDeliveryDays: r.min_delivery_days,
      maxDeliveryDays: r.max_delivery_days,
      carrier: r.carrier,
    }))

    const response: ShippingQuoteResponse = { 
      options, 
      ttlSeconds: 180 // Cache for 3 minutes
    }

    // Cache the result
    cacheSet(cacheKey, response, response.ttlSeconds)
    console.log('Cached shipping rates for key:', cacheKey)

    return Response.json(response, { headers })

  } catch (error) {
    console.error('Shipping quotes error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    )
  }
})
