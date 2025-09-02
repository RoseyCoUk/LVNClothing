#!/usr/bin/env tsx
/**
 * Printful Variant ID Audit Script
 * 
 * This script fetches ALL products and variants from both Printful Catalog API 
 * and Store Sync API to create a comprehensive audit of variant mappings.
 * 
 * Purpose: Verify which ID type we should use and create complete mappings
 */

import * as fs from 'fs';
import * as path from 'path';

// Environment setup
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID;

if (!PRINTFUL_TOKEN) {
  console.error('❌ PRINTFUL_TOKEN environment variable is required');
  process.exit(1);
}

console.log('🚀 Starting Printful Variant ID Audit...');
console.log(`📊 Store ID: ${PRINTFUL_STORE_ID || 'Not set'}`);
console.log('🔍 This will fetch from both Catalog API and Store Sync API\n');

interface PrintfulCatalogProduct {
  id: number;
  type: string;
  brand: string;
  model: string;
  image: string;
  variant_count: number;
}

interface PrintfulCatalogVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  color_code: string;
  image: string;
  price: string;
  in_stock: boolean;
  availability_regions: any;
  availability_status: any[];
}

interface PrintfulSyncProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
}

interface PrintfulSyncVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number; // This is the Catalog API variant ID
  main_category_id: number;
  warehouse_product_variant_id?: number;
  retail_price: string;
  sku: string;
  currency: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  files: any[];
  options: any[];
  is_ignored: boolean;
}

interface AuditRow {
  product_name: string;
  variant_name: string;
  color: string;
  size: string;
  catalog_product_id: number | null;
  catalog_variant_id: number | null;
  sync_product_id: number | null;
  sync_variant_id: number | null;
  external_id: string;
  sku: string;
  price: string;
  in_stock: boolean;
  synced: boolean;
}

async function fetchPrintfulAPI(endpoint: string): Promise<any> {
  const url = `https://api.printful.com${endpoint}`;
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  if (PRINTFUL_STORE_ID) {
    headers['X-PF-Store-Id'] = PRINTFUL_STORE_ID;
  }

  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data;
}

