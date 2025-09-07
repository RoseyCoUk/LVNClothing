#!/usr/bin/env tsx

import fs from 'fs';

// Read anon key from .env.local
function getAnonKey() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);
  return match ? match[1].trim() : null;
}

async function testShippingEdgeFunction() {
  const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
  const anonKey = getAnonKey();
  
  if (!anonKey) {
    console.error('❌ VITE_SUPABASE_ANON_KEY not found in .env.local');
    process.exit(1);
  }
  
  const payload = {
    recipient: {
      address1: "123 Main Street",
      city: "Newry",
      country_code: "GB",
      zip: "BT34 2FL"
    },
    items: [
      {
        printful_variant_id: 4011,
        quantity: 1
      }
    ]
  };

  console.log('📦 Testing edge function with payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/shipping-quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Response status:', response.status);

    const data = await response.json();
    console.log('✅ Edge function response:', JSON.stringify(data, null, 2));
    
    if (data.options) {
      console.log('\n📦 Shipping options returned:');
      data.options.forEach((option: any) => {
        console.log(`\n  ${option.name}:`);
        console.log(`    Rate: ${option.currency} ${option.rate}`);
        console.log(`    Min delivery days: ${option.minDeliveryDays || 'NOT PRESENT'}`);
        console.log(`    Max delivery days: ${option.maxDeliveryDays || 'NOT PRESENT'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error calling edge function:', error);
  }
}

testShippingEdgeFunction();