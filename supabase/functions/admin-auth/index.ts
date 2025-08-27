import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { action } = body

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey })
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') || '' },
      },
    })

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Authentication error', details: authError.message }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - No user found' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User authenticated:', user.id)

    // Check if user has admin permissions
    const { data: adminRole, error: roleError } = await supabaseClient
      .from('admin_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (roleError) {
      console.error('Role check error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Admin role check failed', details: roleError.message }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: 'Admin access required - No admin role found' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Admin role found:', adminRole.role)

    // Handle different actions
    switch (action) {
      case 'get_role':
        // Get user's admin role with permissions
        const { data: permissions, error: permError } = await supabaseClient
          .from('admin_role_permissions')
          .select(`
            admin_permissions (
              name,
              description,
              resource,
              action
            )
          `)
          .eq('admin_role_id', adminRole.id)

        if (permError) {
          console.error('Permissions fetch error:', permError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch permissions', details: permError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const permissionNames = permissions?.map(p => p.admin_permissions?.name).filter(Boolean) || []
        
        return new Response(
          JSON.stringify({ 
            role: {
              role: adminRole.role,
              permissions: permissionNames,
              is_active: adminRole.is_active
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'check_permission':
        const { resource, action: actionName = 'read' } = body
        
        if (!resource) {
          return new Response(
            JSON.stringify({ error: 'Resource is required for permission check' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Check if user has the required permission
        const hasPermission = await supabaseClient.rpc('check_admin_permission', {
          user_uuid: user.id,
          resource_name: resource,
          action_name: actionName
        })

        return new Response(
          JSON.stringify({ 
            hasPermission: hasPermission.data || false,
            user_id: user.id,
            resource,
            action: actionName
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      case 'validate_access':
        return new Response(
          JSON.stringify({ 
            valid: true,
            user_id: user.id,
            role: adminRole.role,
            is_active: adminRole.is_active
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action', supported_actions: ['get_role', 'check_permission', 'validate_access'] }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        stack: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
