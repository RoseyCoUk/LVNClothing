#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Use the same values from your test-printful-functions.html
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanupProductsDatabase() {
  console.log('🧹 Starting database cleanup...');
  
  try {
    // Step 1: Get current product count
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, printful_product_id');

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    console.log(`📊 Found ${products?.length || 0} existing products:`);
    products?.forEach(product => {
      console.log(`  - ${product.name} (ID: ${product.id}, Printful ID: ${product.printful_product_id})`);
    });

    if (!products || products.length === 0) {
      console.log('✅ No products found. Database is already clean.');
      return;
    }

    // Step 2: Get current variant count
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, name, value, product_id');

    if (variantsError) {
      throw new Error(`Failed to fetch variants: ${variantsError.message}`);
    }

    console.log(`📊 Found ${variants?.length || 0} existing variants`);

    // Step 3: Get current bundle count
    const { data: bundles, error: bundlesError } = await supabase
      .from('bundles')
      .select('id, name');

    if (bundlesError) {
      throw new Error(`Failed to fetch bundles: ${bundlesError.message}`);
    }

    console.log(`📊 Found ${bundles?.length || 0} existing bundles`);

    // Step 4: Confirm cleanup
    console.log('\n⚠️  WARNING: This will permanently delete all product data!');
    console.log('Products to delete:', products.length);
    console.log('Variants to delete:', variants?.length || 0);
    console.log('Bundles to delete:', bundles?.length || 0);
    
    // For safety, we'll just log what would be deleted
    // Uncomment the actual deletion code when you're ready
    console.log('\n🔒 SAFETY MODE: Only logging what would be deleted');
    console.log('To actually perform cleanup, uncomment the deletion code in this script');
    
    /*
    // Step 5: Delete variants first (due to foreign key constraints)
    if (variants && variants.length > 0) {
      console.log('🗑️  Deleting variants...');
      const { error: deleteVariantsError } = await supabase
        .from('product_variants')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all variants
      
      if (deleteVariantsError) {
        throw new Error(`Failed to delete variants: ${deleteVariantsError.message}`);
      }
      console.log('✅ Variants deleted successfully');
    }

    // Step 6: Delete bundles
    if (bundles && bundles.length > 0) {
      console.log('🗑️  Deleting bundles...');
      const { error: deleteBundlesError } = await supabase
        .from('bundles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all bundles
      
      if (deleteBundlesError) {
        throw new Error(`Failed to delete bundles: ${deleteBundlesError.message}`);
      }
      console.log('✅ Bundles deleted successfully');
    }

    // Step 7: Delete products
    console.log('🗑️  Deleting products...');
    const { error: deleteProductsError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all products
    
    if (deleteProductsError) {
      throw new Error(`Failed to delete products: ${deleteProductsError.message}`);
    }
    console.log('✅ Products deleted successfully');
    */

    console.log('\n🎯 Cleanup simulation complete!');
    console.log('To perform actual cleanup, uncomment the deletion code and run again.');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupProductsDatabase()
  .then(() => {
    console.log('✅ Cleanup script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup script failed:', error);
    process.exit(1);
  });
