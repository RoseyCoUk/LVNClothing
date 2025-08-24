// Simple test runner for shipping integration
import { testMoneyUtils, testTypes, validateTestData } from './test-shipping-utils'

export async function runBasicTests() {
  console.log('🧪 Running Basic Tests...')
  
  const results = {
    moneyUtils: false,
    types: false,
    dataValidation: false
  }
  
  try {
    // Test money utilities
    console.log('\n💰 Testing Money Utils...')
    const moneyResults = testMoneyUtils()
    results.moneyUtils = Object.values(moneyResults).every(Boolean)
    console.log('Money Utils:', results.moneyUtils ? '✅ PASS' : '❌ FAIL')
    
    // Test types
    console.log('\n📝 Testing Types...')
    testTypes()
    results.types = true
    console.log('Types: ✅ PASS')
    
    // Test data validation
    console.log('\n🔍 Testing Data Validation...')
    const dataValid = validateTestData()
    results.dataValidation = dataValid
    console.log('Data Validation:', dataValid ? '✅ PASS' : '❌ FAIL')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
  
  const allPassed = Object.values(results).every(Boolean)
  console.log(`\n📊 Test Results: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}`)
  console.log('Results:', results)
  
  return results
}

// Auto-run tests if this file is imported
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('🚀 Shipping Integration Test Runner Loaded')
  console.log('Run runBasicTests() to start testing')
  
  // Make it available globally for console testing
  ;(window as any).runBasicTests = runBasicTests
} else {
  // Node environment
  runBasicTests()
}
