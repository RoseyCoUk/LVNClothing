#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

// Types for Printful API responses
type SyncProduct = {
  id: number;
  name: string;
  external_id?: string | null;
  thumbnail_url?: string;
  is_ignored?: boolean;
};

type SyncVariant = {
  id: number;                 // sync_variant.id (your store)
  name: string;
  external_id?: string | null;
  variant_id: number;         // Catalog Variant ID (use this in orders)
  retail_price?: string | null;
  sku?: string | null;
  in_stock?: boolean;
  files?: any[];
};

type Store = {
  id: number;
  name: string;
  type: string;
};

// Configuration
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN;
const STORE_ID = process.env.PRINTFUL_STORE_ID;

if (!PRINTFUL_TOKEN) {
  console.error("❌ Missing PRINTFUL_TOKEN environment variable");
  console.error("Get your token from: Printful Dashboard → Settings → API → Create Private Token");
  process.exit(1);
}

if (!STORE_ID) {
  console.error("❌ Missing PRINTFUL_STORE_ID environment variable");
  console.error("Run: curl -H 'Authorization: Bearer $PRINTFUL_TOKEN' https://api.printful.com/v2/stores");
  process.exit(1);
}

// API helper function
async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 
      Authorization: `Bearer ${PRINTFUL_TOKEN}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${url}\n${errorText}`);
  }
  
  const body = await res.json();
  // For variants endpoint, return the full response object
  if (url.includes('/variants')) {
    return body as T;
  }
  // For other endpoints, extract data property
  return (body.data ?? body.result ?? body) as T;
}

// List all stores to verify access
async function listStores(): Promise<Store[]> {
  console.log("🔍 Fetching stores...");
  const stores = await getJSON<Store[]>("https://api.printful.com/v2/stores");
  console.log(`✅ Found ${stores.length} store(s)`);
  stores.forEach(store => {
    console.log(`   - ${store.name} (ID: ${store.id}, Type: ${store.type})`);
  });
  return stores;
}

// List all products from the store
async function listAllProducts(): Promise<SyncProduct[]> {
  console.log("🔍 Fetching products...");
  
  // For native stores, use the /v2/products endpoint
  const response = await getJSON<Array<{
    name: string;
    published_to_stores: Array<{
      store_id: number;
      sync_product_id: number;
      sync_product_external_id: string;
    }>;
    thumbnail_url?: string;
  }>>("https://api.printful.com/v2/products");
  

  
  const products: SyncProduct[] = [];
  
  if (!Array.isArray(response)) {
    console.error("❌ Unexpected API response structure:", response);
    throw new Error("API response does not contain expected data structure");
  }
  
  for (const product of response) {
    // Find the store-specific data
    const storeData = product.published_to_stores.find(store => store.store_id.toString() === STORE_ID);
    
    if (storeData) {
      products.push({
        id: storeData.sync_product_id,
        name: product.name,
        external_id: storeData.sync_product_external_id,
        thumbnail_url: product.thumbnail_url,
        is_ignored: false,
      });
    }
  }
  
  console.log(`✅ Total: ${products.length} products found`);
  return products;
}

// Get variants for a specific product with pagination
async function getProductVariants(syncProductId: number): Promise<SyncVariant[]> {
  const variants: SyncVariant[] = [];
  let offset = 0;
  const limit = 20; // Printful's default limit
  
  while (true) {
    const url = `https://api.printful.com/v2/products/sp${syncProductId}/variants?limit=${limit}&offset=${offset}`;
    
    try {
      const response = await getJSON<{
        data: Array<{
          id: number;
          store_id: number;
          external_id?: string | null;
          retail_price?: string | null;
          retail_price_currency?: string;
          source: string;
          is_synced: boolean;
          catalog_variant_id: number;
          placements: any[];
          product_options: any[];
        }>;
        paging: {
          total: number;
          limit: number;
          offset: number;
        };
      }>(url);
      
      if (!response || !response.data || !Array.isArray(response.data)) {
        console.log(`     ❌ Invalid response structure for variants`);
        break;
      }
      
      // Add variants from this page
      const pageVariants = response.data.map(variant => ({
        id: variant.id,
        name: `Variant ${variant.id}`, // Generate a name since it's not provided
        external_id: variant.external_id,
        variant_id: variant.catalog_variant_id, // This is the catalog variant ID
        retail_price: variant.retail_price,
        sku: variant.external_id, // Use external_id as SKU
        in_stock: variant.is_synced, // Use sync status as stock indicator
        files: [],
      }));
      
      variants.push(...pageVariants);
      
      // Check if we've fetched all variants
      if (response.paging && (offset + limit) >= response.paging.total) {
        break;
      }
      
      offset += limit;
      
      // Add small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.log(`     ❌ Error fetching variants at offset ${offset}:`, error);
      break;
    }
  }
  
  return variants;
}

