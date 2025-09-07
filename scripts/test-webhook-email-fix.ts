#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Checking recent webhook events...\n');

async function checkRecentWebhooks() {
  try {
    // Get recent webhook events
    const { data: webhooks, error } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('event_type', 'payment_intent.succeeded')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching webhooks:', error);
      return;
    }

    if (!webhooks || webhooks.length === 0) {
      console.log('No recent payment_intent.succeeded webhooks found');
      return;
    }

    console.log(`Found ${webhooks.length} recent payment_intent.succeeded webhooks:\n`);

    webhooks.forEach((webhook, index) => {
      console.log(`\n=== Webhook ${index + 1} ===`);
      console.log(`Event ID: ${webhook.event_id}`);
      console.log(`Created: ${webhook.created_at}`);
      console.log(`Processed: ${webhook.processed ? '✅' : '❌'}`);
      
      if (webhook.error) {
        console.log(`Error: ${webhook.error}`);
      }

      // Check payload for email data
      if (webhook.payload?.data?.object) {
        const paymentIntent = webhook.payload.data.object;
        console.log(`Payment Intent ID: ${paymentIntent.id}`);
        console.log(`Receipt Email: ${paymentIntent.receipt_email || 'Not set'}`);
        
        if (paymentIntent.metadata) {
          console.log('Metadata:');
          console.log(`  - customer_email: ${paymentIntent.metadata.customer_email || 'Not set'}`);
          console.log(`  - items: ${paymentIntent.metadata.items ? '✅' : '❌'}`);
          console.log(`  - shipping_address: ${paymentIntent.metadata.shipping_address ? '✅' : '❌'}`);
        }
      }
    });

    // Check recent orders
    console.log('\n\n=== Recent Orders ===');
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('readable_order_id, customer_email, stripe_payment_intent_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (orderError) {
      console.error('Error fetching orders:', orderError);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('No recent orders found');
      return;
    }

    orders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order ${order.readable_order_id}`);
      console.log(`   Email: ${order.customer_email || '❌ MISSING'}`);
      console.log(`   Payment Intent: ${order.stripe_payment_intent_id}`);
      console.log(`   Created: ${order.created_at}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkRecentWebhooks();