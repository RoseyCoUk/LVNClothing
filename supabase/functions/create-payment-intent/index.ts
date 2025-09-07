import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
// Temporarily removed performance monitoring to debug 500 error
// import { createPerformanceMonitor, measureAsyncOperation } from '../_shared/performance.ts';
import { generateCartIdempotencyKey } from '../_shared/idempotency.ts';
import { getFallbackPrice, isVariantSupported } from '../_shared/variant-fallback.ts';

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

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  printful_variant_id: string | number; // Can be string or number from frontend
  product_type?: string;
  isDiscount?: boolean; // Whether this item is a discount (not to be sent to Printful)
}

interface ShippingAddress {
  name: string;
  address1: string;
  city: string;
  state_code?: string;
  country_code: string;
  zip: string;
}

interface PaymentIntentRequest {
  items: CartItem[];
  shipping_address: ShippingAddress;
  customer_email: string;
  currency?: string;
  metadata?: Record<string, string>;
  guest_checkout?: boolean;
}

interface PaymentIntentResponse {
  client_secret: string;
  amount: number;
  currency: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  payment_intent_id: string;
}

// Function to get product prices from our database/variant system
async function getProductPrice(printfulVariantId: string | number): Promise<number> {
  try {
    // Convert to string for database lookup (database stores as string)
    const variantIdStr = String(printfulVariantId);
    
    // First try to get price from product_variants table
    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('price')
      .eq('printful_variant_id', variantIdStr)
      .single();
    
    if (!error && variant?.price) {
      console.log(`✅ Found price in database: ${variantIdStr} = £${variant.price}`);
      return parseFloat(variant.price);
    }
    
    console.log(`⚠️ Database lookup failed for variant ${variantIdStr}, trying fallback...`);
    
    // Try fallback pricing system
    const fallbackPrice = getFallbackPrice(variantIdStr);
    if (fallbackPrice) {
      console.log(`✅ Found fallback price: ${variantIdStr} = £${fallbackPrice}`);
      return fallbackPrice;
    }
    
    console.log(`❌ No fallback price found for variant ${variantIdStr}`);
    
    // Last resort: Return default prices based on product type
    // This is a temporary fallback - in production you should have all prices in DB
    const defaultPrices: { [key: string]: number } = {
      // T-shirts
      'tshirt': 24.99,
      // Hoodies  
      'hoodie': 39.99,
      // Caps
      'cap': 19.99,
      // Mugs
      'mug': 19.99,
      // Tote bags
      'tote': 24.99,
      // Water bottles
      'water': 24.99,
      // Mouse pads
      'mousepad': 14.99
    };
    
    // Try to infer product type from variant ID or return default
    console.warn(`Price not found for variant ${printfulVariantId}, using fallback`);
    return defaultPrices['tshirt']; // Default fallback
    
  } catch (error) {
    console.error('Error getting product price:', error);
    return 24.99; // Safe fallback
  }
}

// Function to get shipping cost from Printful
async function getShippingCost(items: CartItem[], shippingAddress: ShippingAddress): Promise<number> {
  try {
    // Prepare request for shipping quotes
    const shippingRequest = {
      recipient: {
        name: shippingAddress.name,
        address1: shippingAddress.address1,
        city: shippingAddress.city,
        state_code: shippingAddress.state_code,
        country_code: shippingAddress.country_code,
        zip: shippingAddress.zip,
      },
      items: items
        .filter(item => !item.isDiscount) // Skip discount items for shipping
        .map(item => {
          // Parse the variant ID, handling non-numeric strings
          let variantId = item.printful_variant_id;
          if (typeof variantId === 'string') {
            const parsed = parseInt(variantId);
            // Only use parsed value if it's a valid number
            variantId = isNaN(parsed) ? 0 : parsed;
          }
          return {
            printful_variant_id: variantId,
            quantity: item.quantity
          };
        })
        .filter(item => item.printful_variant_id > 0) // Remove any invalid variant IDs
    };
    
    // Call our shipping-quotes function
    const { data, error } = await supabase.functions.invoke('shipping-quotes', {
      body: shippingRequest,
    });
    
    // Check for both possible response formats (shipping_rates or options)
    const rates = data?.shipping_rates || data?.options;
    
    if (error || !data || !rates || rates.length === 0) {
      console.warn('No shipping rates available, using default', { error, data });
      return 4.99; // Default shipping cost
    }
    
    // Use the first (cheapest) shipping option
    const cheapestRate = rates[0];
    return parseFloat(cheapestRate.rate) || 4.99;
    
  } catch (error) {
    console.error('Error getting shipping cost:', error);
    return 4.99; // Fallback shipping cost
  }
}

