#!/usr/bin/env tsx

import ComprehensiveTestRunner from './test-runner';

async function main() {
  console.log('🎯 Reform UK Frontend Testing Suite');
  console.log('====================================');
  console.log('');

  const runner = new ComprehensiveTestRunner();
  
  try {
    await runner.runAllTests();
    console.log('');
    console.log('🎉 Testing completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Testing failed:', error);
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);

