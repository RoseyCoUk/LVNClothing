// Test Printful API Function - Completely standalone, no Supabase dependencies
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Standalone Printful API Test Function Started")

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
    // Only allow GET requests for testing
    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Method not allowed',
        message: 'Only GET requests are supported for testing'
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

    console.log('PRINTFUL_TOKEN found, testing API...');

    // Test 1: Get all products from Printful
    console.log('Testing 1: Getting all products...');
    let productsResult;
    try {
      const productsResponse = await fetch('https://api.printful.com/sync/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!productsResponse.ok) {
        throw new Error(`Printful products API error: ${productsResponse.status} ${productsResponse.statusText}`);
      }
      
      const productsData = await productsResponse.json();
      console.log('Products API response status:', productsResponse.status);
      console.log('Products count:', productsData.result?.length || 0);
      
      productsResult = {
        status: productsResponse.status,
        count: productsData.result?.length || 0,
        sample: productsData.result?.slice(0, 2) || [] // Show first 2 products
      };
      
    } catch (error) {
      console.error('Error fetching products:', error);
      productsResult = { error: error.message };
    }

    // Test 2: Get product templates (catalog)
    console.log('Testing 2: Getting product templates...');
    let templatesResult;
    try {
      const templatesResponse = await fetch('https://api.printful.com/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!templatesResponse.ok) {
        throw new Error(`Printful templates API error: ${templatesResponse.status} ${templatesResponse.statusText}`);
      }
      
      const templatesData = await templatesResponse.json();
      console.log('Templates API response status:', templatesResponse.status);
      console.log('Templates count:', templatesData.result?.length || 0);
      
      templatesResult = {
        status: templatesResponse.status,
        count: templatesData.result?.length || 0,
        sample: templatesData.result?.slice(0, 2) || [] // Show first 2 templates
      };
      
    } catch (error) {
      console.error('Error fetching templates:', error);
      templatesResult = { error: error.message };
    }

    // Test 3: Get store info
    console.log('Testing 3: Getting store info...');
    let storeResult;
    try {
      const storeResponse = await fetch('https://api.printful.com/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!storeResponse.ok) {
        throw new Error(`Printful store API error: ${storeResponse.status} ${storeResponse.statusText}`);
      }
      
      const storeData = await storeResponse.json();
      console.log('Store API response status:', storeResponse.status);
      
      storeResult = {
        status: storeResponse.status,
        data: storeData.result || {}
      };
      
    } catch (error) {
      console.error('Error fetching store info:', error);
      storeResult = { error: error.message };
    }

    // Return all test results
    return new Response(JSON.stringify({
      success: true,
      message: 'Printful API test completed successfully',
      timestamp: new Date().toISOString(),
      tests: {
        products: productsResult,
        templates: templatesResult,
        store: storeResult
      },
      note: 'This shows what data is available from Printful API'
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    console.error('Error in standalone Printful API test function:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Test failed',
      message: error.message || 'An unexpected error occurred during testing'
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})
