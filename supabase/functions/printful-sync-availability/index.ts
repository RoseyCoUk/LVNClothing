// Simple Printful Availability Sync Function
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Printful Availability Sync Function Started")

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // For testing purposes, allow unauthenticated requests
    // In production, you should add proper authentication
    console.log('Request received:', req.method, req.url);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get all products first - only select columns that exist
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, printful_product_id');

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    console.log(`Found ${products?.length || 0} products to sync`);

    let variantsUpdated = 0;
    let variantsChecked = 0;

    // For now, we'll set all variants as available
    // In the future, this can be enhanced to call Printful API for real-time availability
    for (const product of products || []) {
      try {
        // Get variants for this product
        const { data: variants, error: variantsError } = await supabase
          .from('product_variants')
          .select('id, printful_variant_id, name, value, design')
          .eq('product_id', product.id);

        if (variantsError) {
          console.error(`Error fetching variants for product ${product.name}:`, variantsError);
          continue;
        }

        if (variants && variants.length > 0) {
          console.log(`Processing ${variants.length} variants for product: ${product.name}`);
          
          for (const variant of variants) {
            try {
              // Update variant availability
              const { error: updateError } = await supabase
                .from('product_variants')
                .update({
                  in_stock: true,
                  is_available: true
                })
                .eq('id', variant.id);

              if (updateError) {
                console.error(`Error updating variant ${variant.id}:`, updateError);
                continue;
              }

              variantsUpdated++;
              console.log(`Updated variant: ${variant.name} ${variant.value}`);
            } catch (error) {
              console.error(`Error processing variant ${variant.id}:`, error);
              continue;
            }
          }
          variantsChecked += variants.length;
        } else {
          console.log(`No variants found for product: ${product.name}`);
        }
      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error);
        continue;
      }
    }

    const result = {
      success: true,
      message: `Successfully synced availability for ${variantsUpdated} variants`,
      variantsChecked,
      variantsUpdated,
      timestamp: new Date().toISOString()
    };

    console.log('Availability sync completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});
