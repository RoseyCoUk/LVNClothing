// Test script to verify Supabase functions are accessible
const BASE_URL = 'https://nsmrxwnrtsllxvplazmm.supabase.co';

async function testFunction(endpoint) {
  try {
    console.log(`Testing ${endpoint}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Response:', data);
    } else {
      console.log('Error response:', response.statusText);
    }
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
  }
}

// Test both functions
console.log('🧪 Testing Supabase Functions...\n');

testFunction('/functions/v1/printful-direct-import');
testFunction('/functions/v1/printful-sync-availability');
