import { createClient } from '@supabase/supabase-js';
import { getProducts, getProductVariants } from './src/lib/api.js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontendQueries() {
  console.log('\n=== TESTING FRONTEND QUERIES ===\n');

  try {
    // 1. Test getProducts() API function
    console.log('1. Testing getProducts() API function...');
    const products = await getProducts();
    console.log('Products returned:', products.length);
    
    if (products.length > 0) {
      const tshirtProduct = products.find(p => p.name.toLowerCase().includes('t-shirt'));
      if (tshirtProduct) {
        console.log('T-shirt product found:');
        console.log('- ID:', tshirtProduct.id);
        console.log('- Name:', tshirtProduct.name);
        console.log('- Image URL:', tshirtProduct.image_url);
        console.log('- Category:', (tshirtProduct as any).category);
        console.log('- Full object:', JSON.stringify(tshirtProduct, null, 2));
      } else {
        console.log('No T-shirt product found in results');
      }
    }

    // 2. Test raw supabase query for products with images
    console.log('\n2. Testing raw Supabase query...');
    const { data: rawProducts, error: rawError } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .eq('slug', 't-shirt');

    if (rawError) {
      console.log('Raw query error:', rawError);
    } else {
      console.log('Raw products:', JSON.stringify(rawProducts, null, 2));
      if (rawProducts && rawProducts.length > 0) {
        const product = rawProducts[0];
        console.log('T-shirt images from DB:');
        product.product_images?.forEach((img, i) => {
          console.log(`  ${i+1}. Color: ${img.color}, Type: ${img.variant_type}, URL: ${img.image_url}`);
        });
      }
    }

    // 3. Test variant fetching
    if (products.length > 0) {
      const tshirtProduct = products.find(p => p.name.toLowerCase().includes('t-shirt'));
      if (tshirtProduct) {
        console.log('\n3. Testing getProductVariants()...');
        const variants = await getProductVariants(tshirtProduct.id);
        console.log('Variants returned:', variants.length);
        console.log('Variant data:', JSON.stringify(variants, null, 2));
      }
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testFrontendQueries();