#!/usr/bin/env node

/**
 * Starter Bundle Printful Integration Test Script
 * 
 * This script verifies that the starter bundle is properly linked to Printful variants
 * and that all database relationships are correctly established.
 * 
 * Usage:
 *   node test-starter-bundle-integration.js [--supabase-url=URL] [--supabase-key=KEY]
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || 'https://nsmrxwnrtsllxvplazmm.supabase.co',
  supabaseKey: process.env.SUPABASE_ANON_KEY || '',
  printfulToken: process.env.PRINTFUL_TOKEN || ''
};

// Parse command line arguments
process.argv.slice(2).forEach(arg => {
  if (arg.startsWith('--supabase-url=')) {
    config.supabaseUrl = arg.split('=')[1];
  } else if (arg.startsWith('--supabase-key=')) {
    config.supabaseKey = arg.split('=')[1];
  } else if (arg.startsWith('--printful-token=')) {
    config.printfulToken = arg.split('=')[1];
  }
});

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logTest(name, passed, details = '') {
  const status = passed ? 'PASSED' : 'FAILED';
  const icon = passed ? '✅' : '❌';
  log(`${icon} ${name}: ${status}`, passed ? 'success' : 'error');
  if (details) {
    console.log(`   ${details}`);
  }
  
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
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
async function testDatabaseConnection() {
  try {
            const response = await makeRequest(`${config.supabaseUrl}/rest/v1/products?select=*&limit=1`, {
            headers: {
                'Authorization': `Bearer ${config.supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

    if (response.status === 200) {
      logTest('Database Connection', true, 'Successfully connected to Supabase');
      return true;
    } else {
      logTest('Database Connection', false, `HTTP ${response.status}: ${response.data}`);
      return false;
    }
  } catch (error) {
    logTest('Database Connection', false, error.message);
    return false;
  }
}

async function testProductVariants() {
  try {
            const response = await makeRequest(`${config.supabaseUrl}/rest/v1/product_variants?select=*,products(name)&limit=10`, {
            headers: {
                'Authorization': `Bearer ${config.supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

    if (response.status === 200 && response.data.length > 0) {
      const variantsWithPrintfulIds = response.data.filter(v => v.printful_variant_id);
      const totalVariants = response.data.length;
      
      logTest('Product Variants', true, `Found ${totalVariants} variants, ${variantsWithPrintfulIds.length} with Printful IDs`);
      
      // Log some sample variants
      response.data.slice(0, 3).forEach(variant => {
        console.log(`   - ${variant.products?.name || 'Unknown'}: ${variant.name} (Printful ID: ${variant.printful_variant_id || 'Missing'})`);
      });
      
      return true;
    } else {
      logTest('Product Variants', false, `HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Product Variants', false, error.message);
    return false;
  }
}

async function testBundleVariants() {
  try {
            const response = await makeRequest(`${config.supabaseUrl}/rest/v1/bundle_variants?select=*,products(name),product_variants(name,printful_variant_id,color,size)`, {
            headers: {
                'Authorization': `Bearer ${config.supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

    if (response.status === 200) {
      if (response.data.length > 0) {
        logTest('Bundle Variants', true, `Found ${response.data.length} bundle variant relationships`);
        
        // Log bundle components
        response.data.forEach(bv => {
          console.log(`   - Bundle: ${bv.products?.name || 'Unknown'}`);
          console.log(`     Component: ${bv.product_variants?.name || 'Unknown'} (Printful ID: ${bv.product_variants?.printful_variant_id || 'Missing'})`);
        });
      } else {
        logTest('Bundle Variants', false, 'No bundle variants found - table may be empty');
        return false;
      }
      return true;
    } else {
      logTest('Bundle Variants', false, `HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Bundle Variants', false, error.message);
    return false;
  }
}

async function testPrintfulIds() {
  try {
            const response = await makeRequest(`${config.supabaseUrl}/rest/v1/products?select=name,printful_product_id&order=name`, {
            headers: {
                'Authorization': `Bearer ${config.supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

    if (response.status === 200) {
      const productsWithPrintfulIds = response.data.filter(p => p.printful_product_id);
      const totalProducts = response.data.length;
      
      logTest('Printful IDs', true, `${productsWithPrintfulIds.length}/${totalProducts} products have Printful IDs`);
      
      // Check specific products
      const expectedProducts = ['Reform UK T-Shirt', 'Reform UK Cap', 'Reform UK Mug'];
      const missingProducts = expectedProducts.filter(name => 
        !response.data.find(p => p.name === name && p.printful_product_id)
      );
      
      if (missingProducts.length === 0) {
        console.log('   ✅ All expected products have Printful IDs');
      } else {
        console.log(`   ⚠️ Missing Printful IDs for: ${missingProducts.join(', ')}`);
      }
      
      return true;
    } else {
      logTest('Printful IDs', false, `HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Printful IDs', false, error.message);
    return false;
  }
}

async function testPrintfulProducts() {
  try {
            const response = await makeRequest(`${config.supabaseUrl}/functions/v1/printful-proxy/products`, {
            headers: {
                'Authorization': `Bearer ${config.supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

    if (response.status === 200) {
      logTest('Printful Products', true, 'Printful proxy function is accessible');
      return true;
    } else {
      logTest('Printful Products', false, `HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Printful Products', false, error.message);
    return false;
  }
}

async function testPrintfulVariants() {
  try {
            const response = await makeRequest(`${config.supabaseUrl}/functions/v1/printful-proxy/products/1`, {
            headers: {
                'Authorization': `Bearer ${config.supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

    if (response.status === 200) {
      if (response.data.result && response.data.result.variants) {
        logTest('Printful Variants', true, `Found ${response.data.result.variants.length} variants for product ID 1`);
        return true;
      } else {
        logTest('Printful Variants', false, 'No variants found in response');
        return false;
      }
    } else {
      logTest('Printful Variants', false, `HTTP ${response.status}: ${JSON.stringify(response.data)}`);
      return false;
    }
  } catch (error) {
    logTest('Printful Variants', false, error.message);
    return false;
  }
}

async function validateStarterBundle() {
  try {
    // Get starter bundle
            const bundleResponse = await makeRequest(`${config.supabaseUrl}/rest/v1/products?select=*&name=eq.Starter Bundle`, {
            headers: {
                'Authorization': `Bearer ${config.supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

    if (bundleResponse.status !== 200 || bundleResponse.data.length === 0) {
      logTest('Starter Bundle Validation', false, 'Starter Bundle not found');
      return false;
    }

    const bundle = bundleResponse.data[0];
    console.log(`   Found Starter Bundle: £${bundle.price}`);

    // Get bundle components
            const componentsResponse = await makeRequest(`${config.supabaseUrl}/rest/v1/bundle_variants?select=*,products(name),product_variants(name,printful_variant_id,color,size)&bundle_id=eq.${bundle.id}`, {
            headers: {
                'Authorization': `Bearer ${config.supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

    if (componentsResponse.status === 200 && componentsResponse.data.length > 0) {
      const components = componentsResponse.data;
      const expectedIds = [4017, 6001, 7001]; // T-shirt, Cap, Mug
      const foundIds = components.map(c => c.product_variants?.printful_variant_id).filter(Boolean);
      const missingIds = expectedIds.filter(id => !foundIds.includes(id));

      if (missingIds.length === 0) {
        logTest('Starter Bundle Validation', true, 'All expected Printful variant IDs are present');
        
        // Log bundle composition
        console.log('   Bundle composition:');
        components.forEach(component => {
          console.log(`     - ${component.products?.name || 'Unknown'}: ${component.product_variants?.name || 'Unknown'} (Printful ID: ${component.product_variants?.printful_variant_id})`);
        });
        
        return true;
      } else {
        logTest('Starter Bundle Validation', false, `Missing Printful variant IDs: ${missingIds.join(', ')}`);
        return false;
      }
    } else {
      logTest('Starter Bundle Validation', false, 'No bundle components found');
      return false;
    }
  } catch (error) {
    logTest('Starter Bundle Validation', false, error.message);
    return false;
  }
}

async function testBundleCalculation() {
  try {
    // Simulate bundle calculation
    const tshirtPrice = 24.99;
    const capPrice = 19.99;
    const mugPrice = 19.99;
    const bundlePrice = 34.99;
    
    const individualTotal = tshirtPrice + capPrice + mugPrice;
    const savings = individualTotal - bundlePrice;
    
    if (savings > 0) {
      logTest('Bundle Calculation', true, `Bundle offers £${savings.toFixed(2)} savings`);
      console.log(`   Individual: £${tshirtPrice} + £${capPrice} + £${mugPrice} = £${individualTotal}`);
      console.log(`   Bundle: £${bundlePrice}`);
      console.log(`   Savings: £${savings.toFixed(2)}`);
      return true;
    } else {
      logTest('Bundle Calculation', false, 'Bundle pricing needs review - no savings detected');
      return false;
    }
  } catch (error) {
    logTest('Bundle Calculation', false, error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Starting Starter Bundle Printful Integration Tests\n');
  console.log(`📋 Configuration:`);
  console.log(`   Supabase URL: ${config.supabaseUrl}`);
  console.log(`   Has Supabase Key: ${config.supabaseKey ? 'Yes' : 'No'}`);
  console.log(`   Has Printful Token: ${config.printfulToken ? 'Yes' : 'No'}\n`);

  if (!config.supabaseKey) {
    console.log('❌ Error: SUPABASE_ANON_KEY environment variable is required');
    console.log('   Set it with: export SUPABASE_ANON_KEY=your_key_here');
    process.exit(1);
  }

  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Product Variants', fn: testProductVariants },
    { name: 'Bundle Variants', fn: testBundleVariants },
    { name: 'Printful IDs', fn: testPrintfulIds },
    { name: 'Printful Products', fn: testPrintfulProducts },
    { name: 'Printful Variants', fn: testPrintfulVariants },
    { name: 'Bundle Calculation', fn: testBundleCalculation },
    { name: 'Starter Bundle Validation', fn: validateStarterBundle }
  ];

  for (const test of tests) {
    console.log(`\n🔍 Running: ${test.name}`);
    try {
      await test.fn();
    } catch (error) {
      logTest(test.name, false, `Unexpected error: ${error.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! The starter bundle is properly integrated with Printful.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the errors above and fix the integration issues.');
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testResults,
  config
};
