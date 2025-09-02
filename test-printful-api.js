import { createClient } from '@supabase/supabase-js';

const supabase = createClient('http://127.0.0.1:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU');

async function testPrintfulAPI() {
  console.log('🧪 Testing Printful API directly...');
  
  // Get secrets from environment
  const { data: secrets } = await supabase
    .from('vault.secrets') 
    .select('name, secret')
    .in('name', ['PRINTFUL_TOKEN']);
    
  console.log('🔍 Found secrets:', secrets?.map(s => ({ name: s.name, hasSecret: !!s.secret })));
  
  const tokenSecret = secrets?.find(s => s.name === 'PRINTFUL_TOKEN');
  if (!tokenSecret?.secret) {
    console.error('❌ No PRINTFUL_TOKEN found in secrets');
    return;
  }
  
  const token = tokenSecret.secret;
  console.log('🔑 Token length:', token.length);
  console.log('🔑 Token starts with:', token.substring(0, 10) + '...');
  
  // Test the exact same API call as the function
  const payload = {
    recipient: {
      name: "A A",
      address1: "75 forest hills",
      city: "newry",
      country_code: "GB",
      zip: "bt34"
    },
    items: [
      {
        variant_id: 4938946337, // Real Printful variant ID (as number)
        quantity: 1
      }
    ]
  };
  
  console.log('📦 Testing with payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch('https://api.printful.com/shipping/rates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📦 Response body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Parsed response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ API call failed');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testPrintfulAPI().then(() => {
  console.log('Done.');
  process.exit(0);
});