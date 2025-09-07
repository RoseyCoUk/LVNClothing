#!/usr/bin/env -S deno run --allow-env --allow-net

/**
 * Test script to validate bundle item resolution
 * Simulates the bundle item processing logic from stripe-webhook2
 */

// Mock bundle items that might come from Stripe metadata
const testBundleItems = [
  { id: 'starter-bundle-tshirt-0', qty: 1, price: 24.99 },
  { id: 'starter-bundle-cap-1', qty: 1, price: 19.99 },
  { id: 'starter-bundle-mug-2', qty: 1, price: 9.99 },
  { id: 'champion-bundle-hoodie-0', qty: 1, price: 39.99 },
  { id: 'champion-bundle-tshirt-1', qty: 1, price: 24.99 },
  { id: 'champion-bundle-cap-2', qty: 1, price: 19.99 },
  { id: 'champion-bundle-totebag-3', qty: 1, price: 24.99 },
  { id: 'activist-bundle-hoodie-0', qty: 1, price: 39.99 },
  { id: 'activist-bundle-tshirt-1', qty: 1, price: 24.99 },
  { id: 'activist-bundle-cap-2', qty: 1, price: 19.99 },
  { id: 'activist-bundle-totebag-3', qty: 1, price: 24.99 },
  { id: 'activist-bundle-waterbottle-4', qty: 1, price: 24.99 },
  { id: 'activist-bundle-mug-5', qty: 1, price: 9.99 },
  { id: 'activist-bundle-mousepad-6', qty: 1, price: 14.99 },
];

// Bundle variant mapping from bundle-utils.ts and webhook logic
const BUNDLE_VARIANT_IDS: Record<string, number> = {
  'tshirt': 15451,  // Default t-shirt variant ID
  't-shirt': 15451, 
  'hoodie': 15463,  // Default hoodie variant ID
  'cap': 301,       // Cap variant ID
  'mug': 601,       // Mug variant ID
  'totebag': 15451, // Fallback to t-shirt variant
  'tote': 15451,
  'waterbottle': 15451, // Fallback to t-shirt variant
  'water-bottle': 15451,
  'mousepad': 15451, // Fallback to t-shirt variant
  'mouse-pad': 15451
};

/**
 * Simulate the bundle item processing logic from stripe-webhook2
 */
function resolveBundleItem(item: any) {
  console.log(`\n🔍 Processing item: ${item.id}`);
  
  // Handle bundle items
  if (item.id && String(item.id).includes('bundle')) {
    const bundleMatch = String(item.id).match(/^(.*?)-bundle-(.*?)(?:-(\d+))?$/);
    if (bundleMatch) {
      const bundleType = bundleMatch[1]; // 'starter', 'champion', 'activist'
      const productType = bundleMatch[2]; // 'tshirt', 'hoodie', 'cap', etc.
      
      console.log(`  📦 Bundle detected: ${bundleType} bundle ${productType}`);
      
      const printfulVariantId = BUNDLE_VARIANT_IDS[productType];
      
      if (printfulVariantId) {
        console.log(`  ✅ Found variant: ${productType} -> Printful ID ${printfulVariantId}`);
        return {
          ...item,
          printful_variant_id: printfulVariantId,
          resolved: true
        };
      } else {
        console.log(`  ❌ No variant mapping for product type: ${productType}`);
        return {
          ...item,
          printful_variant_id: null,
          resolved: false
        };
      }
    }
  }
  
  console.log(`  ⏭️  Not a bundle item, skipping`);
  return {
    ...item,
    printful_variant_id: null,
    resolved: false
  };
}

/**
 * Main test function
 */
function main() {
  console.log('🚀 Testing Bundle Item Resolution');
  console.log('='.repeat(50));
  
  const results = testBundleItems.map(resolveBundleItem);
  
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(50));
  
  const resolved = results.filter(r => r.resolved);
  const unresolved = results.filter(r => !r.resolved);
  
  console.log(`✅ Successfully resolved: ${resolved.length}/${results.length} items`);
  console.log(`❌ Failed to resolve: ${unresolved.length}/${results.length} items`);
  
  if (unresolved.length > 0) {
    console.log('\n❌ UNRESOLVED ITEMS:');
    unresolved.forEach(item => console.log(`  - ${item.id}`));
  }
  
  console.log('\n📋 RESOLVED ITEMS:');
  resolved.forEach(item => {
    console.log(`  ✓ ${item.id} -> Printful ID: ${item.printful_variant_id}`);
  });
  
  // Create mock Printful order payload format
  const printfulItems = resolved
    .filter(item => item.printful_variant_id && String(item.printful_variant_id).trim() !== '')
    .map(item => ({
      sync_variant_id: parseInt(String(item.printful_variant_id)),
      quantity: item.qty || item.quantity || 1,
      retail_price: (item.price || 0).toFixed(2)
    }));
  
  console.log('\n📤 MOCK PRINTFUL ORDER PAYLOAD:');
  console.log(JSON.stringify({
    external_id: 'RUK-test-order-123',
    items: printfulItems,
    item_count: printfulItems.length
  }, null, 2));
  
  console.log(`\n🎯 Final result: ${printfulItems.length} items ready for Printful fulfillment`);
  
  return {
    total: results.length,
    resolved: resolved.length,
    unresolved: unresolved.length,
    printfulItems: printfulItems.length
  };
}

// Run the test if called directly
if (import.meta.main) {
  const result = main();
  
  if (result.unresolved > 0) {
    console.error('\n⚠️  Some items failed to resolve. Check the bundle variant mappings.');
    Deno.exit(1);
  } else {
    console.log('\n🎉 All bundle items resolved successfully!');
    Deno.exit(0);
  }
}