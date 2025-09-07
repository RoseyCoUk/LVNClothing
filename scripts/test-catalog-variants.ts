#!/usr/bin/env tsx

/**
 * Test Catalog Variant IDs
 * 
 * Tests the correct catalog variant IDs with the shipping API to see UK delivery times.
 */

const SUPABASE_URL = 'http://localhost:54321'
const SHIPPING_QUOTES_ENDPOINT = `${SUPABASE_URL}/functions/v1/shipping-quotes`
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Correct catalog variant IDs from our UK store
const CATALOG_VARIANTS = {
  'UK T-Shirt (Small)': 8923,
  'UK Hoodie (Small)': 5530,
  'UK Sticker': 10163
}

async function testCatalogVariant(variantName: string, catalogId: number) {
  console.log(`\n🧪 Testing: ${variantName} (Catalog ID: ${catalogId})`)
  
  const testRequest = {
    recipient: {
      name: 'John Smith',
      address1: '10 Downing Street',
      city: 'London',
      state_code: '',
      country_code: 'GB',
      zip: 'SW1A 2AA',
      phone: '+447700000000',
      email: 'test@example.com'
    },
    items: [
      {
        printful_variant_id: catalogId,
        quantity: 1
      }
    ]
  }

  try {
    const response = await fetch(SHIPPING_QUOTES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testRequest)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ HTTP Error: ${response.status} - ${errorText}`)
      return null
    }

    const data = await response.json()
    
    if (data.options && data.options.length > 0) {
      // Check if these are fallback options (they have consistent naming)
      const isFallback = data.options.some((opt: any) => 
        opt.name.includes('Standard UK Delivery') || 
        opt.name.includes('Express UK Delivery')
      )
      
      if (isFallback) {
        console.log(`❌ Got fallback shipping options (API call failed)`)
        return null
      }
      
      console.log(`✅ Real Printful API response with ${data.options.length} shipping options:`)
      
      data.options.forEach((option: any, index: number) => {
        const deliveryText = option.minDeliveryDays && option.maxDeliveryDays 
          ? `${option.minDeliveryDays}-${option.maxDeliveryDays} days`
          : 'N/A'
        
        console.log(`  ${index + 1}. ${option.name}: ${option.rate} ${option.currency}`)
        console.log(`     Delivery: ${deliveryText}`)
        
        // Analyze delivery times
        if (option.minDeliveryDays <= 5 && option.maxDeliveryDays <= 7) {
          console.log(`     🇬🇧 FAST UK DELIVERY - This matches website expectations!`)
        } else if (option.minDeliveryDays > 7) {
          console.log(`     🌍 SLOW DELIVERY - This suggests non-UK fulfillment`)
        }
      })
      
      const fastestOption = data.options.reduce((fastest: any, current: any) => {
        return (current.minDeliveryDays || 999) < (fastest.minDeliveryDays || 999) ? current : fastest
      })
      
      console.log(`🚚 Fastest delivery: ${fastestOption.minDeliveryDays}-${fastestOption.maxDeliveryDays} days`)
      
      return {
        variantName,
        catalogId,
        fastestDelivery: {
          min: fastestOption.minDeliveryDays,
          max: fastestOption.maxDeliveryDays
        },
        allOptions: data.options
      }
      
    } else {
      console.log('❌ No shipping options received')
      return null
    }

  } catch (error) {
    console.error(`❌ Request failed:`, error)
    return null
  }
}

async function runTests() {
  console.log('🇬🇧 Testing UK Store Catalog Variants with Printful Shipping API')
  console.log('================================================================')
  console.log('This will show the REAL delivery times from Printful for your UK variants.')
  console.log('')
  
  const results = []
  
  for (const [variantName, catalogId] of Object.entries(CATALOG_VARIANTS)) {
    const result = await testCatalogVariant(variantName, catalogId)
    if (result) results.push(result)
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n📊 FINAL ANALYSIS')
  console.log('==================')
  
  if (results.length === 0) {
    console.log('❌ All tests failed. Check Supabase functions and Printful API connectivity.')
  } else {
    console.log(`✅ Successfully tested ${results.length} variants:`)
    console.log('')
    
    results.forEach(result => {
      const isGoodTiming = result.fastestDelivery.max <= 7
      const status = isGoodTiming ? '🇬🇧 GOOD' : '🌍 SLOW'
      
      console.log(`${status} ${result.variantName}: ${result.fastestDelivery.min}-${result.fastestDelivery.max} days`)
    })
    
    console.log('')
    
    const goodVariants = results.filter(r => r.fastestDelivery.max <= 7).length
    const slowVariants = results.filter(r => r.fastestDelivery.max > 7).length
    
    if (slowVariants === 0) {
      console.log('🎉 EXCELLENT! All variants show fast UK delivery times (≤7 days)')
      console.log('✅ Your API is configured correctly for UK fulfillment')
    } else if (goodVariants > 0) {
      console.log(`⚠️  MIXED RESULTS: ${goodVariants} fast, ${slowVariants} slow`)
      console.log('Some variants are fulfilled from UK, others from international facilities')
    } else {
      console.log('❌ ALL VARIANTS SLOW: All variants show >7 day delivery')
      console.log('This suggests your products are being fulfilled from non-UK facilities')
    }
    
    console.log('')
    console.log('💡 NEXT STEPS:')
    console.log('1. Compare these results with Printful website for same variants')
    console.log('2. If times match: API is working correctly, variants may be international')
    console.log('3. If times differ: Check Printful store settings and fulfillment locations')
  }
}

runTests()