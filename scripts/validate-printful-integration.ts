#!/usr/bin/env tsx
/**
 * Printful Integration Validation Script
 * 
 * This script performs a comprehensive validation of the Printful integration,
 * focusing on variant ID correctness and shipping quote accuracy.
 */

import { TshirtVariants } from '../src/hooks/tshirt-variants';
import { HoodieVariants } from '../src/hooks/hoodie-variants';
import { CapVariants } from '../src/hooks/cap-variants';
import { MugVariants } from '../src/hooks/mug-variants';
import { TotebagVariants } from '../src/hooks/totebag-variants';
import { WaterbottleVariants } from '../src/hooks/waterbottle-variants';
import { MousepadVariants } from '../src/hooks/mousepad-variants';

const TEST_CONFIG = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
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

interface ValidationResult {
  testName: string;
  success: boolean;
  details: string;
  data?: any;
  issues?: string[];
}

class PrintfulValidator {
  private results: ValidationResult[] = [];

  async validate() {
    console.log('🔬 Printful Integration Validation');
    console.log('=' .repeat(70));
    
    // Test 1: Variant ID Mapping Accuracy
    await this.validateVariantMappings();
    
    // Test 2: Shipping Quote Consistency
    await this.validateShippingQuoteConsistency();
    
    // Test 3: Bundle Variant ID Handling
    await this.validateBundleHandling();
    
    // Test 4: Edge Function Conversion Logic
    await this.validateConversionLogic();
    
    this.generateReport();
  }

