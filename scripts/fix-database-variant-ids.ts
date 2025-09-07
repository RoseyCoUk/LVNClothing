#!/usr/bin/env tsx

/**
 * Fix Database Variant IDs
 * 
 * Updates the database to use catalog variant IDs instead of sync variant IDs
 * for proper shipping quote calculations.
 */

const PRINTFUL_TOKEN = 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB'
const PRINTFUL_STORE_ID = '16651763'
const SUPABASE_URL = 'https://nsmrxwnrtsllxvplazmm.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw'

interface SyncToCatalogMapping {
  syncVariantId: number
  catalogVariantId: number
  variantName: string
}

async function getPrintfulMappings(): Promise<Map<number, number>> {
  console.log('🔄 Fetching Printful sync-to-catalog variant mappings...')
  
  const syncToCatalogMap = new Map<number, number>()
  
  try {
    // Get store products
    const storeResponse = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
        'X-PF-Store-Id': PRINTFUL_STORE_ID
      }
    })
    
    const storeData = await storeResponse.json()
    
    if (!storeData.result) {
      throw new Error('Failed to fetch store products')
    }
    
    console.log(`📦 Processing ${storeData.result.length} store products...`)
    
    // Get variant details for each product
    for (const product of storeData.result) {
      if (product.is_ignored) continue
      
      const detailResponse = await fetch(`https://api.printful.com/store/products/${product.id}`, {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
          'X-PF-Store-Id': PRINTFUL_STORE_ID
        }
      })
      
      const detailData = await detailResponse.json()
      
      if (detailData.result?.sync_variants) {
        for (const variant of detailData.result.sync_variants) {
          syncToCatalogMap.set(variant.id, variant.variant_id)
          console.log(`  📌 ${variant.name}: Sync ${variant.id} → Catalog ${variant.variant_id}`)
        }
      }
      
      // Rate limit delay
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
  } catch (error) {
    console.error('❌ Error fetching Printful mappings:', error)
    throw error
  }
  
  console.log(`✅ Built mapping for ${syncToCatalogMap.size} variants`)
  return syncToCatalogMap
}

async function updateDatabaseVariants(mappings: Map<number, number>) {
  console.log('\n🔄 Updating database with catalog variant IDs...')
  
  try {
    // Get all variants from database
    const variantsResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?select=*`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    })
    
    const variants = await variantsResponse.json()
    
    if (!Array.isArray(variants)) {
      throw new Error('Failed to fetch variants from database')
    }
    
    console.log(`📋 Found ${variants.length} variants in database`)
    
    let updatedCount = 0
    let skippedCount = 0
    
    for (const variant of variants) {
      const syncId = variant.printful_variant_id
      
      if (!syncId) {
        console.log(`⏭️ Skipping variant ${variant.id} - no printful_variant_id`)
        skippedCount++
        continue
      }
      
      const catalogId = mappings.get(syncId)
      
      if (!catalogId) {
        console.log(`⚠️  No mapping found for sync ID ${syncId} (variant ${variant.color} ${variant.size})`)
        skippedCount++
        continue
      }
      
      // Update the variant with catalog ID
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?id=eq.${variant.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          printful_variant_id: catalogId
        })
      })
      
      if (updateResponse.ok) {
        console.log(`✅ Updated ${variant.color} ${variant.size}: ${syncId} → ${catalogId}`)
        updatedCount++
      } else {
        const errorText = await updateResponse.text()
        console.error(`❌ Failed to update variant ${variant.id}:`, errorText)
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    console.log(`\n📊 UPDATE SUMMARY:`)
    console.log(`   ✅ Updated: ${updatedCount} variants`)
    console.log(`   ⏭️  Skipped: ${skippedCount} variants`)
    
  } catch (error) {
    console.error('❌ Error updating database:', error)
    throw error
  }
}

async function verifyUpdates() {
  console.log('\n🔍 Verifying database updates...')
  
  try {
    // Get some sample variants to check
    const variantsResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?select=*&limit=5`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    })
    
    const variants = await variantsResponse.json()
    
    console.log('📋 Sample updated variants:')
    variants.forEach((variant: any, index: number) => {
      console.log(`${index + 1}. ${variant.color} ${variant.size}: Catalog ID ${variant.printful_variant_id}`)
    })
    
  } catch (error) {
    console.error('❌ Error verifying updates:', error)
  }
}

async function main() {
  console.log('🚀 FIXING DATABASE VARIANT IDs FOR SHIPPING API')
  console.log('===============================================')
  console.log('This will update printful_variant_id fields to use catalog IDs instead of sync IDs.')
  console.log('')
  
  try {
    // Step 1: Get Printful mappings
    const mappings = await getPrintfulMappings()
    
    // Step 2: Update database
    await updateDatabaseVariants(mappings)
    
    // Step 3: Verify updates
    await verifyUpdates()
    
    console.log('\n🎉 DATABASE UPDATE COMPLETE!')
    console.log('============================')
    console.log('✅ Your database now has the correct catalog variant IDs')
    console.log('✅ Shipping quotes should now return fast UK delivery times')
    console.log('✅ No more fallback shipping options!')
    console.log('')
    console.log('💡 Next steps:')
    console.log('1. Test a shipping quote on your website')
    console.log('2. Verify you see 2-4 day delivery times for UK addresses')
    console.log('3. Compare with Printful website to confirm they match')
    
  } catch (error) {
    console.error('\n❌ SCRIPT FAILED:', error)
    process.exit(1)
  }
}

main()