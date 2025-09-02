import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN || 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB';
if (!PRINTFUL_TOKEN) {
  throw new Error('PRINTFUL_TOKEN environment variable is required');
}

interface PrintfulVariant {
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
  availability_regions: { [key: string]: string };
  availability_status: { region: string; status: string }[];
}

interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url?: string;
  is_ignored: boolean;
}

interface PrintfulProductDetails {
  sync_product: {
    id: number;
    external_id: string;
    name: string;
    thumbnail: string;
    is_ignored: boolean;
  };
  sync_variants: Array<{
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
    files: Array<{
      id: number;
      type: string;
      hash: string | null;
      url: string | null;
      filename: string;
      mime_type: string;
      size: number;
      width: number;
      height: number;
      x: number;
      y: number;
      scale: number;
      visible: boolean;
      is_default: boolean;
      is_template: boolean;
    }>;
  }>;
}

interface ProductVariantData {
  printful_variant_id: number;
  name: string;
  color: string;
  size: string | null;
  price: number;
  color_hex: string;
  value: string;
  retail_price: number;
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

async function getProductVariantDetails(productId: number): Promise<PrintfulVariant[]> {
  console.log(`Getting variant details for Printful product ${productId}...`);
  
  try {
    const variants = await callPrintfulAPI(`/products/${productId}/variants`);
    return variants;
  } catch (error) {
    console.error(`Failed to get variants for product ${productId}:`, error);
    return [];
  }
}

async function getProductDetails(productId: number): Promise<{ cost: number; retail: number } | null> {
  console.log(`Getting product details for Printful product ${productId}...`);
  
  try {
    const productDetails = await callPrintfulAPI(`/products/${productId}`);
    
    // Extract cost from first variant
    if (productDetails.variants && productDetails.variants.length > 0) {
      const firstVariant = productDetails.variants[0];
      return {
        cost: parseFloat(firstVariant.price || '0'),
        retail: parseFloat(firstVariant.price || '0') * 1.5 // 50% markup as example
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to get product details for ${productId}:`, error);
    return null;
  }
}

async function getSyncProductDetails(syncProductId: number): Promise<PrintfulProductDetails | null> {
  console.log(`Getting sync product details for ${syncProductId}...`);
  
  try {
    const productDetails = await callPrintfulAPI(`/store/products/${syncProductId}`);
    return productDetails;
  } catch (error) {
    console.error(`Failed to get sync product details for ${syncProductId}:`, error);
    return null;
  }
}

function extractVariantInfo(variant: PrintfulVariant): {
  color: string;
  size: string | null;
  colorHex: string;
} {
  let color = variant.color || 'Default';
  let size = variant.size || null;
  let colorHex = variant.color_code || '#000000';

  // Clean up color names
  color = color.replace(/([a-z])([A-Z])/g, '$1 $2'); // Add space between camelCase
  
  // Handle specific color mappings
  const colorMappings: { [key: string]: string } = {
    'BlackHeather': 'Black Heather',
    'IndigoBlue': 'Indigo Blue',
    'HeatherGrey': 'Heather Grey',
    'NavyBlue': 'Navy Blue',
    'DarkGrey': 'Dark Grey',
    'LightBlue': 'Light Blue',
    'ForestGreen': 'Forest Green'
  };

  if (colorMappings[color.replace(/\s/g, '')]) {
    color = colorMappings[color.replace(/\s/g, '')];
  }

  // Handle size cleanup - remove "One Size" for items that shouldn't have sizes
  if (size === 'One size fits most' || size === 'One size') {
    // Keep "One Size" for caps, but null for other items like mugs, mousepads
    if (variant.name.toLowerCase().includes('cap') || 
        variant.name.toLowerCase().includes('hat')) {
      size = 'One Size';
    } else if (variant.name.toLowerCase().includes('mug') ||
               variant.name.toLowerCase().includes('mousepad') ||
               variant.name.toLowerCase().includes('water bottle') ||
               variant.name.toLowerCase().includes('tote')) {
      size = null;
    } else {
      size = 'One Size';
    }
  }

  return { color, size, colorHex };
}

async function fixPrintfulVariantSync() {
  console.log('=== STARTING PRINTFUL VARIANT SYNC FIX ===\n');

  // Get all products from our database
  const { data: dbProducts } = await supabase
    .from('products')
    .select('id, printful_product_id, printful_sync_product_id, name');

  if (!dbProducts || dbProducts.length === 0) {
    console.error('No products found in database');
    return;
  }

  console.log(`Found ${dbProducts.length} products in database\n`);

  for (const product of dbProducts) {
    console.log(`\n--- Processing product: ${product.name} ---`);
    console.log(`Product ID: ${product.id}, Printful Product ID: ${product.printful_product_id}, Sync Product ID: ${product.printful_sync_product_id}`);

    let variantData: ProductVariantData[] = [];
    let productCost = 0;
    let productRetail = 0;

    // First try to get sync product details if we have sync_product_id
    if (product.printful_sync_product_id) {
      try {
        const syncDetails = await getSyncProductDetails(product.printful_sync_product_id);
        
        if (syncDetails && syncDetails.sync_variants) {
          console.log(`Found ${syncDetails.sync_variants.length} sync variants`);
          
          for (const syncVariant of syncDetails.sync_variants) {
            if (!syncVariant.synced) continue;
            
            // Get the base variant details
            const baseVariants = await getProductVariantDetails(syncVariant.product.product_id);
            const baseVariant = baseVariants.find(v => v.id === syncVariant.variant_id);
            
            if (baseVariant) {
              const { color, size, colorHex } = extractVariantInfo(baseVariant);
              const price = parseFloat(syncVariant.retail_price);
              
              const value = size ? `${color}-${size}` : color;
              
              variantData.push({
                printful_variant_id: syncVariant.id, // Use sync variant ID
                name: syncVariant.name,
                color,
                size,
                price,
                color_hex: colorHex,
                value,
                retail_price: price
              });

              // Use first variant price as product cost/retail
              if (productCost === 0) {
                productCost = price * 0.6; // Estimate cost as 60% of retail
                productRetail = price;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing sync product ${product.printful_sync_product_id}:`, error);
      }
    }

    // Fallback to regular product variants if sync didn't work
    if (variantData.length === 0 && product.printful_product_id) {
      console.log('Sync variants not found, trying regular product variants...');
      
      try {
        const variants = await getProductVariantDetails(product.printful_product_id);
        const productDetails = await getProductDetails(product.printful_product_id);

        if (productDetails) {
          productCost = productDetails.cost;
          productRetail = productDetails.retail;
        }

        for (const variant of variants) {
          const { color, size, colorHex } = extractVariantInfo(variant);
          const price = parseFloat(variant.price);
          const value = size ? `${color}-${size}` : color;
          
          variantData.push({
            printful_variant_id: variant.id,
            name: variant.name,
            color,
            size,
            price,
            color_hex: colorHex,
            value,
            retail_price: price
          });
        }
      } catch (error) {
        console.error(`Error processing regular product ${product.printful_product_id}:`, error);
      }
    }

    if (variantData.length === 0) {
      console.log(`No variants found for product ${product.name}`);
      continue;
    }

    console.log(`Processed ${variantData.length} variants for ${product.name}`);

    // Update product with cost data
    if (productCost > 0) {
      await supabase
        .from('products')
        .update({
          printful_cost: productCost,
          retail_price: productRetail
        })
        .eq('id', product.id);

      console.log(`Updated product ${product.name} with cost: ${productCost}, retail: ${productRetail}`);
    }

    // Get existing variants for this product
    const { data: existingVariants } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', product.id);

    if (!existingVariants || existingVariants.length === 0) {
      console.log(`No existing variants found for product ${product.name}`);
      continue;
    }

    // Update existing variants with real data
    for (let i = 0; i < Math.min(existingVariants.length, variantData.length); i++) {
      const variantId = existingVariants[i].id;
      const newData = variantData[i];

      await supabase
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

      console.log(`Updated variant ${variantId} with real Printful data`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n=== PRINTFUL VARIANT SYNC FIX COMPLETED ===');
}

fixPrintfulVariantSync().catch(console.error);