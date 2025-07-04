import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
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

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { price_id, success_url, cancel_url, mode } = await req.json();

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment'] }, // Only 'payment' mode is supported now
      },
    );

    if (error) {
      return corsResponse({ error }, 400);
    }

    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

      if (getUserError) {
        console.error('Failed to authenticate user with provided token:', getUserError);
        // Continue without user if authentication fails, treat as guest
      } else if (user) {
        userId = user.id;
      }
    }

    let customerId: string | null = null;

    if (userId) {
      // Try to find an existing Stripe customer for the authenticated user
      const { data: customer, error: getCustomerError } = await supabase
        .from('stripe_customers')
        .select('customer_id')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .maybeSingle();

      if (getCustomerError) {
        console.error('Failed to fetch customer information from the database for user:', getCustomerError);
        // Continue without customerId if there's an error, a new one will be created
      } else if (customer?.customer_id) {
        customerId = customer.customer_id;
      }
    }

    // If no customerId found (either guest or new authenticated user), create a new Stripe customer
    if (!customerId) {
      const customerData: Stripe.CustomerCreateParams = {};
      if (userId) {
        // If authenticated, try to get email and link customer
        const { data: { user: authenticatedUser } } = await supabase.auth.admin.getUserById(userId);
        if (authenticatedUser?.email) {
          customerData.email = authenticatedUser.email;
        }
        customerData.metadata = { userId: userId };
      } else {
        // For guest users, you might want to add some identifier or just leave it
        customerData.description = 'Guest customer from Bolt checkout';
      }

      const newCustomer = await stripe.customers.create(customerData);
      customerId = newCustomer.id;

      // Only save the customer record if we have a userId to link it to
      if (userId) {
        const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
          user_id: userId,
          customer_id: newCustomer.id,
        });

        if (createCustomerError) {
          console.error('Failed to save new customer information in the database:', createCustomerError);
          // Proceed with checkout even if we couldn't save the customer mapping
        }
      }
      
      console.log(`Created new Stripe customer: ${customerId} (linked to user ${userId || 'guest'})`);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode,
      success_url,
      cancel_url,
    });

    console.log(`Created checkout session ${session.id} for customer ${customerId}`);

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}