serve(async (req: Request) => {
  // const performanceMonitor = createPerformanceMonitor('create-payment-intent', req);
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

    // Check if Stripe is configured
    if (!stripe) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return new Response(JSON.stringify({ 
        error: 'Stripe is not configured',
        details: 'Please set STRIPE_SECRET_KEY in your environment variables',
        test_mode: true
      }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const requestBody: PaymentIntentRequest = await req.json();
    const { items, shipping_address, customer_email, currency = 'gbp', metadata = {}, guest_checkout = false } = requestBody;

    console.log('Creating payment intent for items:', items.length);
    console.log('Items received:', items.map(item => ({
      id: item.id,
      name: item.name,
      printful_variant_id: item.printful_variant_id,
      isDiscount: item.isDiscount
    })));

    // Validate required parameters
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    if (!shipping_address || !customer_email) {
      return new Response(JSON.stringify({ error: 'Missing shipping address or customer email' }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Get current user if authenticated
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader && !guest_checkout) {
      try {
        const token = authHeader.replace('Bearer ', '').trim();
        const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);
        if (!getUserError && user) {
          userId = user.id;
        }
      } catch (err) {
        console.warn('Could not authenticate user, proceeding as guest');
      }
    }

    // Separate discount items from regular items
    const regularItems = items.filter(item => !item.isDiscount);
    const discountItems = items.filter(item => item.isDiscount);
    
    // Calculate subtotal with real-time pricing (regular items only)
    let subtotal = 0;
    const enrichedItems = [];
    
    for (const item of regularItems) {
      // Always trust the price from frontend since it includes any promotions/discounts
      // The frontend has already validated prices through the product hooks
      const realPrice = item.price;
        
      const itemTotal = realPrice * item.quantity;
      subtotal += itemTotal;
      
      enrichedItems.push({
        ...item,
        real_price: realPrice,
        item_total: itemTotal
      });
    }
    
    // Add discount items to enriched items (they already have their prices)
    for (const discountItem of discountItems) {
      const itemTotal = discountItem.price * discountItem.quantity;
      subtotal += itemTotal; // This will reduce the subtotal since price is negative
      
      enrichedItems.push({
        ...discountItem,
        real_price: discountItem.price,
        item_total: itemTotal,
        is_discount: true
      });
    }

    // Get shipping cost from Printful (regular items only, not discounts)
    console.log('Getting shipping cost for items:', regularItems.length, 'regular items');
    let shippingCost = 4.99; // Default fallback
    try {
      shippingCost = await getShippingCost(regularItems, shipping_address);
    } catch (shippingError) {
      console.error('Error calculating shipping cost:', shippingError);
      // Use default shipping cost if calculation fails
      shippingCost = 4.99;
    }

    // Calculate total
    const total = subtotal + shippingCost;
    const totalPence = Math.round(total * 100); // Convert to smallest currency unit

    console.log('Payment calculation:', {
      subtotal,
      shippingCost,
      total,
      totalPence,
      currency
    });

    // Prepare metadata for the payment intent
    // Create simplified items for metadata (Stripe has 500 char limit per value)
    const simplifiedItems = enrichedItems.map(item => ({
      id: item.id,
      qty: item.quantity,
      price: item.real_price || item.price
    }));
    
    const paymentMetadata = {
      customer_email,
      subtotal: subtotal.toString(),
      shipping_cost: shippingCost.toString(),
      total: total.toString(),
      item_count: items.length.toString(),
      items: JSON.stringify(simplifiedItems), // Simplified to stay under 500 chars
      shipping_address: JSON.stringify(shipping_address),
      ...(userId ? { user_id: userId } : {}),
      guest_checkout: guest_checkout.toString(),
      ...metadata
    };

    // Generate idempotency key based on cart contents and customer data
    // This ensures the same cart + customer combination always generates the same key
    const idempotencyKey = await generateCartIdempotencyKey(
      customer_email,
      items,
      shipping_address
    );

    console.log(`Generated idempotency key: ${idempotencyKey}`);

    // Create the payment intent with idempotency key
    const paymentIntent = await stripe!.paymentIntents.create({
        amount: totalPence,
        currency: currency,
        metadata: paymentMetadata,
        automatic_payment_methods: {
          enabled: true,
        },
        // Set up for future payments if user is authenticated
        setup_future_usage: userId ? 'off_session' : undefined,
        shipping: {
          name: shipping_address.name,
          address: {
            line1: shipping_address.address1,
            city: shipping_address.city,
            state: shipping_address.state_code,
            postal_code: shipping_address.zip,
            country: shipping_address.country_code,
          },
        },
        receipt_email: customer_email,
      }, {
        idempotencyKey: idempotencyKey
      });

    console.log(`Created payment intent ${paymentIntent.id} for ${customer_email}`);

    const response: PaymentIntentResponse = {
      client_secret: paymentIntent.client_secret!,
      amount: totalPence,
      currency: currency,
      shipping_cost: shippingCost,
      subtotal: subtotal,
      total: total,
      payment_intent_id: paymentIntent.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...headers, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    console.error('Error stack:', error.stack);
    // performanceMonitor.incrementErrorCount();
    
    // Include more error details for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorDetails = {
      error: 'Failed to create payment intent',
      details: errorMessage,
      type: error?.constructor?.name || 'Unknown',
      // Include partial stack trace for debugging
      stack: error?.stack?.split('\n').slice(0, 3).join('\n')
    };
    
    return new Response(JSON.stringify(errorDetails), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } finally {
    // performanceMonitor.end(200);
  }
});