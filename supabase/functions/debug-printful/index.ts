import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧪 Debug Printful API test')
    
    const printfulToken = Deno.env.get('PRINTFUL_TOKEN')
    console.log('🔑 PRINTFUL_TOKEN configured:', !!printfulToken)
    console.log('🔑 Token length:', printfulToken?.length || 0)
    
    if (!printfulToken) {
      return new Response(JSON.stringify({ 
        error: 'PRINTFUL_TOKEN not configured' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
    
    // Test payload with real variant ID from frontend logs
    const payload = {
      recipient: {
        name: "Test User",
        address1: "123 Test St",
        city: "London",
        country_code: "GB",
        zip: "SW1A 1AA"
      },
      items: [
        {
          variant_id: 7854, // Real catalog variant ID from corrected sync
          quantity: 1
        }
      ]
    }
    
    console.log('📦 Calling Printful with:', JSON.stringify(payload, null, 2))
    
    const response = await fetch('https://api.printful.com/shipping/rates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${printfulToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    console.log('📡 Printful response status:', response.status)
    
    const responseText = await response.text()
    console.log('📦 Printful response body:', responseText)
    
    let parsedResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (e) {
      parsedResponse = { raw: responseText }
    }
    
    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      data: parsedResponse
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})