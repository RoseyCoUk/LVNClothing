import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');

  // First, let's see what tables exist
  const { data: tables, error: tablesError } = await supabase.rpc('get_table_info');
  
  if (tablesError) {
    console.log('Using alternative method to check products table...\n');
    
    // Let's try to get products with a simple select
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }

    if (products && products.length > 0) {
      console.log('✅ Products table structure:');
      console.log(JSON.stringify(products[0], null, 2));
    }
  }

  // Now check variants
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('*')
    .limit(1);

  if (variantsError) {
    console.error('❌ Error fetching variants:', variantsError);
  } else if (variants && variants.length > 0) {
    console.log('\n✅ Product variants table structure:');
    console.log(JSON.stringify(variants[0], null, 2));
  }

  // Get all products to see current state
  const { data: allProducts, error: allProductsError } = await supabase
    .from('products')
    .select('*');

  if (!allProductsError && allProducts) {
    console.log(`\n📦 Found ${allProducts.length} products:`);
    allProducts.forEach(p => {
      console.log(`  - ${p.id}: ${p.name} (${Object.keys(p).join(', ')})`);
    });
  }
}

checkSchema().catch(console.error);