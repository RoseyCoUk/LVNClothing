#!/usr/bin/env tsx

/**
 * Verify and Populate Product Variants Script
 * 
 * This script:
 * 1. Verifies all product variants have sync variant IDs populated
 * 2. Uses the variant files in src/hooks/*-variants.ts as source of truth
 * 3. Updates the database to ensure every variant has its printful_variant_id populated
 * 4. Provides detailed reporting on missing sync variant IDs
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { TshirtVariants } from '../src/hooks/tshirt-variants';
import { HoodieVariants } from '../src/hooks/hoodie-variants';
import { CapVariants } from '../src/hooks/cap-variants';
import { MugVariants } from '../src/hooks/mug-variants';
import { TotebagVariants } from '../src/hooks/totebag-variants';
import { WaterbottleVariants } from '../src/hooks/waterbottle-variants';
import { MousepadVariants } from '../src/hooks/mousepad-variants';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VariantMapping {
  productName: string;
  variants: Array<{
    syncVariantId: number;
    key: string;
    name: string;
    price?: string;
  }>;
}

// Product name mappings to database product names
const PRODUCT_MAPPINGS: Record<string, string> = {
  'tshirt': 'Unisex t-shirt DARK',
  'tshirt_light': 'Unisex t-shirt LIGHT', 
  'hoodie': 'Unisex Hoodie DARK',
  'hoodie_light': 'Unisex Hoodie LIGHT',
  'cap': 'Reform UK Cap',
  'mug': 'Reform UK Mug',
  'totebag': 'Reform UK Tote Bag',
  'waterbottle': 'Reform UK Water Bottle', 
  'mousepad': 'Reform UK Mouse Pad'
};

async function getProductId(productName: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('name', productName)
    .single();
    
  if (error) {
    // Try case-insensitive search
    const { data: altData } = await supabase
      .from('products')
      .select('id')
      .ilike('name', productName)
      .single();
    return altData?.id || null;
  }
  
  return data?.id || null;
}

async function getAllProductVariants() {
  const { data, error } = await supabase
    .from('product_variants')
    .select('id, product_id, printful_variant_id, value, products!inner(name)');
    
  if (error) {
    throw new Error(`Failed to get product variants: ${error.message}`);
  }
  
  return data;
}

async function updateVariantWithSyncId(variantId: string, syncVariantId: number) {
  const { error } = await supabase
    .from('product_variants')
    .update({ printful_variant_id: syncVariantId.toString() })
    .eq('id', variantId);
    
  if (error) {
    console.error(`❌ Failed to update variant ${variantId}:`, error.message);
    return false;
  }
  
  return true;
}

async function main() {
  console.log('🔍 Starting product variant verification and population...\n');
  
  // Collect all variant mappings from the variant files
  const allVariantMappings: VariantMapping[] = [
    {
      productName: PRODUCT_MAPPINGS.tshirt,
      variants: TshirtVariants.map(v => ({
        syncVariantId: v.syncVariantId,
        key: v.key,
        name: v.name,
        price: v.price
      }))
    },
    {
      productName: PRODUCT_MAPPINGS.hoodie, 
      variants: HoodieVariants.map(v => ({
        syncVariantId: v.syncVariantId,
        key: v.key,
        name: v.name,
        price: v.price
      }))
    },
    {
      productName: PRODUCT_MAPPINGS.cap,
      variants: CapVariants.map(v => ({
        syncVariantId: v.syncVariantId,
        key: v.key,
        name: v.name,
        price: v.price
      }))
    },
    {
      productName: PRODUCT_MAPPINGS.mug,
      variants: MugVariants.map(v => ({
        syncVariantId: v.syncVariantId,
        key: v.key,
        name: v.name,
        price: v.price
      }))
    },
    {
      productName: PRODUCT_MAPPINGS.totebag,
      variants: TotebagVariants.map(v => ({
        syncVariantId: v.syncVariantId,
        key: v.key,
        name: v.name,
        price: v.price
      }))
    },
    {
      productName: PRODUCT_MAPPINGS.waterbottle,
      variants: WaterbottleVariants.map(v => ({
        syncVariantId: v.syncVariantId,
        key: v.key,
        name: v.name,
        price: v.price
      }))
    },
    {
      productName: PRODUCT_MAPPINGS.mousepad,
      variants: MousepadVariants.map(v => ({
        syncVariantId: v.syncVariantId,
        key: v.key,
        name: v.name,
        price: v.price
      }))
    }
  ];

  // Also check for LIGHT variants if they exist
  const lightTshirtProductId = await getProductId(PRODUCT_MAPPINGS.tshirt_light);
  const lightHoodieProductId = await getProductId(PRODUCT_MAPPINGS.hoodie_light);
  
  if (lightTshirtProductId) {
    // For light t-shirts, we need to map them appropriately
    // This would require additional variant files or mappings
    console.log('ℹ️  Light t-shirt product found but no separate variant file - using DARK variants as fallback');
  }
  
  if (lightHoodieProductId) {
    console.log('ℹ️  Light hoodie product found but no separate variant file - using DARK variants as fallback');
  }

  console.log(`📊 Loaded variant mappings for ${allVariantMappings.length} products:`);
  allVariantMappings.forEach(mapping => {
    console.log(`  - ${mapping.productName}: ${mapping.variants.length} variants`);
  });
  
  console.log(`\n📈 Total variants to verify: ${allVariantMappings.reduce((total, m) => total + m.variants.length, 0)}\n`);

  // Get all existing product variants from database
  console.log('🔄 Fetching existing product variants from database...');
  const dbVariants = await getAllProductVariants();
  console.log(`📋 Found ${dbVariants.length} existing variants in database\n`);

  let updatedCount = 0;
  let missingProducts = 0;
  let skippedVariants = 0;
  let totalProcessed = 0;
  
  // Process each product mapping
  for (const mapping of allVariantMappings) {
    console.log(`\n🎯 Processing ${mapping.productName}...`);
    
    const productId = await getProductId(mapping.productName);
    if (!productId) {
      console.log(`❌ Product not found in database: ${mapping.productName}`);
      missingProducts++;
      continue;
    }
    
    console.log(`✅ Found product ID: ${productId}`);
    
    // Get all variants for this product from database
    const productVariants = dbVariants.filter(v => v.product_id === productId);
    console.log(`📊 Database has ${productVariants.length} variants for this product`);
    
    // For each variant mapping, try to find and update the corresponding database variant
    for (const variantMapping of mapping.variants) {
      totalProcessed++;
      
      // Try to find matching variant in database by sync variant ID first
      let dbVariant = productVariants.find(v => v.printful_variant_id === variantMapping.syncVariantId.toString());
      
      if (!dbVariant) {
        // Try to match by variant key in the value field
        dbVariant = productVariants.find(v => v.value === variantMapping.key);
      }
      
      if (!dbVariant) {
        // Try to match by variant name
        dbVariant = productVariants.find(v => v.value === variantMapping.name);
      }
      
      if (dbVariant) {
        if (!dbVariant.printful_variant_id || dbVariant.printful_variant_id !== variantMapping.syncVariantId.toString()) {
          // Update the variant with sync variant ID
          const success = await updateVariantWithSyncId(dbVariant.id, variantMapping.syncVariantId);
          if (success) {
            updatedCount++;
            console.log(`  ✅ Updated variant ${variantMapping.key} -> sync ID ${variantMapping.syncVariantId}`);
          }
        } else {
          console.log(`  ✓ Variant ${variantMapping.key} already has correct sync ID ${variantMapping.syncVariantId}`);
        }
      } else {
        console.log(`  ❌ No database variant found for sync ID ${variantMapping.syncVariantId} (${variantMapping.key})`);
        skippedVariants++;
      }
    }
  }

  // Final verification - check how many variants still lack sync IDs
  console.log('\n🔍 Final verification...');
  const finalDbVariants = await getAllProductVariants();
  const variantsWithoutSyncId = finalDbVariants.filter(v => !v.printful_variant_id);
  
  console.log('\n📊 SUMMARY REPORT:');
  console.log('═'.repeat(50));
  console.log(`Total variants processed: ${totalProcessed}`);
  console.log(`Successfully updated: ${updatedCount}`);
  console.log(`Already had correct sync ID: ${totalProcessed - updatedCount - skippedVariants}`);
  console.log(`Could not find in database: ${skippedVariants}`);
  console.log(`Missing products: ${missingProducts}`);
  console.log(`\nDatabase status:`);
  console.log(`Total variants in database: ${finalDbVariants.length}`);
  console.log(`Variants with sync ID: ${finalDbVariants.length - variantsWithoutSyncId.length}`);
  console.log(`Variants missing sync ID: ${variantsWithoutSyncId.length}`);
  
  if (variantsWithoutSyncId.length > 0) {
    console.log('\n⚠️  Variants still missing sync IDs:');
    variantsWithoutSyncId.forEach(v => {
      const productName = (v as any).products?.name || 'Unknown';
      console.log(`  - ${productName}: ${v.value || v.id} (ID: ${v.id})`);
    });
  }
  
  if (updatedCount > 0) {
    console.log(`\n🎉 Successfully populated ${updatedCount} variants with sync IDs!`);
  }
  
  if (variantsWithoutSyncId.length === 0) {
    console.log('\n✅ All variants now have sync IDs populated!');
  }
  
  console.log('\n✅ Verification and population complete!');
}

// Run the script if called directly
main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});