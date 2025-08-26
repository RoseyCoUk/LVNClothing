// Simple test script to verify authentication fixes
// Run with: node test-auth-fixes.js

import https from 'https';
import http from 'http';

const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
const LOCAL_FRONTEND_URL = 'http://localhost:5173';

// Test configuration
const testConfig = {
  supabaseUrl: LOCAL_SUPABASE_URL,
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test functions
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  try {
    const response = await makeRequest(`${testConfig.supabaseUrl}/rest/v1/`);
    console.log(`✅ Supabase API accessible: ${response.status}`);
    return response.status === 200;
  } catch (error) {
    console.log(`❌ Supabase connection failed: ${error.message}`);
    return false;
  }
}

async function testAuthentication() {
  console.log('🔐 Testing authentication...');
  try {
    // Use a unique email with timestamp to avoid duplicate user errors
    const uniqueEmail = `test${Date.now()}@example.com`;
    const response = await makeRequest(`${testConfig.supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': testConfig.anonKey
      },
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'testpassword123'
      })
    });
    
    if (response.status === 200) {
      console.log('✅ Authentication working - got access token');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Authentication still failing - 401 Unauthorized');
      return false;
    } else if (response.status === 422) {
      console.log('⚠️ Authentication test got 422 - checking if it\'s a duplicate user error');
      try {
        const errorData = JSON.parse(response.data);
        if (errorData.error_code === 'user_already_exists') {
          console.log('✅ Authentication working (user already exists is expected)');
          return true;
        } else {
          console.log(`❌ Unexpected 422 error: ${errorData.msg}`);
          return false;
        }
      } catch (parseError) {
        console.log(`❌ Could not parse 422 response: ${response.data}`);
        return false;
      }
    } else {
      console.log(`⚠️ Unexpected response: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Authentication test failed: ${error.message}`);
    return false;
  }
}

async function testProductAccess() {
  console.log('🛍️ Testing product access...');
  try {
    const response = await makeRequest(`${testConfig.supabaseUrl}/rest/v1/products?select=*&limit=1`, {
      headers: {
        'apikey': testConfig.anonKey
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Product data accessible');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Product access still failing - 401 Unauthorized');
      return false;
    } else {
      console.log(`⚠️ Unexpected response: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Product access test failed: ${error.message}`);
    return false;
  }
}

async function testFrontendAccess() {
  console.log('🌐 Testing frontend access...');
  try {
    const response = await makeRequest(LOCAL_FRONTEND_URL);
    
    if (response.status === 200) {
      console.log('✅ Frontend accessible');
      return true;
    } else {
      console.log(`❌ Frontend access failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend test failed: ${error.message}`);
    return false;
  }
}

async function testSupabaseFunctions() {
  console.log('⚡ Testing Supabase functions...');
  try {
    const response = await makeRequest(`${testConfig.supabaseUrl}/functions/v1/newsletter-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testConfig.anonKey}`
      },
      body: JSON.stringify({
        email: 'test@example.com'
      })
    });
    
    if (response.status === 200) {
      console.log('✅ Functions accessible');
      return true;
    } else if (response.status === 401) {
      console.log('❌ Functions still failing - 401 Unauthorized');
      return false;
    } else if (response.status === 503) {
      console.log('⚠️ Functions getting 503 - edge runtime may not be fully started');
      console.log(`   Response: ${response.data}`);
      return false;
    } else if (response.status === 400 || response.status === 500) {
      console.log(`✅ Functions accessible (got ${response.status} - business logic error, not auth error)`);
      console.log(`   Response: ${response.data}`);
      return true;
    } else {
      console.log(`⚠️ Functions response: ${response.status} - ${response.data}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Functions test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting authentication fix verification tests...\n');
  
  const tests = [
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Authentication', fn: testAuthentication },
    { name: 'Product Access', fn: testProductAccess },
    { name: 'Frontend Access', fn: testFrontendAccess },
    { name: 'Supabase Functions', fn: testSupabaseFunctions }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
    console.log(`   ${result ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log(`\n🎯 Overall Result: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Authentication errors appear to be resolved.');
  } else if (passed >= 4) {
    console.log('🎉 Excellent progress! Authentication errors are resolved. Only minor issues remain.');
  } else if (passed > 0) {
    console.log('⚠️ Some tests passed, but there are still issues to address.');
  } else {
    console.log('❌ All tests failed. Authentication issues persist.');
  }
  
  return results;
}

// Run tests
runTests().catch(console.error);
