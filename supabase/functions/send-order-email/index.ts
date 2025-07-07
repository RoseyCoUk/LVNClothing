import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  order_id?: string;  // Direct order ID lookup (preferred)
  orderId?: string;   // Legacy session_id lookup (fallback)
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
    
    const { order_id, orderId, customerEmail }: RequestBody = await req.json()
    
    console.log('Received order_id:', order_id)
    console.log('Received orderId (legacy):', orderId)
    console.log('Received customerEmail:', customerEmail)
    
    if ((!order_id && !orderId) || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: order_id (or orderId) and customerEmail' }),
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

    // Direct order lookup function - no retry logic needed
    async function fetchOrderById(order_id: string) {
      console.log(`[send-order-email] Fetching order directly by ID: ${order_id}`);
      
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', order_id)
          .single();

        if (error) {
          console.log(`[send-order-email] ❌ Error fetching order by ID:`, error);
          throw error;
        }

        if (!order) {
          console.log(`[send-order-email] ❌ Order not found for ID: ${order_id}`);
          throw new Error(`Order not found for ID: ${order_id}`);
        }

        console.log(`[send-order-email] ✅ Order found:`, {
          id: order.id,
          readable_order_id: order.readable_order_id,
          customer_email: order.customer_email,
          created_at: order.created_at
        });

        return order;
      } catch (fetchError) {
        console.log(`[send-order-email] ❌ Exception during order fetch:`, fetchError);
        throw fetchError;
      }
    }

    // Fallback function for session_id lookup (legacy support)
    async function fetchOrderBySessionId(session_id: string) {
      console.log(`[send-order-email] Fetching order by session_id (fallback): ${session_id}`);
      
      try {
        const { data: order, error } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_session_id', session_id)
          .single();

        if (error) {
          console.log(`[send-order-email] ❌ Error fetching order by session_id:`, error);
          throw error;
        }

        if (!order) {
          console.log(`[send-order-email] ❌ Order not found for session_id: ${session_id}`);
          throw new Error(`Order not found for session_id: ${session_id}`);
        }

        console.log(`[send-order-email] ✅ Order found by session_id:`, {
          id: order.id,
          readable_order_id: order.readable_order_id,
          customer_email: order.customer_email,
          created_at: order.created_at
        });

        return order;
      } catch (fetchError) {
        console.log(`[send-order-email] ❌ Exception during session_id lookup:`, fetchError);
        throw fetchError;
      }
    }

    // Fetch order details using direct ID lookup (preferred) or session_id (fallback)
    let orderData;
    try {
      if (order_id) {
        // Use direct order_id lookup (fast and reliable)
        orderData = await fetchOrderById(order_id);
        console.log(`[send-order-email] ✅ Successfully fetched order by ID with readable_order_id: ${orderData.readable_order_id}`);
      } else if (orderId) {
        // Fallback to session_id lookup (legacy support)
        orderData = await fetchOrderBySessionId(orderId);
        console.log(`[send-order-email] ✅ Successfully fetched order by session_id with readable_order_id: ${orderData.readable_order_id}`);
      } else {
        throw new Error('Neither order_id nor orderId provided');
      }
    } catch (error) {
      console.error(`[send-order-email] ❌ Failed to fetch order:`, error)
      
      // Log additional context for debugging
      console.log(`[send-order-email] 📊 Debug info:`, {
        order_id: order_id,
        session_id: orderId,
        customer_email: customerEmail,
        timestamp: new Date().toISOString(),
        error_message: error.message
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Order not found',
          order_id: order_id,
          session_id: orderId,
          customer_email: customerEmail
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
      .eq('order_id', orderData.id)

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
      product_name: item.name ?? 'Unnamed Product',
      quantity: item.quantity,
      unit_price: Math.round(parseFloat(item.price) * 100) // Convert from decimal to pence (integer)
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