#!/usr/bin/env tsx

/**
 * Test Real UK Store Variants
 * 
 * Tests the actual variant IDs from our UK store to verify delivery times.
 */

const SUPABASE_URL = 'http://localhost:54321'
const SHIPPING_QUOTES_ENDPOINT = `${SUPABASE_URL}/functions/v1/shipping-quotes`
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Real variant IDs from our UK store
const REAL_VARIANTS = {
  tshirt: 4938821282, // Unisex t-shirt DARK / Black Heather / S
  hoodie: 4938800533, // Unisex Hoodie DARK / Black / S  
  sticker: 4938952082, // Reform UK Sticker
}

async function testVariantDeliveryTimes(variantId: number, variantName: string) {
  console.log(`\n🧪 Testing variant: ${variantName} (ID: ${variantId})`)
  
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
        printful_variant_id: variantId,
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
      return
    }

    const data = await response.json()
    
    if (data.options && data.options.length > 0) {
      console.log(`✅ Response received with ${data.options.length} shipping options:`)
      
      data.options.forEach((option: any, index: number) => {
        const deliveryText = option.minDeliveryDays && option.maxDeliveryDays 
          ? `${option.minDeliveryDays}-${option.maxDeliveryDays} days`
          : 'N/A'
        
        console.log(`  ${index + 1}. ${option.name}: ${option.rate} ${option.currency}`)
        console.log(`     Delivery: ${deliveryText}`)
        
        // Check if this looks like UK delivery
        if (option.minDeliveryDays <= 5 && option.maxDeliveryDays <= 7) {
          console.log(`     🇬🇧 UK DELIVERY DETECTED - Good delivery times!`)
        } else if (option.minDeliveryDays > 7) {
          console.log(`     🌍 INTERNATIONAL DELIVERY - Slow times suggest non-UK fulfillment`)
        }
      })
      
      const fastestOption = data.options.reduce((fastest: any, current: any) => {
        return (current.minDeliveryDays || 999) < (fastest.minDeliveryDays || 999) ? current : fastest
      })
      
      console.log(`🚚 Fastest delivery: ${fastestOption.minDeliveryDays}-${fastestOption.maxDeliveryDays} days`)
      
    } else {
      console.log('❌ No shipping options received (likely fallback response)')
    }

  } catch (error) {
    console.error(`❌ Request failed:`, error)
  }
}

async function runTests() {
  console.log('🇬🇧 Testing Real UK Store Variants for Delivery Times')
  console.log('====================================================')
  
  for (const [name, variantId] of Object.entries(REAL_VARIANTS)) {
    await testVariantDeliveryTimes(variantId, name)
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n📊 SUMMARY')
  console.log('===========')
  console.log('If you see "UK DELIVERY DETECTED" for your variants, then they are fulfilled from UK facilities.')
  console.log('If you see "INTERNATIONAL DELIVERY", those variants may be coming from non-UK facilities.')
  console.log('')
  console.log('Next step: Compare these results with what you see on the Printful website when you:')
  console.log('1. Go to your Printful dashboard')
  console.log('2. View the same variants')  
  console.log('3. Check the shipping calculator there')
  console.log('4. See if delivery times match between API and dashboard')
}

runTests()