#!/usr/bin/env npx tsx

/**
 * Test Remote Variant Insertion
 * 
 * This script tests variant insertion directly on the remote database
 * to diagnose why the sync function isn't creating variants.
 */

import { createClient } from '@supabase/supabase-js';

// Remote database credentials
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVariantInsertion() {
  try {
    console.log('🧪 Testing variant insertion on remote database...');

    // First, get a product to work with
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);

    if (productsError || !products || products.length === 0) {
      console.error('❌ No products found:', productsError);
      return;
    }

    const testProduct = products[0];
    console.log(`🎯 Using product: ${testProduct.name} (${testProduct.id})`);

    // Test variant data that matches the sync function structure
    const testVariants = [
      {
        product_id: testProduct.id,
        name: 'Black T-Shirt - S',
        value: 'Black-S',
        color: 'Black',
        size: 'S',
        printful_variant_id: '4012',
        price: 19.99,
        in_stock: true,
        is_available: true
      },
      {
        product_id: testProduct.id,
        name: 'White T-Shirt - M',
        value: 'White-M',
        color: 'White',
        size: 'M',
        printful_variant_id: '4013',
        price: 19.99,
        in_stock: true,
        is_available: true
      }
    ];

    console.log(`🔄 Attempting to insert ${testVariants.length} test variants...`);

    // Try batch insert
    const { data: insertResult, error: insertError } = await supabase
      .from('product_variants')
      .insert(testVariants)
      .select();

    if (insertError) {
      console.error('❌ Batch insert failed:', insertError);
      
      // Try individual inserts to narrow down the issue
      console.log('\\n🔍 Trying individual inserts to diagnose...');
      
      for (let i = 0; i < testVariants.length; i++) {
        const variant = testVariants[i];
        console.log(`\\n🧪 Testing variant ${i + 1}: ${variant.name}`);
        
        try {
          const { data: singleResult, error: singleError } = await supabase
            .from('product_variants')
            .insert([variant])
            .select();

          if (singleError) {
            console.error(`❌ Individual insert ${i + 1} failed:`, singleError);
          } else {
            console.log(`✅ Individual insert ${i + 1} succeeded:`, singleResult?.[0]?.id);
          }
        } catch (err) {
          console.error(`💥 Individual insert ${i + 1} exception:`, err);
        }
      }
    } else {
      console.log(`✅ Successfully inserted ${insertResult?.length || 0} variants!`);
      insertResult?.forEach((variant, i) => {
        console.log(`  ${i + 1}. ${variant.name} (ID: ${variant.id})`);
      });
      
      // Clean up test variants
      if (insertResult && insertResult.length > 0) {
        const variantIds = insertResult.map(v => v.id);
        await supabase
          .from('product_variants')
          .delete()
          .in('id', variantIds);
        console.log('🧹 Cleaned up test variants');
      }
    }

    // Test the exact structure from the mock data
    console.log('\\n🔬 Testing with mock data structure...');
    
    // Load a sample from TshirtVariants like the sync function does
    const mockVariant = {
      product_id: testProduct.id,
      name: 'Black Unisex T-Shirt - S',
      value: 'Black-S',
      color: 'Black',
      size: 'S',
      printful_variant_id: '4012', // This should be numeric string like in real data
      price: 15.95,
      in_stock: true,
      is_available: true
    };

    const { data: mockResult, error: mockError } = await supabase
      .from('product_variants')
      .insert([mockVariant])
      .select();

    if (mockError) {
      console.error('❌ Mock variant insert failed:', mockError);
    } else {
      console.log('✅ Mock variant insert succeeded:', mockResult?.[0]?.id);
      
      // Clean up
      if (mockResult?.[0]?.id) {
        await supabase
          .from('product_variants')
          .delete()
          .eq('id', mockResult[0].id);
        console.log('🧹 Cleaned up mock variant');
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testVariantInsertion()
  .then(() => {
    console.log('\\n✅ Variant insertion test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });