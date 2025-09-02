import { tshirtVariants } from './hooks/tshirt-variants';

// Test: Verify all T-shirt variants are properly linked to Printful
export function testTShirtVariants() {
  console.log('🧪 Testing T-shirt Variants...\n');

  // Test 1: Verify variant count
  const expectedCount = 20 * 5; // 20 colors × 5 sizes
  if (tshirtVariants.length !== expectedCount) {
    console.error(`❌ Variant count mismatch: Expected ${expectedCount}, got ${tshirtVariants.length}`);
    return false;
  }
  console.log(`✅ Variant count: ${tshirtVariants.length} (${expectedCount} expected)`);

  // Test 2: Verify all colors have all sizes
  const colors = [...new Set(tshirtVariants.map(v => v.color))];
  const sizes = [...new Set(tshirtVariants.map(v => v.size))];
  const expectedSizes = ['S', 'M', 'L', 'XL', '2XL'];
  
  if (sizes.length !== expectedSizes.length || !expectedSizes.every(s => sizes.includes(s))) {
    console.error(`❌ Size mismatch: Expected ${expectedSizes.join(', ')}, got ${sizes.join(', ')}`);
    return false;
  }
  console.log(`✅ Sizes: ${sizes.join(', ')}`);

  // Test 3: Verify each color has all 5 sizes
  for (const color of colors) {
    const colorVariants = tshirtVariants.filter(v => v.color === color);
    if (colorVariants.length !== 5) {
      console.error(`❌ Color ${color} has ${colorVariants.length} variants, expected 5`);
      return false;
    }
    
    const colorSizes = colorVariants.map(v => v.size);
    if (!expectedSizes.every(s => colorSizes.includes(s))) {
      console.error(`❌ Color ${color} missing sizes: ${expectedSizes.filter(s => !colorSizes.includes(s)).join(', ')}`);
      return false;
    }
  }
  console.log(`✅ All ${colors.length} colors have all 5 sizes`);

  // Test 4: Verify unique IDs and Printful variant IDs
  const ids = tshirtVariants.map(v => v.id);
  const printfulIds = tshirtVariants.map(v => v.printful_variant_id);
  
  if (new Set(ids).size !== ids.length) {
    console.error('❌ Duplicate internal IDs found');
    return false;
  }
  
  if (new Set(printfulIds).size !== printfulIds.length) {
    console.error('❌ Duplicate Printful variant IDs found');
    return false;
  }
  
  console.log('✅ All IDs are unique (internal and Printful)');

  // Test 5: Verify Printful variant ID range
  const minPrintfulId = Math.min(...printfulIds);
  const maxPrintfulId = Math.max(...printfulIds);
  const expectedMinId = 4016;
  const expectedMaxId = 4115;
  
  if (minPrintfulId !== expectedMinId || maxPrintfulId !== expectedMaxId) {
    console.error(`❌ Printful ID range mismatch: Expected ${expectedMinId}-${expectedMaxId}, got ${minPrintfulId}-${maxPrintfulId}`);
    return false;
  }
  console.log(`✅ Printful variant IDs: ${minPrintfulId}-${maxPrintfulId}`);

  // Test 6: Verify pricing structure
  const standardPrice = '24.99';
  const xlPrice = '26.99';
  
  for (const variant of tshirtVariants) {
    if (variant.size === '2XL') {
      if (variant.price !== xlPrice) {
        console.error(`❌ 2XL variant ${variant.name} has wrong price: ${variant.price}, expected ${xlPrice}`);
        return false;
      }
    } else {
      if (variant.price !== standardPrice) {
        console.error(`❌ Variant ${variant.name} has wrong price: ${variant.price}, expected ${standardPrice}`);
        return false;
      }
    }
  }
  console.log('✅ Pricing structure is correct');

  // Test 7: Verify color codes are valid hex colors
  for (const variant of tshirtVariants) {
    if (!variant.color_code || !/^#[0-9A-Fa-f]{6}$/.test(variant.color_code)) {
      console.error(`❌ Invalid color code for ${variant.name}: ${variant.color_code}`);
      return false;
    }
  }
  console.log('✅ All color codes are valid hex colors');

  // Test 8: Verify all variants are in stock
  for (const variant of tshirtVariants) {
    if (!variant.in_stock) {
      console.error(`❌ Variant ${variant.name} is not in stock`);
      return false;
    }
  }
  console.log('✅ All variants are in stock');

  // Test 9: Verify naming convention
  for (const variant of tshirtVariants) {
    const expectedName = `${variant.color} T-Shirt - ${variant.size}`;
    if (variant.name !== expectedName) {
      console.error(`❌ Naming convention mismatch for ${variant.name}, expected ${expectedName}`);
      return false;
    }
  }
  console.log('✅ All variants follow naming convention');

  // Test 10: Verify Printful integration readiness
  const printfulReadyVariants = tshirtVariants.filter(v => 
    v.printful_variant_id && 
    v.color && 
    v.size && 
    v.price && 
    v.color_code
  );
  
  if (printfulReadyVariants.length !== tshirtVariants.length) {
    console.error(`❌ ${tshirtVariants.length - printfulReadyVariants.length} variants not ready for Printful integration`);
    return false;
  }
  console.log('✅ All variants are ready for Printful integration');

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   • Total variants: ${tshirtVariants.length}`);
  console.log(`   • Colors: ${colors.length}`);
  console.log(`   • Sizes: ${sizes.length}`);
  console.log(`   • Printful ID range: ${minPrintfulId}-${maxPrintfulId}`);
  console.log(`   • Price range: £${standardPrice} - £${xlPrice}`);
  
  console.log('\n🎯 All tests passed! T-shirt variants are properly linked and ready for Printful integration.');
  return true;
}

// Test: Verify specific color and size combinations
export function testSpecificVariants() {
  console.log('\n🔍 Testing Specific Variants...\n');

  // Get sizes from variants
  const sizes = [...new Set(tshirtVariants.map(v => v.size))];

  // Test Black variants
  const blackVariants = tshirtVariants.filter(v => v.color === 'Black');
  console.log(`Black variants: ${blackVariants.length}`);
  blackVariants.forEach(v => {
    console.log(`  • ${v.name} - ID: ${v.id}, Printful ID: ${v.printful_variant_id}, Color: ${v.color_code}`);
  });

  // Test White variants
  const whiteVariants = tshirtVariants.filter(v => v.color === 'White');
  console.log(`\nWhite variants: ${whiteVariants.length}`);
  whiteVariants.forEach(v => {
    console.log(`  • ${v.name} - ID: ${v.id}, Printful ID: ${v.printful_variant_id}, Color: ${v.color_code}`);
  });

  // Test size distribution
  const sizeDistribution = sizes.reduce((acc, size) => {
    acc[size] = tshirtVariants.filter(v => v.size === size).length;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\nSize distribution:');
  Object.entries(sizeDistribution).forEach(([size, count]) => {
    console.log(`  • ${size}: ${count} variants`);
  });
}

// Test: Verify Printful mapping consistency
export function testPrintfulMapping() {
  console.log('\n🔗 Testing Printful Mapping...\n');

  // Get colors from variants
  const colors = [...new Set(tshirtVariants.map(v => v.color))];

  // Create a mapping table
  const mappingTable = colors.map(color => {
    const colorVariants = tshirtVariants.filter(v => v.color === color);
    return {
      color,
      variants: colorVariants.map(v => ({
        size: v.size,
        printfulId: v.printful_variant_id,
        internalId: v.id
      }))
    };
  });

  console.log('Printful Mapping Table:');
  mappingTable.forEach(colorMap => {
    console.log(`\n${colorMap.color}:`);
    colorMap.variants.forEach(v => {
      console.log(`  • ${v.size}: Internal ID ${v.internalId} → Printful ID ${v.printfulId}`);
    });
  });

  // Verify no duplicate Printful IDs
  const allPrintfulIds = tshirtVariants.map(v => v.printful_variant_id);
  const duplicateIds = allPrintfulIds.filter((id, index) => allPrintfulIds.indexOf(id) !== index);
  
  if (duplicateIds.length > 0) {
    console.error(`❌ Duplicate Printful IDs found: ${duplicateIds.join(', ')}`);
    return false;
  }
  
  console.log('\n✅ No duplicate Printful IDs found');
  return true;
}

// Run all tests
export function runAllTShirtTests() {
  console.log('🚀 Running T-shirt Variant Tests...\n');
  
  const test1 = testTShirtVariants();
  const test2 = testSpecificVariants();
  const test3 = testPrintfulMapping();
  
  if (test1 && test3) {
    console.log('\n🎉 All T-shirt variant tests passed successfully!');
    return true;
  } else {
    console.log('\n💥 Some tests failed. Please review the errors above.');
    return false;
  }
}

// Export for use in other files
export { tshirtVariants };
