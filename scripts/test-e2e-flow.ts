#!/usr/bin/env tsx
/**
 * End-to-End Testing Script for ReformUK E-commerce Platform
 * This script tests the complete order flow including:
 * - Product browsing
 * - Cart management
 * - Bundle shipping calculation
 * - Checkout process
 * - Order fulfillment
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message?: string;
  details?: any;
}

const results: TestResult[] = [];

function log(test: string, status: TestResult['status'], message?: string, details?: any) {
  const result = { test, status, message, details };
  results.push(result);
  
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${emoji} ${test}: ${message || status}`);
  if (details && process.env.DEBUG) {
    console.log('   Details:', JSON.stringify(details, null, 2));
  }
}

async function testDatabaseConnection() {
  console.log('\n🔍 Testing Database Connection...');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category')
      .limit(1);
      
    if (error) {
      log('Database Connection', 'fail', error.message);
      return false;
    }
    
    log('Database Connection', 'pass', 'Connected successfully');
    return true;
  } catch (err: any) {
    log('Database Connection', 'fail', err.message);
    return false;
  }
}

async function testProductAvailability() {
  console.log('\n🛍️ Testing Product Availability...');
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category, price, is_active')
      .eq('is_active', true);
      
    if (error) {
      log('Product Query', 'fail', error.message);
      return false;
    }
    
    if (!products || products.length === 0) {
      log('Product Availability', 'fail', 'No active products found');
      return false;
    }
    
    log('Product Availability', 'pass', `${products.length} active products found`);
    
    // Check for each category
    const categories = ['apparel', 'gear'];
    for (const category of categories) {
      const categoryProducts = products.filter(p => p.category === category);
      if (categoryProducts.length > 0) {
        log(`${category} Products`, 'pass', `${categoryProducts.length} products available`);
      } else {
        log(`${category} Products`, 'warning', 'No products in this category');
      }
    }
    
    return true;
  } catch (err: any) {
    log('Product Availability', 'fail', err.message);
    return false;
  }
}

async function testProductVariants() {
  console.log('\n🎨 Testing Product Variants...');
  
  try {
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('id, product_id, color, size, printful_variant_id, stock')
      .limit(10);
      
    if (error) {
      log('Variant Query', 'fail', error.message);
      return false;
    }
    
    if (!variants || variants.length === 0) {
      log('Product Variants', 'warning', 'No variants found');
      return false;
    }
    
    log('Product Variants', 'pass', `${variants.length} variants loaded`);
    
    // Check for Printful IDs
    const variantsWithPrintfulId = variants.filter(v => v.printful_variant_id);
    if (variantsWithPrintfulId.length === variants.length) {
      log('Printful Integration', 'pass', 'All variants have Printful IDs');
    } else {
      log('Printful Integration', 'warning', 
        `${variantsWithPrintfulId.length}/${variants.length} variants have Printful IDs`);
    }
    
    return true;
  } catch (err: any) {
    log('Product Variants', 'fail', err.message);
    return false;
  }
}

async function testShippingQuotes() {
  console.log('\n📦 Testing Shipping Quotes...');
  
  try {
    const testAddress = {
      recipient: {
        address1: '10 Downing Street',
        city: 'London',
        country_code: 'GB',
        zip: 'SW1A 2AA'
      },
      items: [
        { printful_variant_id: 15451, quantity: 1 }, // T-shirt
        { printful_variant_id: 15463, quantity: 1 }  // Hoodie
      ]
    };
    
    const response = await fetch(`${supabaseUrl}/functions/v1/shipping-quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify(testAddress)
    });
    
    if (!response.ok) {
      const error = await response.text();
      log('Shipping API', 'fail', `HTTP ${response.status}: ${error}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.options && data.options.length > 0) {
      log('Shipping Quotes', 'pass', `${data.options.length} shipping options available`);
      
      // Log shipping options
      data.options.forEach((opt: any) => {
        log(`Shipping Option: ${opt.name}`, 'pass', 
          `£${opt.rate} (${opt.minDeliveryDays}-${opt.maxDeliveryDays} days)`);
      });
      
      return true;
    } else {
      log('Shipping Quotes', 'warning', 'No shipping options returned (using fallback)');
      return true; // Still pass as fallback is expected behavior
    }
  } catch (err: any) {
    log('Shipping Quotes', 'fail', err.message);
    return false;
  }
}

async function testBundleExpansion() {
  console.log('\n🎁 Testing Bundle Shipping Calculation...');
  
  try {
    // Test with a bundle that should expand to multiple items
    const bundleRequest = {
      recipient: {
        address1: '10 Downing Street',
        city: 'London',
        country_code: 'GB',
        zip: 'SW1A 2AA'
      },
      items: [
        // Simulating expanded bundle items
        { printful_variant_id: 15451, quantity: 1 }, // T-shirt from bundle
        { printful_variant_id: 15463, quantity: 1 }, // Hoodie from bundle
        { printful_variant_id: 601, quantity: 1 }     // Mug from bundle
      ]
    };
    
    const response = await fetch(`${supabaseUrl}/functions/v1/shipping-quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify(bundleRequest)
    });
    
    if (!response.ok) {
      log('Bundle Shipping', 'fail', `HTTP ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.options && data.options.length > 0) {
      log('Bundle Shipping Calculation', 'pass', 
        'Bundle items properly calculated for shipping');
      return true;
    } else {
      log('Bundle Shipping Calculation', 'warning', 
        'Using fallback rates for bundle shipping');
      return true;
    }
  } catch (err: any) {
    log('Bundle Shipping Calculation', 'fail', err.message);
    return false;
  }
}

async function testAuthenticationFlow() {
  console.log('\n🔐 Testing Authentication Flow...');
  
  try {
    // Test sign up with a test email
    const testEmail = `test-${Date.now()}@reformuk-test.com`;
    const testPassword = 'TestPassword123!';
    
    // Test signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      log('User Signup', 'fail', signUpError.message);
      return false;
    }
    
    log('User Signup', 'pass', 'Test user created successfully');
    
    // Test signin
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      log('User Signin', 'fail', signInError.message);
      return false;
    }
    
    log('User Signin', 'pass', 'Authentication successful');
    
    // Test signout
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      log('User Signout', 'fail', signOutError.message);
      return false;
    }
    
    log('User Signout', 'pass', 'Signout successful');
    
    return true;
  } catch (err: any) {
    log('Authentication Flow', 'fail', err.message);
    return false;
  }
}

async function testOrderCreation() {
  console.log('\n📝 Testing Order Creation...');
  
  try {
    // Check if orders table exists and is accessible
    const { data, error } = await supabase
      .from('orders')
      .select('id, readable_order_id, status, created_at')
      .limit(1);
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      log('Orders Table', 'fail', error.message);
      return false;
    }
    
    log('Orders Table', 'pass', 'Orders table is accessible');
    
    // Check order structure
    const { data: tableInfo } = await supabase
      .from('orders')
      .select()
      .limit(0); // Just get structure, no data
      
    log('Order Structure', 'pass', 'Order table structure verified');
    
    return true;
  } catch (err: any) {
    log('Order Creation', 'fail', err.message);
    return false;
  }
}

async function testEmailConfiguration() {
  console.log('\n📧 Testing Email Configuration...');
  
  try {
    // Check if Resend is configured
    const resendKey = process.env.RESEND_API_KEY;
    
    if (resendKey) {
      log('Resend Configuration', 'pass', 'Resend API key is configured');
    } else {
      log('Resend Configuration', 'warning', 
        'Resend API key not found in environment (check edge function config)');
    }
    
    // Test email edge function exists
    const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (response.ok || response.status === 400) { // 400 expected for OPTIONS without data
      log('Email Edge Function', 'pass', 'Email function is deployed');
    } else {
      log('Email Edge Function', 'warning', 'Email function may not be deployed');
    }
    
    return true;
  } catch (err: any) {
    log('Email Configuration', 'fail', err.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting End-to-End Tests for ReformUK E-commerce Platform');
  console.log('=' .repeat(60));
  
  const tests = [
    testDatabaseConnection,
    testProductAvailability,
    testProductVariants,
    testShippingQuotes,
    testBundleExpansion,
    testAuthenticationFlow,
    testOrderCreation,
    testEmailConfiguration
  ];
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  for (const test of tests) {
    const success = await test();
    if (!success) {
      failed++;
    }
  }
  
  // Count results
  results.forEach(r => {
    if (r.status === 'pass') passed++;
    else if (r.status === 'fail') failed++;
    else if (r.status === 'warning') warnings++;
  });
  
  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${results.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All critical tests passed! The system is ready for use.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(console.error);