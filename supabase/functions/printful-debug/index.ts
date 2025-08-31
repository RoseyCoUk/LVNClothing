// Printful Debug Function - Fetch detailed variant data for products
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

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
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Method not allowed',
        message: 'Only POST requests are supported'
      }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Get the Printful token from environment variables
    const token = Deno.env.get('PRINTFUL_TOKEN')
    
    if (!token) {
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

    console.log('Fetching detailed variant data for products...')
    
    // Step 1: Get the product list from /sync/products
    const syncResponse = await fetch('https://api.printful.com/sync/products?detailed=1', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!syncResponse.ok) {
      const errorText = await syncResponse.text()
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Sync API error',
        status: syncResponse.status,
        error_text: errorText
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    const syncData = await syncResponse.json()
    const products = syncData.result ? Object.values(syncData.result) : []
    
    console.log(`Found ${products.length} products, fetching variant details...`)
    
    // Step 2: For each product, fetch detailed variant data
    const productsWithVariants = []
    
    for (const product of products) {
      try {
        console.log(`Fetching variants for: ${product.name} (ID: ${product.id})`)
        
        // Try to get detailed variant data using the catalog/variants endpoint
        const variantsResponse = await fetch(`https://api.printful.com/catalog/variants?product_id=${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        let variantData = null
        let variantError = null
        
        if (variantsResponse.ok) {
          try {
            variantData = await variantsResponse.json()
          } catch (parseError) {
            variantError = `Parse error: ${parseError.message}`
          }
        } else {
          variantError = `HTTP ${variantsResponse.status}: ${variantsResponse.statusText}`
        }
        
        // Also try to get product details from the catalog endpoint
        const catalogResponse = await fetch(`https://api.printful.com/catalog/products?product_id=${product.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        let catalogData = null
        let catalogError = null
        
        if (catalogResponse.ok) {
          try {
            catalogData = await catalogResponse.json()
          } catch (parseError) {
            catalogError = `Parse error: ${parseError.message}`
          }
        } else {
          catalogError = `HTTP ${catalogResponse.status}: ${catalogResponse.statusText}`
        }
        
        productsWithVariants.push({
          product_id: product.id,
          name: product.name,
          external_id: product.external_id,
          variants_count: product.variants,
          synced: product.synced,
          thumbnail_url: product.thumbnail_url,
          // Variant data attempt
          variants_endpoint: {
            success: variantsResponse.ok,
            status: variantsResponse.status,
            data: variantData,
            error: variantError
          },
          // Catalog data attempt
          catalog_endpoint: {
            success: catalogResponse.ok,
            status: catalogResponse.status,
            data: catalogData,
            error: catalogError
          }
        })
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Error fetching variants for ${product.name}:`, error)
        productsWithVariants.push({
          product_id: product.id,
          name: product.name,
          error: error.message
        })
      }
    }
    
    const result = {
      success: true,
      message: 'Detailed variant data fetch completed',
      total_products: products.length,
      products_with_variants: productsWithVariants,
      summary: {
        products_with_variant_data: productsWithVariants.filter(p => p.variants_endpoint?.data || p.catalog_endpoint?.data).length,
        products_with_errors: productsWithVariants.filter(p => p.error).length
      },
      recommendations: {
        has_variants: productsWithVariants.some(p => p.variants_endpoint?.data || p.catalog_endpoint?.data),
        next_step: productsWithVariants.some(p => p.variants_endpoint?.data || p.catalog_endpoint?.data)
          ? 'Found variant data - can now import real variants instead of defaults'
          : 'No variant data found - may need different API approach'
      }
    }
    
    console.log('Variant data fetch completed:', result)
    
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
