#!/usr/bin/env npx tsx

// Direct test to Printful API bypassing edge functions
const PRINTFUL_TOKEN = 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB';
const STORE_ID = '16651763';

async function testShipping() {
  console.log('🚀 Testing Printful Shipping Quotes Directly\n');
  console.log('Store ID:', STORE_ID);
  console.log('Testing address: London, UK\n');
  
  // Test variants - focusing on the problematic hoodie
  const testCases = [
    {
      name: 'Hoodie - White/XXL (catalog ID)',
      variant_id: 10868,  // Using catalog variant ID
      quantity: 1,
      expected: '£4.99'
    },
    {
      name: 'Hoodie - White/L (catalog ID)',
      variant_id: 10866,
      quantity: 1,
      expected: '£4.99'
    },
    {
      name: 'T-Shirt - Navy/L (catalog ID)',
      variant_id: 4046,
      quantity: 1,
      expected: '~£3.29'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📦 Testing: ${testCase.name}`);
    console.log(`   Variant ID: ${testCase.variant_id}`);
    console.log(`   Expected: ${testCase.expected}`);
    
    try {
      const response = await fetch(`https://api.printful.com/shipping/rates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
          'Content-Type': 'application/json',
          'X-PF-Store-Id': STORE_ID
        },
        body: JSON.stringify({
          recipient: {
            name: 'Test Customer',
            address1: '10 Downing Street',
            city: 'London',
            country_code: 'GB',
            zip: 'SW1A 2AA'
          },
          items: [{
            variant_id: testCase.variant_id,
            quantity: testCase.quantity
          }]
        })
      });

      const text = await response.text();
      
      if (!response.ok) {
        console.log(`   ❌ Error ${response.status}:`, text);
        continue;
      }

      try {
        const data = JSON.parse(text);
        
        if (data.result && Array.isArray(data.result)) {
          console.log(`   ✅ Success! Shipping options:`);
          data.result.forEach((option: any) => {
            const match = option.rate == 4.99 ? '✓' : '';
            console.log(`      - ${option.name}: £${option.rate} (${option.minDeliveryDays}-${option.maxDeliveryDays} days) ${match}`);
          });
        } else {
          console.log(`   ⚠️ Unexpected response structure:`, data);
        }
      } catch (parseError) {
        console.log(`   ❌ Failed to parse JSON:`, text);
      }
    } catch (error) {
      console.log(`   ❌ Request failed:`, error);
    }
  }
  
  console.log('\n\n🔍 Testing with sync variant IDs (alternative IDs):\n');
  
  // Test with sync variant IDs
  const syncTestCases = [
    {
      name: 'Hoodie - White/2XL (sync ID)',
      variant_id: '66d96f965f37b1_25018516',
      quantity: 1,
      expected: '£4.99'
    }
  ];

  for (const testCase of syncTestCases) {
    console.log(`\n📦 Testing: ${testCase.name}`);
    console.log(`   Sync Variant ID: ${testCase.variant_id}`);
    
    try {
      const response = await fetch(`https://api.printful.com/shipping/rates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
          'Content-Type': 'application/json',
          'X-PF-Store-Id': STORE_ID
        },
        body: JSON.stringify({
          recipient: {
            name: 'Test Customer',
            address1: '10 Downing Street',
            city: 'London',
            country_code: 'GB',
            zip: 'SW1A 2AA'
          },
          items: [{
            external_variant_id: testCase.variant_id,  // Using external_variant_id for sync IDs
            quantity: testCase.quantity
          }]
        })
      });

      const text = await response.text();
      
      if (!response.ok) {
        console.log(`   ❌ Error ${response.status}:`, text);
        continue;
      }

      const data = JSON.parse(text);
      
      if (data.result && Array.isArray(data.result)) {
        console.log(`   ✅ Success! Shipping options:`);
        data.result.forEach((option: any) => {
          console.log(`      - ${option.name}: £${option.rate}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Request failed:`, error);
    }
  }
  
  console.log('\n✨ Test complete!\n');
}

// Run the test
testShipping().catch(console.error);
