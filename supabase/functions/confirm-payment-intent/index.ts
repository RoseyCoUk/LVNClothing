import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { createPerformanceMonitor, measureAsyncOperation } from '../_shared/performance.ts';

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'http://127.0.0.1:54321';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZXZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Initialize Stripe
let stripe: Stripe | null = null;
if (stripeSecret) {
  stripe = new Stripe(stripeSecret, {
    appInfo: {
      name: 'Reform UK Store',
      version: '1.0.0',
    },
    timeout: 30000,
    maxNetworkRetries: 3,
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
  let allow: string;
  if (!origin || origin === 'null' || origin.startsWith('file://')) {
    allow = "*";
  } else if (allowed.has(origin)) {
    allow = origin;
  } else {
    allow = "https://backreform.co.uk";
  }
  
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  };
}

interface ConfirmPaymentRequest {
  payment_intent_id: string;
}

interface ConfirmPaymentResponse {
  success: boolean;
  payment_status: string;
  message: string;
}

// This function now ONLY verifies payment status
// All order creation is handled by the Stripe webhook (stripe-webhook2)
// This prevents the race condition that was causing duplicate orders

serve(async (req: Request) => {
  const performanceMonitor = createPerformanceMonitor('confirm-payment-intent', req);
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

    if (!stripe) {
      return new Response(JSON.stringify({ 
        error: 'Stripe is not configured',
        details: 'Please set STRIPE_SECRET_KEY in your environment variables'
      }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const { payment_intent_id }: ConfirmPaymentRequest = await req.json();

    if (!payment_intent_id) {
      return new Response(JSON.stringify({ error: 'Payment intent ID is required' }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    console.log('Confirming payment intent:', payment_intent_id);

    // Retrieve the payment intent from Stripe
    const paymentIntent = await measureAsyncOperation(
      () => stripe!.paymentIntents.retrieve(payment_intent_id),
      'Stripe payment intent retrieval'
    );

    console.log('Payment intent status:', paymentIntent.status);

    // Check if payment was successful
    if (paymentIntent.status === 'succeeded') {
      // Just return success - webhook will handle all order creation
      const response: ConfirmPaymentResponse = {
        success: true,
        payment_status: paymentIntent.status,
        message: 'Payment confirmed successfully'
      };
      
      console.log('Payment confirmed successfully for intent:', payment_intent_id);
      console.log('Webhook will handle order creation to prevent race condition');

      return new Response(JSON.stringify(response), {
        headers: { ...headers, "Content-Type": "application/json" },
      });

    } else {
      // Payment not successful
      const response: ConfirmPaymentResponse = {
        success: false,
        payment_status: paymentIntent.status,
        message: `Payment not successful. Status: ${paymentIntent.status}`
      };

      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error('Payment confirmation error:', error);
    performanceMonitor.incrementErrorCount();
    
    return new Response(JSON.stringify({ 
      success: false,
      payment_status: 'error',
      message: 'Failed to confirm payment',
      details: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } finally {
    performanceMonitor.end(200);
  }
});