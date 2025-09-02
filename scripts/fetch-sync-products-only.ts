#!/usr/bin/env tsx
/**
 * Quick Printful Sync Products Audit
 * 
 * Focus only on Store Sync products since those are what we need for fulfillment
 */

import * as fs from 'fs';
import * as path from 'path';

const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN || 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB';
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID || '16651763';

console.log('🚀 Fetching ONLY Store Sync Products (what we actually use)...');

interface AuditRow {
  product_name: string;
  sync_product_id: number;
  sync_variant_id: number;
  variant_name: string;
  catalog_variant_id: number;
  external_id: string;
  sku: string;
  price: string;
  synced: boolean;
}

async function fetchPrintfulAPI(endpoint: string): Promise<any> {
  const url = `https://api.printful.com${endpoint}`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
    'Content-Type': 'application/json',
    'X-PF-Store-Id': PRINTFUL_STORE_ID
  };

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}

async function main(): Promise<void> {
  // Fetch sync products
  console.log('🔄 Fetching Store Sync Products...');
  const productsResponse = await fetchPrintfulAPI('/store/products');
  const syncProducts = productsResponse.result || [];
  console.log(`✅ Found ${syncProducts.length} sync products`);

  const auditData: AuditRow[] = [];
  
  for (const syncProduct of syncProducts) {
    console.log(`📦 Processing: ${syncProduct.name} (${syncProduct.variants} variants)`);
    
    // Fetch sync variants for this product
    const variantsResponse = await fetchPrintfulAPI(`/store/products/${syncProduct.id}`);
    const syncVariants = variantsResponse.result?.sync_variants || [];
    
    for (const variant of syncVariants) {
      auditData.push({
        product_name: syncProduct.name,
        sync_product_id: syncProduct.id,
        sync_variant_id: variant.id,
        variant_name: variant.name,
        catalog_variant_id: variant.variant_id,
        external_id: variant.external_id || '',
        sku: variant.sku || '',
        price: variant.retail_price || '',
        synced: variant.synced
      });
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Create artifacts directory
  const artifactsDir = '/Users/arnispiekus/Documents/Github/ReformUK/agents/artifacts';
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  
  // Generate CSV
  const csvPath = path.join(artifactsDir, 'printful-variant-audit.csv');
  const csvHeaders = [
    'product_name',
    'sync_product_id',
    'sync_variant_id',
    'variant_name',
    'catalog_variant_id',
    'external_id', 
    'sku',
    'price',
    'synced'
  ];
  
  const csvContent = [
    csvHeaders.join(','),
    ...auditData.map(row => [
      `"${row.product_name}"`,
      row.sync_product_id,
      row.sync_variant_id,
      `"${row.variant_name}"`,
      row.catalog_variant_id,
      `"${row.external_id}"`,
      `"${row.sku}"`,
      `"${row.price}"`,
      row.synced
    ].join(','))
  ].join('\n');
  
  fs.writeFileSync(csvPath, csvContent);
  
  // Generate summary
  const syncedVariants = auditData.filter(r => r.synced);
  const productSummary = Array.from(new Set(auditData.map(r => r.product_name)))
    .map(productName => {
      const variants = auditData.filter(r => r.product_name === productName);
      const syncedCount = variants.filter(v => v.synced).length;
      return `- **${productName}**: ${variants.length} variants (${syncedCount} synced)`;
    }).join('\n');

  const summaryContent = `# Printful Store Sync Audit

Generated: ${new Date().toISOString()}

## Summary
- **Total Sync Products**: ${new Set(auditData.map(r => r.product_name)).size}
- **Total Variants**: ${auditData.length}
- **Synced Variants**: ${syncedVariants.length}
- **Expected**: 158 variants across 10 products

## Key Finding
✅ **Use sync_variant_id for fulfillment** (confirmed by code analysis)
✅ Database should store sync_variant_id values

## Products Found
${productSummary}

## Files
- CSV: \`printful-variant-audit.csv\`
`;

  fs.writeFileSync(path.join(artifactsDir, 'printful-sync-audit.md'), summaryContent);
  
  console.log(`\n📊 AUDIT COMPLETE!`);
  console.log(`🎯 Found ${auditData.length} variants across ${new Set(auditData.map(r => r.product_name)).size} products`);
  console.log(`✅ ${syncedVariants.length} variants are synced and ready`);
  console.log(`📄 Files saved to: ${artifactsDir}/`);
}

main().catch(console.error);