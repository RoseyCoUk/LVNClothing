#!/usr/bin/env npx tsx

/**
 * Clean Remote Database Script
 * 
 * This script completely cleans the remote database and prepares it
 * for a fresh sync from Printful.
 */

import { createClient } from '@supabase/supabase-js';

// Remote database credentials
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanRemoteDatabase() {
  try {
    console.log('🧹 Starting complete database cleanup...');

    // Step 1: Delete all product variants
    console.log('\\n🔧 Deleting all product variants...');
    const { error: variantsDeleteError } = await supabase
      .from('product_variants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (variantsDeleteError) {
      console.error('❌ Error deleting variants:', variantsDeleteError);
    } else {
      console.log('✅ All product variants deleted');
    }

    // Step 2: Delete all product images
    console.log('\\n🖼️ Deleting all product images...');
    const { error: imagesDeleteError } = await supabase
      .from('product_images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (imagesDeleteError) {
      console.error('❌ Error deleting images:', imagesDeleteError);
    } else {
      console.log('✅ All product images deleted');
    }

    // Step 3: Delete all products
    console.log('\\n📦 Deleting all products...');
    const { error: productsDeleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (productsDeleteError) {
      console.error('❌ Error deleting products:', productsDeleteError);
    } else {
      console.log('✅ All products deleted');
    }

    // Step 4: Verify cleanup
    console.log('\\n📊 Verifying cleanup...');
    
    const [productsResult, variantsResult, imagesResult] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('product_variants').select('id', { count: 'exact' }),
      supabase.from('product_images').select('id', { count: 'exact' })
    ]);

    console.log(`📦 Products remaining: ${productsResult.count || 0}`);
    console.log(`🎨 Variants remaining: ${variantsResult.count || 0}`);
    console.log(`🖼️ Images remaining: ${imagesResult.count || 0}`);

    if ((productsResult.count || 0) === 0 && 
        (variantsResult.count || 0) === 0 && 
        (imagesResult.count || 0) === 0) {
      console.log('\\n🎉 Database cleanup successful! Ready for fresh sync.');
    } else {
      console.log('\\n⚠️ Cleanup incomplete. Some data remains.');
    }

  } catch (error) {
    console.error('💥 Database cleanup failed:', error);
    process.exit(1);
  }
}

// Run the script
cleanRemoteDatabase()
  .then(() => {
    console.log('\\n✅ Database cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });