#!/usr/bin/env node

const API_URL = 'http://127.0.0.1:54321/functions/v1/shipping-quotes';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

async function testShippingQuote(productName, variantId) {
  const request = {
    recipient: {
      name: "Test Customer",
      address1: "75 Forest Hills",
      city: "Newry",
      country_code: "GB",
      zip: "BT34 2FL"
    },
    items: [{
      printful_variant_id: variantId,
      quantity: 1
    }]
  };

  console.log(`\n🧪 Testing ${productName} (Variant: ${variantId})`);
  console.log('─'.repeat(60));
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`
      },
      body: JSON.stringify(request)
    });

    const data = await response.json();
    
    if (data.error) {
      console.error(`❌ Error: ${data.error}`);
      console.error(`   Message: ${data.message || 'No message'}`);
    } else if (data.options) {
      console.log(`✅ Success! Found ${data.options.length} shipping options:`);
      data.options.forEach(opt => {
        console.log(`   📦 ${opt.name}`);
        console.log(`      Price: ${opt.rate} ${opt.currency}`);
        console.log(`      Delivery: ${opt.minDeliveryDays || '?'}-${opt.maxDeliveryDays || '?'} days`);
        console.log(`      Carrier: ${opt.carrier || 'Unknown'}`);
      });
    } else {
      console.error('❌ Unexpected response:', data);
    }
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Debugging Shipping Quote Issues');
  console.log('=' .repeat(60));
  console.log('Testing with UK address: 75 Forest Hills, Newry BT34 2FL');
  
  // Test different product types with their sync variant IDs
  const testCases = [
    // T-shirt variants (sync IDs that should convert to catalog)
    ['T-Shirt White M (sync ID)', '4938821287'],
    ['T-Shirt Black L (sync ID)', '4938821282'],
    
    // Hoodie variants (sync IDs)
    ['Hoodie Black M (sync ID)', '4938800533'],
    ['Hoodie Navy L (sync ID)', '4938800535'],
    
    // Cap variant (sync ID)
    ['Cap Black (sync ID)', '4938797545'],
    
    // Mug variant (sync ID)
    ['Mug 11oz (sync ID)', '4938946337'],
    
    // Sticker variant (sync ID)  
    ['Sticker (sync ID)', '4938952082'],
    
    // Test with catalog IDs directly (should work)
    ['T-Shirt (catalog ID 4012)', '4012'],
    ['Hoodie (catalog ID 5530)', '5530'],
    
    // Test with invalid IDs
    ['Invalid ID', 'invalid_id'],
    ['Non-existent sync ID', '9999999999']
  ];

  for (const [name, id] of testCases) {
    await testShippingQuote(name, id);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing complete!');
  console.log('\n📊 Summary:');
  console.log('If you see "Standard UK/Express UK/International" options,');
  console.log('those are FALLBACK rates (not from Printful).');
  console.log('Real Printful rates should show specific carriers and varied prices.');
}

runTests().catch(console.error);