  private async validateVariantMappings() {
    console.log('\n📋 Validating Variant ID Mappings');
    console.log('-'.repeat(40));

    const allVariants = [
      ...TshirtVariants.map(v => ({ ...v, type: 'T-Shirt' })),
      ...HoodieVariants.map(v => ({ ...v, type: 'Hoodie' })),
      ...CapVariants.map(v => ({ ...v, type: 'Cap' })),
      ...MugVariants.map(v => ({ ...v, type: 'Mug' })),
      ...TotebagVariants.map(v => ({ ...v, type: 'Tote Bag' })),
      ...WaterbottleVariants.map(v => ({ ...v, type: 'Water Bottle' })),
      ...MousepadVariants.map(v => ({ ...v, type: 'Mouse Pad' })),
    ];

    const issues: string[] = [];
    const mappingStats = {
      totalVariants: allVariants.length,
      validCatalogIds: 0,
      validSyncIds: 0,
      catalogIdRange: { min: Infinity, max: -Infinity },
      syncIdRange: { min: Infinity, max: -Infinity },
      duplicateCatalogIds: new Set<number>(),
      duplicateSyncIds: new Set<number>(),
      catalogIdsByType: new Map<string, number[]>(),
      syncIdsByType: new Map<string, number[]>()
    };

    const catalogIds = new Set<number>();
    const syncIds = new Set<number>();

    for (const variant of allVariants) {
      // Track catalog IDs
      if (catalogIds.has(variant.catalogVariantId)) {
        mappingStats.duplicateCatalogIds.add(variant.catalogVariantId);
        issues.push(`Duplicate catalog ID ${variant.catalogVariantId} in ${variant.type}`);
      } else {
        catalogIds.add(variant.catalogVariantId);
        mappingStats.validCatalogIds++;
        
        if (!mappingStats.catalogIdsByType.has(variant.type)) {
          mappingStats.catalogIdsByType.set(variant.type, []);
        }
        mappingStats.catalogIdsByType.get(variant.type)!.push(variant.catalogVariantId);
        
        mappingStats.catalogIdRange.min = Math.min(mappingStats.catalogIdRange.min, variant.catalogVariantId);
        mappingStats.catalogIdRange.max = Math.max(mappingStats.catalogIdRange.max, variant.catalogVariantId);
      }

      // Track sync IDs
      if (syncIds.has(variant.syncVariantId)) {
        mappingStats.duplicateSyncIds.add(variant.syncVariantId);
        issues.push(`Duplicate sync ID ${variant.syncVariantId} in ${variant.type}`);
      } else {
        syncIds.add(variant.syncVariantId);
        mappingStats.validSyncIds++;
        
        if (!mappingStats.syncIdsByType.has(variant.type)) {
          mappingStats.syncIdsByType.set(variant.type, []);
        }
        mappingStats.syncIdsByType.get(variant.type)!.push(variant.syncVariantId);
        
        mappingStats.syncIdRange.min = Math.min(mappingStats.syncIdRange.min, variant.syncVariantId);
        mappingStats.syncIdRange.max = Math.max(mappingStats.syncIdRange.max, variant.syncVariantId);
      }
    }

    console.log(`  📊 Total variants: ${mappingStats.totalVariants}`);
    console.log(`  📊 Valid catalog IDs: ${mappingStats.validCatalogIds}`);
    console.log(`  📊 Valid sync IDs: ${mappingStats.validSyncIds}`);
    console.log(`  📊 Catalog ID range: ${mappingStats.catalogIdRange.min} - ${mappingStats.catalogIdRange.max}`);
    console.log(`  📊 Sync ID range: ${mappingStats.syncIdRange.min} - ${mappingStats.syncIdRange.max}`);
    console.log(`  📊 Duplicate catalog IDs: ${mappingStats.duplicateCatalogIds.size}`);
    console.log(`  📊 Duplicate sync IDs: ${mappingStats.duplicateSyncIds.size}`);

    // Display variant counts by type
    console.log('\n  Product Type Breakdown:');
    for (const [type, catalogIds] of mappingStats.catalogIdsByType) {
      const syncIds = mappingStats.syncIdsByType.get(type) || [];
      console.log(`    ${type}: ${catalogIds.length} variants (catalog: ${Math.min(...catalogIds)}-${Math.max(...catalogIds)}, sync: ${Math.min(...syncIds)}-${Math.max(...syncIds)})`);
    }

    const success = issues.length === 0;
    if (success) {
      console.log('  ✅ All variant mappings are valid');
    } else {
      console.log(`  ❌ Found ${issues.length} mapping issues`);
    }

    this.results.push({
      testName: 'Variant ID Mappings',
      success,
      details: `${mappingStats.validCatalogIds}/${mappingStats.totalVariants} valid catalog IDs, ${mappingStats.validSyncIds}/${mappingStats.totalVariants} valid sync IDs`,
      data: mappingStats,
      issues: issues.length > 0 ? issues : undefined
    });
  }

