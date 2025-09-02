import { mugVariants, getMugVariantsByColor, getMugVariant, getMugColors, getMugSizes } from './hooks/mug-variants';

// Test suite for mug variants
export function testMugVariants() {
  console.log('☕ Testing Mug Variants System...\n');
  
  let allTestsPassed = true;
  const testResults: { test: string; passed: boolean; details: string }[] = [];

  // Test 1: Variant Count
  function testVariantCount() {
    const expectedCount = 1; // 1 color × 1 size
    const actualCount = mugVariants.length;
    const passed = actualCount === expectedCount;
    
    testResults.push({
      test: 'Variant Count',
      passed,
      details: `Expected ${expectedCount}, got ${actualCount}`
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Variant Count: ${actualCount}/${expectedCount} ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 2: Color Consistency
  function testColorConsistency() {
    const colors = getMugColors();
    const expectedColors = ['White'];
    
    let passed = true;
    let details = '';
    
    // Check if all expected colors are present
    for (const expectedColor of expectedColors) {
      if (!colors.includes(expectedColor)) {
        passed = false;
        details = `Missing color: ${expectedColor}`;
        break;
      }
    }
    
    // Check if there are any unexpected colors
    for (const color of colors) {
      if (!expectedColors.includes(color)) {
        passed = false;
        details = `Unexpected color: ${color}`;
        break;
      }
    }
    
    testResults.push({
      test: 'Color Consistency',
      passed,
      details: details || `All ${colors.length} expected colors are present`
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Color Consistency: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 3: Unique IDs
  function testUniqueIds() {
    const internalIds = mugVariants.map(v => v.id);
    const printfulIds = mugVariants.map(v => v.printful_variant_id);
    
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
    const minId = Math.min(...mugVariants.map(v => v.printful_variant_id));
    const maxId = Math.max(...mugVariants.map(v => v.printful_variant_id));
    
    const expectedMin = 10000;
    const expectedMax = 10099;
    
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
    const expectedPrice = '9.99';
    
    let passed = true;
    let details = '';
    
    for (const variant of mugVariants) {
      if (variant.price !== expectedPrice) {
        passed = false;
        details = `${variant.name} has price ${variant.price}, expected ${expectedPrice}`;
        break;
      }
    }
    
    testResults.push({
      test: 'Pricing Structure',
      passed,
      details: details || `All variants priced at £${expectedPrice}`
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Pricing Structure: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 6: Color Codes
  function testColorCodes() {
    let passed = true;
    let details = '';
    
    for (const variant of mugVariants) {
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
    const allInStock = mugVariants.every(v => v.in_stock === true);
    
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
    
    for (const variant of mugVariants) {
      const expectedFormat = `${variant.color} Mug - One Size`;
      if (variant.name !== expectedFormat) {
        passed = false;
        details = `${variant.name} doesn't match expected format: ${expectedFormat}`;
        break;
      }
    }
    
    testResults.push({
      test: 'Naming Convention',
      passed,
      details: details || 'All variants follow "Color Mug - One Size" format'
    });
    
    if (!passed) allTestsPassed = false;
    
    console.log(`✅ Naming Convention: ${passed ? 'PASS' : 'FAIL'}`);
  }

  // Test 9: Helper Functions
  function testHelperFunctions() {
    let passed = true;
    let details = '';
    
    // Test getMugColors
    const colors = getMugColors();
    if (colors.length !== 1) {
      passed = false;
      details = `getMugColors returned ${colors.length} colors, expected 1`;
    }
    
    // Test getMugSizes
    const sizes = getMugSizes();
    if (sizes.length !== 1 || sizes[0] !== 'One Size') {
      passed = false;
      details = `getMugSizes returned ${sizes.length} sizes, expected 1 with 'One Size'`;
    }
    
    // Test getMugVariant
    const testVariant = getMugVariant('White');
    if (!testVariant || testVariant.color !== 'White') {
      passed = false;
      details = 'getMugVariant failed to return correct variant';
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
  testColorConsistency();
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
export default testMugVariants;
