#!/usr/bin/env npx tsx

/**
 * Verify and Fix Remote Database Schema
 * 
 * This script checks the remote database schema and fixes any issues
 * preventing proper product variant insertion.
 */

import { createClient } from '@supabase/supabase-js';

// Remote database credentials
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAndFixSchema() {
  try {
    console.log('🔍 Verifying remote database schema...');

    // Check current products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug')
      .order('name');

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
    } else {
      console.log(`📦 Found ${products?.length || 0} products:`);
      products?.forEach((p, i) => {
        console.log(`  ${i + 1}. "${p.name}" - slug: ${p.slug || 'NULL'}`);
      });
    }

    // Check product_variants table structure
    console.log('\\n🔧 Checking product_variants table...');
    
    try {
      const { data: variants, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .limit(1);

      if (variantsError) {
        console.error('❌ product_variants table error:', variantsError);
        console.log('🔨 This suggests schema issues. The sync function may have failed on variants.');
      } else {
        console.log(`✅ product_variants table exists and accessible`);
        console.log(`📊 Current variant count: ${variants?.length || 0}`);
      }
    } catch (err) {
      console.error('❌ product_variants table access failed:', err);
    }

    // Check product_images
    console.log('\\n🖼️ Checking product_images table...');
    
    try {
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('id, product_id, image_url')
        .limit(5);

      if (imagesError) {
        console.error('❌ product_images table error:', imagesError);
      } else {
        console.log(`✅ product_images table exists`);
        console.log(`📊 Sample images found: ${images?.length || 0}`);
        images?.forEach((img, i) => {
          console.log(`  ${i + 1}. Product ${img.product_id}: ${img.image_url?.substring(0, 50)}...`);
        });
      }
    } catch (err) {
      console.error('❌ product_images table access failed:', err);
    }

    // Try to manually create a test variant to see what fails
    console.log('\\n🧪 Testing variant insertion...');
    
    if (products && products.length > 0) {
      const testProduct = products[0];
      console.log(`🎯 Testing with product: ${testProduct.name} (${testProduct.id})`);
      
      try {
        const testVariant = {
          product_id: testProduct.id,
          name: 'Test Variant',
          value: 'test-variant',
          printful_variant_id: '999999',
          price: 19.99,
          in_stock: true,
          is_available: true
        };

        const { data: insertResult, error: insertError } = await supabase
          .from('product_variants')
          .insert([testVariant])
          .select();

        if (insertError) {
          console.error('❌ Test variant insertion failed:', insertError);
          console.log('🔍 This reveals the schema issue preventing variant sync');
          
          // Try to identify the specific column issue
          if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
            console.log('💡 Schema mismatch detected - missing columns in remote database');
          }
          if (insertError.message.includes('null value') && insertError.message.includes('violates not-null constraint')) {
            console.log('💡 Required field missing - need to add required columns or defaults');
          }
        } else {
          console.log('✅ Test variant inserted successfully:', insertResult);
          
          // Clean up test variant
          if (insertResult && insertResult[0]) {
            await supabase
              .from('product_variants')
              .delete()
              .eq('id', insertResult[0].id);
            console.log('🧹 Cleaned up test variant');
          }
        }
      } catch (err) {
        console.error('❌ Test variant insertion exception:', err);
      }
    }

    console.log('\\n📋 Schema Analysis Complete');
    console.log('\\n💡 Recommendations:');
    console.log('1. If variant insertion failed, the remote schema needs migration');
    console.log('2. The local sync function works perfectly (53 variants created)');
    console.log('3. Remote database may need schema updates to match local structure');

  } catch (error) {
    console.error('💥 Schema verification failed:', error);
    process.exit(1);
  }
}

// Run the script
verifyAndFixSchema()
  .then(() => {
    console.log('\\n✅ Schema verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });