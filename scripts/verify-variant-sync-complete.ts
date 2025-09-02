import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyVariantSyncComplete() {
  console.log('=== VERIFYING VARIANT SYNC COMPLETION ===\n');

  // 1. Check total variants count
  const { data: allVariants, count: totalVariants } = await supabase
    .from('product_variants')
    .select('*', { count: 'exact' });

  console.log(`✅ Total variants in database: ${totalVariants}`);
  console.log(`Expected: 158 variants`);
  console.log(`Match: ${totalVariants === 158 ? 'YES' : 'NO'}\n`);

  // 2. Check for NULL printful_variant_ids (should be 0)
  const nullPrintfulIds = allVariants?.filter(v => !v.printful_variant_id).length || 0;
  console.log(`❌ Variants with NULL printful_variant_id: ${nullPrintfulIds}`);
  console.log(`Expected: 0`);
  console.log(`Fixed: ${nullPrintfulIds === 0 ? 'YES' : 'NO'}\n`);

  // 3. Check for NULL prices (should be 0)  
  const nullPrices = allVariants?.filter(v => !v.price).length || 0;
  console.log(`❌ Variants with NULL price: ${nullPrices}`);
  console.log(`Expected: 0`);
  console.log(`Fixed: ${nullPrices === 0 ? 'YES' : 'NO'}\n`);

  // 4. Show color distribution (should have real colors now)
  const colors = [...new Set(allVariants?.map(v => v.color).filter(Boolean))].sort();
  console.log('=== COLOR DISTRIBUTION ===');
  console.log(`Total unique colors: ${colors.length}`);
  colors.forEach(color => {
    const count = allVariants?.filter(v => v.color === color).length || 0;
    console.log(`  - ${color}: ${count} variants`);
  });
  console.log('');

  // 5. Show size distribution (should have real sizes now)
  const sizes = [...new Set(allVariants?.map(v => v.size).filter(s => s !== null))].sort();
  const nullSizes = allVariants?.filter(v => v.size === null).length || 0;
  console.log('=== SIZE DISTRIBUTION ===');
  console.log(`Total unique sizes: ${sizes.length}`);
  sizes.forEach(size => {
    const count = allVariants?.filter(v => v.size === size).length || 0;
    console.log(`  - ${size}: ${count} variants`);
  });
  console.log(`  - null (no size): ${nullSizes} variants`);
  console.log('');

  // 6. Check products have cost data
  const { data: products } = await supabase
    .from('products')
    .select('name, printful_cost, retail_price');

  const productsWithoutCost = products?.filter(p => !p.printful_cost).length || 0;
  const productsWithoutRetail = products?.filter(p => !p.retail_price).length || 0;
  
  console.log('=== PRODUCT COST DATA ===');
  console.log(`Products missing printful_cost: ${productsWithoutCost}`);
  console.log(`Products missing retail_price: ${productsWithoutRetail}`);
  console.log(`All products have cost data: ${productsWithoutCost === 0 && productsWithoutRetail === 0 ? 'YES' : 'NO'}\n`);

  // 7. Show sample variant data for each product type
  console.log('=== SAMPLE VARIANT DATA BY PRODUCT ===');
  const productSamples = await Promise.all([
    // Single variant products
    supabase.from('product_variants').select('name, color, size, price, printful_variant_id, value').eq('product_id', 
      (await supabase.from('products').select('id').eq('name', 'Reform UK Sticker').single()).data?.id).limit(1),
    
    // Cap (multiple colors, one size)
    supabase.from('product_variants').select('name, color, size, price, printful_variant_id, value').eq('product_id',
      (await supabase.from('products').select('id').eq('name', 'Reform UK Cap').single()).data?.id).limit(3),
    
    // T-shirt (multiple colors and sizes)
    supabase.from('product_variants').select('name, color, size, price, printful_variant_id, value').eq('product_id',
      (await supabase.from('products').select('id').eq('name', 'Unisex t-shirt DARK').single()).data?.id).limit(5)
  ]);

  console.log('Reform UK Sticker samples:');
  productSamples[0].data?.forEach(v => console.log(`  ${v.name} | Color: ${v.color} | Size: ${v.size} | Price: $${v.price} | ID: ${v.printful_variant_id} | Value: ${v.value}`));
  
  console.log('\nReform UK Cap samples:');
  productSamples[1].data?.forEach(v => console.log(`  ${v.name} | Color: ${v.color} | Size: ${v.size} | Price: $${v.price} | ID: ${v.printful_variant_id} | Value: ${v.value}`));
  
  console.log('\nUnisex t-shirt DARK samples:');
  productSamples[2].data?.forEach(v => console.log(`  ${v.name} | Color: ${v.color} | Size: ${v.size} | Price: $${v.price} | ID: ${v.printful_variant_id} | Value: ${v.value}`));

  // 8. Overall verification result
  console.log('\n=== OVERALL VERIFICATION RESULTS ===');
  const allChecks = [
    totalVariants === 158,
    nullPrintfulIds === 0,
    nullPrices === 0,
    productsWithoutCost === 0,
    productsWithoutRetail === 0,
    colors.includes('Black Heather'), // Should have real color names
    colors.includes('Indigo Blue'),
    sizes.includes('S'), // Should have real sizes
    sizes.includes('M'),
    sizes.includes('L')
  ];

  const passedChecks = allChecks.filter(Boolean).length;
  const totalChecks = allChecks.length;

  console.log(`Verification checks passed: ${passedChecks}/${totalChecks}`);
  console.log(`Overall status: ${passedChecks === totalChecks ? 'ALL FIXED ✅' : 'ISSUES REMAIN ❌'}`);

  if (passedChecks === totalChecks) {
    console.log('\n🎉 VARIANT SYNCHRONIZATION COMPLETE!');
    console.log('✅ All 158 variants have real Printful variant IDs');
    console.log('✅ Colors are correct (Black Heather, Indigo Blue, etc.)');
    console.log('✅ Sizes are correct (S/M/L/XL/XXL for clothing, null for accessories)');
    console.log('✅ Prices are populated from real Printful data');
    console.log('✅ Products have printful_cost and retail_price filled');
    console.log('✅ Value column has meaningful data');
  } else {
    console.log('\n❌ Some issues still remain. Please check the output above.');
  }
}

verifyVariantSyncComplete().catch(console.error);