// Detect product category based on name and external_id
function detectCategory(product: SyncProduct): "tshirt" | "hoodie" | "cap" | "mug" | "totebag" | "waterbottle" | "mousepad" | "other" {
  const name = product.name.toLowerCase();
  const externalId = (product.external_id || "").toLowerCase();
  
  // Check external_id first (most reliable)
  if (externalId.includes("tshirt") || externalId.includes("tee") || externalId.includes("t-shirt")) return "tshirt";
  if (externalId.includes("hoodie") || externalId.includes("sweatshirt")) return "hoodie";
  if (externalId.includes("cap") || externalId.includes("hat")) return "cap";
  if (externalId.includes("mug")) return "mug";
  if (externalId.includes("tote") || externalId.includes("bag")) return "totebag";
  if (externalId.includes("bottle") || externalId.includes("water")) return "waterbottle";
  if (externalId.includes("mouse") || externalId.includes("pad")) return "mousepad";
  
  // Fallback to name analysis
  if (name.includes("tee") || name.includes("t-shirt") || name.includes("tshirt")) return "tshirt";
  if (name.includes("hoodie") || name.includes("sweatshirt")) return "hoodie";
  if (name.includes("cap") || name.includes("hat") || name.includes("trucker")) return "cap";
  if (name.includes("mug")) return "mug";
  if (name.includes("tote")) return "totebag";
  if (name.includes("bottle")) return "waterbottle";
  if (name.includes("mouse")) return "mousepad";
  
  return "other";
}

// Generate TypeScript file content
function generateVariantFile(
  category: string, 
  entries: Array<{
    key: string;
    catalogVariantId: number;
    syncVariantId: number;
    price?: string | null;
    name: string;
    externalId?: string | null;
    sku?: string | null;
  }>
): string {
  const className = category.charAt(0).toUpperCase() + category.slice(1);
  
  const lines = [
    `// AUTO-GENERATED by scripts/printful-sync.ts — do not edit manually`,
    `// Generated on: ${new Date().toISOString()}`,
    `// Total variants: ${entries.length}`,
    ``,
    `export type ${className}Variant = {`,
    `  key: string;`,
    `  catalogVariantId: number;`,
    `  syncVariantId: number;`,
    `  price?: string;`,
    `  name: string;`,
    `  externalId?: string;`,
    `  sku?: string;`,
    `};`,
    ``,
    `export const ${className}Variants: ${className}Variant[] = [`
  ];
  
  for (const entry of entries) {
    lines.push(`  {`);
    lines.push(`    key: ${JSON.stringify(entry.key)},`);
    lines.push(`    catalogVariantId: ${entry.catalogVariantId},`);
    lines.push(`    syncVariantId: ${entry.syncVariantId},`);
    lines.push(`    price: ${entry.price ? JSON.stringify(entry.price) : "undefined"},`);
    lines.push(`    name: ${JSON.stringify(entry.name)},`);
    lines.push(`    externalId: ${entry.externalId ? JSON.stringify(entry.externalId) : "undefined"},`);
    lines.push(`    sku: ${entry.sku ? JSON.stringify(entry.sku) : "undefined"},`);
    lines.push(`  },`);
  }
  
  lines.push(`];`);
  lines.push(``);
  lines.push(`// Helper function to find variant by key`);
  lines.push(`export function find${className}Variant(key: string): ${className}Variant | undefined {`);
  lines.push(`  return ${className}Variants.find(v => v.key === key);`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`// Helper function to find variant by catalog variant ID`);
  lines.push(`export function find${className}VariantByCatalogId(catalogVariantId: number): ${className}Variant | undefined {`);
  lines.push(`  return ${className}Variants.find(v => v.catalogVariantId === catalogVariantId);`);
  lines.push(`}`);
  
  return lines.join("\n");
}

// Generate pricing data file
function generatePricingFile(entries: Array<{ catalogVariantId: number; price: string | null }>): string {
  const lines = [
    `// AUTO-GENERATED pricing data by scripts/printful-sync.ts`,
    `// Generated on: ${new Date().toISOString()}`,
    `// Total variants with pricing: ${entries.filter(e => e.price).length}`,
    ``,
    `export const variantPricing: Record<number, string> = {`
  ];
  
  for (const entry of entries) {
    if (entry.price) {
      lines.push(`  ${entry.catalogVariantId}: ${JSON.stringify(entry.price)},`);
    }
  }
  
  lines.push(`};`);
  lines.push(``);
  lines.push(`// Helper function to get price for a catalog variant ID`);
  lines.push(`export function getVariantPrice(catalogVariantId: number): string | undefined {`);
  lines.push(`  return variantPricing[catalogVariantId];`);
  lines.push(`}`);
  
  return lines.join("\n");
}

