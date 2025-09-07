#!/usr/bin/env tsx

/**
 * Get Catalog Variant IDs for Shipping API
 * 
 * Gets the correct catalog variant IDs (variant_id field) that should be used
 * with the shipping API, not the sync variant IDs.
 */

const PRINTFUL_TOKEN = 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB'
const PRINTFUL_STORE_ID = '16651763'

async function getCatalogVariantIds() {
  console.log('🔍 Getting catalog variant IDs for shipping API...')
  
  // Get sample products
  const productIds = [
    390630122, // Unisex t-shirt DARK  
    390628740, // Unisex Hoodie DARK
    390637627  // Reform UK Sticker
  ]

  const catalogVariants: Array<{
    productName: string,
    variantName: string,
    syncVariantId: number,
    catalogVariantId: number
  }> = []

  for (const productId of productIds) {
    try {
      const response = await fetch(`https://api.printful.com/store/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
          'X-PF-Store-Id': PRINTFUL_STORE_ID
        }
      })

      const data = await response.json()
      
      if (data.result && data.result.sync_variants) {
        const productName = data.result.sync_product.name
        
        // Get first few variants
        const variants = data.result.sync_variants.slice(0, 3)
        
        for (const variant of variants) {
          catalogVariants.push({
            productName,
            variantName: variant.name,
            syncVariantId: variant.id,
            catalogVariantId: variant.variant_id
          })
        }
      }
      
      // Delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`Failed to fetch product ${productId}:`, error)
    }
  }

  console.log('\n📋 CATALOG VARIANT IDs FOR SHIPPING API')
  console.log('=====================================')
  
  catalogVariants.forEach(variant => {
    console.log(`Product: ${variant.productName}`)
    console.log(`Variant: ${variant.variantName}`)
    console.log(`Sync ID: ${variant.syncVariantId} (❌ Don't use for shipping)`)
    console.log(`Catalog ID: ${variant.catalogVariantId} (✅ Use for shipping API)`)
    console.log('')
  })

  console.log('🧪 TEST THESE CATALOG IDs:')
  console.log('==========================')
  
  // Show unique catalog IDs for testing
  const uniqueCatalogIds = [...new Set(catalogVariants.map(v => v.catalogVariantId))]
  uniqueCatalogIds.forEach((id, index) => {
    const variant = catalogVariants.find(v => v.catalogVariantId === id)
    console.log(`${index + 1}. Catalog ID: ${id} (${variant?.variantName})`)
  })
}

getCatalogVariantIds()