import { createClient } from '@supabase/supabase-js';

// REMOTE Supabase connection
const SUPABASE_URL = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function gatherSQLEvidence() {
  console.log('=================================================================');
  console.log('              SQL EVIDENCE FROM REMOTE DATABASE                 ');
  console.log('=================================================================');
  console.log(`Remote URL: ${SUPABASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  try {
    // 1. PRODUCTS EVIDENCE
    console.log('=== PRODUCTS EVIDENCE ===');
    console.log('Query: SELECT id, name, printful_product_id, printful_cost, retail_price, margin');
    console.log('FROM public.products ORDER BY name;\n');

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, printful_product_id, printful_cost, retail_price, margin')
      .order('name');

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else {
      console.log('Results:');
      console.log('id | name | printful_product_id | printful_cost | retail_price | margin');
      console.log('---|------|---------------------|---------------|--------------|-------');
      products?.forEach(p => {
        console.log(`${p.id} | ${p.name} | ${p.printful_product_id} | ${p.printful_cost} | ${p.retail_price} | ${p.margin}`);
      });
    }

    // 2. VARIANT COUNTS & NULL CHECKS
    console.log('\n=== VARIANT COUNTS & NULL CHECKS ===');
    
    // Total count
    const { count: totalVariants } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\nQuery: SELECT COUNT(*) AS total_variants FROM public.product_variants;`);
    console.log(`Result: total_variants = ${totalVariants}`);

    // Null checks
    const { data: variants } = await supabase
      .from('product_variants')
      .select('printful_variant_id, price, color_name, size_name, color_hex');

    const nullStats = {
      null_variant_ids: variants?.filter(v => !v.printful_variant_id).length || 0,
      null_prices: variants?.filter(v => !v.price).length || 0,
      null_color_names: variants?.filter(v => !v.color_name).length || 0,
      one_size_count: variants?.filter(v => v.size_name === 'One Size').length || 0,
      missing_hex_with_color: variants?.filter(v => !v.color_hex && v.color_name).length || 0
    };

    console.log('\nQuery: SELECT SUM(CASE WHEN printful_variant_id IS NULL THEN 1 ELSE 0 END) AS null_variant_ids,');
    console.log('       SUM(CASE WHEN price IS NULL THEN 1 ELSE 0 END) AS null_prices,');
    console.log('       SUM(CASE WHEN color_name IS NULL THEN 1 ELSE 0 END) AS null_color_names,');
    console.log('       SUM(CASE WHEN size_name = \'One Size\' THEN 1 ELSE 0 END) AS one_size_count,');
    console.log('       SUM(CASE WHEN color_hex IS NULL AND color_name IS NOT NULL THEN 1 ELSE 0 END) AS missing_hex_with_color');
    console.log('FROM public.product_variants;\n');
    console.log('Results:');
    console.log(`null_variant_ids | null_prices | null_color_names | one_size_count | missing_hex_with_color`);
    console.log(`${nullStats.null_variant_ids} | ${nullStats.null_prices} | ${nullStats.null_color_names} | ${nullStats.one_size_count} | ${nullStats.missing_hex_with_color}`);

    // 3. SIZE DISTRIBUTION BY PRODUCT
    console.log('\n=== SIZE DISTRIBUTION BY PRODUCT ===');
    console.log('Query: SELECT product_id, ARRAY_AGG(DISTINCT size_name ORDER BY size_name) AS sizes');
    console.log('FROM public.product_variants');
    console.log('WHERE size_name IS NOT NULL AND size_name <> \'One Size\'');
    console.log('GROUP BY product_id;\n');

    const { data: productSizes } = await supabase
      .from('product_variants')
      .select('product_id, size_name')
      .not('size_name', 'is', null)
      .neq('size_name', 'One Size');

    // Group by product_id
    const sizesByProduct: Record<string, Set<string>> = {};
    productSizes?.forEach(v => {
      if (!sizesByProduct[v.product_id]) {
        sizesByProduct[v.product_id] = new Set();
      }
      sizesByProduct[v.product_id].add(v.size_name);
    });

    console.log('Results:');
    console.log('product_id | sizes');
    console.log('-----------|------');
    Object.entries(sizesByProduct).forEach(([productId, sizes]) => {
      const sortedSizes = Array.from(sizes).sort();
      console.log(`${productId} | [${sortedSizes.join(', ')}]`);
    });

    // 4. VALUE FORMATTING CHECK
    console.log('\n=== VALUE FORMATTING CHECK (first 25) ===');
    console.log('Query: SELECT id, value FROM public.product_variants ORDER BY id LIMIT 25;\n');

    const { data: valueCheck } = await supabase
      .from('product_variants')
      .select('id, value')
      .order('id')
      .limit(25);

    console.log('Results:');
    console.log('id | value');
    console.log('---|------');
    valueCheck?.forEach(v => {
      console.log(`${v.id} | ${v.value}`);
    });

    // 5. SCHEMA CHECK
    console.log('\n=== SCHEMA CHECK ===');
    console.log('Query: SELECT column_name FROM information_schema.columns');
    console.log('WHERE table_schema = \'public\' AND table_name IN (\'products\',\'product_variants\')');
    console.log('ORDER BY table_name, column_name;\n');

    // Get column names from sample data
    const { data: sampleProduct } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .single();

    const { data: sampleVariant } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1)
      .single();

    console.log('Results:');
    console.log('Products table columns:');
    if (sampleProduct) {
      Object.keys(sampleProduct).sort().forEach(col => {
        console.log(`  ${col}`);
      });
    }

    console.log('\nProduct_variants table columns:');
    if (sampleVariant) {
      Object.keys(sampleVariant).sort().forEach(col => {
        console.log(`  ${col}`);
      });
    }

    // 6. VARIANT COUNT BY PRODUCT
    console.log('\n=== VARIANT COUNT BY PRODUCT ===');
    
    const { data: variantCounts } = await supabase
      .from('product_variants')
      .select('product_id');

    const countsByProduct: Record<string, number> = {};
    variantCounts?.forEach(v => {
      countsByProduct[v.product_id] = (countsByProduct[v.product_id] || 0) + 1;
    });

    // Get product names
    const { data: productNames } = await supabase
      .from('products')
      .select('id, name');

    console.log('Product | Variant Count');
    console.log('--------|-------------');
    productNames?.forEach(p => {
      const count = countsByProduct[p.id] || 0;
      console.log(`${p.name} | ${count}`);
    });

    // 7. SAMPLE VARIANT DATA
    console.log('\n=== SAMPLE VARIANT DATA (10 records) ===');
    const { data: sampleVariants } = await supabase
      .from('product_variants')
      .select('name, printful_variant_id, color_name, color_hex, size_name, price, value')
      .limit(10);

    console.log('name | printful_variant_id | color_name | color_hex | size_name | price | value');
    console.log('-----|---------------------|------------|-----------|-----------|-------|------');
    sampleVariants?.forEach(v => {
      console.log(`${v.name} | ${v.printful_variant_id} | ${v.color_name} | ${v.color_hex} | ${v.size_name} | ${v.price} | ${v.value}`);
    });

    // 8. VALIDATION SUMMARY
    console.log('\n=== VALIDATION SUMMARY ===');
    const allProductsValid = products?.every(p => 
      p.printful_cost !== null && 
      p.retail_price !== null && 
      p.margin !== null
    );
    
    const allVariantsValid = nullStats.null_variant_ids === 0 && 
                             nullStats.null_prices === 0 && 
                             nullStats.missing_hex_with_color === 0;

    console.log(`✅ All products have cost/retail/margin: ${allProductsValid ? 'PASS' : 'FAIL'}`);
    console.log(`✅ All variants have Printful IDs: ${nullStats.null_variant_ids === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ All variants have prices: ${nullStats.null_prices === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ All variants with colors have hex: ${nullStats.missing_hex_with_color === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Total variants: ${totalVariants} (Expected: 158)`);

  } catch (error) {
    console.error('Error gathering evidence:', error);
  }
}

gatherSQLEvidence().catch(console.error);