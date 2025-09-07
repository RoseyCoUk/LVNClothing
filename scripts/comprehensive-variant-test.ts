#!/usr/bin/env tsx
/**
 * Comprehensive Printful Variant ID Testing Script
 * 
 * This script validates that all variant IDs are correctly configured and tests 
 * shipping quotes to ensure proper catalog variant IDs are being sent to Printful.
 * 
 * Tests:
 * 1. All individual product variant configurations
 * 2. Bundle product configurations
 * 3. Sync-to-catalog variant ID mappings
 * 4. Shipping quote API with various combinations
 * 5. Edge cases and error conditions
 */

import { TshirtVariants, findTshirtVariant, findTshirtVariantByCatalogId } from '../src/hooks/tshirt-variants';
import { HoodieVariants, findHoodieVariant, findHoodieVariantByCatalogId } from '../src/hooks/hoodie-variants';
import { CapVariants, findCapVariant, findCapVariantByCatalogId } from '../src/hooks/cap-variants';
import { MugVariants, findMugVariant, findMugVariantByCatalogId } from '../src/hooks/mug-variants';
import { TotebagVariants, findTotebagVariant, findTotebagVariantByCatalogId } from '../src/hooks/totebag-variants';
import { WaterbottleVariants, findWaterbottleVariant, findWaterbottleVariantByCatalogId } from '../src/hooks/waterbottle-variants';
import { MousepadVariants, findMousepadVariant, findMousepadVariantByCatalogId } from '../src/hooks/mousepad-variants';
import { BUNDLES } from '../src/lib/bundle-pricing';

// Test configuration
const TEST_CONFIG = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  // Test recipient data
  TEST_RECIPIENT: {
    name: 'Test Customer',
    address1: '123 Test Street',
    city: 'London',
    country_code: 'GB',
    zip: 'SW1A 1AA',
    state_code: '',
    email: 'test@example.com'
  }
};

interface TestResult {
  testName: string;
  success: boolean;
  details: string;
  errors?: string[];
  data?: any;
}

interface VariantTestSummary {
  productType: string;
  totalVariants: number;
  validCatalogIds: number;
  validSyncIds: number;
  invalidVariants: number;
  duplicateCatalogIds: number;
  duplicateSyncIds: number;
}

class VariantTester {
  private results: TestResult[] = [];
  private allVariants: Array<{
    productType: string;
    key: string;
    catalogVariantId: number;
    syncVariantId: number;
    name: string;
  }> = [];

  constructor() {
    this.collectAllVariants();
  }

  private collectAllVariants() {
    // Collect all variants from all product types
    TshirtVariants.forEach(v => this.allVariants.push({ productType: 'T-Shirt', ...v }));
    HoodieVariants.forEach(v => this.allVariants.push({ productType: 'Hoodie', ...v }));
    CapVariants.forEach(v => this.allVariants.push({ productType: 'Cap', ...v }));
    MugVariants.forEach(v => this.allVariants.push({ productType: 'Mug', ...v }));
    TotebagVariants.forEach(v => this.allVariants.push({ productType: 'Tote Bag', ...v }));
    WaterbottleVariants.forEach(v => this.allVariants.push({ productType: 'Water Bottle', ...v }));
    MousepadVariants.forEach(v => this.allVariants.push({ productType: 'Mouse Pad', ...v }));
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Printful Variant ID Testing\n');
    console.log('=' .repeat(80));

    // Test 1: Individual product variant validation
    await this.testIndividualProductVariants();
    
    // Test 2: Catalog vs Sync variant ID consistency
    await this.testVariantIdConsistency();
    
    // Test 3: Bundle configurations
    await this.testBundleConfigurations();
    
    // Test 4: Shipping quotes with different variant ID formats
    await this.testShippingQuotes();
    
    // Test 5: Edge cases and error conditions
    await this.testEdgeCases();

    // Generate final report
    this.generateFinalReport();
  }

