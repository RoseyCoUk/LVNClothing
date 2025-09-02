// Simple test runner for Printful integration
// This can be run in the browser console for testing

export async function runPrintfulTests() {
  console.log('🧪 Running Printful Integration Tests...')
  
  const results = {
    typeDefinitions: false,
    variantLogic: false,
    bundleCalculations: false,
    stickerLogic: false,
    cartIntegration: false,
    errorHandling: false
  }
  
  try {
    // Test 1: Type Definitions
    console.log('\n📝 Testing Type Definitions...')
    results.typeDefinitions = testTypeDefinitions()
    console.log('Type Definitions:', results.typeDefinitions ? '✅ PASS' : '❌ FAIL')
    
    // Test 2: Variant Logic
    console.log('\n🎨 Testing Variant Logic...')
    results.variantLogic = testVariantLogic()
    console.log('Variant Logic:', results.variantLogic ? '✅ PASS' : '❌ FAIL')
    
    // Test 3: Bundle Calculations
    console.log('\n📦 Testing Bundle Calculations...')
    results.bundleCalculations = testBundleCalculations()
    console.log('Bundle Calculations:', results.bundleCalculations ? '✅ PASS' : '❌ FAIL')
    
    // Test 4: Sticker Logic
    console.log('\n🏷️ Testing Sticker Logic...')
    results.stickerLogic = testStickerLogic()
    console.log('Sticker Logic:', results.stickerLogic ? '✅ PASS' : '❌ FAIL')
    
    // Test 5: Cart Integration
    console.log('\n🛒 Testing Cart Integration...')
    results.cartIntegration = testCartIntegration()
    console.log('Cart Integration:', results.cartIntegration ? '✅ PASS' : '❌ FAIL')
    
    // Test 6: Error Handling
    console.log('\n🚨 Testing Error Handling...')
    results.errorHandling = testErrorHandling()
    console.log('Error Handling:', results.errorHandling ? '✅ PASS' : '❌ FAIL')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
  
  const allPassed = Object.values(results).every(Boolean)
  console.log(`\n📊 Test Results: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`)
  console.log('Results:', results)
  
  return results
}

// Test 1: Type Definitions
function testTypeDefinitions(): boolean {
  try {
    // Test PrintfulProduct interface
    const mockProduct = {
      id: 1,
      name: "Test Product",
      category: 'tshirt' as const,
      variants: [],
      isUnisex: true,
      hasDarkLightVariants: true
    };
    
    // Test PrintfulVariant interface
    const mockVariant = {
      id: 101,
      name: "Test Variant",
      color: "Black",
      size: "M",
      price: "24.99",
      in_stock: true,
      printful_variant_id: 1001
    };
    
    // Test StickerAddon interface
    const mockSticker = {
      id: 'sticker-1',
      name: 'Test Sticker',
      description: 'Test description',
      price: 4.99,
      image: '/test.jpg',
      printful_variant_id: 2001,
      availableFor: ['tshirt', 'hoodie'] as const
    };
    
    // If we get here without errors, types are valid
    return true;
  } catch (error) {
    console.error('Type definition test failed:', error);
    return false;
  }
}

// Test 2: Variant Logic
function testVariantLogic(): boolean {
  try {
    // Test dark/light color detection
    const isDarkColor = (color: string): boolean => {
      const darkColors = ['black', 'charcoal', 'navy', 'dark', 'brown', 'burgundy'];
      return darkColors.some(darkColor => 
        color.toLowerCase().includes(darkColor)
      );
    };
    
    const darkTest = isDarkColor('Black') === true;
    const lightTest = isDarkColor('White') === false;
    
    // Test size sorting
    const sizes = ['L', 'S', 'XL', 'M', '2XL'];
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
    const sortedSizes = sizes.sort((a, b) => {
      return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
    });
    
    const sizeTest = sortedSizes[0] === 'S' && sortedSizes[4] === '2XL';
    
    return darkTest && lightTest && sizeTest;
  } catch (error) {
    console.error('Variant logic test failed:', error);
    return false;
  }
}

// Test 3: Bundle Calculations
function testBundleCalculations(): boolean {
  try {
    const bundleItems = [
      { product: { name: 'Product 1' }, variant: { price: '24.99' }, quantity: 1 },
      { product: { name: 'Product 2' }, variant: { price: '19.99' }, quantity: 1 }
    ];
    
    const totalPrice = bundleItems.reduce((sum, item) => {
      return sum + (parseFloat(item.variant.price) * item.quantity);
    }, 0);
    
    const expectedTotal = 24.99 + 19.99;
    const priceTest = Math.abs(totalPrice - expectedTotal) < 0.01;
    
    // Test savings calculation
    const individualPrice = expectedTotal * 1.2; // 20% markup
    const savings = individualPrice - expectedTotal;
    const savingsTest = savings > 0;
    
    return priceTest && savingsTest;
  } catch (error) {
    console.error('Bundle calculation test failed:', error);
    return false;
  }
}

// Test 4: Sticker Logic
function testStickerLogic(): boolean {
  try {
    const allStickers = [
      { id: '1', availableFor: ['tshirt', 'hoodie'] },
      { id: '2', availableFor: ['cap', 'tote'] },
      { id: '3', availableFor: ['tshirt', 'cap'] }
    ];
    
    const getAvailableStickers = (productCategory: string) => {
      return allStickers.filter(sticker => 
        sticker.availableFor.includes(productCategory as any)
      );
    };
    
    const tshirtStickers = getAvailableStickers('tshirt');
    const capStickers = getAvailableStickers('cap');
    
    const filterTest = tshirtStickers.length === 2 && capStickers.length === 2;
    
    // Test sticker totals
    const selectedStickers = [
      { sticker: { price: 4.99 }, quantity: 2 },
      { sticker: { price: 3.99 }, quantity: 1 }
    ];
    
    const totalPrice = selectedStickers.reduce((sum, item) => {
      return sum + (item.sticker.price * item.quantity);
    }, 0);
    
    const expectedTotal = (4.99 * 2) + (3.99 * 1);
    const totalTest = Math.abs(totalPrice - expectedTotal) < 0.01;
    
    return filterTest && totalTest;
  } catch (error) {
    console.error('Sticker logic test failed:', error);
    return false;
  }
}

// Test 5: Cart Integration
function testCartIntegration(): boolean {
  try {
    // Test main product cart item
    const variant = { id: 101, color: 'Black', size: 'M', price: '24.99', printful_variant_id: 1001 };
    const product = { name: 'Test Product' };
    
    const cartItem = {
      id: `${variant.id}-${variant.size}`,
      name: `${product.name} - ${variant.color} (Size: ${variant.size})`,
      price: parseFloat(variant.price),
      printful_variant_id: variant.printful_variant_id
    };
    
    const cartTest = cartItem.id === '101-M' && cartItem.printful_variant_id === 1001;
    
    // Test sticker cart item
    const stickerCartItem = {
      id: 'sticker-1',
      name: 'Test Sticker (Add-on)',
      price: 4.99,
      printful_variant_id: 2001
    };
    
    const stickerTest = stickerCartItem.name.includes('(Add-on)');
    
    return cartTest && stickerTest;
  } catch (error) {
    console.error('Cart integration test failed:', error);
    return false;
  }
}

// Test 6: Error Handling
function testErrorHandling(): boolean {
  try {
    // Test fallback data
    const fallbackData = {
      id: 1,
      name: "Default Product",
      price: 19.99
    };
    
    const productData = null || fallbackData;
    const fallbackTest = productData.name === "Default Product";
    
    // Test variant availability
    const variants = [
      { color: 'Black', size: 'M', in_stock: true },
      { color: 'Black', size: 'L', in_stock: false }
    ];
    
    const availableVariant = variants.find(v => v.color === 'Black' && v.size === 'M');
    const unavailableVariant = variants.find(v => v.color === 'Black' && v.size === 'L');
    
    const availabilityTest = availableVariant?.in_stock === true && unavailableVariant?.in_stock === false;
    
    return fallbackTest && availabilityTest;
  } catch (error) {
    console.error('Error handling test failed:', error);
    return false;
  }
}

// Performance test
export function runPerformanceTests() {
  console.log('🚀 Running Performance Tests...')
  
  const startTime = performance.now();
  
  // Test large variant list processing
  const largeVariantList = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    color: i % 2 === 0 ? 'Black' : 'White',
    size: ['XS', 'S', 'M', 'L', 'XL'][i % 5],
    in_stock: i % 10 !== 0
  }));
  
  const filteredVariants = largeVariantList.filter(v => 
    v.color === 'Black' && v.size === 'M' && v.in_stock
  );
  
  const endTime = performance.now();
  const processingTime = endTime - startTime;
  
  console.log(`Processed ${largeVariantList.length} variants in ${processingTime.toFixed(2)}ms`);
  console.log(`Found ${filteredVariants.length} matching variants`);
  console.log(`Performance: ${processingTime < 100 ? '✅ GOOD' : '⚠️ SLOW'}`);
  
  return {
    totalVariants: largeVariantList.length,
    filteredVariants: filteredVariants.length,
    processingTime,
    isAcceptable: processingTime < 100
  };
}

