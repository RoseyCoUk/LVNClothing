// Test script to check storage buckets
import { createClient } from '@supabase/supabase-js';

// Supabase credentials from your .env file
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageBuckets() {
  try {
    console.log('🔍 Testing Storage Buckets...');
    
    // List all buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Storage access error:', bucketsError.message);
      return;
    }
    
    console.log('✅ Storage accessible');
    console.log('📦 All available buckets:');
    
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
    });
    
    // Check for required buckets
    const requiredBuckets = ['product-images', 'admin-assets'];
    const existingBuckets = buckets.map(b => b.name);
    
    console.log('\n🔍 Checking required buckets:');
    for (const bucket of requiredBuckets) {
      if (existingBuckets.includes(bucket)) {
        console.log(`✅ Required bucket '${bucket}' exists`);
      } else {
        console.log(`❌ Required bucket '${bucket}' missing`);
        
        // Check for similar names
        const similarBuckets = existingBuckets.filter(name => 
          name.toLowerCase().includes(bucket.split('-')[0]) || 
          name.toLowerCase().includes(bucket.split('-')[1])
        );
        
        if (similarBuckets.length > 0) {
          console.log(`   💡 Similar buckets found: ${similarBuckets.join(', ')}`);
        }
      }
    }
    
    // Test bucket access
    console.log('\n🧪 Testing bucket access:');
    
    for (const bucket of existingBuckets) {
      try {
        const { data: files, error: listError } = await supabase.storage
          .from(bucket)
          .list('', { limit: 1 });
        
        if (listError) {
          console.log(`❌ Cannot access bucket '${bucket}':`, listError.message);
        } else {
          console.log(`✅ Can access bucket '${bucket}' (${files.length} files)`);
        }
      } catch (error) {
        console.log(`❌ Error accessing bucket '${bucket}':`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testStorageBuckets();
