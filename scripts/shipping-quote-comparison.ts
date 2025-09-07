#!/usr/bin/env tsx
/**
 * Shipping Quote Comparison Test
 * 
 * This script specifically tests whether sync variant IDs and catalog variant IDs
 * produce the same shipping quotes from Printful. If they don't match, it indicates
 * that the wrong variant IDs are being sent to Printful's shipping API.
 */

import { TshirtVariants } from '../src/hooks/tshirt-variants';
import { HoodieVariants } from '../src/hooks/hoodie-variants';
import { CapVariants } from '../src/hooks/cap-variants';

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

interface ShippingQuoteRequest {
  recipient: any;
  items: Array<{
    printful_variant_id: number;
    quantity: number;
  }>;
}

interface ShippingQuoteResponse {
  options: Array<{
    id: string;
    name: string;
    rate: string;
    currency: string;
    minDeliveryDays?: number;
    maxDeliveryDays?: number;
    carrier?: string;
  }>;
  ttlSeconds?: number;
}

async function fetchShippingQuote(request: ShippingQuoteRequest): Promise<ShippingQuoteResponse> {
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

function compareShippingQuotes(catalogQuote: ShippingQuoteResponse, syncQuote: ShippingQuoteResponse) {
  const differences: string[] = [];

  // Compare number of options
  if (catalogQuote.options.length !== syncQuote.options.length) {
    differences.push(`Different number of options: catalog=${catalogQuote.options.length}, sync=${syncQuote.options.length}`);
  }

  // Compare each option
  const minOptions = Math.min(catalogQuote.options.length, syncQuote.options.length);
  
  for (let i = 0; i < minOptions; i++) {
    const catalogOption = catalogQuote.options[i];
    const syncOption = syncQuote.options[i];
    
    if (catalogOption.rate !== syncOption.rate) {
      differences.push(`Option ${i}: Different rates - catalog=£${catalogOption.rate}, sync=£${syncOption.rate}`);
    }
    
    if (catalogOption.name !== syncOption.name) {
      differences.push(`Option ${i}: Different names - catalog="${catalogOption.name}", sync="${syncOption.name}"`);
    }
    
    if (catalogOption.minDeliveryDays !== syncOption.minDeliveryDays) {
      differences.push(`Option ${i}: Different min delivery days - catalog=${catalogOption.minDeliveryDays}, sync=${syncOption.minDeliveryDays}`);
    }
    
    if (catalogOption.maxDeliveryDays !== syncOption.maxDeliveryDays) {
      differences.push(`Option ${i}: Different max delivery days - catalog=${catalogOption.maxDeliveryDays}, sync=${syncOption.maxDeliveryDays}`);
    }
  }

  return differences;
}

async function testVariantComparison(
  variantName: string,
  catalogVariantId: number,
  syncVariantId: number,
  quantity: number = 1
) {
  console.log(`\n🔍 Testing: ${variantName}`);
  console.log(`  Catalog ID: ${catalogVariantId}`);
  console.log(`  Sync ID: ${syncVariantId}`);

  try {
    // Test with catalog variant ID
    console.log('  📦 Fetching quote with catalog variant ID...');
    const catalogRequest: ShippingQuoteRequest = {
      recipient: TEST_CONFIG.TEST_RECIPIENT,
      items: [{ printful_variant_id: catalogVariantId, quantity }]
    };
    
    const catalogQuote = await fetchShippingQuote(catalogRequest);
    console.log(`  ✅ Catalog quote: ${catalogQuote.options.length} options, first rate: £${catalogQuote.options[0]?.rate || 'N/A'}`);

    // Wait a bit to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test with sync variant ID
    console.log('  📦 Fetching quote with sync variant ID...');
    const syncRequest: ShippingQuoteRequest = {
      recipient: TEST_CONFIG.TEST_RECIPIENT,
      items: [{ printful_variant_id: syncVariantId, quantity }]
    };
    
    const syncQuote = await fetchShippingQuote(syncRequest);
    console.log(`  ✅ Sync quote: ${syncQuote.options.length} options, first rate: £${syncQuote.options[0]?.rate || 'N/A'}`);

    // Compare the quotes
    const differences = compareShippingQuotes(catalogQuote, syncQuote);
    
    if (differences.length === 0) {
      console.log('  ✅ PERFECT MATCH: Both variant IDs produce identical shipping quotes');
      return { success: true, variantName, catalogVariantId, syncVariantId, differences: [] };
    } else {
      console.log('  ❌ MISMATCH DETECTED:');
      differences.forEach(diff => console.log(`    - ${diff}`));
      return { success: false, variantName, catalogVariantId, syncVariantId, differences };
    }

  } catch (error) {
    console.log(`  ❌ ERROR: ${error}`);
    return { success: false, variantName, catalogVariantId, syncVariantId, error: error.toString() };
  }
}

async function testComplexBundle() {
  console.log('\n🎯 Testing Complex Bundle (Multiple Products)');
  
  const bundleItems = [
    { name: 'T-Shirt', catalog: TshirtVariants[0].catalogVariantId, sync: TshirtVariants[0].syncVariantId },
    { name: 'Hoodie', catalog: HoodieVariants[0].catalogVariantId, sync: HoodieVariants[0].syncVariantId },
    { name: 'Cap', catalog: CapVariants[0].catalogVariantId, sync: CapVariants[0].syncVariantId }
  ];

  console.log('  Bundle contents:');
  bundleItems.forEach(item => {
    console.log(`    - ${item.name}: catalog=${item.catalog}, sync=${item.sync}`);
  });

  try {
    // Test with catalog variant IDs
    const catalogRequest: ShippingQuoteRequest = {
      recipient: TEST_CONFIG.TEST_RECIPIENT,
      items: bundleItems.map(item => ({ printful_variant_id: item.catalog, quantity: 1 }))
    };
    
    const catalogQuote = await fetchShippingQuote(catalogRequest);
    console.log(`  ✅ Catalog bundle quote: ${catalogQuote.options.length} options, first rate: £${catalogQuote.options[0]?.rate || 'N/A'}`);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test with sync variant IDs
    const syncRequest: ShippingQuoteRequest = {
      recipient: TEST_CONFIG.TEST_RECIPIENT,
      items: bundleItems.map(item => ({ printful_variant_id: item.sync, quantity: 1 }))
    };
    
    const syncQuote = await fetchShippingQuote(syncRequest);
    console.log(`  ✅ Sync bundle quote: ${syncQuote.options.length} options, first rate: £${syncQuote.options[0]?.rate || 'N/A'}`);

    // Compare the quotes
    const differences = compareShippingQuotes(catalogQuote, syncQuote);
    
    if (differences.length === 0) {
      console.log('  ✅ BUNDLE PERFECT MATCH: Both variant ID types produce identical shipping quotes');
      return { success: true, differences: [] };
    } else {
      console.log('  ❌ BUNDLE MISMATCH DETECTED:');
      differences.forEach(diff => console.log(`    - ${diff}`));
      return { success: false, differences };
    }

  } catch (error) {
    console.log(`  ❌ BUNDLE ERROR: ${error}`);
    return { success: false, error: error.toString() };
  }
}

async function main() {
  console.log('🧪 Shipping Quote Comparison Test');
  console.log('=' .repeat(60));
  console.log('This test verifies that catalog and sync variant IDs produce identical shipping quotes');
  console.log('If they differ, it means wrong variant IDs are being sent to Printful');
  console.log('');

  const results = [];

  // Test individual products
  console.log('\n📦 Testing Individual Products');
  console.log('-'.repeat(40));

  // Test a few variants from different product types
  const testVariants = [
    { name: 'T-Shirt Variant 1', ...TshirtVariants[0] },
    { name: 'T-Shirt Variant 2', ...TshirtVariants[1] },
    { name: 'Hoodie Variant 1', ...HoodieVariants[0] },
    { name: 'Hoodie Variant 2', ...HoodieVariants[1] },
    { name: 'Cap Variant 1', ...CapVariants[0] },
  ];

  for (const variant of testVariants) {
    const result = await testVariantComparison(
      variant.name,
      variant.catalogVariantId,
      variant.syncVariantId
    );
    results.push(result);
  }

  // Test bundle scenario
  const bundleResult = await testComplexBundle();
  results.push({ ...bundleResult, variantName: 'Complex Bundle' });

  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📋 SHIPPING QUOTE COMPARISON REPORT');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const total = results.length;
  const failed = total - successful;

  console.log(`\n📊 SUMMARY:`);
  console.log(`   Total Tests: ${total}`);
  console.log(`   ✅ Perfect Matches: ${successful}`);
  console.log(`   ❌ Mismatches: ${failed}`);
  console.log(`   Success Rate: ${((successful / total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log(`\n❌ ISSUES DETECTED:`);
    results.filter(r => !r.success).forEach(result => {
      console.log(`\n   ${result.variantName}:`);
      if (result.error) {
        console.log(`     ERROR: ${result.error}`);
      } else if (result.differences) {
        result.differences.forEach(diff => console.log(`     - ${diff}`));
      }
    });

    console.log(`\n🔧 DIAGNOSIS:`);
    console.log(`   The shipping quotes differ between catalog and sync variant IDs.`);
    console.log(`   This suggests that:`);
    console.log(`   1. The edge function is not correctly converting sync IDs to catalog IDs`);
    console.log(`   2. Wrong variant IDs are being sent to Printful's shipping API`);
    console.log(`   3. This explains why customers are getting incorrect shipping quotes`);
    console.log(`\n💡 RECOMMENDED FIXES:`);
    console.log(`   1. Verify the sync-to-catalog mapping table in the edge function`);
    console.log(`   2. Ensure ALL variant IDs in the mapping are correct`);
    console.log(`   3. Check that the frontend is sending the right variant format`);
    console.log(`   4. Test with live Printful API to confirm variant validity`);
  } else {
    console.log(`\n✅ ALL TESTS PASSED!`);
    console.log(`   Catalog and sync variant IDs produce identical shipping quotes.`);
    console.log(`   The variant ID conversion system is working correctly.`);
    console.log(`   If customers are still getting wrong quotes, the issue is likely:`);
    console.log(`   1. Incorrect variant selection in the frontend`);
    console.log(`   2. Outdated variant data in the variant files`);
    console.log(`   3. Printful API connectivity or authentication issues`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test completed! 🎉');
  console.log('='.repeat(60));
}

// Run the test
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}

export { main, testVariantComparison, testComplexBundle };