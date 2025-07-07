import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestOrderData {
  stripe_session_id: string;
  customer_email: string;
  items: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('manual-test-insert function triggered')
    
    const { sessionId, customerEmail, items }: {
      sessionId: string;
      customerEmail: string;
      items: any[];
    } = await req.json()
    
    console.log('Received test data:', { sessionId, customerEmail, items })
    
    if (!sessionId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: sessionId and customerEmail' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Prepare test order data
    const testOrderData = {
      stripe_session_id: sessionId,
      customer_email: customerEmail,
      items: items || [
        {
          id: 'test-hoodie',
          name: 'Test Reform UK Hoodie',
          price: 3499,
          quantity: 1
        }
      ],
      customer_details: {
        name: 'Test Customer',
        phone: '+44 123 456 7890',
        address: {
          line1: '123 Test Street',
          line2: 'Test Apartment',
          city: 'London',
          state: 'England',
          postal_code: 'SW1A 1AA',
          country: 'United Kingdom'
        }
      }
    }

    console.log('Inserting test order data:', testOrderData)

    // Insert test data using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('orders')
      .insert([testOrderData])
      .select()
      .single()

    if (error) {
      console.error('Failed to insert test data:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to insert test data', details: error }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Test data inserted successfully:', {
      id: data.id,
      stripe_session_id: data.stripe_session_id,
      readable_order_id: data.readable_order_id,
      customer_email: data.customer_email
    })

    // Insert test order items into order_items table
    const testOrderItems = [
      {
        order_id: data.id,
        name: 'Test Reform UK Hoodie',
        quantity: 1,
        price: '34.99'
      }
    ];

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(testOrderItems);

    if (itemsError) {
      console.error('Error inserting test order items:', itemsError);
    } else {
      console.log('Successfully inserted test order items');
    }

          // Call the send-order-email function with order_id for direct lookup
      try {
        console.log('📧 Calling send-order-email function with order_id:', data.id)
        console.log('📧 Test mode: Using direct order_id lookup for reliable email sending')
        
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            order_id: data.id,  // Use direct order_id for reliable lookup
            customerEmail: customerEmail,
          }),
        })

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('Email sent successfully:', emailResult)
      } else {
        const errorText = await emailResponse.text()
        console.error('Failed to send email:', errorText)
      }
    } catch (emailError) {
      console.error('Error calling email function:', emailError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Test data inserted and email triggered',
        order: {
          id: data.id,
          stripe_session_id: data.stripe_session_id,
          readable_order_id: data.readable_order_id,
          customer_email: data.customer_email
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unhandled exception:', JSON.stringify(error, null, 2))
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 