async function fetchAllCatalogProducts(): Promise<PrintfulCatalogProduct[]> {
  console.log('📦 Fetching Catalog Products...');
  try {
    const response = await fetchPrintfulAPI('/products');
    const products = response.result || [];
    console.log(`✅ Found ${products.length} catalog products`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching catalog products:', error);
    return [];
  }
}

async function fetchCatalogVariants(productId: number): Promise<PrintfulCatalogVariant[]> {
  try {
    const response = await fetchPrintfulAPI(`/products/${productId}`);
    const variants = response.result?.variants || [];
    return variants;
  } catch (error) {
    console.error(`❌ Error fetching catalog variants for product ${productId}:`, error);
    return [];
  }
}

async function fetchAllSyncProducts(): Promise<PrintfulSyncProduct[]> {
  console.log('🔄 Fetching Store Sync Products...');
  try {
    const response = await fetchPrintfulAPI('/store/products');
    const products = response.result || [];
    console.log(`✅ Found ${products.length} sync products`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching sync products:', error);
    return [];
  }
}

async function fetchSyncVariants(syncProductId: number): Promise<PrintfulSyncVariant[]> {
  try {
    const response = await fetchPrintfulAPI(`/store/products/${syncProductId}`);
    const variants = response.result?.sync_variants || [];
    return variants;
  } catch (error) {
    console.error(`❌ Error fetching sync variants for product ${syncProductId}:`, error);
    return [];
  }
}

async function generateAudit(): Promise<void> {
  const auditData: AuditRow[] = [];
  
  // Fetch catalog data
  const catalogProducts = await fetchAllCatalogProducts();
  const catalogMap = new Map<number, { product: PrintfulCatalogProduct, variants: PrintfulCatalogVariant[] }>();
  
  for (const product of catalogProducts) {
    const variants = await fetchCatalogVariants(product.id);
    catalogMap.set(product.id, { product, variants });
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
  }
  
  // Fetch sync data
  const syncProducts = await fetchAllSyncProducts();
  
  for (const syncProduct of syncProducts) {
    console.log(`🔄 Processing sync product: ${syncProduct.name}`);
    
    const syncVariants = await fetchSyncVariants(syncProduct.id);
    
    for (const syncVariant of syncVariants) {
      const catalogData = catalogMap.get(syncVariant.product.product_id);
      const catalogVariant = catalogData?.variants.find(v => v.id === syncVariant.variant_id);
      
      auditData.push({
        product_name: syncProduct.name,
        variant_name: syncVariant.name,
        color: catalogVariant?.color || '',
        size: catalogVariant?.size || '',
        catalog_product_id: catalogData?.product.id || null,
        catalog_variant_id: syncVariant.variant_id || null,
        sync_product_id: syncProduct.id,
        sync_variant_id: syncVariant.id,
        external_id: syncVariant.external_id || '',
        sku: syncVariant.sku || '',
        price: syncVariant.retail_price || '',
        in_stock: catalogVariant?.in_stock || false,
        synced: syncVariant.synced
      });
    }
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Rate limiting
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
    'variant_name', 
    'color',
    'size',
    'catalog_product_id',
    'catalog_variant_id',
    'sync_product_id',
    'sync_variant_id',
    'external_id',
    'sku',
    'price',
    'in_stock',
    'synced'
  ];
  
  const csvContent = [
    csvHeaders.join(','),
    ...auditData.map(row => [
      `"${row.product_name}"`,
      `"${row.variant_name}"`,
      `"${row.color}"`,
      `"${row.size}"`,
      row.catalog_product_id || '',
      row.catalog_variant_id || '',
      row.sync_product_id || '',
      row.sync_variant_id || '',
      `"${row.external_id}"`,
      `"${row.sku}"`,
      `"${row.price}"`,
      row.in_stock,
      row.synced
    ].join(','))
  ].join('\n');
  
  fs.writeFileSync(csvPath, csvContent);
  
  // Generate summary
  const summaryPath = path.join(artifactsDir, 'printful-audit-summary.md');
  const summary = `# Printful Variant ID Audit Summary

Generated: ${new Date().toISOString()}

## Overview
- **Total Variants Found**: ${auditData.length}
- **Synced Variants**: ${auditData.filter(r => r.synced).length}
- **Products**: ${new Set(auditData.map(r => r.product_name)).size}

## API Usage Recommendation
Based on the fulfillment code analysis:
- **For Order Fulfillment**: Use \`sync_variant_id\` (Store Sync API)
- **For Shipping Quotes**: Use \`sync_variant_id\` or \`catalog_variant_id\` 

## Product Summary
${Array.from(new Set(auditData.map(r => r.product_name))).map(productName => {
  const productVariants = auditData.filter(r => r.product_name === productName);
  return `- **${productName}**: ${productVariants.length} variants (${productVariants.filter(v => v.synced).length} synced)`;
}).join('\n')}

## Files Generated
- \`printful-variant-audit.csv\`: Complete variant data
- \`printful-audit-summary.md\`: This summary
`;
  
  fs.writeFileSync(summaryPath, summary);
  
  console.log('\n📊 Audit Complete!');
  console.log(`📄 CSV saved to: ${csvPath}`);
  console.log(`📝 Summary saved to: ${summaryPath}`);
  console.log(`\n🎯 Found ${auditData.length} total variants across ${new Set(auditData.map(r => r.product_name)).size} products`);
  console.log(`✅ ${auditData.filter(r => r.synced).length} variants are synced and ready for fulfillment`);
}

// Run the audit
generateAudit()
  .then(() => {
    console.log('\n🎉 Printful Variant ID Audit completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Audit failed:', error);
    process.exit(1);
  });