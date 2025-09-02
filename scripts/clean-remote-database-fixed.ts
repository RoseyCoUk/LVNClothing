#!/usr/bin/env npx tsx

/**
 * Clean Remote Database Script (Fixed)
 * 
 * This script completely cleans the remote database with proper foreign key handling.
 */

import { createClient } from '@supabase/supabase-js';

// Remote database credentials
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanRemoteDatabase() {
  try {
    console.log('🧹 Starting complete database cleanup...');

    // Step 1: Delete all product variants (no dependencies)
    console.log('\n🔧 Deleting all product variants...');
    const { error: variantsDeleteError, count: variantsDeleted } = await supabase
      .from('product_variants')
      .delete()
      .gte('created_at', '1900-01-01'); // Match all records

    if (variantsDeleteError) {
      console.error('❌ Error deleting variants:', variantsDeleteError);
    } else {
      console.log(`✅ Deleted ${variantsDeleted || 'all'} product variants`);
    }

    // Step 2: Delete all product images (depends on products)
    console.log('\n🖼️ Deleting all product images...');
    const { error: imagesDeleteError, count: imagesDeleted } = await supabase
      .from('product_images')
      .delete()
      .gte('created_at', '1900-01-01'); // Match all records

    if (imagesDeleteError) {
      console.error('❌ Error deleting images:', imagesDeleteError);
    } else {
      console.log(`✅ Deleted ${imagesDeleted || 'all'} product images`);
    }

    // Step 3: Delete all products (now safe)
    console.log('\n📦 Deleting all products...');
    const { error: productsDeleteError, count: productsDeleted } = await supabase
      .from('products')
      .delete()
      .gte('created_at', '1900-01-01'); // Match all records

    if (productsDeleteError) {
      console.error('❌ Error deleting products:', productsDeleteError);
    } else {
      console.log(`✅ Deleted ${productsDeleted || 'all'} products`);
    }

    // Step 4: Verify cleanup
    console.log('\n📊 Verifying cleanup...');
    
    const [productsResult, variantsResult, imagesResult] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('product_variants').select('id', { count: 'exact', head: true }),
      supabase.from('product_images').select('id', { count: 'exact', head: true })
    ]);

    const productsCount = productsResult.count || 0;
    const variantsCount = variantsResult.count || 0;
    const imagesCount = imagesResult.count || 0;

    console.log(`📦 Products remaining: ${productsCount}`);
    console.log(`🎨 Variants remaining: ${variantsCount}`);
    console.log(`🖼️ Images remaining: ${imagesCount}`);

    if (productsCount === 0 && variantsCount === 0 && imagesCount === 0) {
      console.log('\n🎉 Database cleanup successful! Ready for fresh sync.');
      return true;
    } else {
      console.log('\n⚠️ Cleanup incomplete. Some data remains.');
      return false;
    }

  } catch (error) {
    console.error('💥 Database cleanup failed:', error);
    return false;
  }
}

// Run the script
cleanRemoteDatabase()
  .then((success) => {
    if (success) {
      console.log('\n✅ Database is clean and ready for sync!');
      console.log('\n🚀 You can now run the Printful sync:');
      console.log('curl -X POST "https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-sync" \\');
      console.log('  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"');
    } else {
      console.log('\n❌ Database cleanup incomplete. Manual intervention may be needed.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });