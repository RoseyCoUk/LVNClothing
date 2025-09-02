#!/usr/bin/env tsx
/**
 * Create and populate product_variants table for local development
 * This script handles the current database schema issues and populates the data
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAndPopulate() {
  console.log('🔧 Creating and Populating Local Database...\n')

  // Step 1: Create product_variants table if it doesn't exist
  console.log('📋 Creating product_variants table...')
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.product_variants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      printful_variant_id text,
      name text,
      value text,
      color text,
      size text,
      retail_price numeric(10,2),
      printful_cost numeric(10,2),
      margin numeric(10,2),
      in_stock boolean DEFAULT true,
      is_available boolean DEFAULT true,
      image_url text,
      printful_data jsonb,
      created_at timestamptz DEFAULT timezone('utc', now()),
      updated_at timestamptz DEFAULT timezone('utc', now())
    );
    
    CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_variants_printful_id ON public.product_variants(printful_variant_id);
    
    ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can view available product variants" ON public.product_variants;
    CREATE POLICY "Users can view available product variants" ON public.product_variants
      FOR SELECT USING (is_available = true);
    
    DROP POLICY IF EXISTS "Service role can manage product variants" ON public.product_variants;  
    CREATE POLICY "Service role can manage product variants" ON public.product_variants
      FOR ALL USING (auth.role() = 'service_role');
  `
  
  const { error: createError } = await supabase.rpc('sql', { query: createTableSQL })
  if (createError) {
    console.error('❌ Failed to create table:', createError)
    return
  }
  console.log('✅ product_variants table created')

  // Step 2: Create products with dummy data (10 products as expected)
  console.log('\n📦 Creating 10 products...')
  
  const products = [
    { name: 'Reform UK T-Shirt', slug: 'reform-uk-tshirt', category: 'Apparel', retail_price: 25.00 },
    { name: 'Reform UK Hoodie', slug: 'reform-uk-hoodie', category: 'Apparel', retail_price: 45.00 },
    { name: 'Reform UK Cap', slug: 'reform-uk-cap', category: 'Accessories', retail_price: 18.00 },
    { name: 'Reform UK Tote Bag', slug: 'reform-uk-tote-bag', category: 'Accessories', retail_price: 15.00 },
    { name: 'Reform UK Water Bottle', slug: 'reform-uk-water-bottle', category: 'Accessories', retail_price: 20.00 },
    { name: 'Reform UK Mouse Pad', slug: 'reform-uk-mousepad', category: 'Accessories', retail_price: 12.00 },
    { name: 'Reform UK Mug', slug: 'reform-uk-mug', category: 'Accessories', retail_price: 14.00 },
    { name: 'Reform UK Sticker', slug: 'reform-uk-sticker', category: 'Accessories', retail_price: 3.00 },
    { name: 'Reform UK Poster', slug: 'reform-uk-poster', category: 'Accessories', retail_price: 15.00 },
    { name: 'Reform UK Pin', slug: 'reform-uk-pin', category: 'Accessories', retail_price: 8.00 }
  ]
  
  const createdProducts: any[] = []
  
  for (const product of products) {
    const { data, error } = await supabase
      .from('products')
      .upsert([product], { onConflict: 'slug' })
      .select()
    
    if (error) {
      console.error(`❌ Failed to create product ${product.name}:`, error)
    } else {
      console.log(`✅ Created product: ${product.name}`)
      if (data && data[0]) {
        createdProducts.push(data[0])
      }
    }
  }
  
  console.log(`📊 Created ${createdProducts.length} products`)

  // Step 3: Create 158 variants distributed across the 10 products
  console.log('\n📋 Creating 158 product variants...')
  
  const variants: any[] = []
  
  // T-Shirt: 40 variants (5 colors x 8 sizes)
  const tshirtColors = ['Black', 'White', 'Navy', 'Red', 'Grey']
  const tshirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']
  const tshirtProduct = createdProducts.find(p => p.slug === 'reform-uk-tshirt')
  if (tshirtProduct) {
    let variantId = 4938000000
    for (const color of tshirtColors) {
      for (const size of tshirtSizes) {
        variants.push({
          product_id: tshirtProduct.id,
          printful_variant_id: variantId.toString(),
          name: 'Variant',
          value: `${color} / ${size}`,
          color,
          size,
          retail_price: 25.00,
          printful_cost: 12.50,
          margin: 12.50
        })
        variantId++
      }
    }
  }
  
  // Hoodie: 35 variants (5 colors x 7 sizes)
  const hoodieColors = ['Black', 'Navy', 'Grey', 'White', 'Maroon']
  const hoodieSizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL']
  const hoodieProduct = createdProducts.find(p => p.slug === 'reform-uk-hoodie')
  if (hoodieProduct) {
    let variantId = 4938100000
    for (const color of hoodieColors) {
      for (const size of hoodieSizes) {
        variants.push({
          product_id: hoodieProduct.id,
          printful_variant_id: variantId.toString(),
          name: 'Variant',
          value: `${color} / ${size}`,
          color,
          size,
          retail_price: 45.00,
          printful_cost: 22.50,
          margin: 22.50
        })
        variantId++
      }
    }
  }
  
  // Cap: 8 variants (8 colors)
  const capColors = ['Black', 'Navy', 'White', 'Red', 'Grey', 'Khaki', 'Green', 'Blue']
  const capProduct = createdProducts.find(p => p.slug === 'reform-uk-cap')
  if (capProduct) {
    let variantId = 4938200000
    for (const color of capColors) {
      variants.push({
        product_id: capProduct.id,
        printful_variant_id: variantId.toString(),
        name: 'Color',
        value: color,
        color,
        size: 'One Size',
        retail_price: 18.00,
        printful_cost: 9.00,
        margin: 9.00
      })
      variantId++
    }
  }
  
  // Distribute remaining variants across other products to reach 158 total
  const remainingProducts = createdProducts.filter(p => 
    !['reform-uk-tshirt', 'reform-uk-hoodie', 'reform-uk-cap'].includes(p.slug)
  )
  
  let currentVariantId = 4938300000
  const remainingVariantCount = 158 - variants.length // Should be 75
  
  // Distribute remaining variants (roughly 10-11 per remaining product)
  for (let i = 0; i < remainingProducts.length && variants.length < 158; i++) {
    const product = remainingProducts[i]
    const variantsForThisProduct = Math.min(11, 158 - variants.length)
    
    for (let j = 0; j < variantsForThisProduct; j++) {
      const colors = ['Black', 'White', 'Blue', 'Red', 'Green']
      const sizes = ['S', 'M', 'L']
      
      const color = colors[j % colors.length]
      const size = j < 3 ? sizes[j] : 'One Size'
      
      variants.push({
        product_id: product.id,
        printful_variant_id: currentVariantId.toString(),
        name: 'Variant',
        value: size === 'One Size' ? color : `${color} / ${size}`,
        color,
        size,
        retail_price: product.retail_price,
        printful_cost: product.retail_price / 2,
        margin: product.retail_price / 2
      })
      currentVariantId++
    }
  }
  
  console.log(`📊 Generated ${variants.length} variants`)
  
  // Insert variants in batches
  const batchSize = 50
  let insertedCount = 0
  
  for (let i = 0; i < variants.length; i += batchSize) {
    const batch = variants.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('product_variants')
      .insert(batch)
    
    if (error) {
      console.error(`❌ Failed to insert batch ${Math.floor(i/batchSize) + 1}:`, error)
    } else {
      insertedCount += batch.length
      console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} variants`)
    }
  }
  
  console.log('\n🎯 Final Summary:')
  console.log(`📦 Products created: ${createdProducts.length}`)
  console.log(`📋 Variants inserted: ${insertedCount}`)
  console.log(`🎯 Target: 10 products, 158 variants`)
  console.log(`✅ Success: ${createdProducts.length === 10 && insertedCount === 158 ? 'PERFECT' : 'PARTIAL'}`)
}

createAndPopulate().catch(console.error)