// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Printful Proxy Function Started")

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-PF-Store-Id, X-PF-Language',
        },
      })
    }

    const { pathname, search } = new URL(req.url)
    
    // Get the Printful token from environment variables
    const token = Deno.env.get('PRINTFUL_TOKEN')
    
    if (!token) {
      console.error('PRINTFUL_TOKEN environment variable is not set');
      return new Response(JSON.stringify({ 
        error: 'PRINTFUL_TOKEN not configured',
        message: 'Please check if PRINTFUL_TOKEN is set in Supabase secrets',
        details: 'This is required for Printful API integration to work properly',
        status: 500
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    // Validate token format (should be a non-empty string)
    if (typeof token !== 'string' || token.trim().length === 0) {
      console.error('PRINTFUL_TOKEN is empty or invalid format');
      return new Response(JSON.stringify({ 
        error: 'Invalid PRINTFUL_TOKEN format',
        message: 'PRINTFUL_TOKEN must be a valid non-empty string',
        status: 500
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    // Extract the actual API path (remove /printful-proxy prefix)
    const apiPath = pathname.replace('/printful-proxy', '') || '/'
    
    // Validate API path
    if (!apiPath || apiPath === '/') {
      return new Response(JSON.stringify({ 
        error: 'Invalid API path',
        message: 'Please specify a valid Printful API endpoint',
        details: 'Example: /products, /variants, etc.',
        status: 400
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    // Forward the request to Printful API
    const printfulUrl = `https://api.printful.com${apiPath}${search}`
    
    console.log('Proxying request to Printful:', {
      method: req.method,
      path: apiPath,
      fullUrl: printfulUrl,
      hasToken: !!token
    });
    
    // Prepare headers for the Printful API request
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
    
    // Forward any additional headers from the request (except host and origin)
    for (const [key, value] of req.headers.entries()) {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin' && key.toLowerCase() !== 'authorization') {
        headers[key] = value
      }
    }
    
    // Make the request to Printful
    const response = await fetch(printfulUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined,
    })
    
    console.log('Printful API response:', {
      status: response.status,
      statusText: response.statusText,
      url: printfulUrl,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    // Check for authentication errors
    if (response.status === 401 || response.status === 403) {
      console.error('Printful API authentication failed:', {
        status: response.status,
        url: printfulUrl,
        hasToken: !!token,
        headers: Object.keys(headers)
      });
      
      return new Response(JSON.stringify({ 
        error: 'Authentication failed',
        message: 'Unable to authenticate with Printful API. Please check configuration.',
        details: 'Verify PRINTFUL_TOKEN is valid and has proper permissions',
        status: response.status
      }), {
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    // Check for other error statuses
    if (response.status >= 400) {
      console.error('Printful API request failed:', {
        status: response.status,
        url: printfulUrl,
        method: req.method
      });
      
      // Try to get error details from response
      let errorDetails = 'Unknown error';
      try {
        const errorData = await response.text();
        if (errorData) {
          errorDetails = errorData;
        }
      } catch (e) {
        // Ignore error parsing errors
      }
      
      return new Response(JSON.stringify({ 
        error: 'Printful API request failed',
        message: `Request failed with status ${response.status}`,
        details: errorDetails,
        status: response.status
      }), {
        status: response.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      })
    }
    
    // Get the response data
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }
    
    // Return the response with proper CORS headers
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-PF-Store-Id, X-PF-Language',
      },
    })
    
  } catch (error) {
    console.error('Function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/printful-proxy' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
