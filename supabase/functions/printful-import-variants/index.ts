// Enhanced Printful Import Function - Phase 2: Variant Management System
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log("Enhanced Printful Import Function - Phase 2 Started")

interface PrintfulVariant {
  id: number;
  name: string;
  retail_price: string;
  in_stock: boolean;
  color?: string;
  size?: string;
  color_code?: string;
  size_code?: string;
  image_url?: string;
  variant_id: number;
  files?: any[];
  options?: any[];
}

interface PrintfulProduct {
  id: number;
  name: string;
  description: string;
  retail_price: string;
  sync_product: {
    id: number;
    name: string;
    description: string;
    retail_price: string;
    thumbnail_url: string;
    variants: PrintfulVariant[];
  };
}

interface ImportResult {
  success: boolean;
  message: string;
  productsImported?: number;
  variantsImported?: number;
  productsUpdated?: number;
  variantsUpdated?: number;
  productsSkipped?: number;
  error?: string;
  details?: {
    complexProducts: number;
    mediumProducts: number;
    simpleProducts: number;
    totalVariants: number;
  };
}

// Helper function to determine product complexity
function getProductComplexity(product: any): 'complex' | 'medium' | 'simple' {
  // For catalog products, variant_count indicates the number of variants
  const variantCount = product.variant_count || 0;
  
  if (variantCount === 0) return 'simple';
  
  // Check if product has both size and color options
  const hasSize = product.options && product.options.some((o: any) => 
    o.name && o.name.toLowerCase().includes('size')
  );
  const hasColor = product.options && product.options.some((o: any) => 
    o.name && o.name.toLowerCase().includes('color')
  );
  
  if (hasSize && hasColor) return 'complex';
  if (hasSize || hasColor) return 'medium';
  return 'simple';
}

// Helper function to extract variant information
function extractVariantInfo(variant: PrintfulVariant): { name: string; value: string; type: string } {
  // Try to extract from options first
  if (variant.options && variant.options.length > 0) {
    for (const option of variant.options) {
      if (option.name && option.value) {
        return {
          name: option.name,
          value: option.value,
          type: option.name.toLowerCase()
        };
      }
    }
  }
  
  // Fallback to direct properties
  if (variant.size) {
    return { name: 'Size', value: variant.size, type: 'size' };
  }
  if (variant.color) {
    return { name: 'Color', value: variant.color, type: 'color' };
  }
  
  // Default fallback
  return { name: 'Variant', value: variant.name, type: 'variant' };
}

