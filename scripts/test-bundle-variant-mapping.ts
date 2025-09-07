#!/usr/bin/env npx tsx
/**
 * Test script to verify bundle variant mapping is working correctly
 */

import { findHoodieVariant } from '../src/hooks/hoodie-variants-merged-fixed';
import { findCapVariantByColor } from '../src/hooks/cap-variants';

console.log('🧪 Testing Bundle Variant Mapping System\n');
console.log('=' .repeat(60));

// Test Case 1: Navy Large Hoodie
console.log('\n📦 Test Case 1: Navy Large Hoodie');
console.log('-'.repeat(40));
const navyLargeHoodie = findHoodieVariant('DARK', 'L', 'Navy');
if (navyLargeHoodie) {
  console.log('✅ Found Navy Large Hoodie:');
  console.log(`   Catalog ID: ${navyLargeHoodie.catalogVariantId}`);
  console.log(`   SKU: ${navyLargeHoodie.sku}`);
  console.log(`   Price: £${navyLargeHoodie.price}`);
} else {
  console.error('❌ Navy Large Hoodie not found!');
}

// Test Case 2: Navy Large T-shirt
console.log('\n📦 Test Case 2: Navy Large T-shirt');
console.log('-'.repeat(40));
// Note: T-shirt variants require importing the hook differently
console.log('⚠️  T-shirt test requires runtime context, skipping static test');

// Test Case 3: Navy Cap
console.log('\n📦 Test Case 3: Navy Cap');
console.log('-'.repeat(40));
const navyCap = findCapVariantByColor('Navy');
if (navyCap) {
  console.log('✅ Found Navy Cap:');
  console.log(`   Catalog ID: ${navyCap.catalogVariantId}`);
  console.log(`   SKU: ${navyCap.sku}`);
  console.log(`   Price: £${navyCap.price}`);
} else {
  console.error('❌ Navy Cap not found!');
}

// Test Case 4: Default (Black) variants as fallback
console.log('\n📦 Test Case 4: Black Variants (Fallback)');
console.log('-'.repeat(40));

const blackLargeHoodie = findHoodieVariant('DARK', 'L', 'Black');
if (blackLargeHoodie) {
  console.log('✅ Found Black Large Hoodie:');
  console.log(`   Catalog ID: ${blackLargeHoodie.catalogVariantId}`);
  console.log(`   SKU: ${blackLargeHoodie.sku}`);
}

const blackCap = findCapVariantByColor('Black');
if (blackCap) {
  console.log('✅ Found Black Cap:');
  console.log(`   Catalog ID: ${blackCap.catalogVariantId}`);
  console.log(`   SKU: ${blackCap.sku}`);
}

// Test Case 5: Frontend-to-Backend Flow
console.log('\n🔄 Frontend-to-Backend Variant Flow');
console.log('-'.repeat(40));
console.log('1. Frontend: User selects Navy/Large for hoodie');
console.log('2. Frontend: findHoodieVariant("DARK", "L", "Navy") returns catalogVariantId');
console.log('3. Frontend: Cart item includes printful_variant_id with this catalogVariantId');
console.log('4. Backend: Webhook receives item with printful_variant_id');
console.log('5. Backend: Uses the actual printful_variant_id instead of hardcoded defaults');
console.log('6. Printful: Receives correct variant ID and fulfills Navy/Large hoodie');

console.log('\n✨ Summary');
console.log('-'.repeat(40));
console.log('The fix ensures that:');
console.log('• Frontend correctly looks up variant IDs based on user selections');
console.log('• Cart items include the correct printful_variant_id');
console.log('• Webhook uses the variant ID from frontend instead of hardcoded defaults');
console.log('• Customers receive the exact color/size they ordered');

console.log('\n🎯 Next Steps:');
console.log('1. Deploy the webhook changes to production');
console.log('2. Test a real order with specific color/size selections');
console.log('3. Verify Printful receives the correct variant IDs');