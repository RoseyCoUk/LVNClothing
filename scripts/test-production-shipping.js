#!/usr/bin/env node

const API_URL = 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/shipping-quotes';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM';

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
      const isRealPrintful = !data.options.some(opt => opt.id === 'standard-uk');
      console.log(`${isRealPrintful ? '✅' : '⚠️ '} ${isRealPrintful ? 'REAL Printful rates' : 'FALLBACK rates'}! Found ${data.options.length} shipping options:`);
      data.options.forEach(opt => {
        console.log(`   📦 ${opt.name}`);
        console.log(`      Price: ${opt.rate} ${opt.currency}`);
        console.log(`      Delivery: ${opt.minDeliveryDays || '?'}-${opt.maxDeliveryDays || '?'} days`);
        if (opt.carrier) console.log(`      Carrier: ${opt.carrier}`);
      });
    } else {
      console.error('❌ Unexpected response:', data);
    }
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Testing Production Shipping Quotes');
  console.log('=' .repeat(60));
  console.log('Testing with UK address: 75 Forest Hills, Newry BT34 2FL');
  console.log('URL:', API_URL);
  
  // Test different product types with their sync variant IDs
  const testCases = [
    // T-shirt variants (sync IDs that should convert to catalog)
    ['T-Shirt White M (sync ID)', '4938821287'],
    ['T-Shirt Black L (sync ID)', '4938821282'],
    
    // Hoodie variants (sync IDs)
    ['Hoodie Black M (sync ID)', '4938800533'],
    
    // Cap variant (sync ID)
    ['Cap Black (sync ID)', '4938937571'],
    
    // Mug variant (sync ID)
    ['Mug 11oz (sync ID)', '4938946337'],
    
    // Tote variant (sync ID)  
    ['Tote Bag (sync ID)', '4937855201'],
    
    // Water bottle variant (sync ID)
    ['Water Bottle (sync ID)', '4937829959'],
    
    // Mouse pad variant (sync ID)
    ['Mouse Pad (sync ID)', '4937848099']
  ];

  for (const [name, id] of testCases) {
    await testShippingQuote(name, id);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testing complete!');
  console.log('\n📊 Summary:');
  console.log('✅ REAL rates = Working correctly (varied prices, real carriers)');
  console.log('⚠️  FALLBACK rates = Using hardcoded rates (Standard UK/Express/International)');
}

runTests().catch(console.error);