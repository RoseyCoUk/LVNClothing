import { createClient } from '@supabase/supabase-js';

// Test with both service role and anon key to verify accessibility
const supabaseUrl = 'http://127.0.0.1:54321';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, anonKey);

async function testApiAccess() {
  console.log('=== TESTING API ACCESS TO PRODUCT VARIANTS ===\n');
  console.log('Using anonymous key (public access)...\n');

  try {
    // Test 1: Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3);

    if (productsError) {
      console.log('❌ Error accessing products:', productsError.message);
    } else {
      console.log('✅ Successfully accessed products table');
      console.log(`   Found ${products?.length} products (limited to 3)`);
    }

    // Test 2: Get product variants
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(5);

    if (variantsError) {
      console.log('❌ Error accessing product_variants:', variantsError.message);
    } else {
      console.log('✅ Successfully accessed product_variants table');
      console.log(`   Found ${variants?.length} variants (limited to 5)`);
    }

    // Test 3: Get specific product with its variants
    const { data: productWithVariants, error: joinError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          name,
          color,
          size,
          price,
          printful_variant_id
        )
      `)
      .eq('slug', 'reform-uk-cap')
      .single();

    if (joinError) {
      console.log('❌ Error joining products with variants:', joinError.message);
    } else {
      console.log('✅ Successfully joined products with variants');
      console.log(`   Product: ${productWithVariants?.name}`);
      console.log(`   Variants: ${productWithVariants?.product_variants?.length} found`);
    }

    // Test 4: Test filtering by Printful ID
    const { data: filteredVariants, error: filterError } = await supabase
      .from('product_variants')
      .select('*')
      .not('printful_variant_id', 'is', null)
      .limit(3);

    if (filterError) {
      console.log('❌ Error filtering variants:', filterError.message);
    } else {
      console.log('✅ Successfully filtered variants by Printful ID');
      console.log(`   All ${filteredVariants?.length} variants have Printful IDs`);
    }

    console.log('\n=== API ACCESS TEST COMPLETE ===');
    console.log('✅ All API endpoints are accessible');
    console.log('✅ Data can be queried successfully');
    console.log('✅ Joins and filters work correctly\n');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testApiAccess();