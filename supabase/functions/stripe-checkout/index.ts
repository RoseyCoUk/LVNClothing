import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const allowed = new Set([
  "https://backreform.co.uk",
  "https://www.backreform.co.uk",
  "http://localhost:3000",
  "http://localhost:5173",
]);

function cors(origin: string | null) {
  const allow = origin && allowed.has(origin) ? origin : "https://backreform.co.uk";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    // include all headers your client sends (supabase-js adds these):
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
}

serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  const headers = cors(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const { price_id, line_items, metadata, success_url, cancel_url, mode, customer_email, shipping_rate_id } = await req.json();

    console.log('Received checkout request:', {
      price_id,
      has_line_items: !!line_items,
      line_items_count: line_items ? line_items.length : 0,
      metadata,
      success_url,
      cancel_url,
      mode,
      customer_email,
      shipping_rate_id
    });

    // Validate required parameters
    if (!customer_email) {
      return new Response(JSON.stringify({ error: 'customer_email is required' }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    if (!price_id && !line_items) {
      return new Response(JSON.stringify({ error: 'Either price_id or line_items must be provided' }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Validate line_items structure if provided
    if (line_items && Array.isArray(line_items)) {
      for (const item of line_items) {
        if (!item.price_data || !item.price_data.currency || !item.price_data.product_data || !item.price_data.unit_amount) {
          return new Response(JSON.stringify({ error: 'Invalid line_items structure. Each item must have price_data with currency, product_data, and unit_amount' }), {
            status: 400,
            headers: { ...headers, "Content-Type": "application/json" },
          });
        }
        if (!item.quantity || item.quantity < 1) {
          return new Response(JSON.stringify({ error: 'Invalid quantity in line_items. Quantity must be at least 1' }), {
            status: 400,
            headers: { ...headers, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Try to get user ID from auth header if present
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '').trim();
        const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);
        if (!getUserError && user) {
          userId = user.id;
        }
      } catch (err) {
        console.warn('Error while authenticating user. Proceeding as guest.');
      }
    }

    // Create Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer_email: customer_email,
      payment_method_types: ['card'],
      mode,
      success_url,
      cancel_url,
      customer_creation: 'always',
      // Remove collect_shipping_address as it's not a valid Stripe parameter
      metadata: {
        ...(userId ? { user_id: userId } : {}),
        ...(metadata || {}),
      },
    };

    // Add line items
    if (line_items) {
      sessionParams.line_items = line_items;
    } else if (price_id) {
      sessionParams.line_items = [
        {
          price: price_id,
          quantity: 1,
        },
      ];
    }

    // Add shipping rate if provided
    if (shipping_rate_id) {
      sessionParams.shipping_options = [
        {
          shipping_rate: shipping_rate_id,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`Created checkout session ${session.id} for email ${customer_email}`);

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});