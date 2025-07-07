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

    // Calculate order total from order items (more accurate than amount_total)
    const orderTotal = orderItems.reduce((total, item) => {
      const itemTotal = (item.unit_price * item.quantity) / 100; // Convert from pence to pounds
      return total + itemTotal;
    }, 0);

    // Format email body
    const emailBody = formatOrderEmail(orderData.readable_order_id || 'Processing...', orderItems, orderTotal)

    // Load email configuration from environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const INTERNAL_EMAIL = Deno.env.get('INTERNAL_EMAIL') || 'support@backreform.co.uk'
    
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

    // Validate email addresses
    if (!customerEmail) {
      console.warn('⚠️ customerEmail is undefined')
    }
    if (!INTERNAL_EMAIL) {
      console.warn('⚠️ INTERNAL_EMAIL is undefined')
    }

    // Send customer confirmation email
    let customerEmailResult = null;
    let customerEmailError = null;
    try {
      console.log('📧 Sending customer email to:', customerEmail);
      const customerEmailResponse = await fetch('https://api.resend.com/emails', {
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
      });

      if (customerEmailResponse.ok) {
        customerEmailResult = await customerEmailResponse.json();
        console.log('Customer email sent successfully:', customerEmailResult);
      } else {
        const errorText = await customerEmailResponse.text();
        customerEmailError = errorText;
        console.error('Customer email failed:', errorText);
      }
    } catch (error) {
      customerEmailError = error.message;
      console.error('Customer email exception:', error);
    }

    // Send internal notification email
    let internalEmailResult = null;
    let internalEmailError = null;
    try {
      console.log('📧 Sending internal email to:', INTERNAL_EMAIL);
      const internalEmailBody = formatInternalEmail(orderData, orderItems, orderTotal);
      const internalEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Reform UK Shop <support@backreform.co.uk>',
          to: INTERNAL_EMAIL,
          subject: `New Order Placed: ${orderData.readable_order_id || 'Processing...'}`,
          html: internalEmailBody,
        }),
      });

      if (internalEmailResponse.ok) {
        internalEmailResult = await internalEmailResponse.json();
        console.log('Internal email sent successfully:', internalEmailResult);
      } else {
        const errorText = await internalEmailResponse.text();
        internalEmailError = errorText;
        console.error('Internal email failed:', errorText);
      }
    } catch (error) {
      internalEmailError = error.message;
      console.error('Internal email exception:', error);
    }

    // Return success if at least one email was sent
    const customerEmailSuccess = customerEmailResult !== null;
    const internalEmailSuccess = internalEmailResult !== null;

    if (!customerEmailSuccess && !internalEmailSuccess) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send both emails',
          customer_email_error: customerEmailError,
          internal_email_error: internalEmailError
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order confirmation emails processed',
        customer_email_sent: customerEmailSuccess,
        internal_email_sent: internalEmailSuccess,
        customer_email_id: customerEmailResult?.id,
        internal_email_id: internalEmailResult?.id,
        customer_email_error: customerEmailError,
        internal_email_error: internalEmailError
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

  // Add total row to the table
  const totalRow = `
    <tr style="background-color: #f8f9fa; font-weight: bold;">
      <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">Order Total:</td>
      <td style="padding: 12px; text-align: right; border-top: 2px solid #ddd;">£${total.toFixed(2)}</td>
    </tr>
  `

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Order Confirmation</h1>
          </div>
          
          <!-- Order Info -->
          <div style="padding: 30px;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px; font-size: 24px;">Thank you for your order!</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
              <p style="margin: 8px 0; font-size: 16px;"><strong>Order ID:</strong> <span style="color: #009fe3; font-weight: bold;">${displayOrderId}</span></p>
              <p style="margin: 8px 0; font-size: 16px;"><strong>Date:</strong> <span style="font-weight: bold;">${new Date().toLocaleDateString('en-GB')}</span></p>
            </div>
            
            <!-- Order Details Table -->
            <h3 style="color: #1a1a1a; margin-bottom: 15px; font-size: 20px;">Order Details</h3>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; min-width: 400px;">
                <thead>
                  <tr style="background-color: #1a1a1a; color: white;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  ${totalRow}
                </tbody>
              </table>
            </div>
            
            <!-- Next Steps -->
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; border-left: 4px solid #009fe3;">
              <h3 style="color: #1a1a1a; margin-bottom: 15px; font-size: 18px;">What's Next?</h3>
              <p style="margin-bottom: 10px; font-size: 16px;">We're processing your order and will send you a shipping confirmation email once your items are on their way.</p>
              <p style="margin-bottom: 0; font-size: 16px;">If you have any questions about your order, please contact us at <strong>support@backreform.co.uk</strong></p>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p style="margin: 5px 0;">Thank you for supporting Reform UK!</p>
          <p style="margin: 5px 0;">© 2024 Reform UK. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function formatInternalEmail(orderData: any, items: OrderItem[], total: number): string {
  const itemsHtml = items.map(item => {
    const unitPrice = (item.unit_price / 100).toFixed(2) // Convert from pence to pounds
    const itemTotal = ((item.unit_price * item.quantity) / 100).toFixed(2) // Convert from pence to pounds
    
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.product_name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">£${unitPrice}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">£${itemTotal}</td>
      </tr>
    `
  }).join('')

  const totalRow = `
    <tr style="background-color: #f0f0f0; font-weight: bold;">
      <td colspan="3" style="padding: 8px; text-align: right;">Order Total:</td>
      <td style="padding: 8px; text-align: right;">£${total.toFixed(2)}</td>
    </tr>
  `

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; margin: 0; padding: 20px;">
      <div style="max-width: 800px; margin: 0 auto;">
        <h1 style="color: #1a1a1a; margin-bottom: 20px;">New Order Placed</h1>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 15px;">Order Information</h2>
          <p><strong>Order ID:</strong> ${orderData.readable_order_id || 'Processing...'}</p>
          <p><strong>Customer Email:</strong> ${orderData.customer_email}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.created_at).toLocaleString('en-GB')}</p>
          <p><strong>Stripe Session ID:</strong> ${orderData.stripe_session_id}</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 15px;">Customer Details</h2>
          <p><strong>Full Name:</strong> ${orderData.customer_details?.name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${orderData.customer_email}</p>
          <p><strong>Phone:</strong> ${orderData.customer_details?.phone || 'Not provided'}</p>
          <p><strong>Shipping Address:</strong></p>
          <div style="margin-left: 20px; color: #666;">
            ${orderData.customer_details?.address ? `
              <p>${orderData.customer_details.address.line1 || ''}</p>
              ${orderData.customer_details.address.line2 ? `<p>${orderData.customer_details.address.line2}</p>` : ''}
              <p>${orderData.customer_details.address.city || ''}, ${orderData.customer_details.address.state || ''} ${orderData.customer_details.address.postal_code || ''}</p>
              <p>${orderData.customer_details.address.country || ''}</p>
            ` : 'Not provided'}
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="color: #1a1a1a; margin-bottom: 15px;">Ordered Items</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #1a1a1a; color: white;">
                <th style="padding: 8px; text-align: left;">Product</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Unit Price</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              ${totalRow}
            </tbody>
          </table>
        </div>
        
        <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
          <p style="margin: 0; font-weight: bold;">Order Total: £${total.toFixed(2)}</p>
        </div>
      </div>
    </body>
    </html>
  `
}