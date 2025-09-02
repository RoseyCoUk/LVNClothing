import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMergingIssue() {
  console.log('=== INVESTIGATING PRODUCT MERGING ISSUE ===\n');

  // 1. Check all products with their names
  console.log('1. ALL PRODUCTS IN DATABASE:');
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, printful_product_id')
    .order('name');

  products?.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id}, Printful: ${p.printful_product_id})`);
  });

  // 2. Check T-Shirt products specifically
  console.log('\n2. T-SHIRT PRODUCTS:');
  const { data: tshirtProducts } = await supabase
    .from('products')
    .select('id, name, printful_product_id')
    .or('name.ilike.%t-shirt%,name.ilike.%tshirt%');

  tshirtProducts?.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id})`);
  });

  // 3. Check Hoodie products specifically
  console.log('\n3. HOODIE PRODUCTS:');
  const { data: hoodieProducts } = await supabase
    .from('products')
    .select('id, name, printful_product_id')
    .ilike('name', '%hoodie%');

  hoodieProducts?.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id})`);
  });

  // 4. Check Cap product and its variants
  console.log('\n4. CAP PRODUCT AND VARIANTS:');
  const { data: capProduct } = await supabase
    .from('products')
    .select('id, name')
    .ilike('name', '%cap%')
    .single();

  if (capProduct) {
    console.log(`  Cap Product: ${capProduct.name} (ID: ${capProduct.id})`);
    
    const { data: capVariants } = await supabase
      .from('product_variants')
      .select('id, color, color_hex, printful_variant_id')
      .eq('product_id', capProduct.id)
      .order('color');

    console.log('  Cap Variants:');
    capVariants?.forEach(v => {
      console.log(`    - ${v.color}: hex=${v.color_hex}, printful_id=${v.printful_variant_id}`);
    });
  }

  // 5. Check variant counts for each product
  console.log('\n5. VARIANT COUNTS BY PRODUCT:');
  for (const product of products || []) {
    const { count } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', product.id);
    
    console.log(`  ${product.name}: ${count} variants`);
  }

  // 6. Sample T-Shirt variants from different products
  console.log('\n6. T-SHIRT VARIANT SAMPLES:');
  for (const product of tshirtProducts || []) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('color, size, printful_variant_id')
      .eq('product_id', product.id)
      .limit(3);
    
    console.log(`  ${product.name}:`);
    variants?.forEach(v => {
      console.log(`    - ${v.color} / ${v.size} (Printful: ${v.printful_variant_id})`);
    });
  }

  // 7. Sample Hoodie variants from different products
  console.log('\n7. HOODIE VARIANT SAMPLES:');
  for (const product of hoodieProducts || []) {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('color, size, printful_variant_id')
      .eq('product_id', product.id)
      .limit(3);
    
    console.log(`  ${product.name}:`);
    variants?.forEach(v => {
      console.log(`    - ${v.color} / ${v.size} (Printful: ${v.printful_variant_id})`);
    });
  }
}

checkMergingIssue().catch(console.error);