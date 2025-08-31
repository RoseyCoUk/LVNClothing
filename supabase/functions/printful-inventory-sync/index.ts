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
            is_available: isAvailable
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
                is_available: isAvailable
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
            is_available: is_available !== false
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
    console.log('Starting inventory sync...')
    
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

    // Process variants in batches to avoid overwhelming the API
    const batchSize = 10
    for (let i = 0; i < variants.length; i += batchSize) {
      const batch = variants.slice(i, i + batchSize)
      
      for (const variant of batch) {
        try {
          // Simulate Printful API call to get current inventory status
          // In production, this would be a real API call to Printful
          const inventoryStatus = await getPrintfulInventoryStatus(variant.printful_variant_id)
          
          // Update variant in database
          const { error: updateError } = await supabase
            .from('product_variants')
            .update({
              in_stock: inventoryStatus.in_stock,
              is_available: inventoryStatus.is_available
              // Note: last_synced column removed for now
            })
            .eq('id', variant.id)

          if (updateError) {
            console.error(`Error updating variant ${variant.id}:`, updateError)
            errorCount++
          } else {
            updatedCount++
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (variantError) {
          console.error(`Error processing variant ${variant.id}:`, variantError)
          errorCount++
        }
      }
    }

    console.log(`Inventory sync completed: ${updatedCount} updated, ${errorCount} errors`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Inventory sync completed',
        summary: {
          total_variants: variants.length,
          updated: updatedCount,
          errors: errorCount
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Inventory sync failed:', error)
    throw error
  }
}

async function getPrintfulInventoryStatus(printfulVariantId: string) {
  // TODO: Replace with actual Printful API call
  // For now, return mock data to test the sync system
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50))
  
  // Mock response - in production this would call Printful API
  return {
    in_stock: Math.random() > 0.3, // 70% chance of being in stock
    is_available: Math.random() > 0.2 // 80% chance of being available
  }
}
