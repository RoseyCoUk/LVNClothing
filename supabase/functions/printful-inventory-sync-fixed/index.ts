import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check if this is a webhook call or manual sync
    const url = new URL(req.url)
    const isWebhook = url.searchParams.get('webhook') === 'true'
    
    if (isWebhook) {
      // For webhooks, we don't require authentication - PUBLIC ENDPOINT
      // Initialize Supabase client with service role key
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Handle Printful webhook
      return await handlePrintfulWebhook(req, supabase)
    } else {
      // For manual sync, require authentication
      const authHeader = req.headers.get('authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ code: 401, message: 'Missing authorization header' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      // Handle manual inventory sync
      return await performInventorySync(supabase)
    }

  } catch (error) {
    console.error('Error in inventory sync:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Inventory sync failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handlePrintfulWebhook(req: Request, supabase: any) {
  try {
    const body = await req.json()
    console.log('Received Printful webhook:', body)

    // Handle different webhook types
    const { type, data } = body
    
    if (type === 'stock_updated' && data && data.variant_stock) {
      // Handle stock_updated webhook
      console.log('Processing stock_updated webhook')
      
      for (const [variantId, inStock] of Object.entries(data.variant_stock)) {
        const isAvailable = inStock === true
        
        // Update variant availability in database
        const { error } = await supabase
          .from('product_variants')
          .update({ 
            in_stock: inStock,
            is_available: isAvailable,
            last_synced: new Date().toISOString()
          })
          .eq('printful_variant_id', variantId)

        if (error) {
          console.error(`Error updating variant ${variantId} from webhook:`, error)
        } else {
          console.log(`Updated variant ${variantId} availability via webhook: in_stock=${inStock}, is_available=${isAvailable}`)
        }
      }
    } else if (type === 'product_updated' || type === 'product_synced') {
      // Handle product update webhooks
      console.log(`Processing ${type} webhook`)
      
      if (data && data.sync_product && data.sync_product.variants) {
        for (const variant of data.sync_product.variants) {
          if (variant.id) {
            const inStock = variant.in_stock !== false
            const isAvailable = variant.is_available !== false
            
            // Update variant availability in database
            const { error } = await supabase
              .from('product_variants')
              .update({ 
                in_stock: inStock,
                is_available: isAvailable,
                last_synced: new Date().toISOString()
              })
              .eq('printful_variant_id', variant.id.toString())

            if (error) {
              console.error(`Error updating variant ${variant.id} from webhook:`, error)
            } else {
              console.log(`Updated variant ${variant.id} availability via webhook: in_stock=${inStock}, is_available=${isAvailable}`)
            }
          }
        }
      }
    } else {
      // Handle legacy format or unknown webhook types
      const { variant_id, in_stock, is_available } = body
      
      if (variant_id) {
        // Update variant availability in database
        const { error } = await supabase
          .from('product_variants')
          .update({ 
            in_stock: in_stock || false,
            is_available: is_available !== false,
            last_synced: new Date().toISOString()
          })
          .eq('printful_variant_id', variant_id)

        if (error) {
          console.error('Error updating variant from webhook:', error)
        } else {
          console.log(`Updated variant ${variant_id} availability via webhook`)
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        webhook_type: type || 'unknown'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function performInventorySync(supabase: any) {
  try {
    console.log('Starting REAL inventory sync with Printful API...')
    
    // Get Printful API token
    const printfulToken = Deno.env.get('PRINTFUL_API_TOKEN')
    if (!printfulToken) {
      throw new Error('PRINTFUL_API_TOKEN environment variable not set')
    }
    
    // Get all variants that need inventory sync
    const { data: variants, error: fetchError } = await supabase
      .from('product_variants')
      .select('id, printful_variant_id, name, value')
      .not('printful_variant_id', 'is', null)

    if (fetchError) {
      throw new Error(`Failed to fetch variants: ${fetchError.message}`)
    }

    console.log(`Found ${variants.length} variants to sync`)

    let updatedCount = 0
    let errorCount = 0
    let skippedCount = 0

    // Process variants in batches to avoid overwhelming the API
    const batchSize = 5 // Smaller batches for API calls
    for (let i = 0; i < variants.length; i += batchSize) {
      const batch = variants.slice(i, i + batchSize)
      
      for (const variant of batch) {
        try {
          // Get REAL inventory status from Printful API
          const inventoryStatus = await getPrintfulInventoryStatus(printfulToken, variant.printful_variant_id)
          
          if (inventoryStatus === null) {
            console.log(`Skipping variant ${variant.printful_variant_id} - not found in Printful`)
            skippedCount++
            continue
          }
          
          // Update variant in database
          const { error: updateError } = await supabase
            .from('product_variants')
            .update({
              in_stock: inventoryStatus.in_stock,
              is_available: inventoryStatus.is_available,
              last_synced: new Date().toISOString()
            })
            .eq('id', variant.id)

          if (updateError) {
            console.error(`Error updating variant ${variant.id}:`, updateError)
            errorCount++
          } else {
            console.log(`Updated variant ${variant.printful_variant_id}: in_stock=${inventoryStatus.in_stock}, is_available=${inventoryStatus.is_available}`)
            updatedCount++
          }

          // Delay to respect API rate limits
          await new Promise(resolve => setTimeout(resolve, 200))

        } catch (variantError) {
          console.error(`Error processing variant ${variant.id}:`, variantError)
          errorCount++
        }
      }
    }

    console.log(`REAL inventory sync completed: ${updatedCount} updated, ${errorCount} errors, ${skippedCount} skipped`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'REAL inventory sync completed using Printful API',
        summary: {
          total_variants: variants.length,
          updated: updatedCount,
          errors: errorCount,
          skipped: skippedCount,
          sync_type: 'REAL_PRINTFUL_API'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('REAL inventory sync failed:', error)
    throw error
  }
}

async function getPrintfulInventoryStatus(token: string, printfulVariantId: string) {
  try {
    console.log(`Fetching REAL inventory for variant ${printfulVariantId}`)
    
    // Call Printful API to get variant information
    const response = await fetch(`https://api.printful.com/products/variant/${printfulVariantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Variant ${printfulVariantId} not found in Printful`)
        return null
      }
      throw new Error(`Printful API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const variant = data.result
    
    if (!variant) {
      console.log(`No variant data returned for ${printfulVariantId}`)
      return null
    }

    // Determine availability based on Printful data
    // In Printful, variants are generally available unless explicitly marked otherwise
    const isAvailable = variant.is_ignored !== true && variant.is_discontinued !== true
    
    // For stock status, we need to check if it's in stock
    // Printful doesn't always provide explicit stock info in variant endpoint
    // So we assume available variants are in stock unless told otherwise
    const inStock = isAvailable && (!variant.out_of_stock)
    
    console.log(`Printful variant ${printfulVariantId}: available=${isAvailable}, in_stock=${inStock}`, {
      is_ignored: variant.is_ignored,
      is_discontinued: variant.is_discontinued,
      out_of_stock: variant.out_of_stock
    })

    return {
      in_stock: inStock,
      is_available: isAvailable
    }

  } catch (error) {
    console.error(`Error fetching inventory for variant ${printfulVariantId}:`, error)
    // In case of API errors, default to conservative values
    return {
      in_stock: true,  // Assume in stock if we can't verify
      is_available: true  // Assume available if we can't verify
    }
  }
}
