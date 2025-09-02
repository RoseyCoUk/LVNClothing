import { createClient } from '@supabase/supabase-js';

// REMOTE Supabase connection
const SUPABASE_URL = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function analyzeRemoteSchema() {
  console.log('=== ANALYZING REMOTE DATABASE SCHEMA ===');
  console.log(`Connected to: ${SUPABASE_URL}`);
  console.log('');

  try {
    // 1. Check products table columns using RPC
    const { data: productColumns, error: prodColError } = await supabase.rpc('get_table_columns', {
      table_name_param: 'products',
      schema_name_param: 'public'
    }).single();

    if (prodColError) {
      // Try alternative approach - query a row to see structure
      const { data: sampleProduct } = await supabase
        .from('products')
        .select('*')
        .limit(1)
        .single();

      console.log('PRODUCTS TABLE COLUMNS (from sample):');
      if (sampleProduct) {
        Object.keys(sampleProduct).forEach(col => {
          console.log(`  - ${col}: ${typeof sampleProduct[col]}`);
        });
      }
    } else {
      console.log('PRODUCTS TABLE COLUMNS:');
      console.log(productColumns);
    }

    // 2. Check product_variants table columns
    const { data: sampleVariant } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1)
      .single();

    console.log('\nPRODUCT_VARIANTS TABLE COLUMNS (from sample):');
    if (sampleVariant) {
      Object.keys(sampleVariant).forEach(col => {
        console.log(`  - ${col}: ${typeof sampleVariant[col]}`);
      });
    }

    // 3. Check current data state
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: variantCount } = await supabase
      .from('product_variants')
      .select('*', { count: 'exact', head: true });

    console.log('\nCURRENT DATA STATE:');
    console.log(`  - Products: ${productCount}`);
    console.log(`  - Product Variants: ${variantCount}`);

    // 4. Check for null values in critical fields
    const { data: productsCheck } = await supabase
      .from('products')
      .select('id, name, printful_product_id, printful_cost, retail_price, margin')
      .limit(5);

    console.log('\nSAMPLE PRODUCTS DATA:');
    productsCheck?.forEach(p => {
      console.log(`  ${p.name}:`);
      console.log(`    - printful_product_id: ${p.printful_product_id || 'NULL'}`);
      console.log(`    - printful_cost: ${p.printful_cost || 'NULL'}`);
      console.log(`    - retail_price: ${p.retail_price || 'NULL'}`);
      console.log(`    - margin: ${p.margin || 'NULL'}`);
    });

    // 5. Check variants for critical fields
    const { data: variantsCheck } = await supabase
      .from('product_variants')
      .select('id, printful_variant_id, color, color_name, color_hex, size, size_name, price, value')
      .limit(5);

    console.log('\nSAMPLE VARIANTS DATA:');
    variantsCheck?.forEach(v => {
      console.log(`  Variant ${v.id.substring(0, 8)}:`);
      console.log(`    - printful_variant_id: ${v.printful_variant_id || 'NULL'}`);
      console.log(`    - color: ${v.color || 'NULL'}`);
      console.log(`    - color_name: ${v.color_name || 'NULL'}`);
      console.log(`    - color_hex: ${v.color_hex || 'NULL'}`);
      console.log(`    - size: ${v.size || 'NULL'}`);
      console.log(`    - size_name: ${v.size_name || 'NULL'}`);
      console.log(`    - price: ${v.price || 'NULL'}`);
      console.log(`    - value: ${v.value || 'NULL'}`);
    });

    // 6. Check for nulls in critical fields
    const { data: nullChecks } = await supabase.rpc('check_null_counts').single();
    
    if (!nullChecks) {
      // Manual check if RPC doesn't exist
      const { data: variants } = await supabase
        .from('product_variants')
        .select('printful_variant_id, price, color_name, size_name');

      const nullCounts = {
        null_printful_ids: variants?.filter(v => !v.printful_variant_id).length || 0,
        null_prices: variants?.filter(v => !v.price).length || 0,
        null_color_names: variants?.filter(v => !v.color_name).length || 0
      };

      console.log('\nNULL VALUE COUNTS:');
      console.log(`  - Variants without printful_variant_id: ${nullCounts.null_printful_ids}`);
      console.log(`  - Variants without price: ${nullCounts.null_prices}`);
      console.log(`  - Variants without color_name: ${nullCounts.null_color_names}`);
    }

  } catch (error) {
    console.error('Error analyzing schema:', error);
  }
}

// Create RPC function to get column info
async function createHelperFunctions() {
  // This would need to be run once to create helper functions
  const createColumnQuery = `
    CREATE OR REPLACE FUNCTION get_table_columns(
      table_name_param text,
      schema_name_param text DEFAULT 'public'
    )
    RETURNS json AS $$
    BEGIN
      RETURN (
        SELECT json_agg(column_name)
        FROM information_schema.columns
        WHERE table_schema = schema_name_param
        AND table_name = table_name_param
      );
    END;
    $$ LANGUAGE plpgsql;
  `;

  const createNullCheckQuery = `
    CREATE OR REPLACE FUNCTION check_null_counts()
    RETURNS json AS $$
    DECLARE
      result json;
    BEGIN
      SELECT json_build_object(
        'products_null_printful_cost', (SELECT COUNT(*) FROM products WHERE printful_cost IS NULL),
        'products_null_retail_price', (SELECT COUNT(*) FROM products WHERE retail_price IS NULL),
        'products_null_margin', (SELECT COUNT(*) FROM products WHERE margin IS NULL),
        'variants_null_printful_id', (SELECT COUNT(*) FROM product_variants WHERE printful_variant_id IS NULL),
        'variants_null_price', (SELECT COUNT(*) FROM product_variants WHERE price IS NULL)
      ) INTO result;
      RETURN result;
    END;
    $$ LANGUAGE plpgsql;
  `;
}

analyzeRemoteSchema().catch(console.error);