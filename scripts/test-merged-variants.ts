#!/usr/bin/env tsx

// Test script for merged variant files
// Run with: npx tsx scripts/test-merged-variants.ts

import { 
  TshirtVariants, 
  findTshirtVariant,
  getTshirtVariantsByDesign,
  tshirtDesigns,
  tshirtSizes,
  tshirtColors 
} from '../src/hooks/tshirt-variants-merged';

import { 
  HoodieVariants, 
  findHoodieVariant,
  getHoodieVariantsByDesign,
  hoodieDesigns,
  hoodieSizes,
  hoodieColors 
} from '../src/hooks/hoodie-variants-merged';

console.log('🧪 Testing Merged Variant Files\n');

// Test T-Shirt Variants
console.log('👕 T-Shirt Variants Test:');
console.log(`Total variants: ${TshirtVariants.length} (expected: 100)`);

const darkTshirts = getTshirtVariantsByDesign('DARK');
const lightTshirts = getTshirtVariantsByDesign('LIGHT');

console.log(`DARK variants: ${darkTshirts.length} (expected: 60)`);
console.log(`LIGHT variants: ${lightTshirts.length} (expected: 40)`);

// Test variant lookup
const testTshirt = findTshirtVariant('DARK', 'M', 'Color 3');
if (testTshirt) {
  console.log(`✅ Found DARK M Color 3: £${testTshirt.price}, ID: ${testTshirt.catalogVariantId}`);
} else {
  console.log('❌ Failed to find DARK M Color 3 t-shirt');
}

// Test Hoodie Variants
console.log('\n🧥 Hoodie Variants Test:');
console.log(`Total variants: ${HoodieVariants.length} (expected: 45)`);

const darkHoodies = getHoodieVariantsByDesign('DARK');
const lightHoodies = getHoodieVariantsByDesign('LIGHT');

console.log(`DARK variants: ${darkHoodies.length} (expected: 25)`);
console.log(`LIGHT variants: ${lightHoodies.length} (expected: 20)`);

// Test variant lookup
const testHoodie = findHoodieVariant('LIGHT', 'L', 'Color 2');
if (testHoodie) {
  console.log(`✅ Found LIGHT L Color 2: £${testHoodie.price}, ID: ${testHoodie.catalogVariantId}`);
} else {
  console.log('❌ Failed to find LIGHT L Color 2 hoodie');
}

// Test available options
console.log('\n📋 Available Options:');
console.log(`T-shirt designs: ${tshirtDesigns.join(', ')}`);
console.log(`T-shirt sizes: ${tshirtSizes.join(', ')}`);
console.log(`T-shirt colors: ${tshirtColors.length} colors available`);

console.log(`\nHoodie designs: ${hoodieDesigns.join(', ')}`);
console.log(`Hoodie sizes: ${hoodieSizes.join(', ')}`);
console.log(`Hoodie colors: ${hoodieColors.length} colors available`);

// Test random variant lookups
console.log('\n🎯 Random Variant Lookup Tests:');

const testCases = [
  { design: 'DARK' as const, size: 'S', color: 'Color 1' },
  { design: 'LIGHT' as const, size: 'XL', color: 'Color 4' },
  { design: 'DARK' as const, size: '2XL', color: 'Color 5' },
];

testCases.forEach(({ design, size, color }) => {
  const tshirtVariant = findTshirtVariant(design, size, color);
  const hoodieVariant = findHoodieVariant(design, size, color);
  
  if (tshirtVariant) {
    console.log(`✅ T-shirt ${design} ${size} ${color}: £${tshirtVariant.price}, ID: ${tshirtVariant.catalogVariantId}`);
  } else {
    console.log(`❌ T-shirt ${design} ${size} ${color}: Not found`);
  }
  
  if (hoodieVariant) {
    console.log(`✅ Hoodie ${design} ${size} ${color}: £${hoodieVariant.price}, ID: ${hoodieVariant.catalogVariantId}`);
  } else {
    console.log(`❌ Hoodie ${design} ${size} ${color}: Not found`);
  }
});

console.log('\n🎉 Variant testing completed!');
console.log('\n📝 Next steps:');
console.log('1. Update your frontend imports to use the merged variant files');
console.log('2. Test the helper functions in your components');
console.log('3. Verify cart and checkout integration works correctly');
console.log('4. Test order creation with real Printful catalog variant IDs');
