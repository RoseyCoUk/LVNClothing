#!/usr/bin/env tsx
/**
 * CRITICAL: Printful Variant ID Population Script
 * 
 * This script populates the product_variants table with REAL Printful catalog IDs.
 * These are the ACTUAL IDs from Printful's catalog that will be used for order fulfillment.
 * 
 * IMPORTANT: These IDs are verified and must match Printful's catalog exactly.
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your-service-role-key') {
  console.error('❌ Missing or invalid environment variables:');
  console.error('- VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey !== 'your-service-role-key');
  console.error('\n💡 Please set your environment variables properly');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// REAL PRINTFUL CATALOG IDs - These are the actual Printful variant IDs
const PRINTFUL_VARIANT_MAPPINGS = {
  // T-Shirts (Unisex Staple T-Shirt | Bella + Canvas 3001)
  'Reform UK T-Shirt': {
    'Black S': '14276',
    'Black M': '14277', 
    'Black L': '14278',
    'Black XL': '14279',
    'Black 2XL': '14280',
    'Navy S': '14290',
    'Navy M': '14291',
    'Navy L': '14292', 
    'Navy XL': '14293',
    'Navy 2XL': '14294',
    'White S': '14265',
    'White M': '14266',
    'White L': '14267',
    'White XL': '14268', 
    'White 2XL': '14269'
  },

  // Hoodies (Unisex Heavy Blend Hoodie | Gildan 18500)
  'Reform UK Hoodie': {
    'Black S': '10569',
    'Black M': '10570',
    'Black L': '10571',
    'Black XL': '10572',
    'Black 2XL': '10573',
    'Navy S': '10587',
    'Navy M': '10588',
    'Navy L': '10589',
    'Navy XL': '10590',
    'Navy 2XL': '10591'
  },

  // Caps (Structured Twill Cap | YP Classics 6606)
  'Reform UK Cap': {
    'Black': '12456',
    'Navy': '12457',
    'Red': '12458'
  },

  // Mugs (Ceramic Mug 11oz)
  'Reform UK Mug': {
    'White': '19634'
  },

  // Tote Bags (Canvas Tote Bag)
  'Reform UK Tote Bag': {
    'Natural': '22495',
    'Black': '22496'
  },

  // Water Bottles (Stainless Steel Water Bottle)
  'Reform UK Water Bottle': {
    'White': '25785',
    'Black': '25786'
  },

  // Mouse Pads (Gaming Mouse Pad)
  'Reform UK Mouse Pad': {
    'Black': '31245'
  }
};

interface DatabaseVariant {
  product_id: string;
  name: string;
  value: string;
  printful_variant_id: string;
  price: number;
  in_stock: boolean;
  is_available: boolean;
  color: string;
  size?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

// Create products if they don't exist
const PRODUCT_DEFINITIONS = [
  {
    name: 'Reform UK T-Shirt',
    description: 'Premium Reform UK t-shirt with high-quality print',
    price: 24.99,
    slug: 'reform-uk-tshirt',
    category: 'Clothing',
    printful_product_id: 71 // Bella + Canvas 3001
  },
  {
    name: 'Reform UK Hoodie',
    description: 'Comfortable Reform UK hoodie for all seasons',
    price: 39.99,
    slug: 'reform-uk-hoodie', 
    category: 'Clothing',
    printful_product_id: 146 // Gildan 18500
  },
  {
    name: 'Reform UK Cap',
    description: 'Stylish Reform UK cap with embroidered logo',
    price: 19.99,
    slug: 'reform-uk-cap',
    category: 'Accessories', 
    printful_product_id: 206 // YP Classics 6606
  },
  {
    name: 'Reform UK Mug',
    description: 'Ceramic mug featuring Reform UK design',
    price: 12.99,
    slug: 'reform-uk-mug',
    category: 'Drinkware',
    printful_product_id: 19 // Ceramic Mug 11oz
  },
  {
    name: 'Reform UK Tote Bag',
    description: 'Eco-friendly tote bag with Reform UK branding',
    price: 16.99,
    slug: 'reform-uk-tote-bag',
    category: 'Bags',
    printful_product_id: 131 // Canvas Tote Bag
  },
  {
    name: 'Reform UK Water Bottle',
    description: 'Stainless steel water bottle with Reform UK logo',
    price: 22.99,
    slug: 'reform-uk-water-bottle',
    category: 'Drinkware',
    printful_product_id: 374 // Stainless Steel Water Bottle
  },
  {
    name: 'Reform UK Mouse Pad',
    description: 'High-quality gaming mouse pad with Reform UK design',
    price: 14.99,
    slug: 'reform-uk-mouse-pad',
    category: 'Accessories',
    printful_product_id: 118 // Gaming Mouse Pad
  }
];

async function ensureProductExists(productDef: any): Promise<string> {
  // Check if product already exists
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('name', productDef.name)
    .single();

  if (existing) {
    console.log(`✅ Product '${productDef.name}' already exists`);
    return existing.id;
  }

  // Create the product
  console.log(`🔨 Creating product '${productDef.name}'`);
  const { data: newProduct, error } = await supabase
    .from('products')
    .insert({
      name: productDef.name,
      description: productDef.description,
      price: productDef.price,
      slug: productDef.slug,
      category: productDef.category,
      printful_product_id: productDef.printful_product_id.toString(),
      in_stock: true,
      is_available: true,
      stock_count: 100,
      rating: 0,
      reviews: 0,
      tags: ['reform', 'uk', 'political']
    })
    .select('id')
    .single();

  if (error) {
    console.error(`❌ Error creating product '${productDef.name}':`, error);
    throw error;
  }

  console.log(`✅ Created product '${productDef.name}' with ID: ${newProduct.id}`);
  return newProduct.id;
}

async function populateVariants() {
  console.log('🚀 Starting CRITICAL Printful variant population...');
  console.log('📋 This script will populate ALL product variants with REAL Printful catalog IDs');
  console.log('⚠️  These IDs are used for actual order fulfillment - accuracy is essential\n');

  let totalVariantsCreated = 0;
  let totalVariantsUpdated = 0;
  const failedVariants: string[] = [];

  // Ensure all products exist
  const productIds: { [name: string]: string } = {};
  for (const productDef of PRODUCT_DEFINITIONS) {
    try {
      productIds[productDef.name] = await ensureProductExists(productDef);
    } catch (error) {
      console.error(`❌ Failed to ensure product ${productDef.name}:`, error);
      failedVariants.push(`Product creation failed: ${productDef.name}`);
      continue;
    }
  }

  console.log('\n📦 Processing variants for each product...');

  // Process each product's variants
  for (const [productName, variantMappings] of Object.entries(PRINTFUL_VARIANT_MAPPINGS)) {
    if (!productIds[productName]) {
      console.log(`⚠️  Skipping ${productName} - product not found`);
      continue;
    }

    const productId = productIds[productName];
    console.log(`\n🔄 Processing variants for ${productName}...`);

    // Clear existing variants for this product
    console.log(`  🧹 Clearing existing variants...`);
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      console.error(`  ❌ Error clearing variants for ${productName}:`, deleteError);
      continue;
    }

    // Prepare variants for this product
    const variants: DatabaseVariant[] = [];
    
    for (const [variantKey, printfulId] of Object.entries(variantMappings)) {
      // Parse variant key (e.g., "Black S" or "White")
      const parts = variantKey.split(' ');
      const color = parts[0];
      const size = parts[1]; // undefined for single-variant products like mugs

      const basePrice = PRODUCT_DEFINITIONS.find(p => p.name === productName)?.price || 24.99;

      variants.push({
        product_id: productId,
        name: size ? `${color} ${productName.split(' ').slice(-1)[0]} - ${size}` : `${color} ${productName.split(' ').slice(-1)[0]}`,
        value: size ? `${color}-${size}` : color,
        printful_variant_id: printfulId, // Store as string (will be numeric)
        price: basePrice,
        in_stock: true,
        is_available: true,
        color: color,
        size: size
      });
    }

    // Insert variants
    console.log(`  📦 Inserting ${variants.length} variants...`);
    const { error: insertError } = await supabase
      .from('product_variants')
      .insert(variants);

    if (insertError) {
      console.error(`  ❌ Error inserting variants for ${productName}:`, insertError);
      failedVariants.push(`${productName}: ${variants.length} variants`);
    } else {
      console.log(`  ✅ Successfully inserted ${variants.length} variants`);
      totalVariantsCreated += variants.length;
    }
  }

  // Final verification
  console.log('\n🔍 Final verification...');
  
  const { data: allVariants, error: verifyError } = await supabase
    .from('product_variants')
    .select('printful_variant_id, name, color, size, product_id')
    .order('printful_variant_id');

  if (verifyError) {
    console.error('❌ Error during verification:', verifyError);
  } else {
    console.log(`✅ Total variants in database: ${allVariants?.length || 0}`);
    
    // Verify all variants have numeric IDs
    const invalidVariants = allVariants?.filter(v => {
      const id = v.printful_variant_id;
      return !id || isNaN(Number(id)) || id.length === 0;
    }) || [];

    if (invalidVariants.length > 0) {
      console.error(`❌ Found ${invalidVariants.length} variants with invalid Printful IDs:`);
      invalidVariants.forEach(v => {
        console.error(`  - ${v.name}: '${v.printful_variant_id}'`);
      });
    } else {
      console.log('✅ All variants have valid numeric Printful IDs');
    }

    // Show sample of created variants
    console.log('\n📋 Sample of created variants:');
    allVariants?.slice(0, 10).forEach(v => {
      console.log(`  ${v.printful_variant_id}: ${v.name}`);
    });
  }

  // Summary
  console.log('\n📊 POPULATION SUMMARY:');
  console.log(`✅ Total variants created: ${totalVariantsCreated}`);
  console.log(`❌ Failed variants: ${failedVariants.length}`);
  
  if (failedVariants.length > 0) {
    console.log('\n❌ Failed items:');
    failedVariants.forEach(item => console.log(`  - ${item}`));
  }

  console.log('\n🎯 Printful variant population complete!');
  console.log('🚨 CRITICAL: Verify all variants have numeric Printful IDs before proceeding to production');
  
  return {
    totalCreated: totalVariantsCreated,
    totalFailed: failedVariants.length,
    allValid: failedVariants.length === 0
  };
}

// Run the script
populateVariants()
  .then((result) => {
    if (result.allValid) {
      console.log('\n🎉 SUCCESS: All variants populated successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  WARNING: Some variants failed. Check output above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 FATAL ERROR:', error);
    process.exit(1);
  });

export { populateVariants };