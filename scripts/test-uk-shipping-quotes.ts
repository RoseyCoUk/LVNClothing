#!/usr/bin/env tsx

/**
 * Test UK Shipping Quotes Script
 * 
 * This script tests shipping quote requests to debug delivery time discrepancies
 * between Printful website (5-7 days) and API responses (8-11 days).
 */

const SUPABASE_URL = 'http://localhost:54321'
const SHIPPING_QUOTES_ENDPOINT = `${SUPABASE_URL}/functions/v1/shipping-quotes`
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

interface ShippingTestResult {
  testName: string
  success: boolean
  deliveryDays?: { min?: number, max?: number }
  fullResponse?: any
  error?: string
}

const testCases = [
  {
    name: 'UK T-Shirt to London',
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
        printful_variant_id: 4938821282, // UK T-shirt variant ID - Unisex t-shirt DARK / Black Heather / S
        quantity: 1
      }
    ]
  },
  {
    name: 'UK Hoodie to Manchester',
    recipient: {
      name: 'Jane Doe',
      address1: '1 Market Street',
      city: 'Manchester',
      state_code: '',
      country_code: 'GB',
      zip: 'M1 1AA',
      phone: '+447700000000',
      email: 'test@example.com'
    },
    items: [
      {
        printful_variant_id: 4938800533, // UK hoodie variant ID - Unisex Hoodie DARK / Black / S
        quantity: 1
      }
    ]
  },
  {
    name: 'Multiple Items to Birmingham',
    recipient: {
      name: 'Test User',
      address1: '123 High Street',
      city: 'Birmingham',
      state_code: '',
      country_code: 'GB',
      zip: 'B1 1AA',
      phone: '+447700000000',
      email: 'test@example.com'
    },
    items: [
      {
        printful_variant_id: 4938821282, // T-shirt - Unisex t-shirt DARK / Black Heather / S
        quantity: 1
      },
      {
        printful_variant_id: 4938800533, // Hoodie - Unisex Hoodie DARK / Black / S
        quantity: 1
      }
    ]
  }
]

async function testShippingQuote(testCase: typeof testCases[0]): Promise<ShippingTestResult> {
  console.log(`\n🧪 Testing: ${testCase.name}`)
  console.log(`📍 Destination: ${testCase.recipient.city}, ${testCase.recipient.country_code}`)
  console.log(`📦 Items: ${testCase.items.map(i => `${i.printful_variant_id} x${i.quantity}`).join(', ')}`)
  
  try {
    const response = await fetch(SHIPPING_QUOTES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(testCase)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ HTTP Error: ${response.status} - ${errorText}`)
      return {
        testName: testCase.name,
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      }
    }

    const data = await response.json()
    
    console.log(`✅ Response received with ${data.options?.length || 0} shipping options`)
    
    // Extract delivery day information
    const deliveryDays = data.options?.length > 0 ? {
      min: Math.min(...data.options.filter((o: any) => o.minDeliveryDays).map((o: any) => o.minDeliveryDays)),
      max: Math.max(...data.options.filter((o: any) => o.maxDeliveryDays).map((o: any) => o.maxDeliveryDays))
    } : undefined

    // Log shipping options
    data.options?.forEach((option: any, index: number) => {
      console.log(`  ${index + 1}. ${option.name}: ${option.rate} ${option.currency}`)
      console.log(`     Delivery: ${option.minDeliveryDays || 'N/A'}-${option.maxDeliveryDays || 'N/A'} days`)
      console.log(`     Carrier: ${option.carrier || 'Unknown'}`)
    })

    return {
      testName: testCase.name,
      success: true,
      deliveryDays,
      fullResponse: data
    }

  } catch (error) {
    console.error(`❌ Request failed:`, error)
    return {
      testName: testCase.name,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting UK Shipping Quote Tests')
  console.log('📡 Testing endpoint:', SHIPPING_QUOTES_ENDPOINT)
  console.log('=====================================')

  const results: ShippingTestResult[] = []

  for (const testCase of testCases) {
    const result = await testShippingQuote(testCase)
    results.push(result)
    
    // Wait 1 second between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n📊 TEST SUMMARY')
  console.log('================')
  
  results.forEach(result => {
    console.log(`\n${result.testName}:`)
    console.log(`  Status: ${result.success ? '✅ Success' : '❌ Failed'}`)
    
    if (result.success && result.deliveryDays) {
      console.log(`  Delivery Days: ${result.deliveryDays.min}-${result.deliveryDays.max} days`)
      
      // Highlight if delivery days are longer than expected
      if (result.deliveryDays.min > 7 || result.deliveryDays.max > 10) {
        console.log(`  ⚠️  WARNING: Delivery times longer than expected (should be 5-7 days for UK)`)
      }
    }
    
    if (result.error) {
      console.log(`  Error: ${result.error}`)
    }
  })

  console.log('\n🔍 DIAGNOSIS SUGGESTIONS:')
  console.log('========================')
  
  const allFailed = results.every(r => !r.success)
  const longDelivery = results.some(r => r.success && r.deliveryDays && r.deliveryDays.max > 10)
  
  if (allFailed) {
    console.log('• All tests failed - check if Supabase functions are running')
    console.log('• Verify PRINTFUL_TOKEN and PRINTFUL_STORE_ID environment variables')
    console.log('• Check function logs for detailed error messages')
  } else if (longDelivery) {
    console.log('• Delivery times are longer than expected')
    console.log('• API might be hitting wrong region/store')
    console.log('• Check if PRINTFUL_STORE_ID matches your UK store')
    console.log('• Verify if X-PF-Store-Id header is being sent correctly')
  } else {
    console.log('• Tests passed with reasonable delivery times')
    console.log('• API appears to be configured correctly for UK store')
  }

  console.log('\n💡 NEXT STEPS:')
  console.log('==============')
  console.log('• Check Supabase function logs for detailed API request/response data')
  console.log('• Compare API response with Printful dashboard for same items/destination')
  console.log('• Verify UK store settings in Printful dashboard')
}

// Run the tests
if (import.meta.main) {
  runAllTests().catch(error => {
    console.error('Test runner failed:', error)
    process.exit(1)
  })
}