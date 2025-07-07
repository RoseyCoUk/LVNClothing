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
      throw new Error('No authorization header')
    }

    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user's JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid or expired token')
    }

    // Get user's email for cleanup
    const userEmail = user.email

    // Delete user's orders and order items (cascade will handle order_items)
    const { error: ordersError } = await supabaseClient
      .from('orders')
      .delete()
      .eq('user_id', user.id)
      .eq('customer_email', userEmail)

    if (ordersError) {
      console.error('Error deleting orders:', ordersError)
      // Continue with account deletion even if order deletion fails
    }

    // Delete the user account
    const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      throw new Error(`Failed to delete user account: ${deleteError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in delete-user-account function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}) 