  private async validateShippingQuoteConsistency() {
    console.log('\n🚚 Validating Shipping Quote Consistency');
    console.log('-'.repeat(40));

    const testCases = [
      { name: 'T-Shirt Single', variants: [TshirtVariants[0]] },
      { name: 'Hoodie Single', variants: [HoodieVariants[0]] },
      { name: 'Mixed Bundle', variants: [TshirtVariants[0], CapVariants[0]] },
      { name: 'Large Order', variants: [TshirtVariants[0], TshirtVariants[1], HoodieVariants[0]] }
    ];

    const consistencyResults = [];
    const issues: string[] = [];

    for (const testCase of testCases) {
      console.log(`\n  Testing: ${testCase.name}`);
      
      try {
        // Test with different recipient countries to check rate variations
        const recipients = [
          { name: 'UK', ...TEST_CONFIG.TEST_RECIPIENT, country_code: 'GB' },
          { name: 'US', ...TEST_CONFIG.TEST_RECIPIENT, country_code: 'US', zip: '10001' },
        ];

        for (const recipient of recipients) {
          console.log(`    📍 Testing shipping to ${recipient.name}:`);
          
          const catalogRequest = {
            recipient,
            items: testCase.variants.map(v => ({ printful_variant_id: v.catalogVariantId, quantity: 1 }))
          };

          const syncRequest = {
            recipient,
            items: testCase.variants.map(v => ({ printful_variant_id: v.syncVariantId, quantity: 1 }))
          };

          const catalogResponse = await this.fetchShippingQuote(catalogRequest);
          await this.delay(500); // Rate limiting
          const syncResponse = await this.fetchShippingQuote(syncRequest);

          const catalogRate = catalogResponse.options?.[0]?.rate || 'N/A';
          const syncRate = syncResponse.options?.[0]?.rate || 'N/A';

          console.log(`      Catalog IDs: £${catalogRate} (${catalogResponse.options?.length || 0} options)`);
          console.log(`      Sync IDs:    £${syncRate} (${syncResponse.options?.length || 0} options)`);

          if (catalogRate !== syncRate) {
            issues.push(`${testCase.name} to ${recipient.name}: Rate mismatch - Catalog: £${catalogRate}, Sync: £${syncRate}`);
            console.log('      ❌ Rate mismatch detected!');
          } else {
            console.log('      ✅ Rates match');
          }

          consistencyResults.push({
            testCase: testCase.name,
            destination: recipient.name,
            catalogRate,
            syncRate,
            match: catalogRate === syncRate,
            catalogOptions: catalogResponse.options?.length || 0,
            syncOptions: syncResponse.options?.length || 0
          });

          await this.delay(500);
        }
      } catch (error) {
        console.log(`    ❌ Error: ${error}`);
        issues.push(`${testCase.name}: ${error}`);
      }
    }

    const successfulTests = consistencyResults.filter(r => r.match).length;
    const success = issues.length === 0;

    this.results.push({
      testName: 'Shipping Quote Consistency',
      success,
      details: `${successfulTests}/${consistencyResults.length} shipping quotes consistent`,
      data: consistencyResults,
      issues: issues.length > 0 ? issues : undefined
    });
  }

  private async validateBundleHandling() {
    console.log('\n🎁 Validating Bundle Handling');
    console.log('-'.repeat(40));

    const bundleTests = [
      {
        name: 'Starter Bundle',
        items: [
          { type: 'T-Shirt', catalog: TshirtVariants[0].catalogVariantId, sync: TshirtVariants[0].syncVariantId },
          { type: 'Cap', catalog: CapVariants[0].catalogVariantId, sync: CapVariants[0].syncVariantId },
          { type: 'Mug', catalog: MugVariants[0].catalogVariantId, sync: MugVariants[0].syncVariantId }
        ]
      },
      {
        name: 'Champion Bundle',
        items: [
          { type: 'Hoodie', catalog: HoodieVariants[0].catalogVariantId, sync: HoodieVariants[0].syncVariantId },
          { type: 'T-Shirt', catalog: TshirtVariants[0].catalogVariantId, sync: TshirtVariants[0].syncVariantId },
          { type: 'Cap', catalog: CapVariants[0].catalogVariantId, sync: CapVariants[0].syncVariantId },
          { type: 'Tote Bag', catalog: TotebagVariants[0].catalogVariantId, sync: TotebagVariants[0].syncVariantId }
        ]
      }
    ];

    const bundleResults = [];
    const issues: string[] = [];

    for (const bundle of bundleTests) {
      console.log(`\n  Testing: ${bundle.name}`);
      console.log(`    Items: ${bundle.items.map(i => i.type).join(', ')}`);
      
      try {
        const catalogRequest = {
          recipient: TEST_CONFIG.TEST_RECIPIENT,
          items: bundle.items.map(item => ({ printful_variant_id: item.catalog, quantity: 1 }))
        };

        const syncRequest = {
          recipient: TEST_CONFIG.TEST_RECIPIENT,
          items: bundle.items.map(item => ({ printful_variant_id: item.sync, quantity: 1 }))
        };

        console.log('    📦 Testing with catalog IDs...');
        const catalogResponse = await this.fetchShippingQuote(catalogRequest);
        console.log(`      Result: £${catalogResponse.options?.[0]?.rate || 'N/A'} (${catalogResponse.options?.length || 0} options)`);
        
        await this.delay(500);
        
        console.log('    📦 Testing with sync IDs...');
        const syncResponse = await this.fetchShippingQuote(syncRequest);
        console.log(`      Result: £${syncResponse.options?.[0]?.rate || 'N/A'} (${syncResponse.options?.length || 0} options)`);

        const catalogRate = catalogResponse.options?.[0]?.rate || 'N/A';
        const syncRate = syncResponse.options?.[0]?.rate || 'N/A';

        const bundleResult = {
          bundleName: bundle.name,
          itemCount: bundle.items.length,
          catalogRate,
          syncRate,
          match: catalogRate === syncRate,
          catalogOptions: catalogResponse.options?.length || 0,
          syncOptions: syncResponse.options?.length || 0
        };

        bundleResults.push(bundleResult);

        if (catalogRate === syncRate) {
          console.log('    ✅ Bundle quotes match perfectly');
        } else {
          console.log('    ❌ Bundle quote mismatch detected!');
          issues.push(`${bundle.name}: Rate mismatch - Catalog: £${catalogRate}, Sync: £${syncRate}`);
        }

      } catch (error) {
        console.log(`    ❌ Bundle test error: ${error}`);
        issues.push(`${bundle.name}: ${error}`);
      }
    }

    const successfulBundles = bundleResults.filter(r => r.match).length;
    const success = issues.length === 0;

    this.results.push({
      testName: 'Bundle Handling',
      success,
      details: `${successfulBundles}/${bundleResults.length} bundles handled correctly`,
      data: bundleResults,
      issues: issues.length > 0 ? issues : undefined
    });
  }

