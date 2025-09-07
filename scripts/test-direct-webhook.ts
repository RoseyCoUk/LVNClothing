/**
 * Direct Webhook Test
 * 
 * This script directly tests the webhook processing logic
 * without Stripe signature validation for easier testing
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Configuration  
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51RgXVS6AAjJ6M3ikG5XVOKBGvvihxM2n1M0Xq7cY0rxTJyT0CBFf5cUUa6lvOMqXuv0txfVV7zz3yMVuuNacksbV00nduum9x4';
const SUPABASE_URL = 'http://127.0.0.1:54321'; // Use local Supabase
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Initialize clients
const stripe = new Stripe(STRIPE_SECRET_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test data
const testCustomerEmail = 'test.customer@example.com';
const testShippingAddress = {
  name: 'John Doe',
  address: {
    line1: '123 Test Street',
    line2: 'Apt 4B',
    city: 'London',
    state: '',
    postal_code: 'SW1A 1AA',
    country: 'GB'
  }
};

const testItems = [
  {
    product_id: 'reform-uk-classic-tshirt',
    product_name: 'Reform UK Classic T-Shirt',
    printful_variant_id: '12344567890',
    quantity: 2,
    unit_price: 2499, // £24.99 in pence
    variants: {
      color: 'Navy Blue',
      size: 'Large',
      gender: 'Unisex'
    }
  },
  {
    product_id: 'reform-uk-cap',
    product_name: 'Reform UK Cap',
    printful_variant_id: '9876543210',
    quantity: 1,
    unit_price: 1999, // £19.99 in pence
    variants: {
      color: 'Black',
      size: 'One Size'
    }
  }
];

const testOrderData = {
  subtotal: 6997, // £69.97 in pence (24.99*2 + 19.99)
  shipping_cost: 495, // £4.95 in pence
  total_amount: 7492, // £74.92 in pence
  currency: 'gbp'
};

// Generate readable order ID
function generateReadableOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RUK-${timestamp.slice(-6)}${random}`;
}

/**
 * Create a test PaymentIntent
 */
async function createTestPaymentIntent(): Promise<Stripe.PaymentIntent> {
  console.log('🔄 Creating test PaymentIntent...');
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: testOrderData.total_amount,
    currency: testOrderData.currency,
    payment_method_types: ['card'],
    metadata: {
      customer_email: testCustomerEmail,
      items: JSON.stringify(testItems),
      shipping_address: JSON.stringify(testShippingAddress),
      subtotal: (testOrderData.subtotal / 100).toString(),
      shipping_cost: (testOrderData.shipping_cost / 100).toString(),
      guest_checkout: 'true'
    },
    // Automatically confirm for testing
    confirm: true,
    payment_method: 'pm_card_visa',
    return_url: 'http://localhost:5173/checkout/success'
  });

  console.log(`✅ PaymentIntent created and confirmed: ${paymentIntent.id}`);
  console.log(`   Status: ${paymentIntent.status}`);
  
  return paymentIntent;
}

/**
 * Directly process the payment intent without webhook signature validation
 */
