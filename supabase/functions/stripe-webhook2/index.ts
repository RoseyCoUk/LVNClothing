// No auth required for Stripe webhooks

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";
// Remove old serve import - using Deno.serve instead
import { createPrintfulFulfillment, type OrderData } from '../_shared/printful-fulfillment.ts';

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Reform UK Store',
    version: '2.0.0',
  },
  timeout: 30000,
  maxNetworkRetries: 3,
});

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate readable order ID
function generateReadableOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RUK-${timestamp.slice(-6)}${random}`;
}

// Send order confirmation emails
async function sendOrderEmails(
  orderId: string,
  customerEmail: string,
  items: any[],
  shippingAddress: any,
  orderDetails: {
    subtotal: number;
    shipping_cost: number;
    total_amount: number;
    readable_order_id: string;
  }
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured - skipping email');
    return;
  }

  // Format items for email
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.product_name}</strong>
        ${item.variants ? `<br><small style="color: #6b7280;">${formatVariants(item.variants)}</small>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${(item.unit_price / 100).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">£${((item.unit_price * item.quantity) / 100).toFixed(2)}</td>
    </tr>
  `).join('');

  // Customer email template
  const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation - Reform UK Store</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #009fe3 0%, #0066cc 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0;">Order Confirmation</h1>
    <p style="margin: 10px 0 0 0;">Thank you for your order!</p>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2>Order #${orderDetails.readable_order_id}</h2>
    <p>Hi ${shippingAddress.name || customerEmail},</p>
    <p>We've received your order and it's being processed. You'll receive another email when your items ship.</p>
    
    <h3>Order Details:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 12px; text-align: left;">Item</th>
          <th style="padding: 12px; text-align: center;">Qty</th>
          <th style="padding: 12px; text-align: right;">Price</th>
          <th style="padding: 12px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Subtotal:</strong></td>
          <td style="padding: 12px; text-align: right;">£${orderDetails.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Shipping:</strong></td>
          <td style="padding: 12px; text-align: right;">£${orderDetails.shipping_cost.toFixed(2)}</td>
        </tr>
        <tr style="background: #f3f4f6;">
          <td colspan="3" style="padding: 12px; text-align: right;"><strong>Total:</strong></td>
          <td style="padding: 12px; text-align: right;"><strong>£${orderDetails.total_amount.toFixed(2)}</strong></td>
        </tr>
      </tfoot>
    </table>
    
    <h3>Shipping Address:</h3>
    <p style="background: white; padding: 15px; border-radius: 5px;">
      ${shippingAddress.name}<br>
      ${shippingAddress.address.line1}<br>
      ${shippingAddress.address.line2 ? shippingAddress.address.line2 + '<br>' : ''}
      ${shippingAddress.address.city}, ${shippingAddress.address.state || ''} ${shippingAddress.address.postal_code}<br>
      ${shippingAddress.address.country}
    </p>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
      If you have any questions, please contact us at support@backreform.co.uk
    </p>
  </div>
</body>
</html>
  `;

  // Admin notification email
  const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Order - ${orderDetails.readable_order_id}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h1>New Order Received</h1>
  <p><strong>Order ID:</strong> ${orderDetails.readable_order_id}</p>
  <p><strong>Customer:</strong> ${customerEmail}</p>
  <p><strong>Total:</strong> £${orderDetails.total_amount.toFixed(2)}</p>
  
  <h2>Items Ordered:</h2>
  <table border="1" cellpadding="10" style="border-collapse: collapse;">
    <tr>
      <th>Item</th>
      <th>Quantity</th>
      <th>Price</th>
      <th>Total</th>
    </tr>
    ${itemsHtml}
  </table>
  
  <h2>Shipping Details:</h2>
  <p>
    ${shippingAddress.name}<br>
    ${shippingAddress.address.line1}<br>
    ${shippingAddress.address.line2 ? shippingAddress.address.line2 + '<br>' : ''}
    ${shippingAddress.address.city}, ${shippingAddress.address.state || ''} ${shippingAddress.address.postal_code}<br>
    ${shippingAddress.address.country}
  </p>
</body>
</html>
  `;

  try {
    // Send customer email
    const customerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        to: customerEmail,
        from: 'support@backreform.co.uk',
        subject: `Order Confirmation - ${orderDetails.readable_order_id}`,
        html: customerEmailHtml,
      }),
    });

    if (!customerEmailResponse.ok) {
      const error = await customerEmailResponse.text();
      console.error('Failed to send customer email:', error);
    } else {
      console.log('Customer order confirmation email sent to:', customerEmail);
    }

    // Send admin notification
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        to: 'support@backreform.co.uk',
        from: 'support@backreform.co.uk',
        subject: `New Order: ${orderDetails.readable_order_id} - £${orderDetails.total_amount.toFixed(2)}`,
        html: adminEmailHtml,
      }),
    });

    if (!adminEmailResponse.ok) {
      const error = await adminEmailResponse.text();
      console.error('Failed to send admin email:', error);
    } else {
      console.log('Admin notification email sent to support@backreform.co.uk');
    }
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
}

// Format product variants for display
function formatVariants(variants: any): string {
  const parts = [];
  if (variants.color) parts.push(`Color: ${variants.color}`);
  if (variants.size) parts.push(`Size: ${variants.size}`);
  if (variants.gender) parts.push(`Gender: ${variants.gender}`);
  return parts.join(' | ');
}

const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  // Only process POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  console.log('Stripe webhook received');
  
  let body: string;
  try {
    body = await req.text();
  } catch (err) {
    console.error('Failed to read request body:', err);
    return new Response('Invalid request body', { status: 400 });
  }

  // Stripe signature verification
  let event: Stripe.Event;
  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing Stripe signature header');
      return new Response('Missing Stripe signature', { status: 400 });
    }
    
    event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    console.log('Stripe event parsed successfully:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    // Check if we've already processed this webhook to prevent duplicates
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id, processed')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      console.log(`Webhook ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ received: true, already_processed: true }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log the webhook event for audit trail
    await supabase.from('webhook_events').insert({
      source: 'stripe',
      event_id: event.id,
      event_type: event.type,
      payload: event,
      processed: false,
      created_at: new Date().toISOString()
    });

    console.log(`Processing Stripe event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        return await handlePaymentIntentSucceeded(event);
        
      case 'checkout.session.completed':
        // Legacy support - but payment_intent.succeeded is now primary
        console.log('Received checkout.session.completed - consider migrating to payment_intent.succeeded');
        return await handleLegacyCheckoutSession(event);
        
      default:
        console.log('Unhandled event type:', event.type);
        
        // Mark as processed even for unhandled events
        await supabase
          .from('webhook_events')
          .update({ 
            processed: true, 
            processed_at: new Date().toISOString() 
          })
          .eq('event_id', event.id);
          
        return new Response(
          JSON.stringify({ received: true, message: 'Event type not handled' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Handler error:', error);
    
    // Mark webhook as failed
    await supabase
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      })
      .eq('event_id', event.id);
    
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

async function handlePaymentIntentSucceeded(event: Stripe.Event): Promise<Response> {
  const webhookPaymentIntent = event.data.object as Stripe.PaymentIntent;
  console.log(`Processing payment_intent.succeeded: ${webhookPaymentIntent.id}`);
  
  try {
    // Retrieve the full payment intent from Stripe to ensure we have all metadata
    // Webhook payloads sometimes don't include all fields
    const paymentIntent = await stripe.paymentIntents.retrieve(webhookPaymentIntent.id, {
      expand: ['customer'] // Expand customer if needed
    });
    
    console.log('Retrieved full payment intent from Stripe');
    
    // Check if order already exists to prevent duplicates (idempotency)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, readable_order_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();
      
    if (existingOrder) {
      console.log(`Order already exists for payment intent ${paymentIntent.id}: ${existingOrder.readable_order_id}`);
      
      // Mark webhook as processed
      await supabase
        .from('webhook_events')
        .update({ 
          processed: true, 
          processed_at: new Date().toISOString() 
        })
        .eq('event_id', event.id);
      
      return new Response(JSON.stringify({ 
        success: true, 
        order_id: existingOrder.id,
        message: 'Order already exists'
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Extract data from payment intent metadata
    const metadata = paymentIntent.metadata || {};
    console.log('Payment intent metadata:', JSON.stringify(metadata));
    console.log('Payment intent receipt_email:', paymentIntent.receipt_email);
    
    // Get customer email from metadata or receipt_email
    const customerEmail = metadata.customer_email || paymentIntent.receipt_email;
    if (!customerEmail) {
      console.error('No customer email found in metadata or receipt_email');
      console.error('Metadata:', metadata);
      console.error('Receipt email:', paymentIntent.receipt_email);
      throw new Error('Missing customer_email in payment intent');
    }
    
    if (!metadata.items) {
      console.error('No items found in metadata');
      console.error('Metadata:', metadata);
      throw new Error('Missing items in payment intent metadata');
    }
    
    let items, shippingAddress;
    try {
      // Try direct parsing first (for properly formatted JSON)
      items = typeof metadata.items === 'string' ? JSON.parse(metadata.items) : metadata.items;
      shippingAddress = typeof metadata.shipping_address === 'string' 
        ? JSON.parse(metadata.shipping_address || '{}') 
        : (metadata.shipping_address || {});
    } catch (parseError) {
      // If direct parsing fails, try to fix malformed JSON
      console.error('Direct JSON parsing failed, attempting to fix:', parseError);
      try {
        const itemsStr = metadata.items.replace(/\\"/g, '"');
        items = JSON.parse(itemsStr);
        
        const addressStr = (metadata.shipping_address || '{}').replace(/\\"/g, '"');
        shippingAddress = JSON.parse(addressStr);
      } catch (secondError) {
        console.error('Error parsing metadata after fix attempt:', secondError);
        console.error('Raw items:', metadata.items);
        console.error('Raw shipping_address:', metadata.shipping_address);
        throw new Error(`Invalid JSON in payment intent metadata: ${secondError.message}`);
      }
    }
    
    // Ensure items is an array
    if (!Array.isArray(items)) {
      console.error('Items is not an array:', items);
      throw new Error('Items must be an array');
    }
    
    // Look up printful_variant_id for each item from the database
    // The item.id might be a string like "hoodie-2XL-White" or a UUID
    const itemsWithPrintfulIds = await Promise.all(items.map(async (item) => {
      console.log(`Processing item: ${JSON.stringify(item)}`);
      
      // Skip discount items and bundle discounts
      if (item.id && (String(item.id).includes('discount') || String(item.id).includes('-discount'))) {
        return {
          ...item,
          printful_variant_id: null // Discounts don't have Printful IDs
        };
      }
      
      // Handle bundle items (e.g., starter-bundle-tshirt-0, activist-bundle-hoodie-1)
      if (item.id && String(item.id).includes('bundle')) {
        const bundleMatch = String(item.id).match(/^(.*?)-bundle-(.*?)(?:-(\d+))?$/);
        if (bundleMatch) {
          const bundleType = bundleMatch[1]; // 'starter', 'champion', 'activist'
          const productType = bundleMatch[2]; // 'tshirt', 'hoodie', 'cap', etc.
          
          console.log(`Bundle item detected: ${item.id} -> ${bundleType} bundle ${productType}`);
          
          // Use correct Printful sync variant IDs from database
          const BUNDLE_VARIANT_IDS: Record<string, number> = {
            'tshirt': 4938821288,  // Default t-shirt variant ID (Black, Size M)
            't-shirt': 4938821288, 
            'hoodie': 4938800535,  // Default hoodie variant ID (Black, Size L)
            'cap': 4938937571,     // Cap variant ID (Black)
            'mug': 4938946337,     // Mug variant ID
            'totebag': 4937855201, // Tote bag variant ID
            'tote': 4937855201,
            'waterbottle': 4938941055, // Water bottle variant ID
            'water-bottle': 4938941055,
            'water': 4938941055,
            'mousepad': 4938942751, // Mouse pad variant ID
            'mouse-pad': 4938942751,
            'mouse': 4938942751
          };
          
          const printfulVariantId = BUNDLE_VARIANT_IDS[productType];
          
          if (printfulVariantId) {
            console.log(`Found bundle variant: ${productType} -> Printful ID ${printfulVariantId}`);
            return {
              ...item,
              printful_variant_id: printfulVariantId
            };
          } else {
            console.warn(`No variant mapping for bundle product type: ${productType}`);
            // Try to resolve from database as fallback
            const bundleProductMap: Record<string, string> = {
              'tshirt': 'Reform UK T-Shirt',
              't-shirt': 'Reform UK T-Shirt',
              'hoodie': 'Reform UK Hoodie', 
              'cap': 'Reform UK Cap',
              'mug': 'Reform UK Mug',
              'totebag': 'Reform UK Tote Bag',
              'tote': 'Reform UK Tote Bag',
              'waterbottle': 'Reform UK Water Bottle',
              'water-bottle': 'Reform UK Water Bottle',
              'mousepad': 'Reform UK Mouse Pad',
              'mouse-pad': 'Reform UK Mouse Pad'
            };
            
            const productName = bundleProductMap[productType];
            if (productName) {
              // Try database lookup as fallback
              const { data: product } = await supabase
                .from('products')
                .select('id')
                .ilike('name', `%${productName}%`)
                .limit(1)
                .single();
              
              if (product) {
                const { data: variant } = await supabase
                  .from('product_variants')
                  .select('printful_variant_id')
                  .eq('product_id', product.id)
                  .limit(1)
                  .single();
                
                if (variant) {
                  console.log(`Found fallback variant for ${productType}: ${variant.printful_variant_id}`);
                  return {
                    ...item,
                    printful_variant_id: variant.printful_variant_id
                  };
                }
              }
            }
          }
        }
      }
      
      // Parse the item ID to extract product type and variant details
      const itemIdStr = String(item.id);
      let variant = null;
      let error = null;
      
      // Check if it's a UUID format (36 characters with dashes)
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemIdStr);
      
      if (isUuid) {
        // Try direct lookup by UUID
        const result = await supabase
          .from('product_variants')
          .select('printful_variant_id')
          .eq('id', item.id)
          .single();
        variant = result.data;
        error = result.error;
      } else {
        // Parse string format like "hoodie-2XL-White", "tshirt-M-Black", or "301-Black"
        const parts = itemIdStr.split('-');
        let productType = '';
        let size = '';
        let color = '';
        
        // Check if first part is a number (like "301-Black")
        if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
          // This might be a Printful catalog variant ID or sync variant ID
          // Try to look up by the numeric ID directly
          const numericId = parseInt(parts[0]);
          console.log(`Trying to find variant with Printful ID: ${numericId}`);
          
          const { data: variantByPrintfulId } = await supabase
            .from('product_variants')
            .select('printful_variant_id')
            .eq('printful_variant_id', numericId)
            .single();
          
          if (variantByPrintfulId) {
            variant = variantByPrintfulId;
          } else {
            // If not found, try parsing as color variant
            // Format: number-color (e.g., "301-Black" might mean product 301 in Black)
            color = parts[1];
            // Try to find by color alone across all products
            const { data: variantsByColor } = await supabase
              .from('product_variants')
              .select('printful_variant_id')
              .ilike('color', color);
            
            if (variantsByColor && variantsByColor.length === 1) {
              variant = variantsByColor[0];
            }
          }
        } else if (parts.length >= 2) {
          // Extract product type (first part)
          productType = parts[0].toLowerCase();
          
          // Map product type to actual product name
          const productNameMap: Record<string, string> = {
            'hoodie': 'Unisex Hoodie DARK', // Default to DARK, will try LIGHT as fallback
            'tshirt': 'Unisex t-shirt DARK', // Default to DARK, will try LIGHT as fallback  
            't-shirt': 'Unisex t-shirt DARK',
            'cap': 'Reform UK Cap',
            'mug': 'Reform UK Mug',
            'totebag': 'Reform UK Tote Bag',
            'tote': 'Reform UK Tote Bag',
            'waterbottle': 'Reform UK Water Bottle',
            'water-bottle': 'Reform UK Water Bottle',
            'mousepad': 'Reform UK Mouse Pad',
            'mouse-pad': 'Reform UK Mouse Pad',
            // Also try to map numeric patterns
            '301': 'Reform UK Cap',  // Common cap product ID
            '302': 'Unisex t-shirt DARK',
            '303': 'Unisex Hoodie DARK'
          };
          
          const productName = productNameMap[productType];
          
          // Extract size and color (remaining parts)
          if (parts.length === 3) {
            // Format: product-size-color
            size = parts[1];
            color = parts[2];
          } else if (parts.length === 2) {
            // Format: product-color (for single-size items)
            color = parts[1];
          }
          
          if (productName) {
            // First, try to find the product (DARK variant first for t-shirts and hoodies)
            let product = null;
            const { data: darkProduct } = await supabase
              .from('products')
              .select('id')
              .eq('name', productName)
              .single();
            
            product = darkProduct;
            
            // If DARK variant not found and this is a t-shirt or hoodie, try LIGHT variant
            if (!product && (productType === 'tshirt' || productType === 't-shirt' || productType === 'hoodie')) {
              const lightProductName = productName.replace('DARK', 'LIGHT');
              const { data: lightProduct } = await supabase
                .from('products')
                .select('id')
                .eq('name', lightProductName)
                .single();
              product = lightProduct;
            }
            
            if (product) {
              console.log(`Found product: ${productName}, attempting variant lookup for size=${size}, color=${color}`);
              
              // Look up variant by product ID and attributes
              const query = supabase
                .from('product_variants')
                .select('printful_variant_id, size, color, value')
                .eq('product_id', product.id);
              
              if (size) query.ilike('size', size);
              if (color) query.ilike('color', color);
              
              const result = await query.single();
              variant = result.data;
              error = result.error;
              
              console.log(`Direct variant query result: ${variant?.printful_variant_id || 'null'}, error: ${error?.message || 'none'}`);
              
              // If direct match failed, try fuzzy matching from all variants
              if (error || !variant) {
                const allResult = await supabase
                  .from('product_variants')
                  .select('printful_variant_id, size, color, value')
                  .eq('product_id', product.id);
                
                console.log(`All variants for product: ${allResult.data?.length || 0} variants found`);
                
                if (allResult.data && allResult.data.length > 0) {
                  // Create a color mapping for common frontend->database color translations
                  const colorMapping: Record<string, string[]> = {
                    'autumn': ['Autumn', 'Orange', 'Brown', 'Rust', 'Burnt Orange'],
                    'black': ['Black', 'Charcoal', 'Dark Grey'],
                    'white': ['White', 'Off White', 'Ivory', 'Natural'],
                    'blue': ['Blue', 'Navy', 'Light Blue', 'Royal Blue'],
                    'grey': ['Grey', 'Gray', 'Sport Grey', 'Ash'],
                    'gray': ['Grey', 'Gray', 'Sport Grey', 'Ash'],
                    'green': ['Green', 'Forest Green', 'Olive'],
                    'red': ['Red', 'Crimson', 'Burgundy'],
                    'pink': ['Pink', 'Light Pink', 'Hot Pink']
                  };
                  
                  // Try to find variant by exact match first
                  variant = allResult.data.find(v => {
                    const sizeMatch = !size || v.size?.toLowerCase() === size.toLowerCase();
                    const colorMatch = !color || v.color?.toLowerCase() === color.toLowerCase();
                    return sizeMatch && colorMatch;
                  });
                  
                  // If exact match failed, try color mapping
                  if (!variant && color) {
                    const possibleColors = colorMapping[color.toLowerCase()] || [color];
                    variant = allResult.data.find(v => {
                      const sizeMatch = !size || v.size?.toLowerCase() === size.toLowerCase();
                      const colorMatch = possibleColors.some(pc => 
                        v.color?.toLowerCase().includes(pc.toLowerCase()) ||
                        pc.toLowerCase().includes(v.color?.toLowerCase() || '')
                      );
                      return sizeMatch && colorMatch;
                    });
                    
                    if (variant) {
                      console.log(`Found variant using color mapping: ${color} -> ${variant.color}`);
                    }
                  }
                  
                  // If still no match, try value field pattern matching
                  if (!variant) {
                    variant = allResult.data.find(v => {
                      if (v.value) {
                        const valueLower = v.value.toLowerCase();
                        const sizeMatch = !size || valueLower.includes(size.toLowerCase());
                        const colorMatch = !color || valueLower.includes(color.toLowerCase());
                        return sizeMatch && colorMatch;
                      }
                      return false;
                    });
                    
                    if (variant) {
                      console.log(`Found variant using value field: ${variant.value}`);
                    }
                  }
                  
                  // If still no match and it's a single variant product, use the first one
                  if (!variant && allResult.data.length === 1) {
                    variant = allResult.data[0];
                    console.log(`Using single available variant: ${variant.printful_variant_id}`);
                  }
                  
                  // Log all available variants for debugging
                  if (!variant) {
                    console.log(`No variant found for ${productName}. Available variants:`);
                    allResult.data.forEach(v => console.log(`  - Size: ${v.size}, Color: ${v.color}, Value: ${v.value}, Printful ID: ${v.printful_variant_id}`));
                  }
                }
              }
            } else {
              console.log(`No product found for name: ${productName}`);
            }
          }
        }
      }
      
      // Final fallback: try to find by value field matching the item ID
      if (!variant) {
        const { data: variantByValue } = await supabase
          .from('product_variants')
          .select('printful_variant_id')
          .eq('value', itemIdStr)
          .single();
        
        if (variantByValue) {
          variant = variantByValue;
          console.log(`Found variant by value field: ${itemIdStr}`);
        }
      }
      
      if (error || !variant) {
        console.warn(`Could not find variant for item ${item.id}:`, error);
        console.warn(`Tried: UUID lookup, string parsing, numeric ID, value field`);
        return {
          ...item,
          printful_variant_id: null
        };
      }
      
      return {
        ...item,
        printful_variant_id: variant.printful_variant_id
      };
    }));
    
    console.log('Items with Printful IDs:', itemsWithPrintfulIds.map(i => ({
      id: i.id,
      printful_variant_id: i.printful_variant_id
    })));
    
    // Create the order
    const readableOrderId = generateReadableOrderId();
    const orderData = {
      stripe_payment_intent_id: paymentIntent.id,
      customer_email: customerEmail, // Use the variable we defined above
      user_id: metadata.user_id || null,
      readable_order_id: readableOrderId,
      order_number: readableOrderId, // Required field - use same as readable_order_id
      status: 'paid',
      total_amount: paymentIntent.amount / 100, // Convert from cents to pounds
      currency: paymentIntent.currency.toUpperCase(),
      items: itemsWithPrintfulIds, // Use items with Printful IDs
      shipping_address: shippingAddress,
      shipping_cost: parseFloat(metadata.shipping_cost || '0'),
      subtotal: parseFloat(metadata.subtotal || '0'),
      guest_checkout: metadata.guest_checkout === 'true',
      created_at: new Date().toISOString()
    };

    console.log(`Creating order for payment intent ${paymentIntent.id}`);
    
    // Insert order into database
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, readable_order_id')
      .single();
      
    if (orderError) {
      console.error('Order creation failed:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log(`Order created successfully: ${newOrder.readable_order_id} (ID: ${newOrder.id})`);
    
    // Transform shipping address to the format expected by email template
    // The metadata has flat structure (address1, city, etc.) but email expects nested (address.line1, etc.)
    const formattedShippingAddress = {
      name: shippingAddress.name || '',
      address: {
        line1: shippingAddress.address1 || shippingAddress.line1 || '',
        line2: shippingAddress.address2 || shippingAddress.line2 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || shippingAddress.state_code || '',
        postal_code: shippingAddress.zip || shippingAddress.postal_code || '',
        country: shippingAddress.country_code || shippingAddress.country || 'GB'
      }
    };
    
    // Transform items to the format expected by email template
    // Items from metadata have {id, qty, price} but email expects {product_name, quantity, unit_price}
    const formattedItems = itemsWithPrintfulIds.map(item => {
      // Extract product name from ID (e.g., "activist-bundle-hoodie-0" -> "Activist Bundle Hoodie")
      let productName = item.id || 'Product';
      
      // Handle special cases like discounts
      if (productName.includes('discount')) {
        productName = 'Bundle Discount';
      } else {
        // Convert ID to readable name
        productName = productName
          .replace(/-\d+$/, '') // Remove trailing number
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      
      return {
        product_name: productName,
        quantity: item.qty || 1,
        unit_price: Math.round((item.price || 0) * 100), // Convert to pence
        variants: {} // Add variants if available
      };
    });
    
    // Send order confirmation emails (non-blocking)
    sendOrderEmails(newOrder.id, customerEmail, formattedItems, formattedShippingAddress, {
      subtotal: parseFloat(metadata.subtotal || '0'),
      shipping_cost: parseFloat(metadata.shipping_cost || '0'),
      total_amount: paymentIntent.amount / 100,
      readable_order_id: newOrder.readable_order_id
    }).then(() => {
      console.log('Order confirmation emails sent successfully');
    }).catch(error => {
      console.error('Failed to send order emails:', error);
      // Don't fail the webhook if email fails - order is already created
    });
    
    // Queue Printful fulfillment asynchronously (non-blocking)
    const fulfillmentData: OrderData = {
      id: newOrder.id,
      customer_email: customerEmail,
      items: itemsWithPrintfulIds, // Use items with Printful IDs for fulfillment
      shipping_address: shippingAddress,
      shipping_cost: parseFloat(metadata.shipping_cost || '0'),
      subtotal: parseFloat(metadata.subtotal || '0'),
      total_amount: paymentIntent.amount / 100
    };
    
    // Don't await - let fulfillment happen asynchronously
    createPrintfulFulfillment(fulfillmentData).then(result => {
      if (result.success) {
        console.log(`Printful fulfillment created successfully: ${result.printful_order_id}`);
      } else {
        console.error(`Printful fulfillment failed: ${result.error}`);
      }
    }).catch(error => {
      console.error('Printful fulfillment exception:', error);
    });
    
    // Mark webhook as successfully processed
    await supabase
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('event_id', event.id);

    return new Response(JSON.stringify({
      success: true,
      order_id: newOrder.id,
      readable_order_id: newOrder.readable_order_id,
      message: 'Order created successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
    
    // Mark webhook as failed
    await supabase
      .from('webhook_events')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      })
      .eq('event_id', event.id);
      
    throw error; // Re-throw to be caught by main handler
  }
}

// Legacy handler for backwards compatibility
async function handleLegacyCheckoutSession(event: Stripe.Event): Promise<Response> {
  console.log('Processing legacy checkout.session.completed event');
  
  // Mark as processed but don't create orders - payment_intent.succeeded will handle it
  await supabase
    .from('webhook_events')
    .update({ 
      processed: true, 
      processed_at: new Date().toISOString() 
    })
    .eq('event_id', event.id);
  
  return new Response(JSON.stringify({
    received: true,
    message: 'Legacy event processed - payment_intent.succeeded will create order'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Serve the webhook handler without authentication
Deno.serve(async (req: Request) => {
  try {
    return await handler(req);
  } catch (error) {
    console.error('Unhandled error in webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});