  private async validateConversionLogic() {
    console.log('\n🔧 Validating Conversion Logic');
    console.log('-'.repeat(40));

    // Test edge cases that might reveal conversion logic issues
    const conversionTests = [
      {
        name: 'Very High Catalog ID',
        catalogId: Math.max(...TshirtVariants.map(v => v.catalogVariantId)),
        syncId: TshirtVariants.find(v => v.catalogVariantId === Math.max(...TshirtVariants.map(v => v.catalogVariantId)))?.syncVariantId
      },
      {
        name: 'Very Low Catalog ID',
        catalogId: Math.min(...TshirtVariants.map(v => v.catalogVariantId)),
        syncId: TshirtVariants.find(v => v.catalogVariantId === Math.min(...TshirtVariants.map(v => v.catalogVariantId)))?.syncVariantId
      },
      {
        name: 'Very High Sync ID',
        syncId: Math.max(...TshirtVariants.map(v => v.syncVariantId)),
        catalogId: TshirtVariants.find(v => v.syncVariantId === Math.max(...TshirtVariants.map(v => v.syncVariantId)))?.catalogVariantId
      }
    ];

    const conversionResults = [];
    const issues: string[] = [];

    for (const test of conversionTests.filter(t => t.catalogId && t.syncId)) {
      console.log(`\n  Testing: ${test.name}`);
      console.log(`    Catalog ID: ${test.catalogId}`);
      console.log(`    Sync ID: ${test.syncId}`);

      try {
        const catalogRequest = {
          recipient: TEST_CONFIG.TEST_RECIPIENT,
          items: [{ printful_variant_id: test.catalogId!, quantity: 1 }]
        };

        const syncRequest = {
          recipient: TEST_CONFIG.TEST_RECIPIENT,
          items: [{ printful_variant_id: test.syncId!, quantity: 1 }]
        };

        const catalogResponse = await this.fetchShippingQuote(catalogRequest);
        await this.delay(500);
        const syncResponse = await this.fetchShippingQuote(syncRequest);

        const catalogRate = catalogResponse.options?.[0]?.rate || 'N/A';
        const syncRate = syncResponse.options?.[0]?.rate || 'N/A';

        console.log(`    Catalog quote: £${catalogRate}`);
        console.log(`    Sync quote:    £${syncRate}`);

        const conversionResult = {
          testName: test.name,
          catalogId: test.catalogId,
          syncId: test.syncId,
          catalogRate,
          syncRate,
          match: catalogRate === syncRate
        };

        conversionResults.push(conversionResult);

        if (catalogRate === syncRate) {
          console.log('    ✅ Conversion logic working correctly');
        } else {
          console.log('    ❌ Conversion logic issue detected!');
          issues.push(`${test.name}: Conversion failed - Catalog: £${catalogRate}, Sync: £${syncRate}`);
        }

      } catch (error) {
        console.log(`    ❌ Conversion test error: ${error}`);
        issues.push(`${test.name}: ${error}`);
      }
    }

    const successfulConversions = conversionResults.filter(r => r.match).length;
    const success = issues.length === 0;

    this.results.push({
      testName: 'Conversion Logic',
      success,
      details: `${successfulConversions}/${conversionResults.length} conversions working correctly`,
      data: conversionResults,
      issues: issues.length > 0 ? issues : undefined
    });
  }

