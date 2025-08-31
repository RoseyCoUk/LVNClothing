#!/usr/bin/env node

/**
 * Script to populate missing color, color_hex, and size data in product_variants table
 * Uses the Printful catalog data to extract variant information
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration - load from environment variables directly
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Printful catalog data extracted from the document
const PRINTFUL_CATALOG_DATA: Record<string, { color: string; color_hex: string | null; size: string | null }> = {
  // Hoodie DARK variants
  '68a9d381e56616': { color: 'Black', color_hex: '#0b0b0b', size: 'S' },
  '68a9d381e56696': { color: 'Black', color_hex: '#0b0b0b', size: 'M' },
  '68a9d381e566e2': { color: 'Black', color_hex: '#0b0b0b', size: 'L' },
  '68a9d381e56741': { color: 'Black', color_hex: '#0b0b0b', size: 'XL' },
  '68a9d381e56797': { color: 'Black', color_hex: '#0b0b0b', size: '2XL' },
  
  '68a9d381e56b11': { color: 'Dark Heather', color_hex: '#47484d', size: 'S' },
  '68a9d381e56b63': { color: 'Dark Heather', color_hex: '#47484d', size: 'M' },
  '68a9d381e56ba3': { color: 'Dark Heather', color_hex: '#47484d', size: 'L' },
  '68a9d381e56bf2': { color: 'Dark Heather', color_hex: '#47484d', size: 'XL' },
  '68a9d381e56c57': { color: 'Dark Heather', color_hex: '#47484d', size: '2XL' },
  
  '68a9d381e56ca1': { color: 'Indigo Blue', color_hex: '#395d82', size: 'S' },
  '68a9d381e56cf5': { color: 'Indigo Blue', color_hex: '#395d82', size: 'M' },
  '68a9d381e56d44': { color: 'Indigo Blue', color_hex: '#395d82', size: 'L' },
  '68a9d381e56d98': { color: 'Indigo Blue', color_hex: '#395d82', size: 'XL' },
  '68a9d381e56de2': { color: 'Indigo Blue', color_hex: '#395d82', size: '2XL' },
  
  '68a9d381e567e5': { color: 'Navy', color_hex: '#131928', size: 'S' },
  '68a9d381e56833': { color: 'Navy', color_hex: '#131928', size: 'M' },
  '68a9d381e56881': { color: 'Navy', color_hex: '#131928', size: 'L' },
  '68a9d381e568d2': { color: 'Navy', color_hex: '#131928', size: 'XL' },
  '68a9d381e56925': { color: 'Navy', color_hex: '#131928', size: '2XL' },
  
  '68a9d381e56976': { color: 'Red', color_hex: '#da0a1a', size: 'S' },
  '68a9d381e569c2': { color: 'Red', color_hex: '#da0a1a', size: 'M' },
  '68a9d381e56a15': { color: 'Red', color_hex: '#da0a1a', size: 'L' },
  '68a9d381e56a63': { color: 'Red', color_hex: '#da0a1a', size: 'XL' },
  '68a9d381e56ac9': { color: 'Red', color_hex: '#da0a1a', size: '2XL' },

  // Hoodie LIGHT variants
  '68a9d27b158456': { color: 'Light Blue', color_hex: '#a1c5e1', size: 'S' },
  '68a9d27b1584a1': { color: 'Light Blue', color_hex: '#a1c5e1', size: 'M' },
  '68a9d27b1584e2': { color: 'Light Blue', color_hex: '#a1c5e1', size: 'L' },
  '68a9d27b158534': { color: 'Light Blue', color_hex: '#a1c5e1', size: 'XL' },
  '68a9d27b158581': { color: 'Light Blue', color_hex: '#a1c5e1', size: '2XL' },
  
  '68a9d27b158626': { color: 'Light Pink', color_hex: '#f3d4e3', size: 'S' },
  '68a9d27b158663': { color: 'Light Pink', color_hex: '#f3d4e3', size: 'M' },
  '68a9d27b1586b2': { color: 'Light Pink', color_hex: '#f3d4e3', size: 'L' },
  '68a9d27b158707': { color: 'Light Pink', color_hex: '#f3d4e3', size: 'XL' },
  '68a9d27b158746': { color: 'Light Pink', color_hex: '#f3d4e3', size: '2XL' },
  
  '68a9d27b1582a6': { color: 'Sport Grey', color_hex: '#9b969c', size: 'S' },
  '68a9d27b158311': { color: 'Sport Grey', color_hex: '#9b969c', size: 'M' },
  '68a9d27b158375': { color: 'Sport Grey', color_hex: '#9b969c', size: 'L' },
  '68a9d27b1583b6': { color: 'Sport Grey', color_hex: '#9b969c', size: 'XL' },
  '68a9d27b158405': { color: 'Sport Grey', color_hex: '#9b969c', size: '2XL' },
  
  '68a9d27b158796': { color: 'White', color_hex: '#ffffff', size: 'S' },
  '68a9d27b1587d6': { color: 'White', color_hex: '#ffffff', size: 'M' },
  '68a9d27b158827': { color: 'White', color_hex: '#ffffff', size: 'L' },
  '68a9d27b158863': { color: 'White', color_hex: '#ffffff', size: 'XL' },
  '68a9d27b1588b1': { color: 'White', color_hex: '#ffffff', size: '2XL' },

  // T-shirt DARK variants
  '68a9daac4dcb25': { color: 'Army', color_hex: '#5f5849', size: 'S' },
  '68a9daac4dcb79': { color: 'Army', color_hex: '#5f5849', size: 'M' },
  '68a9daac4dcbc1': { color: 'Army', color_hex: '#5f5849', size: 'L' },
  '68a9daac4dcc04': { color: 'Army', color_hex: '#5f5849', size: 'XL' },
  '68a9daac4dcc52': { color: 'Army', color_hex: '#5f5849', size: '2XL' },
  
  '68a9daac4dc997': { color: 'Asphalt', color_hex: '#52514f', size: 'S' },
  '68a9daac4dc9e2': { color: 'Asphalt', color_hex: '#52514f', size: 'M' },
  '68a9daac4dca33': { color: 'Asphalt', color_hex: '#52514f', size: 'L' },
  '68a9daac4dca85': { color: 'Asphalt', color_hex: '#52514f', size: 'XL' },
  '68a9daac4dcad1': { color: 'Asphalt', color_hex: '#52514f', size: '2XL' },
  
  '68a9daac4dce36': { color: 'Autumn', color_hex: '#c85313', size: 'S' },
  '68a9daac4dce81': { color: 'Autumn', color_hex: '#c85313', size: 'M' },
  '68a9daac4dcee9': { color: 'Autumn', color_hex: '#c85313', size: 'L' },
  '68a9daac4dcf23': { color: 'Autumn', color_hex: '#c85313', size: 'XL' },
  '68a9daac4dcf77': { color: 'Autumn', color_hex: '#c85313', size: '2XL' },
  
  '68a9daac4dc349': { color: 'Black', color_hex: '#0c0c0c', size: 'S' },
  '68a9daac4dc395': { color: 'Black', color_hex: '#0c0c0c', size: 'M' },
  '68a9daac4dc3e8': { color: 'Black', color_hex: '#0c0c0c', size: 'L' },
  '68a9daac4dc438': { color: 'Black', color_hex: '#0c0c0c', size: 'XL' },
  '68a9daac4dc482': { color: 'Black', color_hex: '#0c0c0c', size: '2XL' },
  
  '68a9daac4dc184': { color: 'Black Heather', color_hex: '#0b0b0b', size: 'S' },
  '68a9daac4dc201': { color: 'Black Heather', color_hex: '#0b0b0b', size: 'M' },
  '68a9daac4dc263': { color: 'Black Heather', color_hex: '#0b0b0b', size: 'L' },
  '68a9daac4dc2a4': { color: 'Black Heather', color_hex: '#0b0b0b', size: 'XL' },
  '68a9daac4dc2f9': { color: 'Black Heather', color_hex: '#0b0b0b', size: '2XL' },
  
  '68a9daac4dc7d6': { color: 'Dark Grey Heather', color_hex: '#3E3C3D', size: 'S' },
  '68a9daac4dc864': { color: 'Dark Grey Heather', color_hex: '#3E3C3D', size: 'M' },
  '68a9daac4dc8b2': { color: 'Dark Grey Heather', color_hex: '#3E3C3D', size: 'L' },
  '68a9d381e56d904': { color: 'Dark Grey Heather', color_hex: '#3E3C3D', size: 'XL' },
  '68a9daac4dc952': { color: 'Dark Grey Heather', color_hex: '#3E3C3D', size: '2XL' },
  
  '68a9daac4dcfd5': { color: 'Heather Deep Teal', color_hex: '#447085', size: 'S' },
  '68a9daac4dd018': { color: 'Heather Deep Teal', color_hex: '#447085', size: 'M' },
  '68a9daac4dd068': { color: 'Heather Deep Teal', color_hex: '#447085', size: 'L' },
  '68a9daac4dd0b3': { color: 'Heather Deep Teal', color_hex: '#447085', size: 'XL' },
  '68a9daac4dd102': { color: 'Heather Deep Teal', color_hex: '#447085', size: '2XL' },
  
  '68a9daac4dd149': { color: 'Mauve', color_hex: '#bf6e6e', size: 'S' },
  '68a9daac4dd197': { color: 'Mauve', color_hex: '#bf6e6e', size: 'M' },
  '68a9daac4dd1e9': { color: 'Mauve', color_hex: '#bf6e6e', size: 'L' },
  '68a9daac4dd236': { color: 'Mauve', color_hex: '#bf6e6e', size: 'XL' },
  '68a9daac4dd283': { color: 'Mauve', color_hex: '#bf6e6e', size: '2XL' },
  
  '68a9daac4dc4c4': { color: 'Navy', color_hex: '#212642', size: 'S' },
  '68a9daac4dc511': { color: 'Army', color_hex: '#212642', size: 'M' },
  '68a9daac4dc564': { color: 'Navy', color_hex: '#212642', size: 'L' },
  '68a9daac4dc5b7': { color: 'Navy', color_hex: '#212642', size: 'XL' },
  '68a9daac4dc603': { color: 'Navy', color_hex: '#212642', size: '2XL' },
  
  '68a9daac4dccb2': { color: 'Olive', color_hex: '#5b642f', size: 'S' },
  '68a9daac4dccf5': { color: 'Olive', color_hex: '#5b642f', size: 'M' },
  '68a9daac4dcd47': { color: 'Olive', color_hex: '#5b642f', size: 'L' },
  '68a9daac4dcd98': { color: 'Olive', color_hex: '#5b642f', size: 'XL' },
  '68a9daac4dcde6': { color: 'Olive', color_hex: '#5b642f', size: '2XL' },
  
  '68a9daac4dc655': { color: 'Red', color_hex: '#d0071e', size: 'S' },
  '68a9daac4dc6a7': { color: 'Red', color_hex: '#d0071e', size: 'M' },
  '68a9daac4dc6f4': { color: 'Red', color_hex: '#d0071e', size: 'L' },
  '68a9daac4dc738': { color: 'Red', color_hex: '#d0071e', size: 'XL' },
  '68a9daac4dc784': { color: 'Red', color_hex: '#d0071e', size: '2XL' },
  
  '68a9daac4dd2d1': { color: 'Steel Blue', color_hex: '#668ea7', size: 'S' },
  '68a9daac4dd321': { color: 'Steel Blue', color_hex: '#668ea7', size: 'M' },
  '68a9daac4dd376': { color: 'Steel Blue', color_hex: '#668ea7', size: 'L' },
  '68a9daac4dd3c2': { color: 'Steel Blue', color_hex: '#668ea7', size: 'XL' },
  '68a9daac4dd416': { color: 'Steel Blue', color_hex: '#668ea7', size: '2XL' },

  // T-shirt LIGHT variants
  '68a9d8c287c311': { color: 'Ash', color_hex: '#f0f1ea', size: 'S' },
  '68a9d8c287c367': { color: 'Ash', color_hex: '#f0f1ea', size: 'M' },
  '68a9d8c287c3b2': { color: 'Ash', color_hex: '#f0f1ea', size: 'L' },
  '68a9d8c287c409': { color: 'Ash', color_hex: '#f0f1ea', size: 'XL' },
  '68a9d8c287c443': { color: 'Ash', color_hex: '#f0f1ea', size: '2XL' },
  
  '68a9d8c287bea5': { color: 'Athletic Heather', color_hex: '#cececc', size: 'S' },
  '68a9d8c287bee3': { color: 'Athletic Heather', color_hex: '#cececc', size: 'M' },
  '68a9d8c287bf32': { color: 'Athletic Heather', color_hex: '#cececc', size: 'L' },
  '68a9d8c287bf85': { color: 'Athletic Heather', color_hex: '#cececc', size: 'XL' },
  '68a9d8c287bfc6': { color: 'Athletic Heather', color_hex: '#cececc', size: '2XL' },
  
  '68a9d8c287c195': { color: 'Heather Dust', color_hex: '#e5d9c9', size: 'S' },
  '68a9d8c287c1e1': { color: 'Heather Dust', color_hex: '#e5d9c9', size: 'M' },
  '68a9d8c287c226': { color: 'Heather Dust', color_hex: '#e5d9c9', size: 'L' },
  '68a9d8c287c272': { color: 'Heather Dust', color_hex: '#e5d9c9', size: 'XL' },
  '68a9d8c287c2c5': { color: 'Heather Dust', color_hex: '#e5d9c9', size: '2XL' },
  
  '68a9d8c287bba4': { color: 'Heather Prism Peach', color_hex: '#f3c2b2', size: 'S' },
  '68a9d8c287bbe7': { color: 'Heather Prism Peach', color_hex: '#f3c2b2', size: 'M' },
  '68a9d8c287bc39': { color: 'Heather Prism Peach', color_hex: '#f3c2b2', size: 'L' },
  '68a9d8c287bc83': { color: 'Heather Prism Peach', color_hex: '#f3c2b2', size: 'XL' },
  '68a9d8c287bcd5': { color: 'Heather Prism Peach', color_hex: '#f3c2b2', size: '2XL' },
  
  '68a9d8c287b9e7': { color: 'Mustard', color_hex: '#eda027', size: 'S' },
  '68a9d8c287ba54': { color: 'Mustard', color_hex: '#eda027', size: 'M' },
  '68a9d8c287bab6': { color: 'Mustard', color_hex: '#eda027', size: 'L' },
  '68a9d8c287bb05': { color: 'Mustard', color_hex: '#eda027', size: 'XL' },
  '68a9d8c287bb52': { color: 'Mustard', color_hex: '#eda027', size: '2XL' },
  
  '68a9d8c287bd24': { color: 'Pink', color_hex: '#fdbfc7', size: 'S' },
  '68a9d8c287bd79': { color: 'Pink', color_hex: '#fdbfc7', size: 'M' },
  '68a9d8c287bdc6': { color: 'Pink', color_hex: '#fdbfc7', size: 'L' },
  '68a9d8c287be03': { color: 'Pink', color_hex: '#fdbfc7', size: 'XL' },
  '68a9d8c287be52': { color: 'Pink', color_hex: '#fdbfc7', size: '2XL' },
  
  '68a9d8c287c495': { color: 'White', color_hex: '#ffffff', size: 'S' },
  '68a9d8c287c4e9': { color: 'White', color_hex: '#ffffff', size: 'M' },
  '68a9d8c287c535': { color: 'White', color_hex: '#ffffff', size: 'L' },
  '68a9d8c287c584': { color: 'White', color_hex: '#ffffff', size: 'XL' },
  '68a9d8c287c5d4': { color: 'White', color_hex: '#ffffff', size: '2XL' },
  
  '68a9d8c287c017': { color: 'Yellow', color_hex: '#ffd667', size: 'S' },
  '68a9d8c287c063': { color: 'Yellow', color_hex: '#ffd667', size: 'M' },
  '68a9d8c287c0b3': { color: 'Yellow', color_hex: '#ffd667', size: 'L' },
  '68a9d8c287c0f2': { color: 'Yellow', color_hex: '#ffd667', size: 'XL' },
  '68a9d8c287c149': { color: 'Yellow', color_hex: '#ffd667', size: '2XL' },

  // Cap variants (no sizes)
  '68a9f52cc3d834': { color: 'Black', color_hex: '#181717', size: null },
  '68a9f52cc3d8f7': { color: 'Dark Grey', color_hex: '#39353a', size: null },
  '68a9f52cc3d939': { color: 'Khaki', color_hex: '#b49771', size: null },
  '68a9f52cc3da28': { color: 'Light Blue', color_hex: '#b5cbda', size: null },
  '68a9f52cc3d899': { color: 'Navy', color_hex: '#182031', size: null },
  '68a9f52cc3d9d7': { color: 'Pink', color_hex: '#fab2ba', size: null },
  '68a9f52cc3d988': { color: 'Stone', color_hex: '#d6bdad', size: null },
  '68a9f52cc3da68': { color: 'White', color_hex: '#ffffff', size: null },

  // Other products (single variants)
  '68a9f9b78dd6d8': { color: 'Default', color_hex: null, size: null }, // Sticker
  '68a9f81d60c2b4': { color: 'White', color_hex: '#ffffff', size: null }, // Mug
  '68a9f6e8eeb689': { color: 'White', color_hex: '#ffffff', size: null }, // Mouse Pad
  '68a9f6414ae5b8': { color: 'Stainless Steel', color_hex: null, size: null }, // Water Bottle
  '68a8a3b526d2f1': { color: 'Black', color_hex: '#000000', size: null }, // Tote Bag
};

/**
 * Main function to populate variant data
 */
