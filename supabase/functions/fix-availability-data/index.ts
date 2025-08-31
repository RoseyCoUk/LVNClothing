import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔧 Starting availability data fix...')

    // Step 1: Get current status
    console.log('📊 Step 1: Checking current availability status...')
    const { data: variants, error: fetchError } = await supabase
      .from('product_variants')
      .select('id, is_available, in_stock')

    if (fetchError) {
      throw new Error(`Failed to fetch variants: ${fetchError.message}`)
    }

    console.log(`📊 Total variants: ${variants.length}`)

    const availableVariants = variants.filter(v => v.is_available === true).length
    const unavailableVariants = variants.filter(v => v.is_available === false).length
    const inStockVariants = variants.filter(v => v.in_stock === true).length
    const outOfStockVariants = variants.filter(v => v.in_stock === false).length

    console.log(`📊 Before fix:`)
    console.log(`   - Available: ${availableVariants}`)
    console.log(`   - Unavailable: ${unavailableVariants}`)
    console.log(`   - In Stock: ${inStockVariants}`)
    console.log(`   - Out of Stock: ${outOfStockVariants}`)

    // Step 2: Find variants that need fixing
    const needsFix = variants.filter(v => 
      (v.is_available === false && v.in_stock === true) ||
      (v.is_available === true && v.in_stock === false)
    )

    console.log(`🔧 Variants that need fixing: ${needsFix.length}`)

    if (needsFix.length === 0) {
      console.log('✅ No variants need fixing!')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No variants need fixing',
          summary: {
            total_variants: variants.length,
            available: availableVariants,
            unavailable: unavailableVariants,
            in_stock: inStockVariants,
            out_of_stock: outOfStockVariants
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Step 3: Fix variants that are incorrectly marked as unavailable but are in stock
    const incorrectlyUnavailable = variants.filter(v => v.is_available === false && v.in_stock === true)
    console.log(`🔧 Fixing ${incorrectlyUnavailable.length} variants marked as unavailable but in stock...`)

    if (incorrectlyUnavailable.length > 0) {
      const { error: fixError } = await supabase
        .from('product_variants')
        .update({ 
          is_available: true,
          updated_at: new Date().toISOString()
        })
        .in('id', incorrectlyUnavailable.map(v => v.id))

      if (fixError) {
        throw new Error(`Failed to fix availability: ${fixError.message}`)
      }

      console.log('✅ Availability fixed successfully!')
    }

    // Step 4: Fix variants that are incorrectly marked as out of stock but are available
    const incorrectlyOutOfStock = variants.filter(v => v.is_available === true && v.in_stock === false)
    console.log(`🔧 Fixing ${incorrectlyOutOfStock.length} variants marked as out of stock but available...`)

    if (incorrectlyOutOfStock.length > 0) {
      const { error: fixError } = await supabase
        .from('product_variants')
        .update({ 
          in_stock: true,
          updated_at: new Date().toISOString()
        })
        .in('id', incorrectlyOutOfStock.map(v => v.id))

      if (fixError) {
        throw new Error(`Failed to fix stock status: ${fixError.message}`)
      }

      console.log('✅ Stock status fixed successfully!')
    }

    // Step 5: Verify the fixes
    console.log('📊 Step 5: Verifying fixes...')
    const { data: fixedVariants, error: verifyError } = await supabase
      .from('product_variants')
      .select('id, is_available, in_stock')

    if (verifyError) {
      throw new Error(`Failed to verify: ${verifyError.message}`)
    }

    const fixedAvailableVariants = fixedVariants.filter(v => v.is_available === true).length
    const fixedUnavailableVariants = fixedVariants.filter(v => v.is_available === false).length
    const fixedInStockVariants = fixedVariants.filter(v => v.in_stock === true).length
    const fixedOutOfStockVariants = fixedVariants.filter(v => v.in_stock === false).length

    console.log(`📊 After fix:`)
    console.log(`   - Available: ${fixedAvailableVariants}`)
    console.log(`   - Unavailable: ${fixedUnavailableVariants}`)
    console.log(`   - In Stock: ${fixedInStockVariants}`)
    console.log(`   - Out of Stock: ${fixedOutOfStockVariants}`)

    // Step 6: Check for remaining issues
    const remainingIssues = fixedVariants.filter(v => 
      (v.is_available === false && v.in_stock === true) ||
      (v.is_available === true && v.in_stock === false)
    )

    if (remainingIssues.length === 0) {
      console.log('🎉 All availability issues fixed successfully!')
    } else {
      console.log(`⚠️  ${remainingIssues.length} issues remain. Manual review may be needed.`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Availability data fix completed',
        summary: {
          before: {
            total_variants: variants.length,
            available: availableVariants,
            unavailable: unavailableVariants,
            in_stock: inStockVariants,
            out_of_stock: outOfStockVariants
          },
          after: {
            total_variants: fixedVariants.length,
            available: fixedAvailableVariants,
            unavailable: fixedUnavailableVariants,
            in_stock: fixedInStockVariants,
            out_of_stock: fixedOutOfStockVariants
          },
          fixes_applied: {
            availability_fixed: incorrectlyUnavailable.length,
            stock_fixed: incorrectlyOutOfStock.length,
            total_fixes: incorrectlyUnavailable.length + incorrectlyOutOfStock.length
          },
          remaining_issues: remainingIssues.length
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Error fixing availability data:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Availability data fix failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
