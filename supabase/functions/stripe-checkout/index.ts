import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { createPerformanceMonitor, measureAsyncOperation } from '../_shared/performance.ts';

// Get environment variables with better error handling
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'http://127.0.0.1:54321';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZXZ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Initialize Stripe only if we have the secret key
let stripe: Stripe | null = null;
if (stripeSecret) {
  stripe = new Stripe(stripeSecret, {
    appInfo: {
      name: 'Reform UK Store',
      version: '1.0.0',
    },
    // Add performance optimizations
    timeout: 30000, // 30 second timeout
    maxNetworkRetries: 3, // Retry failed requests
  });
}

const allowed = new Set([
  "https://backreform.co.uk",
  "https://www.backreform.co.uk",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:8080",
  "file://",
]);

function cors(origin: string | null) {
  // Handle file:// protocol and null origins for local testing
  let allow: string;
  if (!origin || origin === 'null' || origin.startsWith('file://')) {
    allow = "*"; // Allow all origins for local testing
  } else if (allowed.has(origin)) {
    allow = origin;
  } else {
    allow = "https://backreform.co.uk";
  }
  
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
  const performanceMonitor = createPerformanceMonitor('stripe-checkout', req);
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
      performanceMonitor.addWarning('Missing customer_email parameter');
      return new Response(JSON.stringify({ error: 'customer_email is required' }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    if (!price_id && !line_items) {
      performanceMonitor.addWarning('Missing both price_id and line_items parameters');
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

    // Check if Stripe is configured
    if (!stripe) {
      console.error('STRIPE_SECRET_KEY is not configured');
      
      // Return a more helpful error response for development/testing
      return new Response(JSON.stringify({ 
        error: 'Stripe is not configured',
        details: 'Please set STRIPE_SECRET_KEY in your environment variables or Supabase secrets',
        test_mode: true,
        request_data: {
          customer_email,
          line_items: line_items || [],
          shipping_rate_id,
          mode,
          success_url,
          cancel_url
        },
        message: 'This is expected in development environment. Configure Stripe keys to enable real payments.'
      }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Try to get user ID from auth header if present, but don't fail if not present
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      try {
        console.log('Attempting to authenticate user...');
        const token = authHeader.replace('Bearer ', '').trim();
        
        // Add timeout to prevent hanging
        const authPromise = supabase.auth.getUser(token);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timeout')), 5000)
        );
        
        const { data: { user }, error: getUserError } = await Promise.race([authPromise, timeoutPromise]);
        
        if (!getUserError && user) {
          userId = user.id;
          console.log('User authenticated successfully:', userId);
        } else {
          console.log('User authentication failed:', getUserError);
          // Don't throw error, just proceed without user ID
        }
      } catch (err) {
        console.warn('Error while authenticating user. Proceeding as guest.', err);
        // Don't throw error, just proceed without user ID
      }
    } else {
      console.log('No authorization header, proceeding as guest checkout');
    }

    // Validate that we have the minimum required data for checkout
    if (!customer_email || !mode) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters',
        details: 'customer_email and mode are required for checkout'
      }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    console.log('Creating Stripe checkout session with params:', {
      customer_email,
      mode,
      has_line_items: !!line_items,
      has_price_id: !!price_id,
      has_user_id: !!userId,
      checkout_type: userId ? 'authenticated' : 'guest'
    });

    // Create Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer_email: customer_email,
      payment_method_types: ['card'],
      mode,
      success_url,
      cancel_url,
      customer_creation: 'always',
      // Add shipping address collection
      shipping_address_collection: {
        allowed_countries: ['GB', 'US', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'IE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SI', 'SK', 'LT', 'LV', 'EE', 'CY', 'MT', 'LU']
      },
      metadata: {
        ...(userId ? { user_id: userId } : {}),
        ...(metadata || {}),
        // Add order items to metadata for webhook processing
        items: line_items ? JSON.stringify(line_items) : (price_id ? JSON.stringify([{ price: price_id, quantity: 1 }]) : '[]'),
        order_type: line_items ? 'cart_checkout' : 'single_product'
      },
    };

    // Add line items with printful_variant_id metadata
    if (line_items) {
      // Enhance line items with printful_variant_id if available
      sessionParams.line_items = line_items.map(item => {
        const enhancedItem = { ...item };
        
        // If the item has printful_variant_id in metadata, preserve it
        if (item.metadata?.printful_variant_id) {
          enhancedItem.metadata = {
            ...enhancedItem.metadata,
            printful_variant_id: item.metadata.printful_variant_id
          };
        }
        
        return enhancedItem;
      });
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

    // Validate session parameters
    console.log('Final session parameters:', JSON.stringify(sessionParams, null, 2));
    
    if (!sessionParams.success_url || !sessionParams.cancel_url) {
      console.error('Missing required URLs:', { success_url: sessionParams.success_url, cancel_url: sessionParams.cancel_url });
      return new Response(JSON.stringify({ error: 'Missing required success_url or cancel_url' }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    console.log('Calling Stripe API to create checkout session...');
    
    try {
      // Measure Stripe API call performance
      const session = await measureAsyncOperation(
        () => stripe!.checkout.sessions.create(sessionParams),
        'Stripe checkout session creation'
      );
      
      console.log('Stripe API call completed successfully');
      console.log(`Created checkout session ${session.id} for email ${customer_email}`);

      return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      performanceMonitor.incrementErrorCount();
      
      return new Response(JSON.stringify({ 
        error: 'Failed to create Stripe checkout session',
        details: stripeError.message || 'Unknown Stripe error'
      }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error('Checkout error:', err);
    performanceMonitor.incrementErrorCount();
    
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } finally {
    performanceMonitor.end(200);
  }
});