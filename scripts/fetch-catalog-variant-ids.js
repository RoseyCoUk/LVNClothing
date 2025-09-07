#!/usr/bin/env node

import fs from 'fs/promises';

// Hardcode for now to avoid dependency issues
const PRINTFUL_TOKEN = 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB'; // From .env.local
const PRINTFUL_STORE_ID = '16651763';

if (!PRINTFUL_TOKEN) {
  console.error('❌ PRINTFUL_TOKEN not found in .env.local');
  process.exit(1);
}

console.log('🔑 PRINTFUL_TOKEN configured:', !!PRINTFUL_TOKEN);
console.log('🏪 PRINTFUL_STORE_ID:', PRINTFUL_STORE_ID || 'none');

// Sample sync variant IDs from the codebase
const syncVariantIds = [
  '68a9f9b78dd6d8', // Sticker
  '68a9f81d60c2b4', // Mug
  '68a9f6e8eeb689', // Mouse Pad
  '68a9f6414ae5b8', // Water Bottle
  '68a9f52cc3d834', // Cap - Black
  '68a9f52cc3d8f7', // Cap - Dark Grey
  '68a9daac4dc349', // T-Shirt - Black / S
  '68a9daac4dc395', // T-Shirt - Black / M
  4016, // From hooks - numeric variant
  4017,
  4018
];

async function fetchPrintfulSyncProducts() {
  try {
    console.log('📦 Fetching sync products from Printful...');
    
    const headers = {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Reform-UK-Store/1.0'
    };

    if (PRINTFUL_STORE_ID) {
      headers['X-PF-Store-Id'] = PRINTFUL_STORE_ID;
    }

    // Get all sync products
    const response = await fetch('https://api.printful.com/sync/products', {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    console.log('✅ Fetched sync products:', data.result?.length || 0);
    
    // Save raw response for debugging
    await fs.writeFile('sync-products-raw.json', JSON.stringify(data, null, 2));
    console.log('💾 Raw sync products saved to sync-products-raw.json');

    return data.result || [];
    
  } catch (error) {
    console.error('❌ Error fetching sync products:', error);
    throw error;
  }
}

async function fetchSyncVariantDetails(syncProductId) {
  try {
    const headers = {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Reform-UK-Store/1.0'
    };

    if (PRINTFUL_STORE_ID) {
      headers['X-PF-Store-Id'] = PRINTFUL_STORE_ID;
    }

    const response = await fetch(`https://api.printful.com/sync/products/${syncProductId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    return data.result;
    
  } catch (error) {
    console.error(`❌ Error fetching sync product ${syncProductId}:`, error);
    return null;
  }
}

async function mapSyncToCatalogVariants() {
  try {
    console.log('🗺️ Creating sync to catalog variant mapping...\n');
    
    // First get all sync products
    const syncProducts = await fetchPrintfulSyncProducts();
    
    const variantMappings = [];
    
    for (const syncProduct of syncProducts) {
      console.log(`🔍 Processing sync product: ${syncProduct.name} (ID: ${syncProduct.id})`);
      
      // Get detailed product with variants
      const productDetails = await fetchSyncVariantDetails(syncProduct.id);
      
      if (productDetails && productDetails.sync_variants) {
        for (const syncVariant of productDetails.sync_variants) {
          console.log(`  📋 Sync Variant ID: ${syncVariant.id}`);
          console.log(`  📋 Catalog Variant ID: ${syncVariant.variant_id}`);
          console.log(`  🎨 Color: ${syncVariant.product?.variant_name || 'N/A'}`);
          console.log(`  💰 Price: ${syncVariant.retail_price || 'N/A'}`);
          
          variantMappings.push({
            sync_variant_id: syncVariant.id,
            catalog_variant_id: syncVariant.variant_id,
            product_id: syncProduct.id,
            product_name: syncProduct.name,
            variant_name: syncVariant.product?.variant_name || '',
            retail_price: syncVariant.retail_price,
            currency: syncVariant.currency,
            is_enabled: syncVariant.is_enabled,
            is_printify_premium: syncVariant.product?.is_printify_premium || false,
            files: syncVariant.files?.map(f => ({ id: f.id, type: f.type, url: f.url })) || []
          });
          
          console.log('  ✅ Mapped\n');
        }
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`📊 Total variant mappings created: ${variantMappings.length}`);
    
    // Save mappings to JSON file
    await fs.writeFile(
      'sync-to-catalog-variant-mappings.json', 
      JSON.stringify(variantMappings, null, 2)
    );
    
    console.log('💾 Variant mappings saved to sync-to-catalog-variant-mappings.json');
    
    // Create a simple lookup table
    const lookupTable = {};
    variantMappings.forEach(mapping => {
      lookupTable[mapping.sync_variant_id] = mapping.catalog_variant_id;
    });
    
    await fs.writeFile(
      'sync-to-catalog-lookup.json',
      JSON.stringify(lookupTable, null, 2)
    );
    
    console.log('💾 Simple lookup table saved to sync-to-catalog-lookup.json');
    
    // Check if any of our known sync variant IDs are found
    console.log('\n🔍 Checking known sync variant IDs:');
    syncVariantIds.forEach(syncId => {
      const catalogId = lookupTable[syncId];
      if (catalogId) {
        console.log(`  ✅ ${syncId} → ${catalogId}`);
      } else {
        console.log(`  ❌ ${syncId} → NOT FOUND`);
      }
    });
    
    return variantMappings;
    
  } catch (error) {
    console.error('❌ Error creating variant mappings:', error);
    throw error;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  mapSyncToCatalogVariants().catch(console.error);
}