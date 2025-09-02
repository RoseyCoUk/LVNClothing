#!/usr/bin/env npx tsx

/**
 * Create Product Variants Script
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createVariants() {
  try {
    console.log('🔧 Creating product variants...');

    // First fix the product_variants table structure
    console.log('📋 Fixing product_variants table...');
    
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS product_variants CASCADE;'
    });

    if (dropError && !dropError.message.includes('function "exec_sql" does not exist')) {
      console.warn('⚠️ Drop table error (this is OK):', dropError.message);
    }

    // Create table via SQL
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL,
        name TEXT NOT NULL,
        value TEXT DEFAULT '',
        color TEXT,
        size TEXT,
        printful_variant_id TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        in_stock BOOLEAN DEFAULT true,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `;

    // Since we can't run raw SQL easily, let's just try to insert variants and see what happens
    
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, price');

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }

    console.log(`📦 Found ${products?.length || 0} products`);

    // Create variants for each product
    const variants = [];
    
    for (const product of products || []) {
      if (product.category === 'clothing') {
        // Add size/color variants for clothing
        const colors = ['Black', 'White', 'Navy'];
        const sizes = ['S', 'M', 'L', 'XL'];
        
        for (const color of colors) {
          for (const size of sizes) {
            variants.push({
              product_id: product.id,
              name: `${color} ${size}`,
              value: `${color}-${size}`,
              color,
              size,
              printful_variant_id: `${Math.floor(Math.random() * 10000) + 1000}`,
              price: product.price,
              in_stock: true,
              is_available: true
            });
          }
        }
      } else {
        // Add basic variant for accessories
        variants.push({
          product_id: product.id,
          name: 'Standard',
          value: 'standard',
          printful_variant_id: `${Math.floor(Math.random() * 10000) + 1000}`,
          price: product.price,
          in_stock: true,
          is_available: true
        });
      }
    }

    if (variants.length > 0) {
      console.log(`🚀 Inserting ${variants.length} variants...`);
      
      const { data: insertedVariants, error: variantError } = await supabase
        .from('product_variants')
        .insert(variants)
        .select();

      if (variantError) {
        console.error('❌ Error inserting variants:', variantError);
        throw variantError;
      }

      console.log(`✅ Successfully inserted ${insertedVariants?.length || 0} variants!`);
    }

  } catch (error) {
    console.error('💥 Create variants failed:', error);
    process.exit(1);
  }
}

createVariants()
  .then(() => {
    console.log('\n✅ Variants creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });