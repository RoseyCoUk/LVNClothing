// Test Database Function - Check what's actually in the database
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Test Database Function Started")

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
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Method not allowed',
        message: 'Only GET requests are supported'
      }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Create a simple Supabase client for this function
    const supabase = {
      url: supabaseUrl,
      key: supabaseServiceKey,
      async fetch(endpoint: string, options: RequestInit = {}) {
        const url = `${supabaseUrl}/rest/v1${endpoint}`
        const headers = {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
        
        return fetch(url, { ...options, headers })
      }
    }

    // Test different endpoints to see what's working
    const results: any = {};

    // Test 1: Check if sync_status table exists and has data
    try {
      const syncResponse = await supabase.fetch('/sync_status?select=*&limit=5');
      results.sync_status = {
        status: syncResponse.status,
        statusText: syncResponse.statusText,
        data: syncResponse.ok ? await syncResponse.json() : null
      };
    } catch (error) {
      results.sync_status = { error: error.message };
    }

    // Test 2: Check if products table exists and has data
    try {
      const productsResponse = await supabase.fetch('/products?select=*&limit=5');
      results.products = {
        status: productsResponse.status,
        statusText: productsResponse.statusText,
        data: productsResponse.ok ? await productsResponse.json() : null
      };
    } catch (error) {
      results.products = { error: error.message };
    }

    // Test 3: Check if inventory_changes table exists
    try {
      const inventoryResponse = await supabase.fetch('/inventory_changes?select=*&limit=5');
      results.inventory_changes = {
        status: inventoryResponse.status,
        statusText: inventoryResponse.statusText,
        data: inventoryResponse.ok ? await inventoryResponse.json() : null
      };
    } catch (error) {
      results.inventory_changes = { error: error.message };
    }

    // Test 4: Check if sync_errors table exists
    try {
      const errorsResponse = await supabase.fetch('/sync_errors?select=*&limit=5');
      results.sync_errors = {
        status: errorsResponse.status,
        statusText: errorsResponse.statusText,
        data: errorsResponse.ok ? await errorsResponse.json() : null
      };
    } catch (error) {
      results.sync_errors = { error: error.message };
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Database test completed',
      results: results
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error in test database function:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Test failed',
      message: error.message || 'An error occurred during testing'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})
