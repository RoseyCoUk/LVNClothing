import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, orderId, customerDetails } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'updateCustomerDetails') {
      // Update customer details for an existing order
      const { data, error } = await supabase
        .from('orders')
        .update({
          customer_details: customerDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()

      if (error) {
        throw new Error(`Failed to update order: ${error.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'test') {
      // Simple test action to verify function accessibility
      console.log('Test action received - function is accessible')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'manual-test-insert function is accessible',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (action === 'createTestOrder') {
      // Create a test order for testing purposes
      const { sessionId, customerEmail, items, address } = await req.json()
      
      if (!sessionId || !customerEmail) {
        throw new Error('Missing required parameters: sessionId and customerEmail')
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          stripe_session_id: sessionId,
          customer_email: customerEmail,
          items: items,
          customer_details: {
            name: address?.name || 'Test Customer',
            email: customerEmail,
            phone: address?.phone || '+44123456789',
            address: {
              city: address?.city || 'London',
              line1: address?.line1 || '123 Test Street',
              line2: address?.line2 || 'Test Apartment',
              state: address?.state || 'England',
              country: address?.country || 'GB',
              postal_code: address?.postal_code || 'SW1A 1AA',
            },
            tax_ids: [],
            tax_exempt: 'none'
          },
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create test order: ${error.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Default action: insert test data
    const { data, error } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: 'test_session_' + Date.now(),
        customer_email: 'test@example.com',
        items: [{ name: 'Test Product', quantity: 1, price: 29.99 }],
        customer_details: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+44123456789',
          address: {
            city: 'London',
            line1: '123 Test Street',
            line2: 'Test Apartment',
            state: 'England',
            country: 'GB',
            postal_code: 'SW1A 1AA',
          },
          tax_ids: [],
          tax_exempt: 'none'
        },
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      throw new Error(`Failed to insert test data: ${error.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 