  private async fetchShippingQuote(request: any) {
    const response = await fetch(`${TEST_CONFIG.SUPABASE_URL}/functions/v1/shipping-quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_CONFIG.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    return await response.json();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📋 PRINTFUL INTEGRATION VALIDATION REPORT');
    console.log('='.repeat(70));

    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log(`\n📊 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${passedTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    console.log(`\n📋 DETAILED RESULTS:`);
    console.log('-'.repeat(70));

    for (const result of this.results) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.testName}: ${result.details}`);
      
      if (result.issues && result.issues.length > 0) {
        console.log(`     Issues:`);
        result.issues.forEach(issue => console.log(`       - ${issue}`));
      }
      console.log('');
    }

    // Generate specific recommendations
    console.log('🎯 ANALYSIS & RECOMMENDATIONS:');
    console.log('-'.repeat(70));

    if (failedTests === 0) {
      console.log('🎉 EXCELLENT! All Printful integration tests passed.');
      console.log('   Your variant ID system is working correctly.');
      console.log('   Customers should receive accurate shipping quotes.');
      console.log('');
      console.log('   If customers are still reporting incorrect quotes, check:');
      console.log('   1. Frontend product variant selection logic');
      console.log('   2. Cart state management and variant ID passing');
      console.log('   3. Printful account settings and available shipping methods');
    } else {
      console.log('⚠️  ISSUES DETECTED in Printful integration.');
      console.log('');
      
      const failedResults = this.results.filter(r => !r.success);
      
      if (failedResults.some(r => r.testName.includes('Mappings'))) {
        console.log('🔧 Variant ID Mapping Issues:');
        console.log('   - Fix duplicate variant IDs in your variant files');
        console.log('   - Ensure each variant has unique catalog and sync IDs');
        console.log('   - Regenerate variant files from latest Printful data');
      }
      
      if (failedResults.some(r => r.testName.includes('Consistency'))) {
        console.log('🔧 Shipping Quote Consistency Issues:');
        console.log('   - Catalog and sync variant IDs produce different quotes');
        console.log('   - This means wrong variant IDs are being sent to Printful');
        console.log('   - Check the conversion mapping in the edge function');
      }
      
      if (failedResults.some(r => r.testName.includes('Bundle'))) {
        console.log('🔧 Bundle Handling Issues:');
        console.log('   - Bundle shipping quotes are inconsistent');
        console.log('   - Verify bundle product configurations match variant files');
        console.log('   - Check bundle pricing logic for correct variant selection');
      }
      
      if (failedResults.some(r => r.testName.includes('Conversion'))) {
        console.log('🔧 Conversion Logic Issues:');
        console.log('   - Edge function conversion logic has bugs');
        console.log('   - Update the SYNC_TO_CATALOG_MAPPINGS in the edge function');
        console.log('   - Ensure all variant IDs in the mapping are current');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('Validation complete! 🚀');
    console.log('='.repeat(70));
  }
}

async function main() {
  const validator = new PrintfulValidator();
  await validator.validate();
}

// Run the validator
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}

export { PrintfulValidator, main };