  private async testIndividualProductVariants() {
    console.log('\n📦 Testing Individual Product Variants');
    console.log('-'.repeat(50));

    const productTests = [
      { name: 'T-Shirt', variants: TshirtVariants, finder: findTshirtVariant, catalogFinder: findTshirtVariantByCatalogId },
      { name: 'Hoodie', variants: HoodieVariants, finder: findHoodieVariant, catalogFinder: findHoodieVariantByCatalogId },
      { name: 'Cap', variants: CapVariants, finder: findCapVariant, catalogFinder: findCapVariantByCatalogId },
      { name: 'Mug', variants: MugVariants, finder: findMugVariant, catalogFinder: findMugVariantByCatalogId },
      { name: 'Tote Bag', variants: TotebagVariants, finder: findTotebagVariant, catalogFinder: findTotebagVariantByCatalogId },
      { name: 'Water Bottle', variants: WaterbottleVariants, finder: findWaterbottleVariant, catalogFinder: findWaterbottleVariantByCatalogId },
      { name: 'Mouse Pad', variants: MousepadVariants, finder: findMousepadVariant, catalogFinder: findMousepadVariantByCatalogId },
    ];

    for (const product of productTests) {
      await this.testProductVariants(product.name, product.variants, product.finder, product.catalogFinder);
    }
  }

  private async testProductVariants(
    productName: string, 
    variants: any[], 
    finder: Function, 
    catalogFinder: Function
  ) {
    const summary: VariantTestSummary = {
      productType: productName,
      totalVariants: variants.length,
      validCatalogIds: 0,
      validSyncIds: 0,
      invalidVariants: 0,
      duplicateCatalogIds: 0,
      duplicateSyncIds: 0
    };

    const errors: string[] = [];
    const catalogIds = new Set<number>();
    const syncIds = new Set<number>();
    const duplicateCatalogIds = new Set<number>();
    const duplicateSyncIds = new Set<number>();

    console.log(`\n  Testing ${productName} variants (${variants.length} total):`);

    for (const variant of variants) {
      let variantErrors: string[] = [];

      // Test basic variant structure
      if (!variant.key || typeof variant.key !== 'string') {
        variantErrors.push(`Missing or invalid key: ${variant.key}`);
      }

      if (!variant.catalogVariantId || typeof variant.catalogVariantId !== 'number') {
        variantErrors.push(`Missing or invalid catalogVariantId: ${variant.catalogVariantId}`);
      } else {
        if (catalogIds.has(variant.catalogVariantId)) {
          duplicateCatalogIds.add(variant.catalogVariantId);
          variantErrors.push(`Duplicate catalogVariantId: ${variant.catalogVariantId}`);
        } else {
          catalogIds.add(variant.catalogVariantId);
          summary.validCatalogIds++;
        }
      }

      if (!variant.syncVariantId || typeof variant.syncVariantId !== 'number') {
        variantErrors.push(`Missing or invalid syncVariantId: ${variant.syncVariantId}`);
      } else {
        if (syncIds.has(variant.syncVariantId)) {
          duplicateSyncIds.add(variant.syncVariantId);
          variantErrors.push(`Duplicate syncVariantId: ${variant.syncVariantId}`);
        } else {
          syncIds.add(variant.syncVariantId);
          summary.validSyncIds++;
        }
      }

      // Test finder functions
      try {
        const foundVariant = finder(variant.key);
        if (!foundVariant) {
          variantErrors.push(`Finder function failed for key: ${variant.key}`);
        }
      } catch (e) {
        variantErrors.push(`Finder function error for key ${variant.key}: ${e}`);
      }

      try {
        const foundVariant = catalogFinder(variant.catalogVariantId);
        if (!foundVariant) {
          variantErrors.push(`Catalog finder function failed for ID: ${variant.catalogVariantId}`);
        }
      } catch (e) {
        variantErrors.push(`Catalog finder function error for ID ${variant.catalogVariantId}: ${e}`);
      }

      if (variantErrors.length > 0) {
        summary.invalidVariants++;
        errors.push(`Variant ${variant.key}: ${variantErrors.join(', ')}`);
      }
    }

    summary.duplicateCatalogIds = duplicateCatalogIds.size;
    summary.duplicateSyncIds = duplicateSyncIds.size;

    const success = summary.invalidVariants === 0 && summary.duplicateCatalogIds === 0 && summary.duplicateSyncIds === 0;

    console.log(`    ✅ Valid catalog IDs: ${summary.validCatalogIds}`);
    console.log(`    ✅ Valid sync IDs: ${summary.validSyncIds}`);
    if (summary.duplicateCatalogIds > 0) console.log(`    ❌ Duplicate catalog IDs: ${summary.duplicateCatalogIds}`);
    if (summary.duplicateSyncIds > 0) console.log(`    ❌ Duplicate sync IDs: ${summary.duplicateSyncIds}`);
    if (summary.invalidVariants > 0) console.log(`    ❌ Invalid variants: ${summary.invalidVariants}`);

    this.results.push({
      testName: `${productName} Variants`,
      success,
      details: `${summary.validCatalogIds}/${summary.totalVariants} valid variants`,
      errors: errors.length > 0 ? errors : undefined,
      data: summary
    });
  }