async function processPaymentIntentDirectly(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log('🔄 Processing PaymentIntent directly...');
  
  try {
    // Check if order already exists to prevent duplicates (idempotency)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, readable_order_id')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();
      
    if (existingOrder) {
      console.log(`✅ Order already exists: ${existingOrder.readable_order_id}`);
      return;
    }
    
    // Extract data from payment intent metadata
    const metadata = paymentIntent.metadata;
    if (!metadata.customer_email) {
      throw new Error('Missing customer_email in payment intent metadata');
    }
    
    if (!metadata.items) {
      throw new Error('Missing items in payment intent metadata');
    }
    
    let items, shippingAddress;
    try {
      items = JSON.parse(metadata.items);
      shippingAddress = JSON.parse(metadata.shipping_address || '{}');
    } catch (parseError) {
      throw new Error('Invalid JSON in payment intent metadata');
    }
    
    // Create the order
    const readableOrderId = generateReadableOrderId();
    const orderData = {
      stripe_payment_intent_id: paymentIntent.id,
      customer_email: metadata.customer_email,
      user_id: metadata.user_id || null,
      readable_order_id: readableOrderId,
      order_number: readableOrderId, // Required field - use same as readable_order_id
      status: 'paid',
      total_amount: paymentIntent.amount / 100, // Convert from cents to pounds
      currency: paymentIntent.currency.toUpperCase(),
      items: items,
      shipping_address: shippingAddress,
      shipping_cost: parseFloat(metadata.shipping_cost || '0'),
      subtotal: parseFloat(metadata.subtotal || '0'),
      guest_checkout: metadata.guest_checkout === 'true',
      created_at: new Date().toISOString()
    };

    console.log(`🔄 Creating order for payment intent ${paymentIntent.id}`);
    
    // Insert order into database
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, readable_order_id')
      .single();
      
    if (orderError) {
      console.error('❌ Order creation failed:', orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log(`✅ Order created successfully: ${newOrder.readable_order_id} (ID: ${newOrder.id})`);
    
    // Test sending order confirmation emails
    await sendOrderEmails(newOrder.id, metadata.customer_email, items, shippingAddress, {
      subtotal: parseFloat(metadata.subtotal || '0'),
      shipping_cost: parseFloat(metadata.shipping_cost || '0'),
      total_amount: paymentIntent.amount / 100,
      readable_order_id: newOrder.readable_order_id
    });
    
  } catch (error) {
    console.error('❌ Error processing payment intent:', error);
    throw error;
  }
}

/**
 * Send order confirmation emails (modified from webhook function)
 */
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
  console.log('🔄 Testing email sending...');
  
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log('⚠️  RESEND_API_KEY not configured - skipping email test');
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
    console.log('🔄 Sending customer order confirmation email...');
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
      console.error('❌ Failed to send customer email:', error);
    } else {
      const result = await customerEmailResponse.json();
      console.log('✅ Customer order confirmation email sent:', result.id);
    }

    // Send admin notification
    console.log('🔄 Sending admin notification email...');
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
      console.error('❌ Failed to send admin email:', error);
    } else {
      const result = await adminEmailResponse.json();
      console.log('✅ Admin notification email sent:', result.id);
    }
  } catch (error) {
    console.error('❌ Error sending emails:', error);
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

/**
 * Verify order was created successfully
 */
async function verifyOrderCreation(paymentIntentId: string): Promise<any> {
  console.log('🔄 Verifying order creation...');
  
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (error) {
    console.error('❌ Order not found:', error);
    return null;
  }

  console.log('✅ Order verified in database:');
  console.log(`   Order ID: ${order.id}`);
  console.log(`   Readable ID: ${order.readable_order_id}`);
  console.log(`   Customer: ${order.customer_email}`);
  console.log(`   Status: ${order.status}`);
  console.log(`   Total: £${order.total_amount.toFixed(2)}`);
  console.log(`   Items: ${order.items.length} items`);
  
  return order;
}

/**
 * Clean up test data
 */
async function cleanupTestData(paymentIntentId: string): Promise<void> {
  console.log('🔄 Cleaning up test data...');
  
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (error) {
    console.log('⚠️  Could not delete test order:', error.message);
  } else {
    console.log('✅ Test order deleted');
  }
}

/**
 * Main test execution
 */
async function runDirectWebhookTest(): Promise<void> {
  console.log('🚀 Starting Direct Webhook Test');
  console.log('================================\n');

  let paymentIntent: Stripe.PaymentIntent | null = null;

  try {
    // Step 1: Create and confirm PaymentIntent
    paymentIntent = await createTestPaymentIntent();
    console.log();

    // Step 2: Process the payment intent directly
    await processPaymentIntentDirectly(paymentIntent);
    console.log();

    // Step 3: Verify order creation
    const order = await verifyOrderCreation(paymentIntent.id);
    console.log();

    if (order) {
      console.log('🎉 Direct Webhook Test - SUCCESS!');
      console.log('================================');
      console.log('✅ PaymentIntent created and confirmed');
      console.log('✅ Order processed directly');
      console.log('✅ Order saved to database');
      console.log('✅ Email notifications attempted');
    } else {
      throw new Error('Order verification failed');
    }

  } catch (error) {
    console.error('\n❌ Direct Webhook Test - FAILED!');
    console.error('================================');
    console.error('Error:', error.message);
    
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }

  } finally {
    // Cleanup
    if (paymentIntent) {
      await cleanupTestData(paymentIntent.id);
    }
  }
}

// Run the test
runDirectWebhookTest().catch(console.error);