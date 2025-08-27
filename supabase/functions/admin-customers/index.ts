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
      case 'get_customers':
        const { page = 1, limit = 50, search } = await req.json()
        
        let query = supabaseClient
          .from('customer_profiles')
          .select('*')
          .order('created_at', { ascending: false })

        // Apply search filter
        if (search) {
          query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
        }

        // Apply pagination
        const offset = (page - 1) * limit
        query = query.range(offset, offset + limit - 1)

        const { data: customers, error: customersError, count } = await query

        if (customersError) throw customersError

        return new Response(
          JSON.stringify({ 
            customers: customers || [],
            total: count || 0,
            page,
            limit
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get_customer_details':
        const { customerId } = await req.json()
        
        const { data: customerDetails, error: detailsError } = await supabaseClient
          .from('customer_profiles')
          .select('*')
          .eq('id', customerId)
          .single()

        if (detailsError) throw detailsError

        // Get customer's order history
        const { data: customerOrders, error: ordersError } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('customer_email', customerDetails.email)
          .order('created_at', { ascending: false })

        if (ordersError) throw ordersError

        return new Response(
          JSON.stringify({ 
            customer: customerDetails,
            orders: customerOrders || []
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'update_customer':
        const { customerId: updateCustomerId, updates } = await req.json()
        
        const { data: updatedCustomer, error: updateError } = await supabaseClient
          .from('customer_profiles')
          .update({ 
            ...updates,
            updated_at: new Date().toISOString() 
          })
          .eq('id', updateCustomerId)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(
          JSON.stringify({ 
            success: true,
            customer: updatedCustomer
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get_customer_stats':
        const { data: totalCustomers, error: totalError } = await supabaseClient
          .from('customer_profiles')
          .select('created_at', { count: 'exact' })

        if (totalError) throw totalError

        // Get customers created in last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: recentCustomers, error: recentError } = await supabaseClient
          .from('customer_profiles')
          .select('created_at', { count: 'exact' })
          .gte('created_at', thirtyDaysAgo.toISOString())

        if (recentError) throw recentError

        return new Response(
          JSON.stringify({ 
            totalCustomers: totalCustomers?.length || 0,
            recentCustomers: recentCustomers?.length || 0
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
