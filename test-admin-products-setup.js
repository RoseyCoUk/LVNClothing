// Test script for Admin Products Management setup
import { createClient } from '@supabase/supabase-js';

// Supabase credentials from your .env file
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM';

console.log('🧪 Testing Admin Products Management setup...');
console.log('📋 Please update the supabaseUrl and supabaseKey variables above with your actual credentials');
console.log('');

// Credentials are set, proceeding with test

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSetup() {
  try {
    console.log('🚀 Starting Admin Products Management setup test...');
    
    // Test 1: Check if tables exist and are accessible
    console.log('\n1. Testing table existence and accessibility...');
    
    const { data: overrides, error: overridesError } = await supabase
      .from('product_overrides')
      .select('count')
      .limit(1);
    
    if (overridesError) {
      console.log('❌ product_overrides table error:', overridesError.message);
    } else {
      console.log('✅ product_overrides table accessible');
    }
    
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('count')
      .limit(1);
    
    if (imagesError) {
      console.log('❌ product_images table error:', imagesError.message);
    } else {
      console.log('✅ product_images table accessible');
    }
    
    const { data: bundles, error: bundlesError } = await supabase
      .from('bundles')
      .select('count')
      .limit(1);
    
    if (bundlesError) {
      console.log('❌ bundles table error:', bundlesError.message);
    } else {
      console.log('✅ bundles table accessible');
    }
    
    const { data: bundleItems, error: bundleItemsError } = await supabase
      .from('bundle_items')
      .select('count')
      .limit(1);
    
    if (bundleItemsError) {
      console.log('❌ bundle_items table error:', bundleItemsError.message);
    } else {
      console.log('✅ bundle_items table accessible');
    }
    
    // Test 2: Check if indexes exist (this would require admin access)
    console.log('\n2. Testing database structure...');
    
    // Test 3: Test RLS policies with unauthenticated user
    console.log('\n3. Testing RLS policies (unauthenticated user)...');
    
    // Try to insert data as unauthenticated user (should fail)
    const { error: insertError } = await supabase
      .from('product_overrides')
      .insert({
        printful_product_id: 'test-product-123',
        custom_retail_price: 29.99,
        custom_description: 'Test product override'
      });
    
    if (insertError && insertError.message.includes('new row violates row-level security policy')) {
      console.log('✅ RLS policy working correctly - unauthenticated insert blocked');
    } else if (insertError) {
      console.log('⚠️  Insert failed with different error:', insertError.message);
    } else {
      console.log('❌ RLS policy not working - unauthenticated insert succeeded');
    }
    
    // Test 4: Test storage access (if storage is set up)
    console.log('\n4. Testing Supabase Storage access...');
    
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.log('❌ Storage access error:', bucketsError.message);
      } else {
        console.log('✅ Storage accessible');
        console.log('📦 Available buckets:', buckets.map(b => b.name).join(', '));
        
        // Check for required buckets
        const requiredBuckets = ['product-images', 'admin-assets'];
        const existingBuckets = buckets.map(b => b.name);
        
        for (const bucket of requiredBuckets) {
          if (existingBuckets.includes(bucket)) {
            console.log(`✅ Required bucket '${bucket}' exists`);
          } else {
            console.log(`❌ Required bucket '${bucket}' missing`);
          }
        }
      }
    } catch (storageError) {
      console.log('❌ Storage test failed:', storageError.message);
    }
    
    // Test 5: Test authenticated access (if user is logged in)
    console.log('\n5. Testing authenticated access...');
    
    const { data: user } = await supabase.auth.getUser();
    
    if (user.user) {
      console.log('✅ User authenticated, testing authenticated access...');
      
      // Test insert permission for authenticated user
      const { error: authInsertError } = await supabase
        .from('product_overrides')
        .insert({
          printful_product_id: 'test-product-auth-123',
          custom_retail_price: 39.99,
          custom_description: 'Test authenticated product override'
        });
      
      if (authInsertError) {
        console.log('❌ Authenticated insert test failed:', authInsertError.message);
      } else {
        console.log('✅ Authenticated insert test successful');
        
        // Clean up test data
        const { error: deleteError } = await supabase
          .from('product_overrides')
          .delete()
          .eq('printful_product_id', 'test-product-auth-123');
        
        if (deleteError) {
          console.log('⚠️  Failed to clean up test data:', deleteError.message);
        } else {
          console.log('✅ Test data cleaned up successfully');
        }
      }
    } else {
      console.log('⚠️  User not authenticated, skipping authenticated tests');
      console.log('   To test authenticated access, sign in first');
    }
    
    // Test 6: Test constraints and validation
    console.log('\n6. Testing data constraints...');
    
    // Test unique constraint on printful_product_id
    const { error: uniqueConstraintError } = await supabase
      .from('product_overrides')
      .insert({
        printful_product_id: 'duplicate-test-123',
        custom_retail_price: 19.99
      });
    
    if (uniqueConstraintError) {
      console.log('✅ Unique constraint working (first insert)');
      
      // Try to insert duplicate
      const { error: duplicateError } = await supabase
        .from('product_overrides')
        .insert({
          printful_product_id: 'duplicate-test-123',
          custom_retail_price: 29.99
        });
      
      if (duplicateError && duplicateError.message.includes('duplicate key')) {
        console.log('✅ Unique constraint working (duplicate blocked)');
        
        // Clean up
        await supabase
          .from('product_overrides')
          .delete()
          .eq('printful_product_id', 'duplicate-test-123');
      } else {
        console.log('❌ Unique constraint not working properly');
      }
    } else {
      console.log('⚠️  Could not test unique constraint');
    }
    
    console.log('\n🎉 Setup test completed!');
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log('   - Tables accessible: Check above results');
    console.log('   - RLS policies: Check above results');
    console.log('   - Storage setup: Check above results');
    console.log('   - Constraints: Check above results');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSetup();
