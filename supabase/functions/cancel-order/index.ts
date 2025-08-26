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
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required',
          message: 'Please log in to cancel your order',
          details: 'No authorization header provided'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user's JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed',
          message: 'Your session has expired. Please log in again.',
          details: authError?.message || 'Invalid or expired token'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { orderId, reason } = await req.json()
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if order exists and belongs to the user
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      console.error('Order lookup failed:', orderError);
      return new Response(
        JSON.stringify({ 
          error: 'Order not found',
          message: 'Order not found or access denied',
          details: 'Please check the order ID and ensure you are logged in'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if order can be cancelled (not already cancelled, fulfilled, etc.)
    if (order.status === 'canceled') {
      return new Response(
        JSON.stringify({ 
          error: 'Order already cancelled',
          message: 'This order has already been cancelled',
          details: 'Cancelled orders cannot be cancelled again'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (order.status === 'fulfilled' || order.status === 'shipped') {
      return new Response(
        JSON.stringify({ 
          error: 'Order cannot be cancelled',
          message: 'This order cannot be cancelled',
          details: 'Orders that have been fulfilled or shipped cannot be cancelled'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabaseClient
      .from('orders')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancel_reason: reason || 'Cancelled by customer',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to cancel order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send cancellation confirmation email
    try {
      const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        },
        body: JSON.stringify({
          orderId: orderId,
          customerEmail: order.customer_email,
          action: 'cancelled',
          reason: reason || 'Cancelled by customer'
        }),
      });
      
      if (!emailResponse.ok) {
        console.warn('Failed to send cancellation email:', await emailResponse.text());
      }
    } catch (emailError) {
      console.warn('Error sending cancellation email:', emailError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order cancelled successfully',
        order: updatedOrder
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in cancel-order function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
