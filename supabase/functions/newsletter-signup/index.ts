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
    console.log('Newsletter signup function called')
    const { email } = await req.json()
    console.log('Received email:', email)

    if (!email) {
      console.log('No email provided')
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email)
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if email is already subscribed
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
    console.log('Supabase Service Key:', supabaseServiceKey ? 'Set' : 'Not set')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for existing subscription (including inactive ones)
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('email, subscribed_at, is_active, discount_code')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing subscriber:', checkError)
      return new Response(
        JSON.stringify({ error: 'Failed to check subscription status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingSubscriber) {
      // If they're already active, they're already subscribed
      if (existingSubscriber.is_active) {
        console.log('Email already subscribed:', email)
        return new Response(
          JSON.stringify({ 
            error: 'already subscribed',
            message: 'This email is already subscribed to our newsletter' 
          }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // If they were unsubscribed, reactivate them
      console.log('Reactivating unsubscribed user:', email)
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({
          is_active: true,
          unsubscribed_at: null,
          subscribed_at: new Date().toISOString()
        })
        .eq('email', email.toLowerCase().trim())
      
      if (updateError) {
        console.error('Error reactivating subscriber:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to reactivate subscription' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Return their existing discount code
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Successfully re-subscribed to newsletter',
          discountCode: existingSubscriber.discount_code,
          reactivated: true
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate a unique and readable discount code
    const timestamp = Date.now().toString(36).toUpperCase().slice(-6)
    const randomStr = Math.random().toString(36).toUpperCase().slice(2, 6)
    const discountCode = `WELCOME10-${randomStr}-${timestamp}`
    console.log('Generated discount code:', discountCode)

    // Store the email and discount code in the database
    console.log('Attempting to insert subscriber into database...')
    const { data: insertedData, error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: email.toLowerCase().trim(),
          discount_code: discountCode,
          discount_amount: 10,
          subscribed_at: new Date().toISOString(),
          is_active: true,
          welcome_email_sent: false
        }
      ])
      .select('unsubscribe_token')
      .single()

    if (insertError) {
      console.error('Error inserting subscriber:', insertError)
      
      // Handle specific database errors
      if (insertError.code === '23505') { // Unique constraint violation
        return new Response(
          JSON.stringify({ 
            error: 'already subscribed',
            message: 'This email is already subscribed to our newsletter' 
          }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to subscribe: ' + insertError.message,
          details: 'Database error occurred while processing subscription'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('Successfully inserted subscriber into database')
    
    const unsubscribeToken = insertedData?.unsubscribe_token || ''
    // Use localhost for development, production URL for production
    const baseUrl = Deno.env.get('APP_URL') || 'http://localhost:5175'
    const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${unsubscribeToken}`

    // Send welcome email with discount code
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Reform UK - Your 10% Discount Code</title>
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
        .discount-box {
            background: #e8f5e8;
            border: 2px solid #4caf50;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .discount-code {
            font-size: 24px;
            font-weight: bold;
            color: #2e7d32;
            background: white;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin: 10px 0;
        }
        .cta-button {
            display: inline-block;
            background: #009fe3;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
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
        <h1>Welcome to Reform UK!</h1>
        <p>Thank you for joining the movement</p>
    </div>
    
    <div class="content">
        <h2>Your 10% Discount Code is Here! 🎉</h2>
        
        <p>Welcome to the Reform UK community! We're excited to have you join thousands of supporters who are committed to real change.</p>
        
        <div class="discount-box">
            <h3>Your Exclusive Welcome Discount</h3>
            <div class="discount-code">${discountCode}</div>
            <p><strong>Save 10% on your first order!</strong></p>
            <p>Use this code at checkout to get 10% off any order</p>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">
                ⚠️ This is a single-use code exclusively for ${email}
            </p>
        </div>
        
        <h3>What's Next?</h3>
        <ul>
            <li><strong>Shop Now:</strong> Browse our latest Reform UK merchandise</li>
            <li><strong>Stay Updated:</strong> Get exclusive access to new product drops</li>
            <li><strong>Campaign News:</strong> Be the first to know about important updates</li>
            <li><strong>Exclusive Offers:</strong> Receive special discounts and promotions</li>
        </ul>
        
        <div style="text-align: center;">
            <a href="https://reformuk.com/shop" class="cta-button">Shop Now & Use Your Code</a>
        </div>
        
        <h3>What You'll Receive:</h3>
        <ul>
            <li>Exclusive access to limited-edition drops</li>
            <li>Campaign updates and important announcements</li>
            <li>Special member-only discounts</li>
            <li>Behind-the-scenes content</li>
        </ul>
        
        <p><strong>Important:</strong> Your discount code is valid for 30 days from today. Make sure to use it before it expires!</p>
    </div>
    
    <div class="footer">
        <p>This email was sent to ${email}</p>
        <p>Reform UK | Building a Better Britain</p>
        <p>
            <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">
                Unsubscribe from newsletter
            </a>
        </p>
        <p style="font-size: 11px; color: #999;">
            If you're having trouble clicking the unsubscribe link, copy and paste this URL into your browser:<br>
            ${unsubscribeUrl}
        </p>
    </div>
</body>
</html>
    `

    // Send email using Resend.com
    console.log('Attempting to send email with Resend...')
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    console.log('Resend API Key:', resendApiKey ? 'Set' : 'Not set')
    
    let emailSent = false;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable is not set')
    } else {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            to: email,
            from: 'support@backreform.co.uk',
            subject: 'Welcome to Reform UK - Your 10% Discount Code Inside! 🎉',
            html: emailContent,
          }),
        });

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          console.error('Error sending email with Resend:', errorText);
          console.error('Resend response status:', resendResponse.status);
        } else {
          console.log('Email sent successfully with Resend');
          emailSent = true;
          
          // Mark email as sent in database
          await supabase
            .from('newsletter_subscribers')
            .update({
              welcome_email_sent: true,
              welcome_email_sent_at: new Date().toISOString()
            })
            .eq('email', email.toLowerCase().trim())
        }
      } catch (emailError) {
        console.error('Exception while sending email:', emailError);
      }
    }

    console.log('Returning success response')
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: emailSent ? 'Successfully subscribed to newsletter and welcome email sent' : 'Successfully subscribed to newsletter (welcome email will be sent shortly)',
        discountCode: discountCode,
        emailSent: emailSent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in newsletter signup:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 