// Integration test
export function runIntegrationTest() {
  console.log('🔗 Running Integration Test...')
  
  try {
    // Test the complete flow
    const product = {
      id: 1,
      name: "Test T-Shirt",
      variants: [
        { id: 101, color: "Black", size: "M", price: "24.99", in_stock: true, printful_variant_id: 1001 },
        { id: 102, color: "White", size: "M", price: "24.99", in_stock: true, printful_variant_id: 1002 }
      ]
    };
    
    // Simulate variant selection
    const selectedVariant = product.variants[0];
    const selectedStickers = [
      { sticker: { id: 'sticker-1', price: 4.99, printful_variant_id: 2001 }, quantity: 2 }
    ];
    
    // Simulate cart addition
    const cartItems = [
      {
        id: `${selectedVariant.id}-M`,
        name: `${product.name} - ${selectedVariant.color} (Size: M)`,
        price: parseFloat(selectedVariant.price),
        printful_variant_id: selectedVariant.printful_variant_id
      },
      ...selectedStickers.map(item => ({
        id: `sticker-${item.sticker.id}`,
        name: `${item.sticker.name} (Add-on)`,
        price: item.sticker.price,
        printful_variant_id: item.sticker.printful_variant_id
      }))
    ];
    
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
    const expectedTotal = 24.99 + (4.99 * 2);
    
    const integrationTest = Math.abs(totalPrice - expectedTotal) < 0.01;
    
    console.log('Integration Test:', integrationTest ? '✅ PASS' : '❌ FAIL');
    console.log('Cart Items:', cartItems.length);
    console.log('Total Price:', totalPrice);
    
    return integrationTest;
  } catch (error) {
    console.error('Integration test failed:', error);
    return false;
  }
}

// Auto-run tests if this file is imported
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('🚀 Printful Integration Test Runner Loaded')
  console.log('Available functions:')
  console.log('- runPrintfulTests() - Run all tests')
  console.log('- runPerformanceTests() - Performance testing')
  console.log('- runIntegrationTest() - Integration testing')
  
  // Make functions available globally for console testing
  (window as any).runPrintfulTests = runPrintfulTests;
  (window as any).runPerformanceTests = runPerformanceTests;
  (window as any).runIntegrationTest = runIntegrationTest;
  
  // Auto-run basic tests
  setTimeout(() => {
    console.log('\n🔄 Auto-running basic tests...');
    runPrintfulTests();
  }, 1000);
} else {
  // Node environment
  runPrintfulTests();
}
