import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// REMOTE Supabase connection - NOT LOCAL
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';
const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN || 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB';
const PRINTFUL_STORE_ID = process.env.PRINTFUL_STORE_ID || '16651763';

// Color name to hex mapping based on Printful standards
const COLOR_HEX_MAP: Record<string, string> = {
  'Black': '#000000',
  'White': '#FFFFFF',
  'Navy': '#1f2937',
  'Red': '#dc2626',
  'Sport Grey': '#6b7280',
  'Dark Grey': '#374151',
  'Light Blue': '#3b82f6',
  'Pink': '#ec4899',
  'Khaki': '#d4a574',
  'Stone': '#a8a29e',
  'Black Heather': '#1f2937',
  'Dark Grey Heather': '#4b5563',
  'Dark Heather': '#374151',
  'Athletic Heather': '#9ca3af',
  'Heather Deep Teal': '#0f766e',
  'Heather Dust': '#fbbf24',
  'Heather Prism Peach': '#fb923c',
  'Indigo Blue': '#4338ca',
  'Light Pink': '#fbcfe8',
  'Mauve': '#c084fc',
  'Mustard': '#eab308',
  'Olive': '#84cc16',
  'Steel Blue': '#475569',
  'Yellow': '#facc15',
  'Army': '#4b5320',
  'Ash': '#e5e7eb',
  'Asphalt': '#1e293b',
  'Autumn': '#ea580c',
  'Default': '#808080'
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log(`\n=== SYNCING PRINTFUL DATA TO REMOTE SUPABASE ===`);
console.log(`Remote URL: ${SUPABASE_URL}`);
console.log(`Printful Store ID: ${PRINTFUL_STORE_ID}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url: string;
  is_ignored: boolean;
}

interface PrintfulVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  retail_price: string;
  currency: string;
  is_ignored: boolean;
  sku: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
}

interface PrintfulCatalogVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  color_code: string;
  color_code2: string;
  image: string;
  price: string;
  in_stock: boolean;
  availability_regions: any;
  availability_status: any[];
}

async function fetchPrintfulProducts(): Promise<PrintfulProduct[]> {
  const response = await fetch(`https://api.printful.com/store/products?store_id=${PRINTFUL_STORE_ID}`, {
    headers: {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'X-PF-Store-Id': PRINTFUL_STORE_ID
    }
  });

  if (!response.ok) {
    throw new Error(`Printful API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  return data.result || [];
}

async function fetchPrintfulProductDetails(productId: number): Promise<any> {
  const response = await fetch(`https://api.printful.com/store/products/${productId}?store_id=${PRINTFUL_STORE_ID}`, {
    headers: {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'X-PF-Store-Id': PRINTFUL_STORE_ID
    }
  });

  if (!response.ok) {
    throw new Error(`Printful API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  return data.result;
}

async function fetchPrintfulCatalogVariant(variantId: number): Promise<PrintfulCatalogVariant | null> {
  try {
    const response = await fetch(`https://api.printful.com/products/variant/${variantId}`, {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_TOKEN}`
      }
    });

    if (!response.ok) {
      console.warn(`Could not fetch catalog variant ${variantId}: ${response.status}`);
      return null;
    }

    const data = await response.json() as any;
    return data.result?.variant || null;
  } catch (error) {
    console.warn(`Error fetching catalog variant ${variantId}:`, error);
    return null;
  }
}

