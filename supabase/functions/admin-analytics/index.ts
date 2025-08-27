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
      case 'get_dashboard_stats':
        // Get basic dashboard statistics
        const { data: ordersData, error: ordersError } = await supabaseClient
          .from('orders')
          .select('amount_total, created_at')

        if (ordersError) throw ordersError

        const { data: customersData, error: customersError } = await supabaseClient
          .from('customer_profiles')
          .select('created_at')

        if (customersError) throw customersError

        // Calculate stats
        const totalOrders = ordersData?.length || 0
        const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.amount_total || 0), 0) || 0
        const totalCustomers = customersData?.length || 0
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        return new Response(
          JSON.stringify({ 
            totalOrders,
            totalRevenue,
            totalCustomers,
            averageOrderValue
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get_revenue_trends':
        const { timeRange = '30d' } = await req.json()
        
        // Calculate date range
        const now = new Date()
        let startDate = new Date()
        
        switch (timeRange) {
          case '7d':
            startDate.setDate(now.getDate() - 7)
            break
          case '30d':
            startDate.setDate(now.getDate() - 30)
            break
          case '90d':
            startDate.setDate(now.getDate() - 90)
            break
          case '1y':
            startDate.setFullYear(now.getFullYear() - 1)
            break
          default:
            startDate.setDate(now.getDate() - 30)
        }

        const { data: revenueData, error: revenueError } = await supabaseClient
          .from('orders')
          .select('amount_total, created_at')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true })

        if (revenueError) throw revenueError

        // Process revenue data by month
        const monthlyData = new Map()
        
        revenueData?.forEach(order => {
          const date = new Date(order.created_at)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, { count: 0, revenue: 0 })
          }
          
          const monthData = monthlyData.get(monthKey)
          monthData.count += 1
          monthData.revenue += order.amount_total || 0
        })

        const revenueTrends = Array.from(monthlyData.entries())
          .map(([month, data]) => ({
            month: new Date(month + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
            count: data.count,
            revenue: data.revenue
          }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

        return new Response(
          JSON.stringify({ 
            revenueTrends
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get_customer_growth':
        const { timeRange: customerTimeRange = '30d' } = await req.json()
        
        // Calculate date range for customers
        const customerNow = new Date()
        let customerStartDate = new Date()
        
        switch (customerTimeRange) {
          case '7d':
            customerStartDate.setDate(customerNow.getDate() - 7)
            break
          case '30d':
            customerStartDate.setDate(customerNow.getDate() - 30)
            break
          case '90d':
            customerStartDate.setDate(customerNow.getDate() - 90)
            break
          case '1y':
            customerStartDate.setFullYear(customerNow.getFullYear() - 1)
            break
          default:
            customerStartDate.setDate(customerNow.getDate() - 30)
        }

        const { data: customerGrowthData, error: customerGrowthError } = await supabaseClient
          .from('customer_profiles')
          .select('created_at')
          .gte('created_at', customerStartDate.toISOString())
          .order('created_at', { ascending: true })

        if (customerGrowthError) throw customerGrowthError

        // Process customer growth by month
        const customerMonthlyData = new Map()
        
        customerGrowthData?.forEach(customer => {
          const date = new Date(customer.created_at)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          customerMonthlyData.set(monthKey, (customerMonthlyData.get(monthKey) || 0) + 1)
        })

        const customerGrowth = Array.from(customerMonthlyData.entries())
          .map(([month, count]) => ({
            month: new Date(month + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
            count
          }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

        return new Response(
          JSON.stringify({ 
            customerGrowth
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'get_top_products':
        // Mock top products data (you can implement this based on your order_items table)
        const topProducts = [
          { name: 'Reform UK Hoodie', quantity: 45, revenue: 1795.55 },
          { name: 'Reform UK T-Shirt', quantity: 38, revenue: 949.62 },
          { name: 'Starter Bundle', quantity: 22, revenue: 1099.78 },
          { name: 'Reform UK Cap', quantity: 31, revenue: 619.69 },
          { name: 'Champion Bundle', quantity: 15, revenue: 1349.85 }
        ]

        return new Response(
          JSON.stringify({ 
            topProducts
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
