import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Embedded variant mappings - sync variant ID to catalog variant ID
// Generated from all product variant files in src/hooks/
const SYNC_TO_CATALOG_MAPPINGS: Record<string, number> = {
  // T-shirt variants
  "4938821282": 8923,
  "4938821283": 8924,
  "4938821284": 8925,
  "4938821285": 8926,
  "4938821286": 8927,
  "4938821287": 4016,
  "4938821288": 4017,
  "4938821289": 4018,
  "4938821290": 4019,
  "4938821291": 4020,
  "4938821292": 4111,
  "4938821293": 4112,
  "4938821294": 4113,
  "4938821295": 4114,
  "4938821296": 4115,
  "4938821297": 4141,
  "4938821298": 4142,
  "4938821299": 4143,
  "4938821300": 4144,
  "4938821301": 4145,
  "4938821302": 8460,
  "4938821303": 8461,
  "4938821304": 8462,
  "4938821305": 8463,
  "4938821306": 8464,
  "4938821307": 4031,
  "4938821308": 4032,
  "4938821309": 4033,
  "4938821310": 4034,
  "4938821311": 4035,
  "4938821312": 8440,
  "4938821313": 8441,
  "4938821314": 8442,
  "4938821315": 8443,
  "4938821316": 8444,
  "4938821317": 4121,
  "4938821318": 4122,
  "4938821319": 4123,
  "4938821320": 4124,
  "4938821321": 4125,
  "4938821322": 10384,
  "4938821323": 10385,
  "4938821324": 10386,
  "4938821325": 10387,
  "4938821326": 10388,
  "4938821327": 8481,
  "4938821328": 8482,
  "4938821329": 8483,
  "4938821330": 8484,
  "4938821331": 8485,
  "4938821332": 9395,
  "4938821333": 9396,
  "4938821334": 9397,
  "4938821335": 9398,
  "4938821336": 9399,
  "4938821337": 4161,
  "4938821338": 4162,
  "4938821339": 4163,
  "4938821340": 4164,
  "4938821341": 4165,
  "4938814128": 10376,
  "4938814129": 10377,
  "4938814130": 10378,
  "4938814131": 10379,
  "4938814132": 10380,
  "4938814133": 9367,
  "4938814134": 9368,
  "4938814135": 9369,
  "4938814136": 9370,
  "4938814137": 9371,
  "4938814138": 4136,
  "4938814139": 4137,
  "4938814140": 4138,
  "4938814141": 4139,
  "4938814142": 4140,
  "4938814143": 6948,
  "4938814144": 6949,
  "4938814145": 6950,
  "4938814146": 6951,
  "4938814147": 6952,
  "4938814148": 4181,
  "4938814149": 4182,
  "4938814150": 4183,
  "4938814151": 4184,
  "4938814152": 4185,
  "4938814153": 10360,
  "4938814154": 10361,
  "4938814155": 10362,
  "4938814156": 10363,
  "4938814157": 10364,
  "4938814158": 4026,
  "4938814159": 4027,
  "4938814160": 4028,
  "4938814161": 4029,
  "4938814162": 4030,
  "4938814163": 4011,
  "4938814164": 4012,
  "4938814165": 4013,
  "4938814166": 4014,
  "4938814167": 4015,
  // Hoodie variants  
  "4938800533": 5530,
  "4938800534": 5531,
  "4938800535": 5532,
  "4938800536": 5533,
  "4938800537": 5534,
  "4938800538": 5594,
  "4938800539": 5595,
  "4938800540": 5596,
  "4938800541": 5597,
  "4938800542": 5598,
  "4938800543": 5538,
  "4938800544": 5539,
  "4938800545": 5540,
  "4938800546": 5541,
  "4938800547": 5542,
  "4938800548": 10806,
  "4938800549": 10807,
  "4938800550": 10808,
  "4938800551": 10809,
  "4938800552": 10810,
  "4938800553": 5562,
  "4938800554": 5563,
  "4938800555": 5564,
  "4938800556": 5565,
  "4938800557": 5566,
  "4938797545": 5610,
  "4938797546": 5611,
  "4938797547": 5612,
  "4938797548": 5613,
  "4938797549": 5614,
  "4938797550": 10841,
  "4938797551": 10842,
  "4938797552": 10843,
  "4938797553": 10844,
  "4938797554": 10845,
  "4938797555": 10849,
  "4938797556": 10850,
  "4938797557": 10851,
  "4938797558": 10852,
  "4938797559": 10853,
  "4938797560": 5522,
  "4938797561": 5523,
  "4938797562": 5524,
  "4938797563": 5525,
  "4938797564": 5526,
  // Cap variants
  "4938937571": 7854,
  "4938937572": 7857,
  "4938937573": 12736,
  "4938937574": 7855,
  "4938937575": 7859,
  "4938937576": 7858,
  "4938937577": 7856,
  "4938937578": 7853,
  // Other products
  "4938946337": 1320,  // Mug
  "4937855201": 10457, // Tote bag
  "4938941055": 20175, // Water bottle
  "4938942751": 13097, // Mouse pad
};

