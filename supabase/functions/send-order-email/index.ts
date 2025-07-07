import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  orderId: string;
  customerEmail: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number; // Price in pence (integer)
}

interface Order {
  id: string;
  checkout_session_id: string;
  amount_total: number;
  customer_id: string;
  items: OrderItem[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('send-order-email function triggered')
    
    const { orderId, customerEmail }: RequestBody = await req.json()
    
    console.log('Received orderId:', orderId)
    console.log('Received customerEmail:', customerEmail)
    
    if (!orderId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: orderId and customerEmail' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
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

    // Enhanced retry function to fetch order with readable_order_id
    async function fetchLatestOrder(session_id: string) {
      let retries = 0;
      const maxRetries = 3;
      const retryDelay = 500; // 500ms delay between retries
      
      console.log(`[send-order-email] Starting order fetch for session_id: ${session_id}`);
      
      while (retries < maxRetries) {
        console.log(`[send-order-email] Attempt ${retries + 1}/${maxRetries} to fetch order for session_id: ${session_id}`);
        
        try {
          const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('stripe_session_id', session_id)
            .limit(1);

                      if (!error && orders && orders.length > 0) {
              const data = orders[0];
              console.log(`[send-order-email] Order found:`, {
                id: data.id,
                readable_order_id: data.readable_order_id,
                customer_email: data.customer_email,
                created_at: data.created_at
              });
              
              if (data.readable_order_id) {
                console.log(`[send-order-email] ✅ Order has readable_order_id: ${data.readable_order_id}`);
                return data;
              } else {
                console.log(`[send-order-email] ⚠️ Order found but readable_order_id is null/undefined, retrying...`);
              }
            } else if (error) {
              console.log(`[send-order-email] ❌ Error fetching order:`, error);
            } else {
              console.log(`[send-order-email] ❌ Order not found for session_id: ${session_id}`);
            }
        } catch (fetchError) {
          console.log(`[send-order-email] ❌ Exception during order fetch:`, fetchError);
        }

        retries++;
        if (retries < maxRetries) {
          console.log(`[send-order-email] ⏳ Waiting ${retryDelay}ms before retry ${retries + 1}...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }

      console.log(`[send-order-email] ❌ Failed to fetch order after ${maxRetries} retries for session_id: ${session_id}`);
      throw new Error(`Order not found or readable_order_id missing after ${maxRetries} retries for session_id: ${session_id}`);
    }

    // Fetch order details with retry logic
    console.log(`[send-order-email] Fetching order details for session_id: ${orderId}`)
    let orderData;
    try {
      orderData = await fetchLatestOrder(orderId);
      console.log(`[send-order-email] ✅ Successfully fetched order with readable_order_id: ${orderData.readable_order_id}`);
    } catch (error) {
      console.error(`[send-order-email] ❌ Failed to fetch order after retries for session_id: ${orderId}:`, error)
      
      // Log additional context for debugging
      console.log(`[send-order-email] 📊 Debug info:`, {
        session_id: orderId,
        customer_email: customerEmail,
        timestamp: new Date().toISOString(),
        error_message: error.message
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Order not found or readable_order_id missing after retries',
          session_id: orderId,
          customer_email: customerEmail,
          retry_attempts: 3
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Order found:', orderData)

    // Fetch order items with product names
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderData.stripe_session_id)

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order items' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Order items found:', itemsData)

    // Check if items exist
    if (!itemsData || itemsData.length === 0) {
      console.warn('No items found for this order')
    }

    // Format order items with safe property access
    const orderItems: OrderItem[] = itemsData.map((item: any) => ({
      id: item.id,
      product_name: item.product_name ?? 'Unnamed Product',
      quantity: item.quantity,
      unit_price: item.unit_price // Price in pence (integer)
    }))

    // Calculate order total
    const orderTotal = orderData.amount_total / 100 // Convert from pence to pounds

    // Format email body
    const emailBody = formatOrderEmail(orderData.readable_order_id || 'Processing...', orderItems, orderTotal)

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('Missing Resend API key')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Reform UK Shop <support@backreform.co.uk>',
        to: customerEmail,
        subject: `Order Confirmation - ${orderData.readable_order_id || 'Processing...'}`,
        html: emailBody,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order confirmation email sent',
        emailId: emailResult.id 
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

function formatOrderEmail(orderId: string, items: OrderItem[], total: number): string {
  // Handle fallback for missing readable order ID
  const displayOrderId = orderId === 'Processing...' ? 'Processing...' : orderId
  
  const itemsHtml = items.map(item => {
    const unitPrice = (item.unit_price / 100).toFixed(2) // Convert from pence to pounds
    const itemTotal = ((item.unit_price * item.quantity) / 100).toFixed(2) // Convert from pence to pounds
    
    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">£${unitPrice}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">£${itemTotal}</td>
      </tr>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h1 style="color: #1a1a1a; margin-bottom: 20px; text-align: center;">Order Confirmation</h1>
        
        <div style="background-color: white; padding: 25px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 15px;">Thank you for your order!</h2>
          <p style="margin-bottom: 10px;"><strong>Order ID:</strong> ${displayOrderId}</p>
          <p style="margin-bottom: 20px;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
          
          <h3 style="color: #1a1a1a; margin-bottom: 15px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; border-top: 2px solid #ddd; padding-top: 15px;">
            <h3 style="margin: 0; color: #1a1a1a;">Order Total: £${total.toFixed(2)}</h3>
          </div>
        </div>
        
        <div style="background-color: white; padding: 25px; border-radius: 6px;">
          <h3 style="color: #1a1a1a; margin-bottom: 15px;">What's Next?</h3>
          <p style="margin-bottom: 10px;">We're processing your order and will send you a shipping confirmation email once your items are on their way.</p>
          <p style="margin-bottom: 10px;">If you have any questions about your order, please contact us at support@backreform.co.uk</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Thank you for supporting Reform UK!</p>
          <p>© 2024 Reform UK. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}