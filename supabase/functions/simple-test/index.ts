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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🧪 Simple test starting...');

    // Step 1: Try to insert a product directly
    console.log('Step 1: Inserting test product...');
    const testProduct = {
      name: 'Simple Test Product',
      description: 'Simple test description',
      category: 'Test',
      price: 19.99,
      is_available: true
    };

    console.log('Product data:', testProduct);
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();

    if (productError) {
      console.error('❌ Product insertion failed:', productError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Product insertion failed',
        message: productError.message,
        step: 'product_insertion'
      }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    }

    console.log('✅ Product inserted successfully:', product);

    // Step 2: Try to insert a variant
    console.log('Step 2: Inserting test variant...');
    const testVariant = {
      product_id: product.id,
      name: 'Test Variant',
      value: 'Test Value',
      is_available: true
    };

    console.log('Variant data:', testVariant);

    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .insert(testVariant)
      .select()
      .single();

    if (variantError) {
      console.error('❌ Variant insertion failed:', variantError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Variant insertion failed',
        message: variantError.message,
        step: 'variant_insertion',
        product_id: product.id
      }), { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      });
    }

    console.log('✅ Variant inserted successfully:', variant);

    // Step 3: Verify data exists
    console.log('Step 3: Verifying data...');
    const { data: verifyProduct, error: verifyProductError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product.id)
      .single();

    const { data: verifyVariant, error: verifyVariantError } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', variant.id)
      .single();

    console.log('Verification results:');
    console.log('Product exists:', !!verifyProduct);
    console.log('Variant exists:', !!verifyVariant);

    // Clean up test data
    console.log('Step 4: Cleaning up test data...');
    await supabase.from('product_variants').delete().eq('id', variant.id);
    await supabase.from('products').delete().eq('id', product.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Simple test completed successfully',
      data: {
        product_inserted: !!product,
        variant_inserted: !!variant,
        product_id: product.id,
        variant_id: variant.id,
        verification: {
          product_exists: !!verifyProduct,
          variant_exists: !!verifyVariant
        }
      }
    }), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Unexpected error',
      message: error.message,
      step: 'unexpected_error'
    }), { 
      status: 500, 
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      } 
    });
  }
});
