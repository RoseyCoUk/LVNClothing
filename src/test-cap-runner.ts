#!/usr/bin/env tsx

import { testCapVariants } from './test-cap-variants';

console.log('🚀 Cap Variants Test Runner');
console.log('============================\n');

try {
  const results = testCapVariants();
  
  console.log('\n🎉 Test Execution Complete!');
  console.log(`📈 Results: ${results.passedTests}/${results.totalTests} tests passed`);
  
  if (results.allTestsPassed) {
    console.log('🎯 All cap variant tests passed successfully!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please review the results above.');
    process.exit(1);
  }
} catch (error) {
  console.error('💥 Test execution failed with error:', error);
  process.exit(1);
}
