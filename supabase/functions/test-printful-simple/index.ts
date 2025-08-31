// Simple Printful Test Function
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Simple Printful Test Function Started")

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
    console.log('Function started successfully')
    
    // Get the Printful token from environment variables
    const token = Deno.env.get('PRINTFUL_TOKEN')
    console.log('PRINTFUL_TOKEN check:', token ? 'SET' : 'NOT SET')
    
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

    console.log('Token found, testing Printful API connection...')
    
    // Test Printful API connection
    const response = await fetch('https://api.printful.com/sync/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Printful API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Printful API error:', errorText)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Printful API error',
        message: `Status: ${response.status}, Response: ${errorText}`
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    const data = await response.json()
    console.log('Printful API response received, products count:', data.result?.length || 0)
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Printful API connection successful',
      productsCount: data.result?.length || 0,
      sampleProduct: data.result?.[0] ? {
        id: data.result[0].id,
        name: data.result[0].sync_product?.name
      } : null
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error in test function:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Function crashed',
      message: error.message || 'An unexpected error occurred',
      stack: error.stack
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})