  private async testVariantIdConsistency() {
    console.log('\n🔍 Testing Variant ID Consistency');
    console.log('-'.repeat(50));

    const catalogIdCounts = new Map<number, string[]>();
    const syncIdCounts = new Map<number, string[]>();
    const errors: string[] = [];

    // Check for duplicate IDs across all products
    for (const variant of this.allVariants) {
      const catalogKey = `${variant.productType}:${variant.key}`;
      const syncKey = `${variant.productType}:${variant.key}`;

      if (catalogIdCounts.has(variant.catalogVariantId)) {
        catalogIdCounts.get(variant.catalogVariantId)!.push(catalogKey);
      } else {
        catalogIdCounts.set(variant.catalogVariantId, [catalogKey]);
      }

      if (syncIdCounts.has(variant.syncVariantId)) {
        syncIdCounts.get(variant.syncVariantId)!.push(syncKey);
      } else {
        syncIdCounts.set(variant.syncVariantId, [syncKey]);
      }
    }

    // Find duplicates
    const duplicateCatalogIds = Array.from(catalogIdCounts.entries())
      .filter(([id, variants]) => variants.length > 1);
    
    const duplicateSyncIds = Array.from(syncIdCounts.entries())
      .filter(([id, variants]) => variants.length > 1);

    if (duplicateCatalogIds.length > 0) {
      errors.push(`Duplicate catalog IDs found: ${duplicateCatalogIds.map(([id, variants]) => 
        `${id} (used by: ${variants.join(', ')})`).join('; ')}`);
    }

    if (duplicateSyncIds.length > 0) {
      errors.push(`Duplicate sync IDs found: ${duplicateSyncIds.map(([id, variants]) => 
        `${id} (used by: ${variants.join(', ')})`).join('; ')}`);
    }

    console.log(`  📊 Total unique catalog IDs: ${catalogIdCounts.size}`);
    console.log(`  📊 Total unique sync IDs: ${syncIdCounts.size}`);
    console.log(`  📊 Total variants tested: ${this.allVariants.length}`);

    if (duplicateCatalogIds.length > 0) {
      console.log(`  ❌ Duplicate catalog IDs: ${duplicateCatalogIds.length}`);
    }

    if (duplicateSyncIds.length > 0) {
      console.log(`  ❌ Duplicate sync IDs: ${duplicateSyncIds.length}`);
    }

    const success = errors.length === 0;

    this.results.push({
      testName: 'Variant ID Consistency',
      success,
      details: `${this.allVariants.length} variants checked, ${catalogIdCounts.size} unique catalog IDs, ${syncIdCounts.size} unique sync IDs`,
      errors: errors.length > 0 ? errors : undefined,
      data: {
        totalVariants: this.allVariants.length,
        uniqueCatalogIds: catalogIdCounts.size,
        uniqueSyncIds: syncIdCounts.size,
        duplicateCatalogIds: duplicateCatalogIds.length,
        duplicateSyncIds: duplicateSyncIds.length
      }
    });
  }

