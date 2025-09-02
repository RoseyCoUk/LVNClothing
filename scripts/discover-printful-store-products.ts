import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

const PRINTFUL_TOKEN = process.env.PRINTFUL_TOKEN || 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB';

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

async function discoverPrintfulStoreProducts() {
  console.log('=== DISCOVERING PRINTFUL STORE PRODUCTS ===\n');

  try {
    // Get all sync products from Printful store
    console.log('Fetching Printful store products...');
    const storeProducts = await callPrintfulAPI('/store/products');
    
    console.log(`Found ${storeProducts.length} products in Printful store:\n`);
    
    for (const product of storeProducts) {
      console.log(`ID: ${product.id}, Name: "${product.name}", External ID: "${product.external_id}", Variants: ${product.variants}, Synced: ${product.synced}`);
      
      if (product.synced > 0) {
        // Get detailed info for synced products
        try {
          const productDetail = await callPrintfulAPI(`/store/products/${product.id}`);
          console.log(`  - Sync variants: ${productDetail.sync_variants?.length || 0}`);
          
          if (productDetail.sync_variants) {
            productDetail.sync_variants.slice(0, 3).forEach((variant: any) => {
              console.log(`    - Variant ID: ${variant.id}, Name: "${variant.name}", Price: ${variant.retail_price}`);
            });
            if (productDetail.sync_variants.length > 3) {
              console.log(`    - ... and ${productDetail.sync_variants.length - 3} more variants`);
            }
          }
        } catch (error) {
          console.log(`  - Error getting details: ${error}`);
        }
      }
      console.log('');
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Now compare with our database
    console.log('\n=== COMPARING WITH DATABASE PRODUCTS ===\n');
    const { data: dbProducts } = await supabase
      .from('products')
      .select('id, name, printful_product_id, printful_sync_product_id');

    dbProducts?.forEach(dbProduct => {
      console.log(`DB Product: "${dbProduct.name}"`);
      console.log(`  - Product ID: ${dbProduct.printful_product_id}`);
      console.log(`  - Sync Product ID: ${dbProduct.printful_sync_product_id}`);
      
      // Try to match with Printful products
      const matchByName = storeProducts.find((p: any) => 
        p.name.toLowerCase().includes(dbProduct.name.toLowerCase().split(' ').slice(0, 2).join(' ')) ||
        dbProduct.name.toLowerCase().includes(p.name.toLowerCase().split(' ').slice(0, 2).join(' '))
      );
      
      if (matchByName) {
        console.log(`  ✅ Potential match: "${matchByName.name}" (ID: ${matchByName.id})`);
      } else {
        console.log(`  ❌ No obvious match found`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error discovering products:', error);
  }
}

discoverPrintfulStoreProducts().catch(console.error);