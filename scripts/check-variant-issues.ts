import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVariantIssues() {
  console.log('=== ANALYZING CURRENT VARIANT ISSUES ===\n');

  // Check total variants and null printful_variant_ids
  const { data: variantStats } = await supabase
    .from('product_variants')
    .select('printful_variant_id, color, size, price, value')
    .order('id');

  console.log(`Total variants: ${variantStats?.length || 0}`);
  
  const nullPrintfulIds = variantStats?.filter(v => !v.printful_variant_id).length || 0;
  console.log(`Variants with NULL printful_variant_id: ${nullPrintfulIds}`);
  console.log(`Variants with valid printful_variant_id: ${(variantStats?.length || 0) - nullPrintfulIds}\n`);

  // Show sample of problematic data
  console.log('=== SAMPLE OF CURRENT VARIANT DATA ===');
  const sampleVariants = variantStats?.slice(0, 10);
  sampleVariants?.forEach(variant => {
    console.log(`printful_variant_id: ${variant.printful_variant_id || 'NULL'}, color: ${variant.color}, size: ${variant.size}, price: ${variant.price}, value: ${variant.value}`);
  });

  // Check products for missing cost data
  console.log('\n=== CHECKING PRODUCTS FOR MISSING COST DATA ===');
  const { data: products } = await supabase
    .from('products')
    .select('id, name, printful_cost, retail_price')
    .order('id');

  const productsWithoutCost = products?.filter(p => !p.printful_cost).length || 0;
  const productsWithoutRetail = products?.filter(p => !p.retail_price).length || 0;
  
  console.log(`Total products: ${products?.length || 0}`);
  console.log(`Products missing printful_cost: ${productsWithoutCost}`);
  console.log(`Products missing retail_price: ${productsWithoutRetail}`);

  // Show sample color issues
  console.log('\n=== SAMPLE COLOR ISSUES ===');
  const uniqueColors = [...new Set(variantStats?.map(v => v.color).filter(Boolean))];
  console.log('Current colors in database:', uniqueColors);

  // Show sample size issues
  console.log('\n=== SAMPLE SIZE ISSUES ===');
  const uniqueSizes = [...new Set(variantStats?.map(v => v.size).filter(Boolean))];
  console.log('Current sizes in database:', uniqueSizes);
}

checkVariantIssues().catch(console.error);