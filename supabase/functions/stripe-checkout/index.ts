import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

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
    const error = validateParameters(
      { price_id, line_items, metadata, success_url, cancel_url, mode, customer_email, shipping_rate_id },
      {
        cancel_url: 'string',
        price_id: 'optional_string',
        line_items: 'optional_array',
        metadata: 'optional_object',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
        customer_email: 'optional_string',
        shipping_rate_id: 'optional_string',
      },
    );

    if (error) {
      console.error('Parameter validation error:', error);
      return corsResponse({ error }, 400);
    }

    // Validate that either price_id or line_items is provided
    if (!price_id && !line_items) {
      return corsResponse({ error: 'Either price_id or line_items must be provided' }, 400);
    }

    // Validate line_items structure if provided
    if (line_items && Array.isArray(line_items)) {
      console.log('Validating line_items structure...');
      for (const item of line_items) {
        console.log('Validating item:', {
          has_price_data: !!item.price_data,
          has_currency: !!item.price_data?.currency,
          has_product_data: !!item.price_data?.product_data,
          has_unit_amount: !!item.price_data?.unit_amount,
          quantity: item.quantity,
          price_data: item.price_data
        });
        
        if (!item.price_data || !item.price_data.currency || !item.price_data.product_data || !item.price_data.unit_amount) {
          console.error('Invalid line_items structure:', item);
          return corsResponse({ error: 'Invalid line_items structure. Each item must have price_data with currency, product_data, and unit_amount' }, 400);
        }
        if (!item.quantity || item.quantity < 1) {
          console.error('Invalid quantity in line_items:', item);
          return corsResponse({ error: 'Invalid quantity in line_items. Quantity must be at least 1' }, 400);
        }
      }
      console.log('Line items validation passed');
    }

    let userId: string | null = null;
    let customerId: string | null = null;

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (token) {
      try {
        const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

        if (getUserError) {
          console.warn('JWT invalid or expired. Proceeding as guest.');
        } else if (user) {
          userId = user.id;
        }
      } catch (err) {
        console.warn('Error while authenticating user. Proceeding as guest.');
      }
    }

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

    // create Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: !customerId ? customer_email : undefined, // Only use customer_email for guest checkout
      payment_method_types: ['card'],
      mode,
      success_url,
      cancel_url,
      // Enable customer details collection for address and contact info
      customer_creation: 'always',
      collect_shipping_address: true,
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

    console.log(`Created checkout session ${session.id} for customer ${customerId}`);

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`Checkout error: ${errorMessage}`);
    return corsResponse({ error: errorMessage }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type OptionalExpectations<T> = { [K in keyof T]: ExpectedType | 'optional_string' };

function validateParameters<T extends Record<string, unknown>>(values: T, expected: OptionalExpectations<T>): string | undefined {
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
    } else if (expectation === 'optional_string') {
      if (value != null && typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else if (expectation === 'optional_array') {
      if (value != null && !Array.isArray(value)) {
        return `Expected parameter ${parameter} to be an array got ${JSON.stringify(value)}`;
      }
    } else if (expectation === 'optional_object') {
      if (value != null && typeof value !== 'object') {
        return `Expected parameter ${parameter} to be an object got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value as string)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}