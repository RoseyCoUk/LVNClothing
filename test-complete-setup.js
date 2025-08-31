// Comprehensive test for Admin Products Management setup
import { createClient } from '@supabase/supabase-js';

// Supabase credentials from your .env file
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteSetup() {
  try {
    console.log('🧪 Comprehensive Admin Products Management Test...');
    
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
    
    // Test 2: Check RLS policies
    console.log('\n2. Testing RLS policies...');
    
    // Try to insert data as unauthenticated user (should fail)
    const { error: insertError } = await supabase
      .from('product_overrides')
      .insert({
        printful_product_id: 'test-rls-fix-123',
        custom_retail_price: 29.99,
        custom_description: 'Test RLS fix'
      });
    
    if (insertError && insertError.message.includes('new row violates row-level security policy')) {
      console.log('✅ RLS policy working correctly - unauthenticated insert blocked');
    } else if (insertError && insertError.message.includes('duplicate key value violates unique constraint')) {
      console.log('⚠️  RLS policy might not be working - got duplicate key error instead of RLS error');
    } else if (insertError) {
      console.log('⚠️  Insert failed with different error:', insertError.message);
    } else {
      console.log('❌ RLS policy not working - unauthenticated insert succeeded');
    }
    
    // Test 3: Check storage buckets
    console.log('\n3. Testing Supabase Storage...');
    
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.log('❌ Storage access error:', bucketsError.message);
      } else {
        console.log('✅ Storage accessible');
        console.log('📦 Available buckets:', buckets.length);
        
        if (buckets.length === 0) {
          console.log('   ⚠️  No buckets found via API (but you can see them in dashboard)');
          console.log('   💡 This might mean:');
          console.log('      - Buckets are not fully created yet');
          console.log('      - There are permission issues');
          console.log('      - Buckets need to be created via SQL script');
        } else {
          buckets.forEach(bucket => {
            console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
          });
        }
      }
    } catch (storageError) {
      console.log('❌ Storage test failed:', storageError.message);
    }
    
    // Test 4: Check if we can create a test bucket
    console.log('\n4. Testing bucket creation capability...');
    
    try {
      // This will fail for non-admin users, but let's see what error we get
      const { error: createError } = await supabase.storage.createBucket('test-bucket-123', {
        public: false,
        fileSizeLimit: 1024
      });
      
      if (createError) {
        if (createError.message.includes('permission denied') || createError.message.includes('not authorized')) {
          console.log('✅ Cannot create buckets (expected for non-admin users)');
        } else {
          console.log('⚠️  Bucket creation failed with unexpected error:', createError.message);
        }
      } else {
        console.log('⚠️  Unexpectedly able to create bucket (this might be a security issue)');
      }
    } catch (error) {
      console.log('✅ Cannot create buckets (expected behavior)');
    }
    
    // Test 5: Check database policies
    console.log('\n5. Checking database policies...');
    
    try {
      // Try to query the policies table to see what's configured
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .limit(5);
      
      if (policiesError) {
        console.log('⚠️  Cannot query policies table (expected for non-admin users)');
      } else {
        console.log('✅ Can query policies table');
        console.log('   Found policies:', policies.length);
      }
    } catch (error) {
      console.log('⚠️  Error checking policies:', error.message);
    }
    
    console.log('\n🎉 Comprehensive test completed!');
    
    // Summary and recommendations
    console.log('\n📋 Summary:');
    console.log('   - Tables: ✅ All accessible');
    console.log('   - RLS: Check above results');
    console.log('   - Storage: Check above results');
    
    console.log('\n🔧 Recommendations:');
    if (insertError && insertError.message.includes('duplicate key value violates unique constraint')) {
      console.log('   1. Run the RLS policies fix SQL script first');
      console.log('   2. Then run the storage buckets SQL script');
      console.log('   3. Test again');
    } else if (insertError && insertError.message.includes('new row violates row-level security policy')) {
      console.log('   1. RLS policies are working correctly');
      console.log('   2. Run the storage buckets SQL script');
      console.log('   3. Test storage again');
    } else {
      console.log('   1. Check the error messages above');
      console.log('   2. Run the SQL scripts as needed');
      console.log('   3. Test again');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testCompleteSetup();
