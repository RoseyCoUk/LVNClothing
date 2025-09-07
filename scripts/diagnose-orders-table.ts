// Check actual database schema
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...')
  
  try {
    // Try a different approach using a test query
    console.log('🔄 Testing individual columns to determine available structure...')
    
    const testColumns = [
      'id', 'created_at', 'user_id', 'status', 'total_amount',
      'currency', 'readable_order_id', 'order_number', 'customer_email',
      'stripe_payment_intent_id', 'items', 'shipping_address',
      'shipping_cost', 'subtotal', 'guest_checkout'
    ]
    
    const availableColumns = []
    const missingColumns = []
    
    for (const col of testColumns) {
      try {
        const { error } = await supabase
          .from('orders')
          .select(col)
          .limit(0)
        
        if (error) {
          if (error.message.includes('column') && error.message.includes('does not exist')) {
            missingColumns.push(col)
          } else {
            console.error(`Unexpected error testing ${col}:`, error.message)
          }
        } else {
          availableColumns.push(col)
        }
      } catch (e) {
        missingColumns.push(col)
      }
    }
    
    console.log(`✅ Available columns (${availableColumns.length}):`, availableColumns.join(', '))
    console.log(`❌ Missing columns (${missingColumns.length}):`, missingColumns.join(', '))
    
    if (missingColumns.length > 0) {
      console.log('\n🔧 Required SQL to fix schema:')
      console.log('-- Add missing columns:')
      for (const col of missingColumns) {
        switch (col) {
          case 'currency':
            console.log(`ALTER TABLE orders ADD COLUMN ${col} TEXT DEFAULT 'GBP';`)
            break
          case 'readable_order_id':
          case 'order_number':
          case 'customer_email':
          case 'stripe_payment_intent_id':
            console.log(`ALTER TABLE orders ADD COLUMN ${col} TEXT;`)
            break
          case 'total_amount':
          case 'shipping_cost':
          case 'subtotal':
            console.log(`ALTER TABLE orders ADD COLUMN ${col} DECIMAL(10,2);`)
            break
          case 'items':
          case 'shipping_address':
            console.log(`ALTER TABLE orders ADD COLUMN ${col} JSONB;`)
            break
          case 'guest_checkout':
            console.log(`ALTER TABLE orders ADD COLUMN ${col} BOOLEAN DEFAULT false;`)
            break
          default:
            console.log(`ALTER TABLE orders ADD COLUMN ${col} TEXT;`)
        }
      }
      
      console.log('\n-- Add constraints:')
      console.log('ALTER TABLE orders ADD CONSTRAINT orders_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);')
      console.log('ALTER TABLE orders ADD CONSTRAINT orders_readable_order_id_key UNIQUE (readable_order_id);')
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

checkDatabaseSchema()