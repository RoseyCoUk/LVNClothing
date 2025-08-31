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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting duplicate cleanup...')

    // Step 1: Get current variant count
    const { count: currentCount, error: countError } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw new Error(`Failed to get variant count: ${countError.message}`)
    }

    console.log(`Current variant count: ${currentCount}`)

    // Step 2: Find duplicates based on printful_variant_id
    const { data: duplicates, error: duplicateError } = await supabase
      .from('product_variants')
      .select('id, printful_variant_id, name, value')
      .order('printful_variant_id')

    if (duplicateError) {
      throw new Error(`Failed to fetch variants: ${duplicateError.message}`)
    }

    // Group by printful_variant_id to find duplicates
    const variantGroups = new Map()
    duplicates.forEach(variant => {
      if (!variantGroups.has(variant.printful_variant_id)) {
        variantGroups.set(variant.printful_variant_id, [])
      }
      variantGroups.get(variant.printful_variant_id).push(variant)
    })

    // Find variants with duplicates
    const variantsWithDuplicates = Array.from(variantGroups.entries())
      .filter(([_, variants]) => variants.length > 1)
      .map(([printfulId, variants]) => ({
        printful_variant_id: printfulId,
        variants: variants,
        duplicateCount: variants.length - 1
      }))

    console.log(`Found ${variantsWithDuplicates.length} variants with duplicates`)

    // Step 3: Remove duplicates (keep the first one)
    let duplicatesRemoved = 0
    for (const duplicateGroup of variantsWithDuplicates) {
      // Keep the first variant, remove the rest
      const variantsToRemove = duplicateGroup.variants.slice(1)
      
      for (const variantToRemove of variantsToRemove) {
        const { error: deleteError } = await supabase
          .from('product_variants')
          .delete()
          .eq('id', variantToRemove.id)

        if (deleteError) {
          console.error(`Error removing duplicate variant ${variantToRemove.id}:`, deleteError)
        } else {
          duplicatesRemoved++
          console.log(`Removed duplicate variant: ${variantToRemove.name} ${variantToRemove.value}`)
        }
      }
    }

    // Step 4: Get final count
    const { count: finalCount, error: finalCountError } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true })

    if (finalCountError) {
      throw new Error(`Failed to get final count: ${finalCountError.message}`)
    }

    console.log(`Cleanup completed. Removed ${duplicatesRemoved} duplicates. Final count: ${finalCount}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Duplicate cleanup completed',
        summary: {
          initial_count: currentCount,
          duplicates_found: variantsWithDuplicates.length,
          duplicates_removed: duplicatesRemoved,
          final_count: finalCount
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in duplicate cleanup:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Duplicate cleanup failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