// Helper function to create variant combinations for complex products
async function createVariantCombinations(
  supabase: any,
  productId: string,
  variants: PrintfulVariant[]
) {
  const sizeVariants = variants.filter(v => {
    const info = extractVariantInfo(v);
    return info.type === 'size';
  });
  
  const colorVariants = variants.filter(v => {
    const info = extractVariantInfo(v);
    return info.type === 'color';
  });
  
  // Create combinations for complex products
  if (sizeVariants.length > 0 && colorVariants.length > 0) {
    for (const sizeVariant of sizeVariants) {
      for (const colorVariant of colorVariants) {
        const sizeInfo = extractVariantInfo(sizeVariant);
        const colorInfo = extractVariantInfo(colorVariant);
        
        // Find the variant IDs in our database
        const { data: sizeVariantData } = await supabase
          .from('product_variants')
          .select('id')
          .eq('printful_variant_id', sizeVariant.variant_id.toString())
          .eq('product_id', productId)
          .single();
        
        const { data: colorVariantData } = await supabase
          .from('product_variants')
          .select('id')
          .eq('printful_variant_id', colorVariant.variant_id.toString())
          .eq('product_id', productId)
          .single();
        
        if (sizeVariantData && colorVariantData) {
          // Create variant combination
          await supabase
            .from('product_variant_combinations')
            .upsert({
              product_id: productId,
              size_variant_id: sizeVariantData.id,
              color_variant_id: colorVariantData.id,
              is_available: sizeVariant.in_stock && colorVariant.in_stock,
              in_stock: sizeVariant.in_stock && colorVariant.in_stock
            }, {
              onConflict: 'product_id,size_variant_id,color_variant_id'
            });
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    // Only allow POST requests for importing products
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Method not allowed',
        message: 'Only POST requests are supported for importing products'
      }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Get the Printful token and Supabase credentials from environment variables
    const token = Deno.env.get('PRINTFUL_TOKEN')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment variables check:')
    console.log('- PRINTFUL_TOKEN:', token ? 'SET' : 'NOT SET')
    console.log('- SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET')
    
    if (!token) {
      console.error('PRINTFUL_TOKEN environment variable is not set');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'PRINTFUL_TOKEN not configured',
        message: 'Please check if PRINTFUL_TOKEN is set in Supabase secrets'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Supabase credentials not configured',
        message: 'Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    console.log('Fetching products from Printful...')
    
    // Fetch products from Printful - use the catalog endpoint with proper pagination
    let allProducts: any[] = []
    let page = 1
    const limit = 100 // Maximum allowed by Printful API
    
    console.log('Fetching products from Printful catalog with pagination...')
    
    while (true) {
      const printfulResponse = await fetch(`https://api.printful.com/catalog/products?limit=${limit}&page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!printfulResponse.ok) {
        const errorText = await printfulResponse.text()
        console.error('Printful API error:', printfulResponse.status, errorText)
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Printful API error',
          message: `Failed to fetch products: ${printfulResponse.status} ${errorText}`
        }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        })
      }
      
      const printfulData = await printfulResponse.json()
      const pageProducts = printfulData.result?.products || []
      
      if (pageProducts.length === 0) {
        break // No more products
      }
      
      allProducts = allProducts.concat(pageProducts)
      console.log(`Fetched page ${page}: ${pageProducts.length} products (total: ${allProducts.length})`)
      
      // Check if we've reached the end
      if (pageProducts.length < limit) {
        break
      }
      
      page++
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const products = allProducts
    
    console.log(`Found ${products.length} products in Printful catalog`)
    
    if (products.length === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No products found in Printful catalog',
        productsImported: 0,
        variantsImported: 0,
        productsUpdated: 0,
        variantsUpdated: 0,
        productsSkipped: 0
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    // Filter for valid products with variants - catalog products have variant_count field
    const validProducts = products.filter((product: any) => 
      product.variant_count && 
      typeof product.variant_count === 'number' && 
      product.variant_count > 0
    )
    
    console.log(`Found ${validProducts.length} valid products with variants`)
    
    if (validProducts.length === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No valid products with variants found in Printful response',
        productsImported: 0,
        variantsImported: 0,
        productsUpdated: 0,
        variantsUpdated: 0,
        productsSkipped: 0
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    let productsImported = 0
    let productsUpdated = 0
    let variantsImported = 0
    let variantsUpdated = 0
    let productsSkipped = 0
    
    const complexityStats = {
      complexProducts: 0,
      mediumProducts: 0,
      simpleProducts: 0,
      totalVariants: 0
    }
    
    // Process each product
    for (const product of validProducts) {
      try {
        const complexity = getProductComplexity(product)
        console.log(`Processing ${product.display_name} (${complexity} product)`)
        
        // Update complexity stats
        switch (complexity) {
          case 'complex':
            complexityStats.complexProducts++
            break
          case 'medium':
            complexityStats.mediumProducts++
            break
          case 'simple':
            complexityStats.simpleProducts++
            break
        }
        
        // Determine product category based on name
        let category = 'gear'
        const name = (product.display_name || '').toLowerCase()
        if (name.includes('hoodie') || name.includes('tshirt') || name.includes('shirt') || name.includes('cap')) {
          category = 'apparel'
        } else if (name.includes('sticker') || name.includes('badge')) {
          category = 'gear'
        }
        
        // Check if product already exists
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('printful_product_id', product.id.toString())
          .single()
        
        let productId: string
        
        if (existingProduct) {
          // Update existing product
          const { error: updateError } = await supabase
            .from('products')
            .update({
              name: product.display_name,
              description: product.description || '',
              retail_price: parseFloat(product.price || '0'),
              category: category,
              image_url: product.image_url || '',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProduct.id)
          
          if (updateError) {
            console.error('Error updating product:', updateError)
            productsSkipped++
            continue
          }
          
          productId = existingProduct.id
          productsUpdated++
          console.log(`Updated product: ${product.display_name || product.name}`)
        } else {
          // Insert new product
          const { data: newProduct, error: insertError } = await supabase
            .from('products')
            .insert({
              printful_product_id: product.id.toString(),
              name: product.display_name,
              description: product.description || '',
              retail_price: parseFloat(product.price || '0'),
              category: category,
              image_url: product.image_url || '',
              is_available: true,
              in_stock: true
            })
            .select('id')
            .single()
          
          if (insertError) {
            console.error('Error inserting product:', insertError)
            productsSkipped++
            continue
          }
          
          productId = newProduct.id
          productsImported++
          console.log(`Imported new product: ${product.display_name}`)
        }
        
        // Process variants based on product complexity
        console.log(`Processing catalog product: ${product.display_name} with ${product.variant_count} variants`)
        
        // For catalog products, we need to create variants based on the options
        if (product.options && product.options.length > 0) {
          // Create variants for each option combination
          for (const option of product.options) {
            if (option.values && option.values.length > 0) {
              for (const value of option.values) {
                const { data: variantData, error: variantError } = await supabase
                  .from('product_variants')
                  .upsert({
                    product_id: productId,
                    printful_variant_id: `${product.id}-${option.name}-${value}`,
                    name: option.name || 'Option',
                    value: value || 'Value',
                    retail_price: parseFloat(product.price || '0'),
                    in_stock: true,
                    is_available: true,
                    image_url: product.image_url || '',
                    printful_data: { 
                      type: 'catalog_product',
                      option_name: option.name,
                      option_value: value,
                      variant_count: product.variant_count
                    }
                  }, {
                    onConflict: 'product_id,printful_variant_id'
                  })
                  .select('id')
                  .single()
                
                if (variantError) {
                  console.error('Error upserting variant:', variantError)
                  continue
                }
                
                if (variantData) {
                  variantsImported++
                  complexityStats.totalVariants++
                }
              }
            }
          }
        } else {
          // Create a single "default" variant for products without options
          const { data: variantData, error: variantError } = await supabase
            .from('product_variants')
            .upsert({
              product_id: productId,
              printful_variant_id: `default-${product.id}`,
              name: 'Product',
              value: 'Default',
              retail_price: parseFloat(product.price || '0'),
              in_stock: true,
              is_available: true,
              image_url: product.image_url || '',
              printful_data: { 
                type: 'catalog_product',
                variant_count: product.variant_count
              }
            }, {
              onConflict: 'product_id,printful_variant_id'
            })
            .select('id')
            .single()
          
          if (variantError) {
            console.error('Error upserting variant:', variantError)
            productsSkipped++
            continue
          }
          
          if (variantData) {
            variantsImported++
            complexityStats.totalVariants++
          }
        }
        
      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error)
        productsSkipped++
        continue
      }
    }
    
    const result: ImportResult = {
      success: true,
      message: `Successfully processed ${validProducts.length} products`,
      productsImported,
      variantsImported,
      productsUpdated,
      variantsUpdated,
      productsSkipped,
      details: complexityStats
    }
    
    console.log('Import completed successfully:', result)
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
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
    })
  }
})
