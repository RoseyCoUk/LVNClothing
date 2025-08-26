import { hoodieVariants, getHoodieVariantsByColor, getHoodieVariantsBySize, getHoodieVariant, getHoodieColors, getHoodieSizes } from './hooks/hoodie-variants';

// Test suite for hoodie variants
export function testHoodieVariants() {
  console.log('🧪 Testing Hoodie Variants System...\n');
  
  let allTestsPassed = true;
  const testResults: { test: string; passed: boolean; details: string }[] = [];

  // Test 1: Variant Count
  function testVariantCount() {
    const expectedCount = 45; // 9 colors × 5 sizes
    const actualCount = hoodieVariants.length;
    const passed = actualCount === expectedCount;
    
    testResults.push({
      test: 'Variant Count',
      passed,
      details: `Expected ${expectedCount}, got ${actualCount}`
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Variant Count: ${actualCount}/${expectedCount} ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 2: Size Consistency
  function testSizeConsistency() {
    const colors = getHoodieColors();
    const sizes = getHoodieSizes();
    const expectedSizes = ['S', 'M', 'L', 'XL', '2XL'];
    
    let passed = true;
    let details = '';
    
    // Check if all colors have all sizes
    for (const color of colors) {
      const colorVariants = getHoodieVariantsByColor(color);
      if (colorVariants.length !== expectedSizes.length) {
        passed = false;
        details = `${color} has ${colorVariants.length} sizes instead of ${expectedSizes.length}`;
        break;
      }
      
      const colorSizes = colorVariants.map(v => v.size).sort();
      const sortedExpectedSizes = [...expectedSizes].sort();
      if (JSON.stringify(colorSizes) !== JSON.stringify(sortedExpectedSizes)) {
        passed = false;
        details = `${color} sizes don't match expected: ${colorSizes.join(', ')} vs ${sortedExpectedSizes.join(', ')}`;
        break;
      }
    }
    
    testResults.push({
      test: 'Size Consistency',
      passed,
      details: details || 'All colors have all 5 sizes'
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Size Consistency: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 3: Unique IDs
  function testUniqueIds() {
    const internalIds = hoodieVariants.map(v => v.id);
    const printfulIds = hoodieVariants.map(v => v.printful_variant_id);
    
    const internalIdsUnique = new Set(internalIds).size === internalIds.length;
    const printfulIdsUnique = new Set(printfulIds).size === printfulIds.length;
    
    const passed = internalIdsUnique && printfulIdsUnique;
    let details = '';
    
    if (!internalIdsUnique) {
      details = 'Internal IDs are not unique';
    } else if (!printfulIdsUnique) {
      details = 'Printful variant IDs are not unique';
    } else {
      details = 'All IDs are unique';
    }
    
    testResults.push({
      test: 'Unique IDs',
      passed,
      details
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Unique IDs: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 4: Printful ID Range
  function testPrintfulIdRange() {
    const minId = Math.min(...hoodieVariants.map(v => v.printful_variant_id));
    const maxId = Math.max(...hoodieVariants.map(v => v.printful_variant_id));
    
    const expectedMin = 5000;
    const expectedMax = 5099;
    
    const passed = minId >= expectedMin && maxId <= expectedMax;
    const details = `IDs range from ${minId} to ${maxId} (expected ${expectedMin}-${expectedMax})`;
    
    testResults.push({
      test: 'Printful ID Range',
      passed,
      details
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Printful ID Range: ${minId}-${maxId} ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 5: Pricing Structure
  function testPricingStructure() {
    const standardPrice = '39.99';
    const xl2Price = '41.99';
    
    let passed = true;
    let details = '';
    
    for (const variant of hoodieVariants) {
      if (variant.size === '2XL') {
        if (variant.price !== xl2Price) {
          passed = false;
          details = `${variant.name} has price ${variant.price}, expected ${xl2Price}`;
          break;
        }
      } else {
        if (variant.price !== standardPrice) {
          passed = false;
          details = `${variant.name} has price ${variant.price}, expected ${standardPrice}`;
          break;
        }
      }
    }
    
    testResults.push({
      test: 'Pricing Structure',
      passed,
      details: details || `Standard: £${standardPrice}, 2XL: £${xl2Price}`
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Pricing Structure: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 6: Color Codes
  function testColorCodes() {
    let passed = true;
    let details = '';
    
    for (const variant of hoodieVariants) {
      if (!variant.color_code || !variant.color_code.startsWith('#')) {
        passed = false;
        details = `${variant.name} has invalid color code: ${variant.color_code}`;
        break;
      }
      
      // Check if hex code is valid (6 characters after #)
      if (variant.color_code.length !== 7) {
        passed = false;
        details = `${variant.name} has invalid color code length: ${variant.color_code}`;
        break;
      }
    }
    
    testResults.push({
      test: 'Color Codes',
      passed,
      details: details || 'All color codes are valid hex codes'
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Color Codes: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 7: Stock Status
  function testStockStatus() {
    const allInStock = hoodieVariants.every(v => v.in_stock === true);
    
    const passed = allInStock;
    const details = allInStock ? 'All variants are in stock' : 'Some variants are out of stock';
    
    testResults.push({
      test: 'Stock Status',
      passed,
      details
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Stock Status: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 8: Naming Convention
  function testNamingConvention() {
    let passed = true;
    let details = '';
    
    for (const variant of hoodieVariants) {
      const expectedFormat = `${variant.color} Hoodie - ${variant.size}`;
      if (variant.name !== expectedFormat) {
        passed = false;
        details = `${variant.name} doesn't match expected format: ${expectedFormat}`;
        break;
      }
    }
    
    testResults.push({
      test: 'Naming Convention',
      passed,
      details: details || 'All variants follow "Color Hoodie - Size" format'
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Naming Convention: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 9: Helper Functions
  function testHelperFunctions() {
    let passed = true;
    let details = '';
    
    // Test getHoodieColors
    const colors = getHoodieColors();
    if (colors.length !== 9) {
      passed = false;
      details = `getHoodieColors returned ${colors.length} colors, expected 9`;
    }
    
    // Test getHoodieSizes
    const sizes = getHoodieSizes();
    if (sizes.length !== 5) {
      passed = false;
      details = `getHoodieSizes returned ${sizes.length} sizes, expected 5`;
    }
    
    // Test getHoodieVariant
    const testVariant = getHoodieVariant('Black', 'M');
    if (!testVariant || testVariant.color !== 'Black' || testVariant.size !== 'M') {
      passed = false;
      details = 'getHoodieVariant failed to return correct variant';
    }
    
    testResults.push({
      test: 'Helper Functions',
      passed,
      details: details || 'All helper functions work correctly'
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Helper Functions: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Run all tests
  testVariantCount();
  testSizeConsistency();
  testUniqueIds();
  testPrintfulIdRange();
  testPricingStructure();
  testColorCodes();
  testStockStatus();
  testNamingConvention();
  testHelperFunctions();

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  testResults.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.test}: ${result.details}`);
  });
  
  console.log(`\n🎯 Overall Result: ${allTestsPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  return {
    allTestsPassed,
    testResults,
    totalTests: testResults.length,
    passedTests: testResults.filter(t => t.passed).length
  };
}

// Export for use in test runner
export default testHoodieVariants;
