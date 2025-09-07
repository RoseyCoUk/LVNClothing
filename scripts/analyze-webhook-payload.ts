// Analyze webhook payload to understand the customer email issue
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function analyzeWebhookPayloads() {
  console.log('🔍 Analyzing webhook payloads...')
  
  try {
    // Get recent webhook events with full payloads
    const { data: webhookEvents, error } = await supabase
      .from('webhook_events')
      .select('event_id, payload, created_at, error')
      .eq('source', 'stripe')
      .eq('event_type', 'payment_intent.succeeded')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (error) {
      console.error('❌ Error fetching webhook events:', error)
      return
    }
    
    for (const event of webhookEvents || []) {
      console.log(`\n🎯 Event ${event.event_id}:`)
      console.log(`   Error: ${event.error || 'None'}`)
      
      if (event.payload && typeof event.payload === 'object') {
        const payload = event.payload as any
        const paymentIntent = payload.data?.object
        
        if (paymentIntent) {
          console.log(`   💳 Payment Intent ID: ${paymentIntent.id}`)
          console.log(`   📧 Receipt Email: ${paymentIntent.receipt_email || 'Not set'}`)
          console.log(`   💰 Amount: ${paymentIntent.amount} ${paymentIntent.currency}`)
          console.log(`   📋 Metadata:`)
          
          const metadata = paymentIntent.metadata || {}
          for (const [key, value] of Object.entries(metadata)) {
            console.log(`      - ${key}: ${typeof value === 'string' && value.length > 100 ? value.substring(0, 100) + '...' : value}`)
          }
          
          // Check if customer_email exists in metadata
          if (!metadata.customer_email && !paymentIntent.receipt_email) {
            console.log('   ❌ NO EMAIL FOUND! Neither metadata.customer_email nor receipt_email is set')
          } else {
            console.log(`   ✅ Email found: ${metadata.customer_email || paymentIntent.receipt_email}`)
          }
          
          // Check if required fields exist
          const requiredFields = ['items', 'shipping_address', 'subtotal', 'shipping_cost']
          for (const field of requiredFields) {
            if (metadata[field]) {
              console.log(`   ✅ ${field}: Present`)
            } else {
              console.log(`   ❌ ${field}: Missing`)
            }
          }
        }
      }
      
      console.log('   ' + '-'.repeat(50))
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

analyzeWebhookPayloads()