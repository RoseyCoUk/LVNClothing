#!/usr/bin/env tsx

/**
 * Get UK Variant IDs Script
 * 
 * Fetches all product variants from the UK Printful store to get real variant IDs
 * for testing shipping quotes.
 */

const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN || 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB'
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID || '16651763'

interface PrintfulVariant {
  id: number
  external_id: string
  sync_variant_id: number
  name: string
  synced: boolean
  variant_id: number
  retail_price: string
  product: {
    variant_id: number
    product_id: number
    image: string
    name: string
  }
  options: Array<{
    id: string
    value: string
  }>
}

interface PrintfulProduct {
  sync_product: {
    id: number
    external_id: string
    name: string
    variants: number
  }
  sync_variants: PrintfulVariant[]
}

async function fetchPrintfulAPI(endpoint: string): Promise<any> {
  const url = `https://api.printful.com${endpoint}`
  
  console.log(`📡 Calling: ${url}`)
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'Content-Type': 'application/json',
      'X-PF-Store-Id': PRINTFUL_STORE_ID,
      'User-Agent': 'Reform-UK-Store/1.0'
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Printful API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data
}

async function getStoreProducts(): Promise<any[]> {
  console.log('🏪 Fetching store products...')
  const response = await fetchPrintfulAPI('/store/products')
  
  if (!response.result || !Array.isArray(response.result)) {
    throw new Error('Invalid response from /store/products')
  }

  console.log(`✅ Found ${response.result.length} products in store`)
  return response.result
}

async function getProductDetails(productId: number): Promise<PrintfulProduct> {
  console.log(`🔍 Fetching details for product ${productId}...`)
  const response = await fetchPrintfulAPI(`/store/products/${productId}`)
  
  if (!response.result) {
    throw new Error(`Invalid response from /store/products/${productId}`)
  }

  return response.result
}

function categorizeProduct(productName: string): string {
  const name = productName.toLowerCase()
  
  if (name.includes('t-shirt') || name.includes('tshirt') || name.includes('tee')) {
    return 'T-Shirt'
  } else if (name.includes('hoodie') || name.includes('sweatshirt')) {
    return 'Hoodie'
  } else if (name.includes('cap') || name.includes('hat')) {
    return 'Cap'
  } else if (name.includes('mug') || name.includes('cup')) {
    return 'Mug'
  } else if (name.includes('tote') || name.includes('bag')) {
    return 'Tote Bag'
  } else if (name.includes('bottle') || name.includes('water')) {
    return 'Water Bottle'
  } else if (name.includes('mouse') || name.includes('pad')) {
    return 'Mouse Pad'
  } else {
    return 'Other'
  }
}

function extractVariantInfo(variant: PrintfulVariant): { color?: string, size?: string } {
  const options = variant.options || []
  let color: string | undefined
  let size: string | undefined

  for (const option of options) {
    if (option.id === 'color') {
      color = option.value
    } else if (option.id === 'size') {
      size = option.value
    }
  }

  return { color, size }
}

async function main() {
  try {
    console.log('🚀 Fetching UK Printful Store Variants')
    console.log(`🔑 Using token: ${PRINTFUL_TOKEN.substring(0, 8)}...`)
    console.log(`🏪 Store ID: ${PRINTFUL_STORE_ID}`)
    console.log('==========================================')

    // Get all products
    const storeProducts = await getStoreProducts()
    
    const productsByCategory: Record<string, any[]> = {}
    const allVariants: Array<{ category: string, productName: string, variant: PrintfulVariant, variantInfo: any }> = []

    // Process each product
    for (const storeProduct of storeProducts) {
      if (storeProduct.is_ignored) {
        console.log(`⏭️ Skipping ignored product: ${storeProduct.name}`)
        continue
      }

      try {
        const productDetail = await getProductDetails(storeProduct.id)
        const category = categorizeProduct(productDetail.sync_product.name)
        
        if (!productsByCategory[category]) {
          productsByCategory[category] = []
        }
        productsByCategory[category].push(productDetail)

        // Process variants
        for (const variant of productDetail.sync_variants || []) {
          const variantInfo = extractVariantInfo(variant)
          allVariants.push({
            category,
            productName: productDetail.sync_product.name,
            variant,
            variantInfo
          })
        }

        console.log(`✅ ${productDetail.sync_product.name} (${category}) - ${productDetail.sync_variants?.length || 0} variants`)
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`❌ Failed to fetch product ${storeProduct.id}:`, error)
      }
    }

    console.log('\n📊 STORE SUMMARY')
    console.log('================')
    
    Object.entries(productsByCategory).forEach(([category, products]) => {
      const totalVariants = products.reduce((sum, product) => sum + (product.sync_variants?.length || 0), 0)
      console.log(`${category}: ${products.length} products, ${totalVariants} variants`)
    })

    console.log('\n🔍 SAMPLE VARIANT IDs FOR TESTING')
    console.log('==================================')

    // Show sample variants for each category
    Object.entries(productsByCategory).forEach(([category, products]) => {
      console.log(`\n${category}:`)
      
      const sampleProduct = products[0]
      if (sampleProduct && sampleProduct.sync_variants?.length > 0) {
        const variants = sampleProduct.sync_variants.slice(0, 3) // Show first 3 variants
        
        variants.forEach((variant: PrintfulVariant, index: number) => {
          const info = extractVariantInfo(variant)
          // Try different ID fields that might be available
          const variantId = variant.sync_variant_id || variant.id || variant.variant_id
          console.log(`  ${index + 1}. Variant ID: ${variantId}`)
          console.log(`     Sync Variant ID: ${variant.sync_variant_id}`)
          console.log(`     ID: ${variant.id}`)
          console.log(`     Variant ID: ${variant.variant_id}`)
          console.log(`     Name: ${variant.name}`)
          console.log(`     Price: ${variant.retail_price}`)
          if (info.color) console.log(`     Color: ${info.color}`)
          if (info.size) console.log(`     Size: ${info.size}`)
          console.log(`     Product: ${sampleProduct.sync_product.name}`)
          console.log(`     DEBUG - Full variant keys: ${Object.keys(variant).join(', ')}`)
          console.log('')
        })
      }
    })

    // Generate test data for shipping quote script
    console.log('\n📝 TEST DATA FOR SHIPPING QUOTES')
    console.log('=================================')

    const testVariants: Array<{ category: string, variantId: number, productName: string }> = []
    
    Object.entries(productsByCategory).forEach(([category, products]) => {
      const sampleProduct = products[0]
      if (sampleProduct && sampleProduct.sync_variants?.length > 0) {
        const firstVariant = sampleProduct.sync_variants[0]
        const variantId = firstVariant.sync_variant_id || firstVariant.id || firstVariant.variant_id
        testVariants.push({
          category,
          variantId: variantId,
          productName: sampleProduct.sync_product.name
        })
      }
    })

    console.log('Copy these variant IDs to update your shipping test script:')
    console.log('')
    testVariants.forEach(item => {
      console.log(`// ${item.category}: ${item.productName}`)
      console.log(`printful_variant_id: ${item.variantId}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }
}

// Run the script
if (import.meta.main) {
  main()
}