#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCatalogVariantMapping() {
  console.log('🧪 Testing catalog variant ID mapping function...\n')

  // Test sync variant IDs from our mapping
  const testSyncIds = [
    '4938952082', // Sticker -> 10163
    '4938821287', // T-Shirt Black/S -> 4016
    '4938821288', // T-Shirt Black/M -> 4017
    '4938937571', // Cap Black -> 7854
    '4938800533', // Hoodie Black/S -> 5530
    '4937855201', // Tote Bag -> 10457
    'invalid_id'   // Should return null
  ];

  for (const syncId of testSyncIds) {
    try {
      const { data, error } = await supabase.rpc('get_catalog_variant_id', {
        sync_variant_id: syncId
      });

      if (error) {
        console.error(`❌ Error for sync ID ${syncId}:`, error);
      } else {
        const catalogId = data;
        console.log(`✅ Sync ID ${syncId} → Catalog ID ${catalogId}`);
      }
    } catch (err) {
      console.error(`❌ Exception for sync ID ${syncId}:`, err);
    }
  }

  console.log('\n🔍 Testing auto-population trigger...')
  
  // Test inserting a product variant to see if catalog_variant_id gets populated
  const testVariant = {
    product_id: '00000000-0000-0000-0000-000000000001', // Dummy UUID
    printful_variant_id: '4938821287', // Should map to 4016
    color: 'Black',
    size: 'S',
    retail_price: 24.99,
    in_stock: true,
    is_available: true
  };

  console.log('Creating test product first...');
  
  // Create a test product first
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert([{
      id: testVariant.product_id,
      name: 'Test Product',
      description: 'Test product for catalog variant mapping',
      price: 24.99,
      category: 'test'
    }])
    .select()
    .single();

  if (productError) {
    console.error('❌ Error creating test product:', productError);
    return;
  }

  console.log('✅ Test product created');

  // Insert the test variant
  const { data: variantData, error: variantError } = await supabase
    .from('product_variants')
    .insert([testVariant])
    .select()
    .single();

  if (variantError) {
    console.error('❌ Error inserting test variant:', variantError);
  } else {
    console.log('✅ Test variant inserted:');
    console.log(`   - printful_variant_id: ${variantData.printful_variant_id}`);
    console.log(`   - catalog_variant_id: ${variantData.catalog_variant_id}`);
    
    if (variantData.catalog_variant_id === 4016) {
      console.log('🎉 Auto-population trigger working correctly!');
    } else {
      console.log('❌ Auto-population trigger failed - expected 4016');
    }
  }

  // Clean up test data
  console.log('\n🧹 Cleaning up test data...');
  
  if (variantData) {
    await supabase.from('product_variants').delete().eq('id', variantData.id);
  }
  
  if (productData) {
    await supabase.from('products').delete().eq('id', productData.id);
  }
  
  console.log('✅ Test data cleaned up');
  console.log('\n✅ Catalog variant mapping test complete!');
}

// Run the test
if (import.meta.url === `file://${process.argv[1]}`) {
  testCatalogVariantMapping().catch(console.error);
}