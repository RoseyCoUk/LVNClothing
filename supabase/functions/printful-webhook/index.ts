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
    // This is a PUBLIC webhook endpoint - no authentication required
    console.log('Received webhook request')
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Handle Printful webhook
    return await handlePrintfulWebhook(req, supabase)

  } catch (error) {
    console.error('Error in webhook processing:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed', 
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
