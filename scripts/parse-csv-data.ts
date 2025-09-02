import * as fs from 'fs';
import * as path from 'path';

// Read and parse the CSV data
function parseCSVData() {
  const csvPath = '/Users/arnispiekus/Documents/Github/ReformUK/agents/artifacts/printful-variant-audit.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    return [];
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  console.log('📋 CSV Headers:', headers);
  
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line (handle quoted values)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    
    if (values.length >= headers.length) {
      const item: any = {};
      headers.forEach((header, index) => {
        item[header] = values[index] || '';
      });
      data.push(item);
    }
  }
  
  console.log(`📊 Parsed ${data.length} items from CSV`);
  
  // Group by product
  const products = new Map();
  
  data.forEach(item => {
    const syncProductId = parseInt(item.sync_product_id);
    if (!products.has(syncProductId)) {
      products.set(syncProductId, {
        product_name: item.product_name,
        sync_product_id: syncProductId,
        variants: []
      });
    }
    
    products.get(syncProductId).variants.push({
      sync_variant_id: parseInt(item.sync_variant_id),
      variant_name: item.variant_name,
      catalog_variant_id: parseInt(item.catalog_variant_id),
      external_id: item.external_id,
      sku: item.sku,
      price: parseFloat(item.price),
      synced: item.synced === 'true'
    });
  });
  
  console.log(`🎯 Found ${products.size} unique products:`);
  products.forEach((product, id) => {
    console.log(`  ${product.product_name}: ${product.variants.length} variants`);
  });
  
  return Array.from(products.values());
}

// Generate TypeScript constant for the data
function generateDataConstant() {
  const products = parseCSVData();
  
  const tsContent = `// Auto-generated from CSV audit data
export const PRINTFUL_AUDIT_DATA = ${JSON.stringify(products, null, 2)};

export const UNIQUE_PRODUCTS = ${JSON.stringify(
  products.map(p => ({
    name: p.product_name,
    sync_product_id: p.sync_product_id,
    variant_count: p.variants.length,
    price_range: {
      min: Math.min(...p.variants.map((v: any) => v.price)),
      max: Math.max(...p.variants.map((v: any) => v.price))
    }
  })),
  null,
  2
)};
`;
  
  const outputPath = '/Users/arnispiekus/Documents/Github/ReformUK/scripts/printful-audit-data.ts';
  fs.writeFileSync(outputPath, tsContent);
  console.log(`✅ Generated data constants at: ${outputPath}`);
  
  return products;
}

// Run if this file is executed directly
generateDataConstant();

export { parseCSVData, generateDataConstant };