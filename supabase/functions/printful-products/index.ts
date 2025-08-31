// Printful Products Function - Pull all products from Printful
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Printful Products Function Started")

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
    variants: Array<{
      id: number;
      name: string;
      retail_price: string;
      in_stock: boolean;
    }>;
  };
}

interface PrintfulResponse {
  success: boolean;
  message: string;
  data?: PrintfulProduct[];
  error?: string;
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
    // Only allow GET requests for fetching products
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Method not allowed',
        message: 'Only GET requests are supported for fetching products'
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

    console.log('Fetching all products from Printful...')

    // Fetch all products from Printful
    const response = await fetch('https://api.printful.com/sync/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Printful API error: ${response.status} ${response.statusText}`)
    }

    const printfulData = await response.json()
    const products = printfulData.result || []

    console.log(`Successfully fetched ${products.length} products from Printful`)

    // Transform the data to match your needs
    const transformedProducts = products.map((product: PrintfulProduct) => ({
      printful_id: product.id,
      name: product.sync_product.name,
      description: product.sync_product.description,
      retail_price: parseFloat(product.sync_product.retail_price),
      thumbnail_url: product.sync_product.thumbnail_url,
      variant_count: product.sync_product.variants.length,
      variants: product.sync_product.variants.map(variant => ({
        id: variant.id,
        name: variant.name,
        retail_price: parseFloat(variant.retail_price),
        in_stock: variant.in_stock
      }))
    }))

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully fetched ${products.length} products from Printful`,
      data: transformedProducts,
      total_count: products.length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error in Printful products function:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch products',
      message: error.message || 'An error occurred while fetching products from Printful'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})