// Convert sync variant ID to catalog variant ID
function convertToCatalogVariantId(syncVariantId: string): number | null {
  const catalogId = SYNC_TO_CATALOG_MAPPINGS[syncVariantId];
  if (catalogId !== undefined) {
    return catalogId;
  }
  return null;
}

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

// CORS headers - simplified to always work
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400"
  }
}

serve(async (req: Request) => {
  const headers = corsHeaders()

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
    console.log('🔑 Cache key:', cacheKey)
    const cached = cacheGet<ShippingQuoteResponse>(cacheKey)
    if (cached) {
      console.log('📦 Cache hit for shipping rates:', cacheKey)
      console.log('📦 Cached response:', JSON.stringify(cached, null, 2))
      return Response.json(cached, { headers })
    }
    console.log('🔄 Cache miss, fetching from Printful...')

    console.log('Fetching shipping rates from Printful for:', {
      recipient: body.recipient,
      itemsCount: body.items.length
    })

    // Get Printful configuration from environment
    const printfulToken = Deno.env.get('PRINTFUL_TOKEN')
    const printfulStoreId = Deno.env.get('PRINTFUL_STORE_ID')
    
    console.log('🔑 PRINTFUL_TOKEN configured:', !!printfulToken)
    console.log('🔑 PRINTFUL_TOKEN length:', printfulToken?.length || 0)
    console.log('🏪 PRINTFUL_STORE_ID configured:', !!printfulStoreId)
    console.log('🏪 PRINTFUL_STORE_ID value:', printfulStoreId)
    
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
      
      return new Response(JSON.stringify(fallbackResponse), { 
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    console.log('🔄 Processing variant IDs for Printful API...')
    
    // Process each item and determine if it needs conversion
    const catalogVariantItems = []
    
    for (const item of body.items) {
      const variantId = item.printful_variant_id.toString()
      console.log(`🔍 Processing variant ID: ${variantId}`)
      
      // Determine if this is a sync variant ID (long string format) or catalog variant ID (short numeric)
      const isLongSyncVariantId = variantId.length >= 8 && /^\d{8,}$/.test(variantId)
      const isShortCatalogVariantId = variantId.length <= 6 && /^\d{1,6}$/.test(variantId)
      
      let catalogVariantId: number
      
      if (isLongSyncVariantId) {
        // This looks like a sync variant ID, convert to catalog variant ID using embedded mapping
        console.log(`🔄 Converting sync variant ${variantId} to catalog variant...`)
        
        const mappedCatalogId = convertToCatalogVariantId(variantId)
        
        if (!mappedCatalogId) {
          console.error(`❌ No catalog variant ID found for sync variant: ${variantId}`)
          return new Response(
            JSON.stringify({ 
              error: 'Variant not found', 
              message: `Catalog variant not found for sync variant ${variantId}. Please ensure this variant is properly configured.`
            }), 
            { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
          )
        }
        
        catalogVariantId = mappedCatalogId
        console.log(`✅ Sync variant ${variantId} → Catalog variant ${catalogVariantId}`)
        
      } else if (isShortCatalogVariantId) {
        // This is already a catalog variant ID, use it directly
        catalogVariantId = parseInt(variantId)
        console.log(`✅ Using catalog variant ID directly: ${catalogVariantId}`)
        
      } else {
        // Check if it's in our mapping table (could be a long sync variant that doesn't match the length pattern)
        const mappedCatalogId = convertToCatalogVariantId(variantId)
        
        if (mappedCatalogId) {
          catalogVariantId = mappedCatalogId
          console.log(`✅ Mapped variant ${variantId} → Catalog variant ${catalogVariantId}`)
        } else {
          // Unknown format
          console.error(`❌ Unknown variant ID format: ${variantId}`)
          return new Response(
            JSON.stringify({ 
              error: 'Invalid variant ID format', 
              message: `Variant ID ${variantId} is not in a recognized format or mapping. Please ensure this variant is properly configured.`
            }), 
            { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
          )
        }
      }
      
      catalogVariantItems.push({
        variant_id: catalogVariantId,
        quantity: item.quantity
      })
    }
    
    // Call Printful API with catalog variant IDs
    const printfulPayload = {
      recipient: body.recipient,
      items: catalogVariantItems
    }
    
    console.log('🌐 Calling Printful API with payload:', JSON.stringify(printfulPayload, null, 2))
    
    // Prepare headers with store ID for UK store
    const printfulHeaders: Record<string, string> = {
      'Authorization': `Bearer ${printfulToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Reform-UK-Store/1.0'
    }
    
    // Add store ID header if available (for multi-store accounts)
    if (printfulStoreId) {
      printfulHeaders['X-PF-Store-Id'] = printfulStoreId
      console.log('🏪 Including Store ID header:', printfulStoreId)
    }
    
    // Log all headers being sent (without revealing token)
    console.log('🔗 Request headers:', {
      ...printfulHeaders,
      'Authorization': `Bearer ${printfulToken.substring(0, 8)}...`
    })
    
    const printfulApiUrl = 'https://api.printful.com/shipping/rates'
    console.log('🌐 Calling Printful API:', printfulApiUrl)
    
    const printfulResponse = await fetch(printfulApiUrl, {
      method: 'POST',
      headers: printfulHeaders,
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
      
      return new Response(JSON.stringify(fallbackResponse), { 
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const printfulData = await printfulResponse.json()
    console.log('📦 Printful API response data:', JSON.stringify(printfulData, null, 2))
    
    // Log response metadata
    console.log('📊 Response metadata:', {
      code: printfulData.code,
      result_count: printfulData.result?.length,
      extra: printfulData.extra
    })
    
    console.log('🎯 Delivery days from Printful:', printfulData.result?.map((r: any) => ({
      id: r.id,
      name: r.name,
      rate: r.rate,
      currency: r.currency,
      minDeliveryDays: r.minDeliveryDays,
      maxDeliveryDays: r.maxDeliveryDays,
      // Also check alternative field names
      min_delivery_days: r.min_delivery_days,
      max_delivery_days: r.max_delivery_days,
      minDeliveryDate: r.minDeliveryDate,
      maxDeliveryDate: r.maxDeliveryDate
    })))
    
    // Log raw shipping options for debugging
    if (printfulData.result && printfulData.result.length > 0) {
      console.log('🔍 First shipping option (full data):', JSON.stringify(printfulData.result[0], null, 2))
    }
    
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
      
      return new Response(JSON.stringify(fallbackResponse), { 
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    // Transform Printful response to our format
    const options: ShippingOption[] = printfulData.result.map((r: any) => {
      console.log('📦 RAW Printful shipping option (ALL FIELDS):', JSON.stringify(r, null, 2));
      
      console.log('📦 Printful shipping option delivery data:', {
        id: r.id,
        name: r.name,
        rate: r.rate,
        currency: r.currency,
        // Check all possible delivery day fields
        minDeliveryDays: r.minDeliveryDays,
        maxDeliveryDays: r.maxDeliveryDays,
        min_delivery_days: r.min_delivery_days,
        max_delivery_days: r.max_delivery_days,
        delivery_days: r.delivery_days,
        minDeliveryDate: r.minDeliveryDate,
        maxDeliveryDate: r.maxDeliveryDate,
        min_delivery_date: r.min_delivery_date,
        max_delivery_date: r.max_delivery_date
      });
      
      // Clean the name - remove any date that Printful might have added
      // as we'll display delivery days separately in the UI
      let cleanName = r.name;
      if (cleanName.includes('(Estimated delivery:')) {
        cleanName = cleanName.split('(Estimated delivery:')[0].trim();
      }
      
      // Try to extract delivery days from multiple possible fields
      let minDeliveryDays = r.minDeliveryDays ?? r.min_delivery_days ?? undefined;
      let maxDeliveryDays = r.maxDeliveryDays ?? r.max_delivery_days ?? undefined;
      
      // If delivery days are not available, try to calculate from dates
      if (minDeliveryDays === undefined || maxDeliveryDays === undefined) {
        const now = new Date();
        
        // Helper function to count business days between two dates
        const countBusinessDays = (startDate: Date, endDate: Date): number => {
          let count = 0;
          const current = new Date(startDate);
          current.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          
          while (current < endDate) {
            current.setDate(current.getDate() + 1);
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
              count++;
            }
          }
          return Math.max(1, count);
        };
        
        if ((r.minDeliveryDate || r.min_delivery_date) && minDeliveryDays === undefined) {
          const minDate = new Date(r.minDeliveryDate || r.min_delivery_date);
          minDeliveryDays = countBusinessDays(now, minDate);
        }
        if ((r.maxDeliveryDate || r.max_delivery_date) && maxDeliveryDays === undefined) {
          const maxDate = new Date(r.maxDeliveryDate || r.max_delivery_date);
          maxDeliveryDays = countBusinessDays(now, maxDate);
        }
      }
      
      console.log('📦 Calculated delivery days:', { minDeliveryDays, maxDeliveryDays });
      
      return {
        id: r.id,
        name: cleanName, // Use cleaned name without date
        rate: r.rate,
        currency: r.currency,
        minDeliveryDays: minDeliveryDays,
        maxDeliveryDays: maxDeliveryDays,
        carrier: r.carrier,
      };
    })

    const response: ShippingQuoteResponse = { 
      options, 
      ttlSeconds: 180 // Cache for 3 minutes
    }

    // Cache the result with shorter TTL for debugging
    const ttl = 10; // 10 seconds for debugging
    response.ttlSeconds = ttl;
    cacheSet(cacheKey, response, ttl)
    console.log('💾 Cached shipping rates for key:', cacheKey)
    console.log('💾 Cached data:', JSON.stringify(response, null, 2))

    return new Response(JSON.stringify(response), { 
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    })

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
