import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nsmrxwnrtsllxvplazmm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ4NTQ0MTEsImV4cCI6MjAzMDQzMDQxMX0.bQDRj0qXiOvSUPI5gRb_PkyEN_1YP43OQFzpHcaCNgg'
);

async function checkOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, readable_order_id, customer_email, status, created_at, stripe_payment_intent_id')
    .eq('customer_email', 'apiekus20@gmail.com')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching orders:', error);
    return;
  }

  console.log('\n📦 Recent orders for apiekus20@gmail.com:');
  console.log('=====================================');
  
  if (!data || data.length === 0) {
    console.log('No orders found');
    return;
  }

  data.forEach(order => {
    console.log(`\nOrder ID: ${order.readable_order_id || order.id}`);
    console.log(`Status: ${order.status}`);
    console.log(`Created: ${new Date(order.created_at).toLocaleString()}`);
    console.log(`Payment Intent: ${order.stripe_payment_intent_id || 'N/A'}`);
  });
}

checkOrders();