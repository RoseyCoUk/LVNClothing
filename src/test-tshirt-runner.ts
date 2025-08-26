// Simple test runner for T-shirt variants
import { runAllTShirtTests } from './test-tshirt-variants';

// Run the tests when this file is executed
console.log('🚀 Starting T-shirt Variant Test Suite...\n');

try {
  const success = runAllTShirtTests();
  
  if (success) {
    console.log('\n🎉 Test suite completed successfully!');
    process.exit(0);
  } else {
    console.log('\n💥 Test suite failed!');
    process.exit(1);
  }
} catch (error) {
  console.error('\n💥 Test suite crashed with error:', error);
  process.exit(1);
}
