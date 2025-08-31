// Test Backend Integration for Admin Products System
// This script tests all the backend functionality to ensure it's working with live data

console.log('🧪 Testing Backend Integration for Admin Products System...\n');

// Test configuration
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key',
  testProductId: 'test-product-123',
  testBundleId: 'test-bundle-123'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const result = { name, passed, details };
  results.tests.push(result);
  
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  console.log(`${status} ${name}`);
  if (details && !passed) {
    console.log(`   Details: ${details}`);
  }
}

// Test 1: Database Connection
async function testDatabaseConnection() {
  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/products?select=count`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`
      }
    });
    
    if (response.ok) {
      logTest('Database Connection', true);
      return true;
    } else {
      logTest('Database Connection', false, `HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logTest('Database Connection', false, error.message);
    return false;
  }
}

// Test 2: Products Table Access
async function testProductsTableAccess() {
  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/products?select=*&limit=1`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('Products Table Access', true, `Found ${data.length} products`);
      return true;
    } else {
      logTest('Products Table Access', false, `HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logTest('Products Table Access', false, error.message);
    return false;
  }
}

// Test 3: Product Overrides Table Access
async function testProductOverridesTableAccess() {
  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/product_overrides?select=*&limit=1`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('Product Overrides Table Access', true, `Found ${data.length} overrides`);
      return true;
    } else {
      logTest('Product Overrides Table Access', false, `HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logTest('Product Overrides Table Access', false, error.message);
    return false;
  }
}

// Test 4: Bundles Table Access
async function testBundlesTableAccess() {
  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/bundles?select=*&limit=1`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('Bundles Table Access', true, `Found ${data.length} bundles`);
      return true;
    } else {
      logTest('Bundles Table Access', false, `HTTP ${response.status}: ${response.statusText}`);
      return false;
  }
  } catch (error) {
    logTest('Bundles Table Access', false, error.message);
    return false;
  }
}

// Test 5: Product Images Table Access
async function testProductImagesTableAccess() {
  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/product_images?select=*&limit=1`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('Product Images Table Access', true, `Found ${data.length} images`);
      return true;
    } else {
      logTest('Product Images Table Access', false, `HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logTest('Product Images Table Access', false, error.message);
    return false;
  }
}

// Test 6: Sync Status Table Access
async function testSyncStatusTableAccess() {
  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/sync_status?select=*&limit=1`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('Sync Status Table Access', true, `Found ${data.length} sync records`);
      return true;
    } else {
      logTest('Sync Status Table Access', false, `HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logTest('Sync Status Table Access', false, error.message);
    return false;
  }
}

// Test 7: Create Test Product Override
async function testCreateProductOverride() {
  try {
    const testOverride = {
      printful_product_id: config.testProductId,
      custom_retail_price: 25.99,
      custom_description: 'Test product override for integration testing',
      is_active: true
    };
    
    const response = await fetch(`${config.supabaseUrl}/rest/v1/product_overrides`, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testOverride)
    });
    
    if (response.ok) {
      const data = await response.json();
      logTest('Create Product Override', true, `Created override with ID: ${data[0].id}`);
      
      // Clean up - delete the test override
      await fetch(`${config.supabaseUrl}/rest/v1/product_overrides?id=eq.${data[0].id}`, {
        method: 'DELETE',
        headers: {
          'apikey': config.supabaseAnonKey,
          'Authorization': `Bearer ${config.supabaseAnonKey}`
        }
      });
      
      return true;
    } else {
      logTest('Create Product Override', false, `HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logTest('Create Product Override', false, error.message);
    return false;
  }
}

// Test 8: Update Product Override
async function testUpdateProductOverride() {
  try {
    // First create a test override
    const testOverride = {
      printful_product_id: `${config.testProductId}-update`,
      custom_retail_price: 20.99,
      custom_description: 'Test product override for update testing',
      is_active: true
    };
    
    const createResponse = await fetch(`${config.supabaseUrl}/rest/v1/product_overrides`, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testOverride)
    });
    
    if (!createResponse.ok) {
      logTest('Update Product Override', false, 'Failed to create test override');
      return false;
    }
    
    const createdData = await createResponse.json();
    const overrideId = createdData[0].id;
    
    // Update the override
    const updateResponse = await fetch(`${config.supabaseUrl}/rest/v1/product_overrides?id=eq.${overrideId}`, {
      method: 'PATCH',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        custom_retail_price: 22.99,
        custom_description: 'Updated test product override'
      })
    });
    
    if (updateResponse.ok) {
      const updatedData = await updateResponse.json();
      logTest('Update Product Override', true, `Updated override price to: ${updatedData[0].custom_retail_price}`);
      
      // Clean up
      await fetch(`${config.supabaseUrl}/rest/v1/product_overrides?id=eq.${overrideId}`, {
        method: 'DELETE',
        headers: {
          'apikey': config.supabaseAnonKey,
          'Authorization': `Bearer ${config.supabaseAnonKey}`
        }
      });
      
      return true;
    } else {
      logTest('Update Product Override', false, `HTTP ${updateResponse.status}: ${updateResponse.statusText}`);
      return false;
    }
  } catch (error) {
    logTest('Update Product Override', false, error.message);
    return false;
  }
}

// Test 9: Delete Product Override
async function testDeleteProductOverride() {
  try {
    // First create a test override
    const testOverride = {
      printful_product_id: `${config.testProductId}-delete`,
      custom_retail_price: 18.99,
      custom_description: 'Test product override for delete testing',
      is_active: true
    };
    
    const createResponse = await fetch(`${config.supabaseUrl}/rest/v1/product_overrides`, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testOverride)
    });
    
    if (!createResponse.ok) {
      logTest('Delete Product Override', false, 'Failed to create test override');
      return false;
    }
    
    const createdData = await createResponse.json();
    const overrideId = createdData[0].id;
    
    // Delete the override
    const deleteResponse = await fetch(`${config.supabaseUrl}/rest/v1/product_overrides?id=eq.${overrideId}`, {
      method: 'DELETE',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`
      }
    });
    
    if (deleteResponse.ok) {
      logTest('Delete Product Override', true, 'Successfully deleted test override');
      return true;
    } else {
      logTest('Delete Product Override', false, `HTTP ${deleteResponse.status}: ${deleteResponse.statusText}`);
      return false;
    }
  } catch (error) {
    logTest('Delete Product Override', false, error.message);
    return false;
  }
}