async function populateVariantData() {
  console.log('🚀 Starting variant data population...');
  
  try {
    // Get all variants from the database
    const { data: variants, error: fetchError } = await supabase
      .from('product_variants')
      .select('id, printful_variant_id, color, color_hex, size')
      .order('id');

    if (fetchError) {
      throw new Error(`Failed to fetch variants: ${fetchError.message}`);
    }

    console.log(`📊 Found ${variants.length} variants in database`);

    // Track statistics
    let updatedCount = 0;
    let skippedCount = 0;
    let errors: Array<{ variantId: string; error: string }> = [];

    // Process each variant
    for (const variant of variants) {
      const printfulId = variant.printful_variant_id;
      
      if (!printfulId) {
        console.log(`⚠️  Variant ${variant.id} has no printful_variant_id, skipping`);
        skippedCount++;
        continue;
      }

      // Extract the variant ID from the full printful ID
      const variantId = printfulId.split('/').pop();
      
      if (!variantId) {
        console.log(`⚠️  Could not extract variant ID from ${printfulId}, skipping`);
        skippedCount++;
        continue;
      }

      // Check if we have catalog data for this variant
      const catalogData = PRINTFUL_CATALOG_DATA[variantId];
      
      if (!catalogData) {
        console.log(`⚠️  No catalog data found for variant ${variantId}, skipping`);
        skippedCount++;
        continue;
      }

      // Check if update is needed - compare with existing JSONB data
      const currentColor = variant.color?.name || variant.color?.value || null;
      const currentColorHex = variant.color_hex?.value || variant.color_hex?.hex || null;
      const currentSize = variant.size?.name || variant.size?.value || null;

      const needsUpdate = 
        currentColor !== catalogData.color ||
        currentColorHex !== catalogData.color_hex ||
        currentSize !== catalogData.size;

      if (!needsUpdate) {
        console.log(`✅ Variant ${variantId} already up to date`);
        skippedCount++;
        continue;
      }

      // Prepare the update data in JSONB format
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (catalogData.color) {
        updateData.color = { name: catalogData.color, value: catalogData.color };
      }
      
      if (catalogData.color_hex) {
        updateData.color_hex = { hex: catalogData.color_hex, value: catalogData.color_hex };
      }
      
      if (catalogData.size) {
        updateData.size = { name: catalogData.size, value: catalogData.size };
      }

      // Update the variant
      const { error: updateError } = await supabase
        .from('product_variants')
        .update(updateData)
        .eq('id', variant.id);

      if (updateError) {
        console.error(`❌ Failed to update variant ${variantId}: ${updateError.message}`);
        errors.push({ variantId, error: updateError.message });
      } else {
        console.log(`✅ Updated variant ${variantId}: ${catalogData.color} ${catalogData.size || ''}`);
        updatedCount++;
      }
    }

    // Print summary
    console.log('\n📈 Population Summary:');
    console.log(`   Total variants: ${variants.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ variantId, error }) => {
        console.log(`   ${variantId}: ${error}`);
      });
    }

    if (updatedCount > 0) {
      console.log('\n🎉 Successfully populated variant data!');
      console.log('   The color grouping should now work correctly.');
    } else {
      console.log('\nℹ️  No updates were needed - all variants already have correct data.');
    }

  } catch (error) {
    console.error('❌ Script failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Function to show current variant data status
 */
async function showVariantStatus() {
  console.log('🔍 Checking current variant data status...');
  
  try {
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('id, printful_variant_id, color, color_hex, size')
      .order('id');

    if (error) {
      throw new Error(`Failed to fetch variants: ${error.message}`);
    }

    const totalVariants = variants.length;
    const variantsWithColor = variants.filter(v => v.color && (v.color.name || v.color.value)).length;
    const variantsWithHex = variants.filter(v => v.color_hex && (v.color_hex.hex || v.color_hex.value)).length;
    const variantsWithSize = variants.filter(v => v.size && (v.size.name || v.size.value)).length;

    console.log('\n📊 Current Variant Data Status:');
    console.log(`   Total variants: ${totalVariants}`);
    console.log(`   With color: ${variantsWithColor} (${((variantsWithColor/totalVariants)*100).toFixed(1)}%)`);
    console.log(`   With hex: ${variantsWithHex} (${((variantsWithHex/totalVariants)*100).toFixed(1)}%)`);
    console.log(`   With size: ${variantsWithSize} (${((variantsWithSize/totalVariants)*100).toFixed(1)}%)`);

    // Show sample variants
    console.log('\n📋 Sample Variants:');
    variants.slice(0, 5).forEach(variant => {
      const printfulId = variant.printful_variant_id?.split('/').pop() || 'N/A';
      const colorName = variant.color?.name || variant.color?.value || 'NULL';
      const colorHex = variant.color_hex?.hex || variant.color_hex?.value || 'NULL';
      const sizeName = variant.size?.name || variant.size?.value || 'NULL';
      console.log(`   ${printfulId}: Color=${colorName}, Hex=${colorHex}, Size=${sizeName}`);
    });

  } catch (error) {
    console.error('❌ Failed to check status:', error instanceof Error ? error.message : String(error));
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'status':
      await showVariantStatus();
      break;
    case 'populate':
      await populateVariantData();
      break;
    default:
      console.log('Usage: npx tsx scripts/populate-variant-colors-sizes.ts [command]');
      console.log('Commands:');
      console.log('  status    - Show current variant data status');
      console.log('  populate  - Populate missing variant data');
      break;
  }
}

// Run the script
main().catch(console.error);
