/**
 * Test Database Connection and Schema
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = 'http://127.0.0.1:54321'; // Local Supabase
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testDatabaseConnection() {
  console.log('🔄 Testing database connection and orders schema...');
  
  try {
    // Test connection
    const { data: tables, error: tablesError } = await supabase
      .from('orders')
      .select('*')
      .limit(0);
      
    if (tablesError) {
      console.error('❌ Error connecting to orders table:', tablesError);
      return;
    }
    
    console.log('✅ Successfully connected to orders table');
    
    // Try a test insert
    const testOrder = {
      stripe_payment_intent_id: 'pi_test_' + Date.now(),
      customer_email: 'test@example.com',
      readable_order_id: 'TEST-' + Date.now(),
      order_number: 'TEST-' + Date.now(), // This field is required
      status: 'paid',
      total_amount: 74.92,
      currency: 'GBP',
      items: [{"test": "item"}],
      shipping_address: {"test": "address"},
      shipping_cost: 4.95,
      subtotal: 69.97,
      guest_checkout: true,
      created_at: new Date().toISOString()
    };

    console.log('🔄 Testing order insertion with full schema...');
    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select('*')
      .single();
      
    if (insertError) {
      console.error('❌ Error inserting test order:', insertError);
      console.log('💡 This indicates a schema mismatch');
    } else {
      console.log('✅ Test order inserted successfully:');
      console.log('   Order ID:', insertedOrder.id);
      console.log('   Readable ID:', insertedOrder.readable_order_id);
      
      // Clean up
      await supabase
        .from('orders')
        .delete()
        .eq('id', insertedOrder.id);
      console.log('✅ Test order cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabaseConnection().catch(console.error);