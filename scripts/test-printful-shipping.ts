#!/usr/bin/env tsx

import fs from 'fs';

// Read PRINTFUL_TOKEN from .env.local
function getToken() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/PRINTFUL_TOKEN=(.+)/);
  return match ? match[1].trim() : null;
}

async function testPrintfulShipping() {
  const printfulToken = getToken();
  
  if (!printfulToken) {
    console.error('❌ PRINTFUL_TOKEN not found in .env.local');
    process.exit(1);
  }

  console.log('Testing Printful shipping API...');
  
  // Test with YOUR EXACT address and product
  console.log('Testing with exact address: 75 Forest Hills, Newry BT34 2FL');
  
  const payload = {
    recipient: {
      address1: "75 Forest Hills",
      city: "Newry",
      country_code: "GB",
      zip: "BT34 2FL"
    },
    items: [
      {
        variant_id: 4012, // Bella+Canvas 3001 - White / M
        quantity: 1
      }
    ]
  };

  console.log('📦 Request payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('https://api.printful.com/shipping/rates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printfulToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Full response:', JSON.stringify(data, null, 2));
    
    if (data.result) {
      console.log('\n📦 Shipping options:');
      data.result.forEach((option: any) => {
        console.log(`\n  ${option.name}:`);
        console.log(`    ID: ${option.id}`);
        console.log(`    Rate: ${option.currency} ${option.rate}`);
        console.log(`    Min delivery days: ${option.minDeliveryDays || option.min_delivery_days || 'N/A'}`);
        console.log(`    Max delivery days: ${option.maxDeliveryDays || option.max_delivery_days || 'N/A'}`);
        console.log(`    Min delivery date: ${option.minDeliveryDate || 'N/A'}`);
        console.log(`    Max delivery date: ${option.maxDeliveryDate || 'N/A'}`);
        console.log(`    Carrier: ${option.carrier || 'N/A'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error calling Printful API:', error);
  }
}

testPrintfulShipping();