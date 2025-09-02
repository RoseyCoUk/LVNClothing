import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN || 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB';

interface PrintfulSyncVariant {
  id: number;
  external_id: string;
  sync_product_id: number;
  name: string;
  synced: boolean;
  variant_id: number;
  main_category_id: number;
  warehouse_product_variant_id: number | null;
  retail_price: string;
  sku: string;
  currency: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
}

interface PrintfulBaseVariant {
  id: number;
  product_id: number;
  name: string;
  size: string | null;
  color: string;
  color_code: string;
  color_code2?: string;
  image?: string;
  price: string;
  in_stock: boolean;
}

interface ProductVariantData {
  printful_variant_id: number;
  name: string;
  color: string;
  size: string | null;
  price: number;
  color_hex: string;
  value: string;
}

async function callPrintfulAPI(endpoint: string) {
  const response = await fetch(`https://api.printful.com${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Printful API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

function extractColorAndSize(variantName: string): { color: string; size: string | null } {
  // Parse variant name like "Reform UK Cap / Black" or "Unisex t-shirt DARK / Black Heather / S"
  const parts = variantName.split(' / ');
  
  if (parts.length === 1) {
    // Single item like "Reform UK Sticker"
    return { color: 'Default', size: null };
  } else if (parts.length === 2) {
    // Color only like "Reform UK Cap / Black"  
    return { color: parts[1], size: 'One Size' };
  } else if (parts.length === 3) {
    // Color and size like "Unisex t-shirt DARK / Black Heather / S"
    return { color: parts[1], size: parts[2] };
  }
  
  // Fallback
  return { color: 'Default', size: null };
}

async function getBaseVariantInfo(productId: number, variantId: number): Promise<PrintfulBaseVariant | null> {
  try {
    const variants = await callPrintfulAPI(`/products/${productId}/variants`);
    return variants.find((v: PrintfulBaseVariant) => v.id === variantId) || null;
  } catch (error) {
    console.warn(`Could not get base variant info for product ${productId}, variant ${variantId}:`, error);
    return null;
  }
}

async function fixVariantSyncCorrected() {
  console.log('=== STARTING CORRECTED VARIANT SYNC FIX ===\n');

  // Get all products from our database
  const { data: dbProducts } = await supabase
    .from('products')
    .select('id, printful_product_id, name');

  if (!dbProducts || dbProducts.length === 0) {
    console.error('No products found in database');
    return;
  }

  console.log(`Found ${dbProducts.length} products in database\n`);

  for (const product of dbProducts) {
    console.log(`\n--- Processing product: ${product.name} ---`);
    console.log(`Product ID: ${product.id}, Printful Sync Product ID: ${product.printful_product_id}`);

    try {
      // Get sync product details from store API
      const syncProductDetails = await callPrintfulAPI(`/store/products/${product.printful_product_id}`);
      
      if (!syncProductDetails.sync_variants || syncProductDetails.sync_variants.length === 0) {
        console.log(`No sync variants found for ${product.name}`);
        continue;
      }

      console.log(`Found ${syncProductDetails.sync_variants.length} sync variants`);

      const variantData: ProductVariantData[] = [];
      let totalCost = 0;
      let totalRetail = 0;

      for (const syncVariant of syncProductDetails.sync_variants) {
        if (!syncVariant.synced) continue;

        const { color, size } = extractColorAndSize(syncVariant.name);
        const price = parseFloat(syncVariant.retail_price);
        
        // Use default color hex for now - sync variants don't have direct color codes available
        const colorHex = '#000000';

        // Create value string
        const value = size && size !== 'One Size' ? `${color}-${size}` : color;

        variantData.push({
          printful_variant_id: syncVariant.id,
          name: syncVariant.name,
          color,
          size: size === 'One Size' && !['cap', 'hat'].some(term => product.name.toLowerCase().includes(term)) ? null : size,
          price,
          color_hex: colorHex,
          value
        });

        totalCost += price * 0.6; // Estimate cost as 60% of retail
        totalRetail += price;

        console.log(`  ✅ ${syncVariant.name} - Color: ${color}, Size: ${size}, Price: $${price}, Hex: ${colorHex}`);
      }

      if (variantData.length === 0) {
        console.log(`No valid variants processed for ${product.name}`);
        continue;
      }

      // Update product with average cost data
      const avgCost = totalCost / variantData.length;
      const avgRetail = totalRetail / variantData.length;

      await supabase
        .from('products')
        .update({
          printful_cost: avgCost,
          retail_price: avgRetail
        })
        .eq('id', product.id);

      console.log(`Updated product ${product.name} with avg cost: $${avgCost.toFixed(2)}, avg retail: $${avgRetail.toFixed(2)}`);

      // Get existing variants for this product
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', product.id)
        .order('id');

      if (!existingVariants || existingVariants.length === 0) {
        console.log(`No existing variants found for product ${product.name}`);
        continue;
      }

      console.log(`Updating ${Math.min(existingVariants.length, variantData.length)} existing variants...`);

      // Update existing variants with real data
      for (let i = 0; i < Math.min(existingVariants.length, variantData.length); i++) {
        const variantId = existingVariants[i].id;
        const newData = variantData[i];

        const { error } = await supabase
          .from('product_variants')
          .update({
            printful_variant_id: newData.printful_variant_id,
            name: newData.name,
            color: newData.color,
            size: newData.size,
            price: newData.price,
            color_hex: newData.color_hex,
            value: newData.value
          })
          .eq('id', variantId);

        if (error) {
          console.error(`Error updating variant ${variantId}:`, error);
        } else {
          console.log(`  ✅ Updated variant ${i + 1}: ${newData.name}`);
        }
      }

      // Handle case where we have more Printful variants than DB variants
      if (variantData.length > existingVariants.length) {
        console.log(`⚠️  Printful has ${variantData.length} variants but DB only has ${existingVariants.length}. Consider adding more variants.`);
      }

      // Handle case where we have fewer Printful variants than DB variants  
      if (existingVariants.length > variantData.length) {
        console.log(`⚠️  DB has ${existingVariants.length} variants but Printful only has ${variantData.length}. Extra variants will keep old data.`);
      }

    } catch (error) {
      console.error(`Error processing product ${product.name}:`, error);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=== CORRECTED VARIANT SYNC FIX COMPLETED ===');
}

fixVariantSyncCorrected().catch(console.error);