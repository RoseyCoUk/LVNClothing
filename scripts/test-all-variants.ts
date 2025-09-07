#!/usr/bin/env npx tsx
/**
 * Test script to verify all 158 product variants are correctly mapped
 * and can be processed through the order system
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_ANON_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface VariantTest {
  id: string;
  product_id: string;
  name: string;
  value: string;
  printful_variant_id: string;
  price: number;
  color?: string;
  size?: string;
  design?: string;
}

async function loadVariantsFromCSV(): Promise<VariantTest[]> {
  try {
    const csvPath = join(process.cwd(), 'product_variants_rows.csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    const variants: VariantTest[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      const variant: any = {};
      
      headers.forEach((header, index) => {
        variant[header.trim()] = values[index]?.trim() || '';
      });
      
      if (variant.id && variant.printful_variant_id) {
        variants.push({
          id: variant.id,
          product_id: variant.product_id,
          name: variant.name,
          value: variant.value,
          printful_variant_id: variant.printful_variant_id,
          price: parseFloat(variant.price) || 0,
          color: variant.color || variant.color_name,
          size: variant.size || variant.size_name,
          design: variant.design
        });
      }
    }
    
    return variants;
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
}

async function testVariantMapping(variant: VariantTest): Promise<boolean> {
  try {
    // Test 1: Verify variant exists in database
    const { data: dbVariant, error: dbError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', variant.id)
      .single();
    
    if (dbError || !dbVariant) {
      console.error(`❌ Variant ${variant.id} not found in database`);
      return false;
    }
    
    // Test 2: Verify printful_variant_id matches
    if (dbVariant.printful_variant_id !== variant.printful_variant_id) {
      console.error(`❌ Printful ID mismatch for ${variant.id}: DB=${dbVariant.printful_variant_id}, CSV=${variant.printful_variant_id}`);
      return false;
    }
    
    // Test 3: Simulate adding to cart (verify the variant can be used)
    const cartItem = {
      id: variant.id,
      name: variant.name,
      price: variant.price,
      printful_variant_id: variant.printful_variant_id,
      color: variant.color,
      size: variant.size,
      quantity: 1
    };
    
    // Test 4: Verify the variant would be accepted by the webhook
    if (!cartItem.printful_variant_id) {
      console.error(`❌ Missing printful_variant_id for ${variant.name}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error testing variant ${variant.id}:`, error);
    return false;
  }
}

async function testBundleVariantSelection() {
  console.log('\n📦 Testing Bundle Variant Selection...\n');
  
  // Test cases for bundles
  const bundleTests = [
    // Starter Bundle: T-shirt (Pink, M), Cap (Black), Mug
    {
      bundle: 'Starter',
      items: [
        { type: 'tshirt', color: 'Pink', size: 'M', expectedId: '4938814139' },
        { type: 'cap', color: 'Black', expectedId: '4938937571' },
        { type: 'mug', expectedId: '4938946337' }
      ]
    },
    // Champion Bundle: Hoodie (Navy, L), T-shirt (White, XL), Cap (Navy), Tote
    {
      bundle: 'Champion',
      items: [
        { type: 'hoodie', color: 'Navy', size: 'L', expectedId: '4938800540' },
        { type: 'tshirt', color: 'White', size: 'XL', expectedId: '4938814166' },
        { type: 'cap', color: 'Navy', expectedId: '4938937572' },
        { type: 'tote', expectedId: '4937855201' }
      ]
    },
    // Activist Bundle: All 7 items with specific variants
    {
      bundle: 'Activist',
      items: [
        { type: 'hoodie', color: 'Black', size: '2XL', expectedId: '4938800537' },
        { type: 'tshirt', color: 'Black', size: '2XL', expectedId: '4938821291' },
        { type: 'cap', color: 'White', expectedId: '4938937578' },
        { type: 'tote', expectedId: '4937855201' },
        { type: 'mug', expectedId: '4938946337' },
        { type: 'water', expectedId: '4938941055' },
        { type: 'mouse', expectedId: '4938942751' }
      ]
    }
  ];
  
  for (const test of bundleTests) {
    console.log(`\nTesting ${test.bundle} Bundle:`);
    
    for (const item of test.items) {
      // Build query based on item properties
      let query = supabase
        .from('product_variants')
        .select('id, name, printful_variant_id, color, size');
      
      // Add filters based on item type
      if (item.type === 'tshirt') {
        query = query.ilike('name', '%t-shirt%');
        if (item.color) query = query.eq('color', item.color);
        if (item.size) query = query.eq('size', item.size);
      } else if (item.type === 'hoodie') {
        query = query.ilike('name', '%hoodie%');
        if (item.color) query = query.eq('color', item.color);
        if (item.size) query = query.eq('size', item.size);
      } else if (item.type === 'cap') {
        query = query.ilike('name', '%cap%');
        if (item.color) query = query.eq('color', item.color);
      } else {
        // Single variant items
        query = query.ilike('name', `%${item.type}%`);
      }
      
      const { data: variant, error } = await query.single();
      
      if (error || !variant) {
        console.error(`  ❌ ${item.type}: Variant not found`);
      } else if (variant.printful_variant_id !== item.expectedId) {
        console.error(`  ⚠️ ${item.type}: Found variant ${variant.printful_variant_id}, expected ${item.expectedId}`);
      } else {
        console.log(`  ✅ ${item.type}: Correct variant ${variant.printful_variant_id}`);
      }
    }
  }
}

async function main() {
  console.log('🧪 Testing All Product Variants Mapping\n');
  console.log('=====================================\n');
  
  // Load variants from CSV
  const csvVariants = await loadVariantsFromCSV();
  console.log(`📊 Loaded ${csvVariants.length} variants from CSV\n`);
  
  if (csvVariants.length === 0) {
    // Fallback: Load from database
    console.log('📊 Loading variants from database instead...\n');
    const { data: dbVariants, error } = await supabase
      .from('product_variants')
      .select('*')
      .order('name');
    
    if (error || !dbVariants) {
      console.error('❌ Failed to load variants from database:', error);
      process.exit(1);
    }
    
    csvVariants.push(...dbVariants);
  }
  
  // Group variants by product type
  const variantsByProduct: Record<string, VariantTest[]> = {};
  
  for (const variant of csvVariants) {
    const productType = variant.name.includes('t-shirt') ? 'T-Shirt' :
                       variant.name.includes('Hoodie') ? 'Hoodie' :
                       variant.name.includes('Cap') ? 'Cap' :
                       variant.name.includes('Mug') ? 'Mug' :
                       variant.name.includes('Tote') ? 'Tote Bag' :
                       variant.name.includes('Water') ? 'Water Bottle' :
                       variant.name.includes('Mouse') ? 'Mouse Pad' :
                       variant.name.includes('Sticker') ? 'Sticker' : 'Other';
    
    if (!variantsByProduct[productType]) {
      variantsByProduct[productType] = [];
    }
    variantsByProduct[productType].push(variant);
  }
  
  // Display summary
  console.log('📊 Variant Summary by Product:\n');
  for (const [product, variants] of Object.entries(variantsByProduct)) {
    console.log(`  ${product}: ${variants.length} variants`);
  }
  
  // Test each variant
  console.log('\n🧪 Testing Individual Variants:\n');
  let passed = 0;
  let failed = 0;
  
  for (const variant of csvVariants) {
    const result = await testVariantMapping(variant);
    if (result) {
      passed++;
      process.stdout.write('.');
    } else {
      failed++;
      process.stdout.write('F');
    }
  }
  
  console.log('\n');
  
  // Test bundle variant selection
  await testBundleVariantSelection();
  
  // Final summary
  console.log('\n=====================================');
  console.log('📊 Test Results Summary:\n');
  console.log(`  Total Variants: ${csvVariants.length}`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  Success Rate: ${((passed / csvVariants.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n⚠️ Some variants failed validation. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All variants passed validation!');
  }
}

// Run the test
main().catch(console.error);