async function syncProducts() {
  try {
    // Step 1: Get all products from our database that have Printful IDs
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('*')
      .not('printful_product_id', 'is', null);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`Found ${dbProducts?.length || 0} products with Printful IDs in database\n`);

    // Step 2: Fetch all Printful products
    const printfulProducts = await fetchPrintfulProducts();
    console.log(`Found ${printfulProducts.length} products in Printful store\n`);

    // Step 3: Process each database product
    for (const dbProduct of dbProducts || []) {
      console.log(`\nProcessing: ${dbProduct.name} (Printful ID: ${dbProduct.printful_product_id})`);
      
      // Find matching Printful product
      const printfulProduct = printfulProducts.find(p => p.id.toString() === dbProduct.printful_product_id);
      
      if (!printfulProduct) {
        console.warn(`  ⚠️  No matching Printful product found for ID ${dbProduct.printful_product_id}`);
        continue;
      }

      // Fetch detailed product info including variants
      const productDetails = await fetchPrintfulProductDetails(printfulProduct.id);
      const syncVariants = productDetails.sync_variants || [];
      
      console.log(`  Found ${syncVariants.length} variants in Printful`);

      // Calculate costs and margins
      let minCost = Infinity;
      let maxCost = 0;
      let totalCost = 0;
      let variantCount = 0;

      // Process variants
      const variantUpdates = [];
      
      for (const syncVariant of syncVariants) {
        if (syncVariant.is_ignored) continue;
        
        const catalogVariant = await fetchPrintfulCatalogVariant(syncVariant.product.variant_id);
        
        if (!catalogVariant) {
          console.warn(`    ⚠️  Could not fetch catalog info for variant ${syncVariant.id}`);
          continue;
        }

        // Parse prices
        const retailPrice = parseFloat(syncVariant.retail_price);
        const costPrice = parseFloat(catalogVariant.price);
        
        if (!isNaN(costPrice)) {
          minCost = Math.min(minCost, costPrice);
          maxCost = Math.max(maxCost, costPrice);
          totalCost += costPrice;
          variantCount++;
        }

        // Determine color and size
        let colorName = catalogVariant.color || 'Default';
        let sizeName = catalogVariant.size || null;
        
        // Handle size properly
        if (sizeName === 'One size' || sizeName === 'One Size') {
          sizeName = 'One Size';
        } else if (sizeName && ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'].includes(sizeName)) {
          // Keep standard sizes as-is
        } else if (!sizeName || sizeName === '') {
          sizeName = null; // No size for this item
        }

        // Get color hex
        const colorHex = COLOR_HEX_MAP[colorName] || catalogVariant.color_code || '#808080';

        // Create value field
        let value = '';
        if (colorName && colorName !== 'Default') {
          value = colorName;
        }
        if (sizeName) {
          value = value ? `${value}-${sizeName}` : sizeName;
        }
        if (!value) {
          value = 'Default';
        }

        variantUpdates.push({
          product_id: dbProduct.id,
          printful_variant_id: syncVariant.id.toString(),
          name: syncVariant.name,
          color: colorName, // Keep for backward compatibility
          color_name: colorName,
          color_hex: colorHex.startsWith('#') ? colorHex : `#${colorHex}`,
          size: sizeName, // Keep for backward compatibility  
          size_name: sizeName,
          price: retailPrice,
          value: value,
          in_stock: catalogVariant.in_stock,
          is_available: true
        });
      }

      // Calculate product-level costs and margins
      const avgCost = variantCount > 0 ? totalCost / variantCount : 0;
      const retailPrice = dbProduct.price || 0;
      const margin = retailPrice - avgCost;
      const marginPercent = avgCost > 0 ? Math.round((margin / avgCost) * 100 * 100) / 100 : 0;

      // Update product with cost data
      const { error: productUpdateError } = await supabase
        .from('products')
        .update({
          printful_cost: avgCost,
          retail_price: retailPrice,
          margin: margin, // Using absolute margin, not percentage
          updated_at: new Date().toISOString()
        })
        .eq('id', dbProduct.id);

      if (productUpdateError) {
        console.error(`  ❌ Error updating product: ${productUpdateError.message}`);
      } else {
        console.log(`  ✅ Updated product costs: cost=$${avgCost.toFixed(2)}, retail=$${retailPrice.toFixed(2)}, margin=$${margin.toFixed(2)}`);
      }

      // Delete existing variants for this product
      const { error: deleteError } = await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', dbProduct.id);

      if (deleteError) {
        console.error(`  ❌ Error deleting old variants: ${deleteError.message}`);
      }

      // Insert new variants
      if (variantUpdates.length > 0) {
        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantUpdates);

        if (variantError) {
          console.error(`  ❌ Error inserting variants: ${variantError.message}`);
        } else {
          console.log(`  ✅ Inserted ${variantUpdates.length} variants`);
        }
      }
    }

    console.log('\n=== SYNC COMPLETE ===\n');

  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}

async function validateResults() {
  console.log('=== VALIDATING RESULTS ===\n');

  // Check products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, printful_cost, retail_price, margin');

  const invalidProducts = products?.filter(p => 
    !p.printful_cost || !p.retail_price || p.margin === null
  ) || [];

  if (invalidProducts.length > 0) {
    console.warn('⚠️  Products with missing data:');
    invalidProducts.forEach(p => {
      console.warn(`  - ${p.name}: cost=${p.printful_cost}, retail=${p.retail_price}, margin=${p.margin}`);
    });
  } else {
    console.log('✅ All products have cost, retail, and margin data');
  }

  // Check variants
  const { data: variantStats } = await supabase.rpc('get_variant_stats').single();
  
  if (!variantStats) {
    // Manual check
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*');

    const stats = {
      total: variants?.length || 0,
      with_printful_id: variants?.filter(v => v.printful_variant_id).length || 0,
      with_price: variants?.filter(v => v.price).length || 0,
      with_color_name: variants?.filter(v => v.color_name && v.color_name !== 'Default').length || 0,
      with_color_hex: variants?.filter(v => v.color_hex && v.color_hex !== '#808080').length || 0,
      with_proper_size: variants?.filter(v => 
        v.size_name === null || 
        v.size_name === 'One Size' || 
        ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'].includes(v.size_name)
      ).length || 0
    };

    console.log('\nVariant Statistics:');
    console.log(`  Total variants: ${stats.total}`);
    console.log(`  With Printful ID: ${stats.with_printful_id}/${stats.total}`);
    console.log(`  With price: ${stats.with_price}/${stats.total}`);
    console.log(`  With proper color name: ${stats.with_color_name}/${stats.total}`);
    console.log(`  With color hex: ${stats.with_color_hex}/${stats.total}`);
    console.log(`  With proper size: ${stats.with_proper_size}/${stats.total}`);

    if (stats.with_printful_id < stats.total) {
      console.warn(`\n⚠️  ${stats.total - stats.with_printful_id} variants missing Printful IDs`);
    }
    if (stats.with_price < stats.total) {
      console.warn(`⚠️  ${stats.total - stats.with_price} variants missing prices`);
    }
  }
}

// Create helper RPC function for stats
async function createStatsFunction() {
  const { error } = await supabase.rpc('create_function', {
    function_sql: `
      CREATE OR REPLACE FUNCTION get_variant_stats()
      RETURNS json AS $$
      DECLARE
        result json;
      BEGIN
        SELECT json_build_object(
          'total', COUNT(*),
          'with_printful_id', COUNT(printful_variant_id),
          'with_price', COUNT(price),
          'with_color_name', COUNT(CASE WHEN color_name IS NOT NULL AND color_name != 'Default' THEN 1 END),
          'with_color_hex', COUNT(CASE WHEN color_hex IS NOT NULL AND color_hex != '#808080' THEN 1 END)
        ) INTO result
        FROM product_variants;
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;
    `
  });
}

// Main execution
async function main() {
  try {
    await syncProducts();
    await validateResults();
    console.log('\n✅ Sync completed successfully');
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  }
}

main();