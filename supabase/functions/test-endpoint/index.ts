import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers
function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin")
  const headers = corsHeaders(origin)

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers })
  }

  try {
    if (req.method === 'GET') {
      return new Response(JSON.stringify({ 
        message: 'Test endpoint is working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        environment: 'local'
      }), {
        headers: { ...headers, "Content-Type": "application/json" },
      })
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      
      return new Response(JSON.stringify({ 
        message: 'Test endpoint received POST request!',
        timestamp: new Date().toISOString(),
        method: req.method,
        body: body,
        environment: 'local'
      }), {
        headers: { ...headers, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error('Test endpoint error:', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    })
  }
})