  private async testBundleConfigurations() {
    console.log('\n📦 Testing Bundle Configurations');
    console.log('-'.repeat(50));

    const errors: string[] = [];
    const bundleResults: any = {};

    for (const [bundleKey, bundle] of Object.entries(BUNDLES)) {
      console.log(`\n  Testing ${bundle.name}:`);
      
      const bundleErrors: string[] = [];
      const productDetails: any[] = [];

      for (const product of bundle.products) {
        console.log(`    - ${product.name} (Product ID: ${product.productId})`);
        
        // Find variants for this product
        const productVariants = this.allVariants.filter(v => {
          // Map product IDs to product types
          const productTypeMapping: Record<number, string> = {
            1: 'T-Shirt',
            2: 'Hoodie',
            3: 'Cap',
            4: 'Mug',
            5: 'Tote Bag',
            6: 'Water Bottle',
            7: 'Mouse Pad'
          };
          
          return v.productType === productTypeMapping[product.productId];
        });

        if (productVariants.length === 0) {
          bundleErrors.push(`No variants found for ${product.name} (Product ID: ${product.productId})`);
        } else {
          console.log(`      Found ${productVariants.length} variants`);
          
          // Test a sample variant for shipping quote compatibility
          const sampleVariant = productVariants[0];
          productDetails.push({
            productId: product.productId,
            productName: product.name,
            variantCount: productVariants.length,
            sampleCatalogId: sampleVariant.catalogVariantId,
            sampleSyncId: sampleVariant.syncVariantId
          });
        }
      }

      bundleResults[bundleKey] = {
        name: bundle.name,
        productCount: bundle.products.length,
        errors: bundleErrors,
        products: productDetails
      };

      if (bundleErrors.length > 0) {
        errors.push(...bundleErrors.map(e => `${bundle.name}: ${e}`));
        console.log(`    ❌ Errors found: ${bundleErrors.length}`);
      } else {
        console.log(`    ✅ Configuration valid`);
      }
    }

    const success = errors.length === 0;

    this.results.push({
      testName: 'Bundle Configurations',
      success,
      details: `${Object.keys(BUNDLES).length} bundles tested`,
      errors: errors.length > 0 ? errors : undefined,
      data: bundleResults
    });
  }

