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
    console.log('Newsletter unsubscribe function called')
    
    // Get token from query params or body
    const url = new URL(req.url)
    let token = url.searchParams.get('token')
    
    // If not in query params, check body
    if (!token && req.method === 'POST') {
      const body = await req.json()
      token = body.token
    }
    
    console.log('Received token:', token ? 'Present' : 'Missing')

    if (!token) {
      console.log('No token provided')
      return new Response(
        JSON.stringify({ error: 'Unsubscribe token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Call the unsubscribe function
    console.log('Attempting to unsubscribe with token:', token)
    const { data, error } = await supabase
      .rpc('unsubscribe_newsletter', { p_token: token })
      .single()

    if (error) {
      console.error('Error unsubscribing:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to process unsubscribe request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!data.success) {
      console.log('Unsubscribe failed:', data.message)
      return new Response(
        JSON.stringify({ 
          success: false,
          message: data.message 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('Successfully unsubscribed:', data.email)
    
    // Send confirmation email (optional)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey && data.email) {
      try {
        const confirmationEmail = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Unsubscribed from Reform UK Newsletter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #009fe3 0%, #0066cc 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            background: #009fe3;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>You've Been Unsubscribed</h1>
    </div>
    
    <div class="content">
        <p>Hi there,</p>
        
        <p>You have been successfully unsubscribed from the Reform UK newsletter.</p>
        
        <p>We're sorry to see you go! You will no longer receive our campaign updates, exclusive offers, or product announcements.</p>
        
        <h3>Changed Your Mind?</h3>
        <p>If you unsubscribed by mistake or would like to rejoin our community in the future, you can always sign up again on our website.</p>
        
        <div style="text-align: center;">
            <a href="https://reformuk.com" class="button">Visit Our Website</a>
        </div>
        
        <p>Thank you for your past support of Reform UK.</p>
    </div>
    
    <div class="footer">
        <p>This confirmation was sent to ${data.email}</p>
        <p>Reform UK | Building a Better Britain</p>
    </div>
</body>
</html>
        `
        
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            to: data.email,
            from: 'support@backreform.co.uk',
            subject: 'Unsubscribed from Reform UK Newsletter',
            html: confirmationEmail,
          }),
        });
        
        console.log('Unsubscribe confirmation email sent to:', data.email)
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: data.message,
        email: data.email
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in newsletter unsubscribe:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})