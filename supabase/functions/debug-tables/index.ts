import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use service role key for admin access
    );

    console.log('🔍 Debugging table structure...');

    // Check products table
    console.log('Checking products table...');
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('❌ Products table error:', productsError);
    } else {
      console.log('✅ Products table accessible');
      console.log('Products columns:', Object.keys(productsData?.[0] || {}));
      console.log('Sample product data:', productsData?.[0]);
    }

    // Check product_variants table
    console.log('Checking product_variants table...');
    const { data: variantsData, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1);
    
    if (variantsError) {
      console.error('❌ Product variants table error:', variantsError);
    } else {
      console.log('✅ Product variants table accessible');
      console.log('Variants columns:', Object.keys(variantsData?.[0] || {}));
      console.log('Sample variant data:', variantsData?.[0]);
    }

    // Try to insert a test product
    console.log('Testing product insertion...');
    const testProduct = {
      name: 'Test Product',
      description: 'Test Description',
      category: 'Test',
      is_available: true
    };
    
    console.log('Inserting test product:', testProduct);
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Product insertion failed:', insertError);
    } else {
      console.log('✅ Product insertion successful:', insertData);
      
      // Try to insert a test variant
      console.log('Testing variant insertion...');
      const testVariant = {
        product_id: insertData.id,
        name: 'Test Variant',
        value: 'Test Value',
        is_available: true
      };
      
      console.log('Inserting test variant:', testVariant);
      const { data: variantInsertData, error: variantInsertError } = await supabase
        .from('product_variants')
        .insert(testVariant)
        .select()
        .single();

      if (variantInsertError) {
        console.error('❌ Variant insertion failed:', variantInsertError);
      } else {
        console.log('✅ Variant insertion successful:', variantInsertData);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Table structure debug completed',
      data: {
        products_table: {
          accessible: !productsError,
          columns: Object.keys(productsData?.[0] || {}),
          sample_data: productsData?.[0],
          error: productsError?.message || null
        },
        variants_table: {
          accessible: !variantsError,
          columns: Object.keys(variantsData?.[0] || {}),
          sample_data: variantsData?.[0],
          error: variantsError?.message || null
        },
        test_insertion: {
          product_success: !insertError,
          variant_success: !insertError && !variantInsertError,
          product_error: insertError?.message || null,
          variant_error: insertError ? null : (variantInsertError?.message || null)
        }
      }
    }), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      } 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Unexpected error',
      message: error.message,
      debug: { errorType: 'Error', errorStack: error.stack }
    }), { 
      status: 500, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      } 
    });
  }
});
