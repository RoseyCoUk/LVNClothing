import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nsmrxwnrtsllxvplazmm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNDg1NDQxMSwiZXhwIjoyMDMwNDMwNDExfQ.cCDbJTKCLe5TlQpLAsOgrL0qLmTVMQ-jYvJYDGUP7zk'
);

async function checkRecentOrders() {
  console.log('🔍 Checking recent orders and webhook events...\n');

  // Check recent orders
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, readable_order_id, customer_email, status, created_at, stripe_payment_intent_id')
    .order('created_at', { ascending: false })
    .limit(5);

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  } else {
    console.log('📦 Recent Orders:');
    console.log('================');
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        console.log(`\nOrder: ${order.readable_order_id || order.id}`);
        console.log(`  Customer: ${order.customer_email}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Created: ${new Date(order.created_at).toLocaleString()}`);
        console.log(`  Payment Intent: ${order.stripe_payment_intent_id || 'N/A'}`);
      });
    } else {
      console.log('No recent orders found');
    }
  }

  // Check webhook events
  const { data: webhookEvents, error: webhookError } = await supabase
    .from('webhook_events')
    .select('event_id, event_type, processed, created_at, error')
    .order('created_at', { ascending: false })
    .limit(10);

  if (webhookError) {
    // Table might not exist
    console.log('\n⚠️  webhook_events table not found or inaccessible');
  } else {
    console.log('\n\n🎯 Recent Webhook Events:');
    console.log('========================');
    if (webhookEvents && webhookEvents.length > 0) {
      webhookEvents.forEach(event => {
        console.log(`\nEvent: ${event.event_id}`);
        console.log(`  Type: ${event.event_type}`);
        console.log(`  Processed: ${event.processed ? '✅' : '❌'}`);
        console.log(`  Created: ${new Date(event.created_at).toLocaleString()}`);
        if (event.error) {
          console.log(`  Error: ${event.error}`);
        }
      });
    } else {
      console.log('No webhook events found - webhooks may not be configured correctly');
    }
  }

  // Check if payment intents from the console logs exist
  const testPaymentIntents = [
    'pi_3S4ZFb6AAjJ6M3ik01lcJCJ3',
    'pi_3S4YmU6AAjJ6M3ik0782Ep5f'
  ];

  console.log('\n\n🔍 Checking for specific payment intents from your recent tests:');
  console.log('================================================================');
  
  for (const pi of testPaymentIntents) {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', pi)
      .single();
    
    if (order) {
      console.log(`✅ Found order for ${pi}: ${order.readable_order_id}`);
    } else {
      console.log(`❌ No order found for ${pi} - webhook was not processed`);
    }
  }
}

checkRecentOrders();