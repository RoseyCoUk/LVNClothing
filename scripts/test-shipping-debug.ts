#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Load environment variables from .env.local
async function loadEnvFile() {
  try {
    const envContent = await Deno.readTextFile('./.env.local')
    const lines = envContent.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=')
          Deno.env.set(key, value)
        }
      }
    }
  } catch (error) {
    console.error('Error loading .env.local:', error)
  }
}

async function testSupabaseFunction() {
  console.log('🔍 Testing Supabase catalog variant lookup function...')
  
  const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL') || 'http://127.0.0.1:54321'
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found')
    return false
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Test with a T-shirt variant (these are working)
  const tshirtSyncId = '4938821282' // T-shirt dark variant from the mapping
  console.log(`🧪 Testing with T-shirt sync variant: ${tshirtSyncId}`)
  
  const { data: tshirtResult, error: tshirtError } = await supabase.rpc('get_catalog_variant_id', {
    sync_variant_id: tshirtSyncId
  })
  
  if (tshirtError) {
    console.error('❌ T-shirt variant lookup error:', tshirtError)
    return false
  }
  
  console.log(`✅ T-shirt: ${tshirtSyncId} → ${tshirtResult}`)
  
  // Test with a hoodie variant
  const hoodieSyncId = '4938800533' // Hoodie dark variant
  console.log(`🧪 Testing with hoodie sync variant: ${hoodieSyncId}`)
  
  const { data: hoodieResult, error: hoodieError } = await supabase.rpc('get_catalog_variant_id', {
    sync_variant_id: hoodieSyncId
  })
  
  if (hoodieError) {
    console.error('❌ Hoodie variant lookup error:', hoodieError)
    return false
  }
  
  console.log(`✅ Hoodie: ${hoodieSyncId} → ${hoodieResult}`)
  
  // Test with a cap variant
  const capSyncId = '4938937571' // Cap variant
  console.log(`🧪 Testing with cap sync variant: ${capSyncId}`)
  
  const { data: capResult, error: capError } = await supabase.rpc('get_catalog_variant_id', {
    sync_variant_id: capSyncId
  })
  
  if (capError) {
    console.error('❌ Cap variant lookup error:', capError)
    return false
  }
  
  console.log(`✅ Cap: ${capSyncId} → ${capResult}`)
  
  return true
}

async function testPrintfulAPI() {
  console.log('\n🌐 Testing Printful API connectivity...')
  
  const printfulToken = Deno.env.get('PRINTFUL_TOKEN')
  const printfulStoreId = Deno.env.get('PRINTFUL_STORE_ID')
  
  if (!printfulToken) {
    console.error('❌ PRINTFUL_TOKEN not found')
    return false
  }
  
  console.log('🔑 PRINTFUL_TOKEN configured:', !!printfulToken)
  console.log('🔑 PRINTFUL_TOKEN length:', printfulToken?.length || 0)
  console.log('🏪 PRINTFUL_STORE_ID configured:', !!printfulStoreId)
  console.log('🏪 PRINTFUL_STORE_ID value:', printfulStoreId)
  
  // Test with a simple shipping rate request using catalog variant IDs
  const testPayload = {
    recipient: {
      country_code: 'GB',
      state_code: null,
      city: 'London',
      zip: 'SW1A 1AA',
      address1: '10 Downing Street'
    },
    items: [
      {
        variant_id: 8923, // T-shirt catalog variant ID
        quantity: 1
      }
    ]
  }
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${printfulToken}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Reform-UK-Store/1.0'
  }
  
  if (printfulStoreId) {
    headers['X-PF-Store-Id'] = printfulStoreId
  }
  
  console.log('📦 Testing shipping rates with payload:', JSON.stringify(testPayload, null, 2))
  
  try {
    const response = await fetch('https://api.printful.com/shipping/rates', {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayload)
    })
    
    console.log('📡 Printful API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Printful API error:', errorText)
      return false
    }
    
    const data = await response.json()
    console.log('✅ Printful API response:', JSON.stringify(data, null, 2))
    
    if (data.result && data.result.length > 0) {
      console.log('🚚 Available shipping options:', data.result.length)
      data.result.forEach((option: any, index: number) => {
        console.log(`  ${index + 1}. ${option.name}: £${option.rate} (${option.currency})`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Printful API connection error:', error)
    return false
  }
}

async function testShippingEndpoint() {
  console.log('\n🧪 Testing shipping endpoint with different product types...')
  
  const testCases = [
    {
      name: 'T-shirt (working)',
      items: [{ printful_variant_id: '4938821282', quantity: 1 }]
    },
    {
      name: 'Hoodie',
      items: [{ printful_variant_id: '4938800533', quantity: 1 }]
    },
    {
      name: 'Cap',
      items: [{ printful_variant_id: '4938937571', quantity: 1 }]
    },
    {
      name: 'Mug',
      items: [{ printful_variant_id: '4938946337', quantity: 1 }]
    }
  ]
  
  const recipient = {
    country_code: 'GB',
    city: 'London',
    zip: 'SW1A 1AA',
    address1: '10 Downing Street'
  }
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Testing ${testCase.name}...`)
    
    const payload = {
      recipient,
      items: testCase.items
    }
    
    try {
      const response = await fetch('http://127.0.0.1:54321/functions/v1/shipping-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify(payload)
      })
      
      console.log(`📡 Response status: ${response.status}`)
      
      const data = await response.json()
      
      if (response.ok) {
        console.log(`✅ ${testCase.name} shipping options:`, data.options?.length || 0)
        if (data.options && data.options.length > 0) {
          data.options.forEach((option: any, index: number) => {
            console.log(`  ${index + 1}. ${option.name}: £${option.rate}`)
          })
        }
      } else {
        console.error(`❌ ${testCase.name} error:`, data)
      }
    } catch (error) {
      console.error(`❌ ${testCase.name} connection error:`, error)
    }
  }
}

async function main() {
  console.log('🚀 Starting shipping debug tests...\n')
  
  // Load environment variables
  await loadEnvFile()
  
  // Test 1: Supabase function
  const supabaseOk = await testSupabaseFunction()
  if (!supabaseOk) {
    console.log('❌ Supabase function test failed, exiting')
    Deno.exit(1)
  }
  
  // Test 2: Direct Printful API
  const printfulOk = await testPrintfulAPI()
  if (!printfulOk) {
    console.log('❌ Printful API test failed, exiting')
    Deno.exit(1)
  }
  
  // Test 3: Our shipping endpoint
  await testShippingEndpoint()
  
  console.log('\n✅ All tests completed!')
}

if (import.meta.main) {
  main()
}