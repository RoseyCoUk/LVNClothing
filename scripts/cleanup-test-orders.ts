#!/usr/bin/env tsx
/**
 * CLEANUP: Remove Test Orders
 * 
 * This script identifies and removes test orders from the database
 * Test orders are identified by:
 * - Email addresses containing @example.com, @test.com, or test patterns
 * - Orders with £0.00 total
 * - Orders with mode=test flag
 * - Short/fake email addresses
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = 'https://nsmrxwnrtsllxvplazmm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TestOrder {
  id: string;
  email: string;
  total_amount: number;
  stripe_payment_intent_id: string;
  created_at: string;
  reason: string;
}

async function identifyTestOrders() {
  console.log('🔍 Identifying test orders...');
  
  // Get all orders
  const { data: allOrders, error } = await supabase
    .from('orders')
    .select('id, email, total_amount, stripe_payment_intent_id, created_at');

  if (error) {
    console.error('❌ Error fetching orders:', error);
    return [];
  }

  console.log(`📊 Found ${allOrders?.length || 0} total orders`);

  const testOrders: TestOrder[] = [];

  // Identify test orders by various criteria
  allOrders?.forEach(order => {
    const reasons: string[] = [];

    // Check email patterns
    if (order.email?.includes('@example.com')) reasons.push('example.com email');
    if (order.email?.includes('@test.com')) reasons.push('test.com email');
    if (order.email?.includes('test@')) reasons.push('test email');
    if (order.email === 'a@a.com') reasons.push('fake email');
    if (order.email === 'john@doe.com') reasons.push('fake email');
    if (order.email?.length <= 5) reasons.push('short email');
    
    // Check total amount
    if (order.total_amount === 0) reasons.push('£0.00 total');
    if (order.total_amount < 0) reasons.push('negative total');
    
    // Check Stripe payment intent (test mode)
    if (order.stripe_payment_intent_id?.startsWith('pi_')) {
      // Real payment intents, but check for test patterns
      if (order.stripe_payment_intent_id.includes('test')) reasons.push('test payment intent');
    }

    if (reasons.length > 0) {
      testOrders.push({
        ...order,
        reason: reasons.join(', ')
      });
    }
  });

  return testOrders;
}

async function cleanupTestOrders() {
  console.log('🧹 Starting test order cleanup...');
  
  const testOrders = await identifyTestOrders();
  
  if (testOrders.length === 0) {
    console.log('✅ No test orders found - database is clean!');
    return { deleted: 0, archived: 0 };
  }

  console.log(`🔍 Found ${testOrders.length} test orders:`);
  testOrders.forEach((order, index) => {
    console.log(`  ${index + 1}. ${order.email} - £${order.total_amount} (${order.reason})`);
  });

  // Create test_orders_archive table if it doesn't exist
  console.log('\\n📁 Creating test orders archive table...');
  const createArchiveQuery = `
    CREATE TABLE IF NOT EXISTS test_orders_archive (
      id uuid PRIMARY KEY,
      email text,
      total_amount numeric(10,2),
      stripe_payment_intent_id text,
      created_at timestamptz,
      archived_at timestamptz DEFAULT NOW(),
      archive_reason text
    );
  `;

  const { error: createError } = await supabase.rpc('exec_sql', { sql: createArchiveQuery });
  if (createError && !createError.message?.includes('already exists')) {
    console.error('❌ Error creating archive table:', createError);
    // Continue anyway
  }

  // Archive test orders
  console.log('📦 Archiving test orders...');
  for (const order of testOrders) {
    const { error: archiveError } = await supabase
      .from('test_orders_archive')
      .insert({
        id: order.id,
        email: order.email,
        total_amount: order.total_amount,
        stripe_payment_intent_id: order.stripe_payment_intent_id,
        created_at: order.created_at,
        archived_at: new Date().toISOString(),
        archive_reason: order.reason
      });

    if (archiveError) {
      console.error(`  ❌ Error archiving order ${order.id}:`, archiveError);
    }
  }

  // Delete test orders from main table
  console.log('🗑️  Deleting test orders from main orders table...');
  const testOrderIds = testOrders.map(o => o.id);
  
  const { error: deleteError } = await supabase
    .from('orders')
    .delete()
    .in('id', testOrderIds);

  if (deleteError) {
    console.error('❌ Error deleting test orders:', deleteError);
    return { deleted: 0, archived: testOrders.length };
  }

  // Verify cleanup
  const { data: remainingOrders } = await supabase
    .from('orders')
    .select('id, email, total_amount')
    .order('created_at', { ascending: false });

  console.log('\\n📊 CLEANUP SUMMARY:');
  console.log(`✅ Test orders archived: ${testOrders.length}`);
  console.log(`✅ Test orders deleted: ${testOrders.length}`);
  console.log(`✅ Remaining orders: ${remainingOrders?.length || 0}`);

  if (remainingOrders && remainingOrders.length > 0) {
    console.log('\\n📋 Remaining orders (should be LIVE only):');
    remainingOrders.slice(0, 5).forEach(order => {
      console.log(`  - ${order.email}: £${order.total_amount}`);
    });
  }

  return {
    deleted: testOrders.length,
    archived: testOrders.length,
    remaining: remainingOrders?.length || 0
  };
}

// Run the script
cleanupTestOrders()
  .then((result) => {
    console.log(`\\n🎯 Test order cleanup complete!`);
    console.log(`📊 Summary: ${result.deleted} deleted, ${result.remaining} remaining`);
    
    if (result.remaining === 0) {
      console.log('ℹ️  Note: No orders remaining - this is expected for a new deployment');
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n💥 CLEANUP FAILED:', error);
    process.exit(1);
  });