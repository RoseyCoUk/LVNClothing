#!/usr/bin/env tsx

import { testMugVariants } from './test-mug-variants';

console.log('🚀 Mug Variants Test Runner');
console.log('============================\n');

try {
  const results = testMugVariants();
  
  console.log('\n🎉 Test Execution Complete!');
  console.log(`📈 Results: ${results.passedTests}/${results.totalTests} tests passed`);
  
  if (results.allTestsPassed) {
    console.log('🎯 All mug variant tests passed successfully!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please review the results above.');
    process.exit(1);
  }
} catch (error) {
  console.error('💥 Test execution failed with error:', error);
  process.exit(1);
}