// Main execution
async function main() {
  try {
    console.log("🚀 Starting Printful product sync...");
    console.log(`Store ID: ${STORE_ID}`);
    console.log(`Token: ${PRINTFUL_TOKEN?.substring(0, 8)}...`);
    console.log("");
    
    // Verify store access
    const stores = await listStores();
    const targetStore = stores.find(s => s.id.toString() === STORE_ID);
    
    if (!targetStore) {
      console.error(`❌ Store ID ${STORE_ID} not found in your stores`);
      console.error("Available stores:");
      stores.forEach(s => console.error(`   - ${s.name} (ID: ${s.id})`));
      process.exit(1);
    }
    
    console.log(`✅ Target store: ${targetStore.name}`);
    console.log("");
    
    // Fetch all products
    const allProducts = await listAllProducts();
    
    // Group products by category
    const buckets: Record<string, Array<{
      key: string;
      catalogVariantId: number;
      syncVariantId: number;
      price?: string | null;
      name: string;
      externalId?: string | null;
      sku?: string | null;
    }>> = {
      tshirt: [],
      hoodie: [],
      cap: [],
      mug: [],
      totebag: [],
      waterbottle: [],
      mousepad: [],
      other: []
    };
    
    const allPricing: Array<{ catalogVariantId: number; price: string | null }> = [];
    
    console.log("🔍 Processing products and variants...");
    
    // Process each product
    for (const [index, product] of allProducts.entries()) {
      if (product.is_ignored) {
        console.log(`   Skipping ignored product: ${product.name}`);
        continue;
      }
      
      console.log(`   Processing ${index + 1}/${allProducts.length}: ${product.name}`);
      
      try {
        const variants = await getProductVariants(product.id);
        const category = detectCategory(product);
        
        console.log(`     Category: ${category}, Variants: ${variants.length}`);
        
        for (const variant of variants) {
          // Create a stable key - prefer external_id, then sku, then a combination
          const key = variant.external_id || variant.sku || `${product.name}-${variant.name}`;
          
          const entry = {
            key,
            catalogVariantId: variant.variant_id,
            syncVariantId: variant.id,
            price: variant.retail_price ?? null,
            name: variant.name,
            externalId: variant.external_id || null,
            sku: variant.sku || null,
          };
          
          buckets[category]?.push(entry);
          allPricing.push({ catalogVariantId: variant.variant_id, price: variant.retail_price ?? null });
        }
        
        // Small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`     ❌ Error processing product ${product.name}:`, error);
      }
    }
    
    console.log("");
    console.log("📊 Category breakdown:");
    for (const [category, entries] of Object.entries(buckets)) {
      if (entries.length > 0) {
        console.log(`   ${category}: ${entries.length} variants`);
      }
    }
    
    // Ensure src/hooks directory exists
    await fs.mkdir("src/hooks", { recursive: true });
    
    // Write variant files
    console.log("");
    console.log("📝 Writing variant files...");
    
    const variantFiles = [
      { category: "tshirt", filename: "tshirt-variants.ts" },
      { category: "hoodie", filename: "hoodie-variants.ts" },
      { category: "cap", filename: "cap-variants.ts" },
      { category: "mug", filename: "mug-variants.ts" },
      { category: "totebag", filename: "totebag-variants.ts" },
      { category: "waterbottle", filename: "waterbottle-variants.ts" },
      { category: "mousepad", filename: "mousepad-variants.ts" },
    ];
    
    for (const { category, filename } of variantFiles) {
      const entries = buckets[category] || [];
      if (entries.length > 0) {
        const content = generateVariantFile(category, entries);
        await fs.writeFile(`src/hooks/${filename}`, content);
        console.log(`   ✅ ${filename} (${entries.length} variants)`);
      } else {
        console.log(`   ⚠️  ${filename} - no variants found`);
      }
    }
    
    // Write pricing file
    console.log("");
    console.log("💰 Writing pricing data...");
    const pricingContent = generatePricingFile(allPricing);
    await fs.writeFile("src/lib/printful/pricing-data.ts", pricingContent);
    console.log(`   ✅ pricing-data.ts (${allPricing.filter(p => p.price).length} variants with pricing)`);
    
    // Generate summary
    console.log("");
    console.log("🎉 Sync completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log(`   Total products processed: ${allProducts.length}`);
    console.log(`   Total variants: ${allPricing.length}`);
    console.log(`   Variants with pricing: ${allPricing.filter(p => p.price).length}`);
    console.log("");
    console.log("📁 Files generated:");
    console.log("   - src/hooks/*-variants.ts (variant definitions)");
    console.log("   - src/lib/printful/pricing-data.ts (pricing data)");
    console.log("");
    console.log("🔧 Next steps:");
    console.log("   1. Review the generated files");
    console.log("   2. Update your frontend to use the new variant structure");
    console.log("   3. Test with real Printful catalog variant IDs");
    console.log("   4. Consider setting up CI checks to prevent drift");
    
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
