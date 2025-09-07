// Debug script to check webhook events and orders in production
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugWebhookIssues() {
  console.log('🔍 Checking recent webhook events...')
  
  try {
    // Get recent webhook events
    const { data: webhookEvents, error: webhookError } = await supabase
      .from('webhook_events')
      .select('*')
      .eq('source', 'stripe')
      .eq('event_type', 'payment_intent.succeeded')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (webhookError) {
      console.error('❌ Error fetching webhook events:', webhookError)
      return
    }
    
    console.log(`📋 Found ${webhookEvents?.length || 0} recent payment_intent.succeeded events`)
    
    for (const event of webhookEvents || []) {
      console.log(`\n🎯 Event ${event.event_id}:`)
      console.log(`   - Created: ${event.created_at}`)
      console.log(`   - Processed: ${event.processed}`)
      console.log(`   - Error: ${event.error || 'None'}`)
      
      if (event.error) {
        console.log(`   ❌ ERROR DETAILS: ${event.error}`)
      }
      
      // Check if there's a corresponding order
      if (event.payload && typeof event.payload === 'object') {
        const paymentIntentId = event.payload.data?.object?.id
        if (paymentIntentId) {
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('id, readable_order_id, status, customer_email')
            .eq('stripe_payment_intent_id', paymentIntentId)
            .single()
          
          if (order) {
            console.log(`   ✅ Order found: ${order.readable_order_id} (${order.status})`)
          } else {
            console.log(`   ❌ No order found for payment intent: ${paymentIntentId}`)
            if (orderError) {
              console.log(`   Order error: ${orderError.message}`)
            }
          }
        }
      }
    }
    
    // Also check recent orders
    console.log('\n🛒 Recent orders:')
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, readable_order_id, customer_email, status, created_at, stripe_payment_intent_id')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError)
    } else {
      for (const order of recentOrders || []) {
        console.log(`   - ${order.readable_order_id}: ${order.customer_email} (${order.status}) - ${order.created_at}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

debugWebhookIssues()