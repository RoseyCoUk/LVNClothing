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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user has admin permissions
    const { data: adminRole, error: roleError } = await supabaseClient
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (roleError || !adminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action } = await req.json()

    switch (action) {
      case 'get_orders':
        const { page = 1, limit = 50, status, search } = await req.json()
        
        let query = supabaseClient
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })

        // Apply filters
        if (status && status !== 'all') {
          query = query.eq('status', status)
        }

        if (search) {
          query = query.or(`customer_email.ilike.%${search}%,readable_order_id.ilike.%${search}%`)
        }

        // Apply pagination
        const offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)

        const { data: orders, error: ordersError, count } = await query

        if (ordersError) throw ordersError

        return new Response(
          JSON.stringify({ 
            orders: orders || [],
            total: count || 0,
            page,
            limit
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'update_order_status':
        const { orderId, newStatus } = await req.json()
        
        const { data: updatedOrder, error: updateError } = await supabaseClient
          .from('orders')
          .update({ 
            status: newStatus, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', orderId)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ 
            success: true,
            order: updatedOrder
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get_order_details':
        const { orderId: orderIdForDetails } = await req.json()
        
        const { data: orderDetails, error: detailsError } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', orderIdForDetails)
          .single()

        if (detailsError) throw detailsError

        return new Response(
          JSON.stringify({ 
            order: orderDetails
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get_orders_stats':
        const { data: stats, error: statsError } = await supabaseClient
          .rpc('get_orders_statistics')

        if (statsError) throw statsError

        return new Response(
          JSON.stringify({ 
            stats: stats || {}
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
