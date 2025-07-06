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
  // Generate email content
  const emailContent = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order!</p>
    <p>Order ID: ${order.id}</p>
    <p>Customer Email: ${customerEmail}</p>
    <pre>${JSON.stringify(order, null, 2)}</pre>
  `;

  // Send to customer
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Reform UK Shop <noreply@backreform.co.uk>',
      to: customerEmail,
      subject: `Your Order Confirmation - #${order.id}`,
      html: emailContent, // You can customise content if you want it different
    }),
  });

  // Send to internal support
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Reform UK Shop <noreply@backreform.co.uk>',
      to: 'support@backreform.co.uk',
      subject: `New Order Received - #${order.id}`,
      html: emailContent,
    }),
  });

  return { success: true };
}