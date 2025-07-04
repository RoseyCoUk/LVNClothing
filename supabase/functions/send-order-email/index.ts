import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Create a Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { orderId, customerEmail } = await req.json();

    if (!orderId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Order ID and customer email are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch order details from the database
    const { data: order, error: orderError } = await supabase
      .from('stripe_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error('Error fetching order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order details' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Send email notification to support
    const emailResult = await sendOrderNotificationEmail(order, customerEmail);

    return new Response(
      JSON.stringify({ success: true, message: 'Order notification email sent' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function sendOrderNotificationEmail(order: any, customerEmail: string) {
  // Format currency for display
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  // Format date for display
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Create email content
  const emailContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #009fe3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .order-details { background-color: #f5f5f5; padding: 15px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Notification</h1>
          </div>
          <div class="content">
            <p>A new order has been placed on the Reform UK shop.</p>
            
            <div class="order-details">
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Customer ID:</strong> ${order.customer_id}</p>
              <p><strong>Customer Email:</strong> ${customerEmail}</p>
              <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
              <p><strong>Amount:</strong> ${formatCurrency(order.amount_total, order.currency)}</p>
              <p><strong>Payment Status:</strong> ${order.payment_status}</p>
              <p><strong>Order Status:</strong> ${order.status}</p>
            </div>
            
            <p>Please log in to the Stripe dashboard to view the complete order details and process the order.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Reform UK Shop system.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // In a real implementation, you would use a service like SendGrid, Mailgun, etc.
  // For this example, we'll simulate sending an email
  console.log(`Sending order notification email to support@backreform.co.uk`);
  console.log(`Email subject: New Order #${order.id} - Reform UK Shop`);
  console.log(`Email content: ${emailContent}`);

  // Here you would integrate with an email service
  // For example with Resend:
  // const { data, error } = await resend.emails.send({
  //   from: 'noreply@backreform.co.uk',
  //   to: 'support@backreform.co.uk',
  //   subject: `New Order #${order.id} - Reform UK Shop`,
  //   html: emailContent,
  // });

  return { success: true };
}