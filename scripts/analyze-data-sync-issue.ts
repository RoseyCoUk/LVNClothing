import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeDataSyncIssue() {
  console.log('🔍 Analyzing data synchronization issue...\n');

  // Get all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('printful_sync_product_id');

  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    return;
  }

  console.log(`📦 Total products found: ${products.length}\n`);

  // Analyze products by Printful ID format
  const correctProducts = products.filter(p => p.printful_sync_product_id?.toString().startsWith('390'));
  const incorrectProducts = products.filter(p => p.printful_sync_product_id?.toString().startsWith('68a'));

  console.log('✅ Products with CORRECT Printful IDs (390xxx format):');
  correctProducts.forEach(p => {
    console.log(`  - ${p.name}: ${p.printful_sync_product_id} (cost: ${p.cost}, margin: ${p.margin})`);
  });

  console.log('\n❌ Products with INCORRECT Printful IDs (68axxx format):');
  incorrectProducts.forEach(p => {
    console.log(`  - ${p.name}: ${p.printful_sync_product_id} (cost: ${p.cost}, margin: ${p.margin})`);
  });

  // Get variant counts
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('product_id, sync_variant_id');

  if (variantsError) {
    console.error('❌ Error fetching variants:', variantsError);
    return;
  }

  console.log(`\n🎯 Total variants found: ${variants.length}`);

  // Check variant linkage
  const variantsByProduct = variants.reduce((acc, variant) => {
    acc[variant.product_id] = (acc[variant.product_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Variants per product:');
  products.forEach(p => {
    const variantCount = variantsByProduct[p.id] || 0;
    console.log(`  - ${p.name}: ${variantCount} variants`);
  });

  // Summary
  console.log('\n📋 SUMMARY:');
  console.log(`  - Products with correct IDs: ${correctProducts.length}`);
  console.log(`  - Products with incorrect IDs: ${incorrectProducts.length}`);
  console.log(`  - Products missing cost/margin: ${correctProducts.filter(p => !p.cost || !p.margin).length}`);
  console.log(`  - Total variants: ${variants.length}`);

  return {
    correctProducts,
    incorrectProducts,
    variants,
    variantsByProduct
  };
}

// Run the analysis
analyzeDataSyncIssue().catch(console.error);