// Test 10: Edge Function Availability (if deployed)
async function testEdgeFunctionAvailability() {
  try {
    const response = await fetch(`${config.supabaseUrl}/functions/v1/printful-sync`, {
      method: 'OPTIONS'
    });
    
    if (response.ok) {
      logTest('Edge Function Availability', true, 'Printful sync function is accessible');
      return true;
    } else {
      logTest('Edge Function Availability', false, `HTTP ${response.status}: ${response.statusText}`);
      return false;
    }
  } catch (error) {
    logTest('Edge Function Availability', false, 'Function may not be deployed yet');
    return false;
  }
}

// Test 11: RLS Policies
async function testRLSPolicies() {
  try {
    // Test that we can read data (should work for authenticated users)
    const readResponse = await fetch(`${config.supabaseUrl}/rest/v1/products?select=*&limit=1`, {
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`
      }
    });
    
    if (readResponse.ok) {
      logTest('RLS Policies - Read Access', true, 'Can read products with authenticated user');
    } else {
      logTest('RLS Policies - Read Access', false, `HTTP ${readResponse.status}: ${readResponse.statusText}`);
    }
    
    // Test that we can write data (should work for authenticated users)
    const testData = {
      printful_product_id: `${config.testProductId}-rls-test`,
      name: 'RLS Test Product',
      description: 'Testing RLS policies',
      retail_price: 15.99,
      printful_cost: 8.50,
      category: 'test',
      is_available: true
    };
    
    const writeResponse = await fetch(`${config.supabaseUrl}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testData)
    });
    
    if (writeResponse.ok) {
      const createdData = await writeResponse.json();
      logTest('RLS Policies - Write Access', true, 'Can create products with authenticated user');
      
      // Clean up
      await fetch(`${config.supabaseUrl}/rest/v1/products?id=eq.${createdData[0].id}`, {
        method: 'DELETE',
        headers: {
          'apikey': config.supabaseAnonKey,
          'Authorization': `Bearer ${config.supabaseAnonKey}`
        }
      });
    } else {
      logTest('RLS Policies - Write Access', false, `HTTP ${writeResponse.status}: ${writeResponse.statusText}`);
    }
    
    return true;
  } catch (error) {
    logTest('RLS Policies', false, error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting backend integration tests...\n');
  
  await testDatabaseConnection();
  await testProductsTableAccess();
  await testProductOverridesTableAccess();
  await testBundlesTableAccess();
  await testProductImagesTableAccess();
  await testSyncStatusTableAccess();
  await testCreateProductOverride();
  await testUpdateProductOverride();
  await testDeleteProductOverride();
  await testEdgeFunctionAvailability();
  await testRLSPolicies();
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.details}`);
    });
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (results.failed === 0) {
    console.log('   🎉 All tests passed! Your backend integration is working perfectly.');
    console.log('   🚀 You can now use the admin products system with live data.');
  } else if (results.failed <= 2) {
    console.log('   ⚠️  Most tests passed. Check the failed tests above for minor issues.');
    console.log('   🔧 The system should be mostly functional.');
  } else {
    console.log('   🚨 Several tests failed. Review the issues above before proceeding.');
    console.log('   🔧 You may need to fix database permissions or table structures.');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('   1. If all tests passed, your backend is ready for production use');
  console.log('   2. If some tests failed, fix the issues and run the tests again');
  console.log('   3. Deploy the printful-sync Edge Function if not already deployed');
  console.log('   4. Set up your PRINTFUL_TOKEN in Supabase secrets');
  console.log('   5. Test the admin products interface with real data');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runAllTests().catch(console.error);
} else {
  // Browser environment
  console.log('🌐 Running in browser environment');
  console.log('Please run this script in Node.js for full testing capabilities');
}
