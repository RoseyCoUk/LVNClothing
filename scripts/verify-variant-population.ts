#!/usr/bin/env tsx
/**
 * Verify Printful Variant Population
 * 
 * This script verifies that all 158 expected variants are properly populated
 * with valid sync_variant_id values and provides a comprehensive reconciliation report.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VariantStats {
  productName: string;
  totalVariants: number;
  withPrintfulId: number;
  withValidId: number;
  samples: string[];
}

async function verifyPopulation() {
  console.log('🔍 Verifying Printful Variant Population...\n');

  // Get all products and their variants
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      printful_product_id,
      product_variants (
        id,
        name,
        printful_variant_id,
        color,
        size,
        price,
        is_available
      )
    `);

  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    return;
  }

  console.log(`📦 Found ${products.length} products in database`);
  
  const stats: VariantStats[] = [];
  let totalVariants = 0;
  let totalWithPrintfulId = 0;
  let totalWithValidId = 0;

  // Analyze each product
  for (const product of products) {
    const variants = product.product_variants || [];
    const withPrintfulId = variants.filter(v => v.printful_variant_id && v.printful_variant_id.trim() !== '').length;
    const withValidId = variants.filter(v => {
      const id = v.printful_variant_id;
      return id && id.trim() !== '' && !isNaN(Number(id));
    }).length;

    const samples = variants
      .filter(v => v.printful_variant_id)
      .slice(0, 3)
      .map(v => `${v.printful_variant_id}: ${v.name}`)
      .concat(variants.length > 3 ? [`... and ${variants.length - 3} more`] : []);

    stats.push({
      productName: product.name,
      totalVariants: variants.length,
      withPrintfulId,
      withValidId,
      samples
    });

    totalVariants += variants.length;
    totalWithPrintfulId += withPrintfulId;
    totalWithValidId += withValidId;

    console.log(`\n📋 ${product.name}:`);
    console.log(`  - Total variants: ${variants.length}`);
    console.log(`  - With Printful ID: ${withPrintfulId}`);
    console.log(`  - With valid ID: ${withValidId}`);
    if (samples.length > 0) {
      console.log(`  - Samples: ${samples.slice(0, 2).join(', ')}`);
    }
  }

  // Load expected data from CSV for comparison
  const csvPath = '/Users/arnispiekus/Documents/Github/ReformUK/agents/artifacts/printful-variant-audit.csv';
  let expectedVariants = 0;
  let csvProductCounts = new Map<string, number>();
  
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').slice(1);
    
    for (const line of lines) {
      if (!line.trim()) continue;
      expectedVariants++;
      
      const parts = line.split(',');
      if (parts.length >= 1) {
        const productName = parts[0].replace(/"/g, '').trim();
        csvProductCounts.set(productName, (csvProductCounts.get(productName) || 0) + 1);
      }
    }
  }

  // Summary report
  console.log('\n' + '='.repeat(60));
  console.log('📊 VARIANT POPULATION VERIFICATION REPORT');
  console.log('='.repeat(60));
  console.log(`\n🎯 Expected: ${expectedVariants} variants (from Printful Sync API)`);
  console.log(`📊 Database: ${totalVariants} total variants`);
  console.log(`✅ With Printful ID: ${totalWithPrintfulId}`);
  console.log(`🔢 With valid numeric ID: ${totalWithValidId}`);
  
  const populationRate = expectedVariants > 0 ? (totalWithValidId / expectedVariants * 100).toFixed(1) : '0';
  console.log(`📈 Population rate: ${populationRate}%`);

  // Product-by-product comparison
  if (csvProductCounts.size > 0) {
    console.log('\n📋 Product-by-Product Comparison:');
    console.log('Product Name'.padEnd(25) + 'Expected'.padEnd(12) + 'Database'.padEnd(12) + 'Status');
    console.log('-'.repeat(60));
    
    for (const [productName, expectedCount] of csvProductCounts) {
      const stat = stats.find(s => s.productName === productName);
      const dbCount = stat ? stat.withValidId : 0;
      const status = dbCount === expectedCount ? '✅ Match' : '❌ Mismatch';
      
      console.log(
        productName.substring(0, 24).padEnd(25) +
        expectedCount.toString().padEnd(12) + 
        dbCount.toString().padEnd(12) +
        status
      );
    }
  }

  // Health check
  console.log('\n🏥 Health Check:');
  const isHealthy = totalWithValidId === expectedVariants && totalWithValidId > 0;
  
  if (isHealthy) {
    console.log('✅ HEALTHY: All expected variants are populated with valid sync_variant_id');
  } else {
    console.log('❌ ISSUES DETECTED:');
    if (totalWithValidId < expectedVariants) {
      console.log(`   - Missing ${expectedVariants - totalWithValidId} variants with valid IDs`);
    }
    if (totalWithValidId > expectedVariants) {
      console.log(`   - Found ${totalWithValidId - expectedVariants} extra variants`);
    }
  }

  // Fulfillment readiness
  console.log('\n🚀 Fulfillment Readiness:');
  if (totalWithValidId >= 150) { // Allow some tolerance
    console.log('✅ READY: Sufficient variants with sync_variant_id for production fulfillment');
    console.log('✅ Order fulfillment can proceed with confidence');
  } else {
    console.log('⚠️  NOT READY: Insufficient variants populated for production fulfillment');
    console.log(`   - Need at least 150 variants, have ${totalWithValidId}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 Verification Complete');
  console.log('='.repeat(60));

  return {
    isHealthy,
    totalExpected: expectedVariants,
    totalPopulated: totalWithValidId,
    populationRate: parseFloat(populationRate)
  };
}

// Run verification
verifyPopulation()
  .then((result) => {
    if (result && result.isHealthy) {
      console.log('\n🎉 SUCCESS: Variant population verified and ready for production!');
      process.exit(0);
    } else {
      console.log('\n⚠️  WARNING: Issues detected in variant population.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 VERIFICATION FAILED:', error);
    process.exit(1);
  });