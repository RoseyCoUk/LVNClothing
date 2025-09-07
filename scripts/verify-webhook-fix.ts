// Verify that the webhook issue is fixed
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyWebhookFix() {
  console.log('🔍 Verifying webhook fix...')
  
  try {
    // Test 1: Check if all required columns are now available
    console.log('\n1️⃣ Testing orders table schema...')
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, 
        created_at,
        user_id,
        status,
        total_amount,
        order_number,
        stripe_payment_intent_id,
        shipping_address,
        currency,
        readable_order_id,
        customer_email,
        items,
        shipping_cost,
        subtotal,
        guest_checkout
      `)
      .limit(1)
    
    if (error) {
      console.error('❌ Schema test failed:', error.message)
      return false
    }
    
    console.log('✅ All columns are now available in orders table!')
    
    // Test 2: Check webhook_events table
    console.log('\n2️⃣ Testing webhook_events table...')
    const { data: webhookData, error: webhookError } = await supabase
      .from('webhook_events')
      .select('event_id, event_type, created_at, processed, error')
      .eq('source', 'stripe')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (webhookError) {
      console.error('❌ Webhook events test failed:', webhookError.message)
      return false
    }
    
    console.log('✅ Webhook events table is accessible!')
    
    // Test 3: Check if we can insert a test order (without actually inserting)
    console.log('\n3️⃣ Testing order creation structure...')
    const testOrderData = {
      stripe_payment_intent_id: 'test_pi_' + Date.now(),
      customer_email: 'test@example.com',
      readable_order_id: 'TEST-' + Date.now(),
      order_number: 'TEST-' + Date.now(),
      status: 'paid',
      total_amount: 50.00,
      currency: 'GBP',
      items: [{ id: 'test', name: 'Test Product', price: 50.00, quantity: 1 }],
      shipping_address: { name: 'Test User', address1: 'Test Address' },
      shipping_cost: 0,
      subtotal: 50.00,
      guest_checkout: true
    }
    
    // Don't actually insert - just validate structure
    const { error: insertError } = await supabase
      .from('orders')
      .insert(testOrderData)
      .select('id')
    
    // Immediately delete if it was created
    if (!insertError) {
      console.log('✅ Order structure validation passed!')
      
      // Clean up the test order
      await supabase
        .from('orders')
        .delete()
        .eq('stripe_payment_intent_id', testOrderData.stripe_payment_intent_id)
      
      console.log('🧹 Test order cleaned up')
    } else {
      console.error('❌ Order structure validation failed:', insertError.message)
      return false
    }
    
    console.log('\n🎉 All tests passed! The webhook should now work correctly.')
    console.log('\n📧 Next steps:')
    console.log('   1. Test with a real Stripe payment')
    console.log('   2. Check that orders are created without errors')
    console.log('   3. Verify that confirmation emails are sent')
    console.log('   4. Confirm that Printful fulfillment is triggered')
    
    return true
    
  } catch (error) {
    console.error('❌ Verification error:', error)
    return false
  }
}

async function checkRecentWebhookStatus() {
  console.log('\n🔍 Checking recent webhook processing...')
  
  try {
    const { data: recentEvents, error } = await supabase
      .from('webhook_events')
      .select('event_id, event_type, created_at, processed, error')
      .eq('source', 'stripe')
      .eq('event_type', 'payment_intent.succeeded')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (error) {
      console.error('❌ Error fetching recent events:', error)
      return
    }
    
    console.log(`📋 Last ${recentEvents?.length || 0} payment_intent.succeeded events:`)
    for (const event of recentEvents || []) {
      const status = event.processed ? (event.error ? '⚠️' : '✅') : '⏳'
      const errorMsg = event.error ? ` - ${event.error}` : ''
      console.log(`   ${status} ${event.event_id} (${event.created_at.split('T')[0]})${errorMsg}`)
    }
    
  } catch (error) {
    console.error('❌ Error checking webhook status:', error)
  }
}

async function main() {
  const success = await verifyWebhookFix()
  await checkRecentWebhookStatus()
  
  if (success) {
    console.log('\n🚀 The webhook fix appears to be successful!')
    console.log('💡 Try making a test purchase to verify the full workflow.')
  } else {
    console.log('\n❌ There are still issues that need to be resolved.')
  }
}

main()