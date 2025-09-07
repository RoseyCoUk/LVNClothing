#!/usr/bin/env tsx

/**
 * Debug Single Product Script
 * 
 * Fetches a single product to see the exact API response structure.
 */

const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN || 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB'
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID || '16651763'

async function debugSingleProduct() {
  try {
    console.log('🔍 Debugging single product structure...')
    
    // First, get store products to find a product ID
    const storeResponse = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': PRINTFUL_STORE_ID
      }
    })

    const storeData = await storeResponse.json()
    console.log('Store products response:', JSON.stringify(storeData, null, 2))

    if (storeData.result && storeData.result.length > 0) {
      const firstProduct = storeData.result[0]
      console.log('\n🎯 First product:', JSON.stringify(firstProduct, null, 2))
      
      // Now get product details
      const detailResponse = await fetch(`https://api.printful.com/store/products/${firstProduct.id}`, {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
          'Content-Type': 'application/json',
          'X-PF-Store-Id': PRINTFUL_STORE_ID
        }
      })

      const detailData = await detailResponse.json()
      console.log('\n📦 Product details response:', JSON.stringify(detailData, null, 2))

      if (detailData.result && detailData.result.sync_variants) {
        console.log('\n🔍 First variant structure:')
        const firstVariant = detailData.result.sync_variants[0]
        console.log(JSON.stringify(firstVariant, null, 2))
        
        console.log('\n🔑 Available variant fields:')
        Object.keys(firstVariant).forEach(key => {
          console.log(`  ${key}: ${typeof firstVariant[key]} = ${firstVariant[key]}`)
        })
      }
    }

  } catch (error) {
    console.error('Debug failed:', error)
  }
}

debugSingleProduct()