  private async testShippingQuotes() {
    console.log('\n🚚 Testing Shipping Quote API');
    console.log('-'.repeat(50));

    const errors: string[] = [];
    const quoteTests: any[] = [];

    // Test cases with different variant ID formats
    const testCases = [
      {
        name: 'Single T-Shirt (Catalog ID)',
        items: [{ printful_variant_id: TshirtVariants[0].catalogVariantId, quantity: 1 }],
        expectedIdType: 'catalog'
      },
      {
        name: 'Single T-Shirt (Sync ID)', 
        items: [{ printful_variant_id: TshirtVariants[0].syncVariantId, quantity: 1 }],
        expectedIdType: 'sync'
      },
      {
        name: 'Mixed Bundle (Catalog IDs)',
        items: [
          { printful_variant_id: TshirtVariants[0].catalogVariantId, quantity: 1 },
          { printful_variant_id: CapVariants[0].catalogVariantId, quantity: 1 },
          { printful_variant_id: MugVariants[0].catalogVariantId, quantity: 1 }
        ],
        expectedIdType: 'catalog'
      },
      {
        name: 'Mixed Bundle (Sync IDs)',
        items: [
          { printful_variant_id: TshirtVariants[0].syncVariantId, quantity: 1 },
          { printful_variant_id: CapVariants[0].syncVariantId, quantity: 1 },
          { printful_variant_id: MugVariants[0].syncVariantId, quantity: 1 }
        ],
        expectedIdType: 'sync'
      },
      {
        name: 'Large Order (Multiple Quantities)',
        items: [
          { printful_variant_id: TshirtVariants[0].catalogVariantId, quantity: 3 },
          { printful_variant_id: HoodieVariants[0].catalogVariantId, quantity: 2 }
        ],
        expectedIdType: 'catalog'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n  Testing: ${testCase.name}`);
      
      try {
        const requestPayload = {
          recipient: TEST_CONFIG.TEST_RECIPIENT,
          items: testCase.items
        };

        console.log(`    Items: ${testCase.items.map(i => `${i.printful_variant_id} (qty: ${i.quantity})`).join(', ')}`);

        const startTime = Date.now();
        const response = await fetch(`${TEST_CONFIG.SUPABASE_URL}/functions/v1/shipping-quotes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(requestPayload)
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const responseData = await response.json();

        console.log(`    Response time: ${responseTime}ms`);
        console.log(`    Status: ${response.status}`);

        if (response.ok) {
          console.log(`    ✅ Success: ${responseData.options?.length || 0} shipping options returned`);
          
          if (responseData.options && responseData.options.length > 0) {
            const firstOption = responseData.options[0];
            console.log(`    First option: ${firstOption.name} - £${firstOption.rate} (${firstOption.minDeliveryDays}-${firstOption.maxDeliveryDays} days)`);
          }

          quoteTests.push({
            ...testCase,
            success: true,
            responseTime,
            optionsCount: responseData.options?.length || 0,
            firstOptionRate: responseData.options?.[0]?.rate
          });
        } else {
          console.log(`    ❌ Failed: ${responseData.error || 'Unknown error'}`);
          errors.push(`${testCase.name}: ${responseData.error || 'Unknown error'} (Status: ${response.status})`);
          
          quoteTests.push({
            ...testCase,
            success: false,
            responseTime,
            error: responseData.error,
            status: response.status
          });
        }

      } catch (error) {
        console.log(`    ❌ Request failed: ${error}`);
        errors.push(`${testCase.name}: Request failed - ${error}`);
        
        quoteTests.push({
          ...testCase,
          success: false,
          error: error.toString()
        });
      }

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successfulTests = quoteTests.filter(t => t.success).length;
    const success = errors.length === 0;

    console.log(`\n  📊 Results: ${successfulTests}/${quoteTests.length} tests passed`);

    this.results.push({
      testName: 'Shipping Quote API',
      success,
      details: `${successfulTests}/${quoteTests.length} quote requests successful`,
      errors: errors.length > 0 ? errors : undefined,
      data: quoteTests
    });
  }

  private async testEdgeCases() {
    console.log('\n⚠️  Testing Edge Cases');
    console.log('-'.repeat(50));

    const errors: string[] = [];
    const edgeCaseTests: any[] = [];

    const edgeCases = [
      {
        name: 'Invalid Variant ID',
        items: [{ printful_variant_id: 999999999, quantity: 1 }],
        shouldFail: true
      },
      {
        name: 'Zero Quantity',
        items: [{ printful_variant_id: TshirtVariants[0].catalogVariantId, quantity: 0 }],
        shouldFail: false // System should handle this gracefully
      },
      {
        name: 'Negative Quantity',
        items: [{ printful_variant_id: TshirtVariants[0].catalogVariantId, quantity: -1 }],
        shouldFail: true
      },
      {
        name: 'String Variant ID',
        items: [{ printful_variant_id: 'invalid-id', quantity: 1 }],
        shouldFail: true
      },
      {
        name: 'Empty Items Array',
        items: [],
        shouldFail: true
      },
      {
        name: 'Missing Recipient Country',
        items: [{ printful_variant_id: TshirtVariants[0].catalogVariantId, quantity: 1 }],
        recipient: { ...TEST_CONFIG.TEST_RECIPIENT, country_code: '' },
        shouldFail: true
      }
    ];

    for (const edgeCase of edgeCases) {
      console.log(`\n  Testing: ${edgeCase.name}`);

      try {
        const requestPayload = {
          recipient: edgeCase.recipient || TEST_CONFIG.TEST_RECIPIENT,
          items: edgeCase.items
        };

        const response = await fetch(`${TEST_CONFIG.SUPABASE_URL}/functions/v1/shipping-quotes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_CONFIG.SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(requestPayload)
        });

        const responseData = await response.json();
        const actuallyFailed = !response.ok;
        const expectedResult = edgeCase.shouldFail ? 'fail' : 'succeed';
        const actualResult = actuallyFailed ? 'failed' : 'succeeded';
        const testPassed = (edgeCase.shouldFail && actuallyFailed) || (!edgeCase.shouldFail && !actuallyFailed);

        console.log(`    Expected to ${expectedResult}, actually ${actualResult}`);
        console.log(`    Status: ${response.status}`);

        if (testPassed) {
          console.log(`    ✅ Edge case handled correctly`);
        } else {
          console.log(`    ❌ Edge case not handled as expected`);
          errors.push(`${edgeCase.name}: Expected to ${expectedResult} but ${actualResult}`);
        }

        edgeCaseTests.push({
          ...edgeCase,
          testPassed,
          actuallyFailed,
          status: response.status,
          response: responseData
        });

      } catch (error) {
        const testPassed = edgeCase.shouldFail; // If we expected failure and got an exception, that's okay
        
        if (testPassed) {
          console.log(`    ✅ Exception thrown as expected: ${error}`);
        } else {
          console.log(`    ❌ Unexpected exception: ${error}`);
          errors.push(`${edgeCase.name}: Unexpected exception - ${error}`);
        }

        edgeCaseTests.push({
          ...edgeCase,
          testPassed,
          exception: error.toString()
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const successfulEdgeCases = edgeCaseTests.filter(t => t.testPassed).length;
    const success = errors.length === 0;

    console.log(`\n  📊 Results: ${successfulEdgeCases}/${edgeCaseTests.length} edge cases handled correctly`);

    this.results.push({
      testName: 'Edge Cases',
      success,
      details: `${successfulEdgeCases}/${edgeCaseTests.length} edge cases handled correctly`,
      errors: errors.length > 0 ? errors : undefined,
      data: edgeCaseTests
    });
  }

  private generateFinalReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(80));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    console.log(`\n📋 DETAILED RESULTS:`);
    console.log('-'.repeat(80));

    for (const result of this.results) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.testName}: ${result.details}`);
      
      if (result.errors && result.errors.length > 0) {
        console.log(`     Errors:`);
        for (const error of result.errors) {
          console.log(`       - ${error}`);
        }
      }
      console.log('');
    }

    // Generate summary recommendations
    console.log('🔧 RECOMMENDATIONS:');
    console.log('-'.repeat(80));

    if (failedTests === 0) {
      console.log('✅ All tests passed! Your Printful variant configuration appears to be working correctly.');
    } else {
      console.log('❌ Some tests failed. Review the errors above and consider the following:');
      
      const variantTestsFailed = this.results.some(r => r.testName.includes('Variants') && !r.success);
      const consistencyTestsFailed = this.results.some(r => r.testName === 'Variant ID Consistency' && !r.success);
      const shippingTestsFailed = this.results.some(r => r.testName === 'Shipping Quote API' && !r.success);
      
      if (variantTestsFailed) {
        console.log('  1. Fix variant structure issues in the product variant files');
        console.log('     - Ensure all variants have valid catalogVariantId and syncVariantId');
        console.log('     - Remove any duplicate IDs within product types');
      }
      
      if (consistencyTestsFailed) {
        console.log('  2. Resolve variant ID conflicts across different product types');
        console.log('     - Each catalog variant ID should be unique across all products');
        console.log('     - Each sync variant ID should be unique across all products');
      }
      
      if (shippingTestsFailed) {
        console.log('  3. Fix shipping quote API issues');
        console.log('     - Verify the edge function is correctly converting sync IDs to catalog IDs');
        console.log('     - Check Printful API credentials and network connectivity');
        console.log('     - Ensure all variant IDs in the mapping table are valid');
      }
    }

    console.log('\n🧪 TEST DATA AVAILABLE:');
    console.log('   - All test results are stored in the VariantTester instance');
    console.log('   - Detailed variant data, shipping responses, and error logs included');
    console.log('   - Use this data to debug specific issues or validate fixes');

    console.log('\n' + '='.repeat(80));
    console.log('Test completed successfully! 🎉');
    console.log('='.repeat(80));
  }

  // Getter for accessing detailed results
  getResults() {
    return this.results;
  }

  getAllVariants() {
    return this.allVariants;
  }
}

// Main execution function
async function main() {
  try {
    const tester = new VariantTester();
    await tester.runAllTests();
    
    // Optional: Save results to file for further analysis
    const results = {
      timestamp: new Date().toISOString(),
      results: tester.getResults(),
      allVariants: tester.getAllVariants(),
      summary: {
        totalVariants: tester.getAllVariants().length,
        totalTests: tester.getResults().length,
        passedTests: tester.getResults().filter(r => r.success).length,
        failedTests: tester.getResults().filter(r => !r.success).length
      }
    };

    // Uncomment to save detailed results to a file
    // import fs from 'fs';
    // fs.writeFileSync('./test-results.json', JSON.stringify(results, null, 2));
    // console.log('\n📄 Detailed results saved to test-results.json');

  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run the tests if this script is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}

export { VariantTester, main };