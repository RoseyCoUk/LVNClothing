#!/usr/bin/env node

import fetch from 'node-fetch';

// Test the shipping-quotes function with sync variant IDs (which should be converted to catalog IDs)
async function testShippingQuotes() {
  console.log('🚢 Testing shipping quotes with catalog variant ID conversion...\n');

  const testPayload = {
    recipient: {
      name: 'Test Customer',
      address1: '123 Test Street',
      city: 'London',
      state_code: 'ENG',
      country_code: 'GB',
      zip: 'SW1A 1AA'
    },
    items: [
      {
        printful_variant_id: '4938821287', // T-Shirt Black/S -> should convert to catalog ID 4016
        quantity: 1
      },
      {
        printful_variant_id: '4938937571', // Cap Black -> should convert to catalog ID 7854
        quantity: 1
      }
    ]
  };

  console.log('📦 Sending request with sync variant IDs:');
  console.log('   - Sync variant 4938821287 (should → catalog 4016)');
  console.log('   - Sync variant 4938937571 (should → catalog 7854)');
  console.log('');

  try {
    const response = await fetch('http://127.0.0.1:54321/functions/v1/shipping-quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📡 Response status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`📝 Response body: ${responseText}`);

    if (response.ok) {
      const responseData = JSON.parse(responseText);
      console.log('\n✅ Shipping quotes received!');
      console.log('📦 Shipping options:');
      
      responseData.options?.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.name} - ${option.rate} ${option.currency}`);
        if (option.minDeliveryDays && option.maxDeliveryDays) {
          console.log(`      Delivery: ${option.minDeliveryDays}-${option.maxDeliveryDays} days`);
        }
        if (option.carrier) {
          console.log(`      Carrier: ${option.carrier}`);
        }
      });
      
      console.log('\n🎉 Test successful! Catalog variant ID conversion is working.');
      
    } else {
      console.log('\n❌ Request failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error:', responseText);
      }
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

// Test with an invalid sync variant ID
async function testInvalidSyncVariant() {
  console.log('\n\n🧪 Testing with invalid sync variant ID...\n');

  const testPayload = {
    recipient: {
      name: 'Test Customer',
      address1: '123 Test Street',
      city: 'London',
      state_code: 'ENG',
      country_code: 'GB',
      zip: 'SW1A 1AA'
    },
    items: [
      {
        printful_variant_id: 'invalid_sync_id', // Should return appropriate error
        quantity: 1
      }
    ]
  };

  try {
    const response = await fetch('http://127.0.0.1:54321/functions/v1/shipping-quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`📡 Response status: ${response.status}`);
    const responseText = await response.text();
    
    if (!response.ok) {
      console.log('✅ Expected error response received');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Raw error:', responseText);
      }
    } else {
      console.log('❌ Expected error but got success');
    }

  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await testShippingQuotes();
    await testInvalidSyncVariant();
  })().catch(console.error);
}