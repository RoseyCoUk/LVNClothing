// Test script to verify webhook is working after schema fix
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testOrdersTable() {
  console.log('🔍 Testing orders table structure...')
  
  try {
    // Test if we can query the orders table with new columns
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id, 
        readable_order_id, 
        customer_email, 
        currency, 
        stripe_payment_intent_id,
        items,
        shipping_cost,
        subtotal,
        guest_checkout,
        status,
        created_at
      `)
      .limit(1)
    
    if (error) {
      console.error('❌ Error querying orders table:', error)
      return false
    }
    
    console.log('✅ Orders table structure is correct')
    console.log(`   Found ${data?.length || 0} orders`)
    
    return true
  } catch (error) {
    console.error('❌ Exception testing orders table:', error)
    return false
  }
}

async function testWebhookEventsTable() {
  console.log('🔍 Testing webhook_events table...')
  
  try {
    const { data, error } = await supabase
      .from('webhook_events')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Error querying webhook_events table:', error)
      return false
    }
    
    console.log('✅ webhook_events table is accessible')
    return true
  } catch (error) {
    console.error('❌ Exception testing webhook_events table:', error)
    return false
  }
}

async function checkRecentWebhookErrors() {
  console.log('🔍 Checking for recent webhook processing errors...')
  
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
      const status = event.processed ? '✅' : '⏳'
      const errorMsg = event.error ? ` - ❌ ${event.error}` : ''
      console.log(`   ${status} ${event.event_id} (${event.created_at})${errorMsg}`)
    }
    
  } catch (error) {
    console.error('❌ Exception checking recent events:', error)
  }
}

async function runTests() {
  console.log('🚀 Running post-deployment tests...\n')
  
  const ordersOk = await testOrdersTable()
  const webhookEventsOk = await testWebhookEventsTable()
  
  if (ordersOk && webhookEventsOk) {
    console.log('\n✅ Database schema tests passed!')
    console.log('🎯 The webhook function should now work correctly.')
    console.log('📧 Make sure to test a real purchase to verify the full workflow.')
  } else {
    console.log('\n❌ Database schema tests failed!')
    console.log('🔧 Additional migration work may be needed.')
  }
  
  console.log('\n' + '='.repeat(50))
  await checkRecentWebhookErrors()
}

runTests()