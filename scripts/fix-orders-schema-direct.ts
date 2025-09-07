// Directly fix orders table schema using service role
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixOrdersSchema() {
  console.log('🔧 Fixing orders table schema...')
  
  const sqlStatements = [
    // Add missing columns
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GBP'`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS readable_order_id TEXT`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2)`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2)`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_checkout BOOLEAN DEFAULT false`,
    
    // Add indexes for performance
    `CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_readable_order_id ON orders(readable_order_id)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`
  ]
  
  // Add unique constraints separately with existence check
  const constraintStatements = [
    {
      name: 'orders_stripe_payment_intent_id_key',
      sql: `ALTER TABLE orders ADD CONSTRAINT orders_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id)`
    },
    {
      name: 'orders_readable_order_id_key',
      sql: `ALTER TABLE orders ADD CONSTRAINT orders_readable_order_id_key UNIQUE (readable_order_id)`
    }
  ]
  
  try {
    // Execute column additions and indexes
    for (const sql of sqlStatements) {
      console.log(`📝 Executing: ${sql}`)
      const { error } = await supabase.rpc('exec_sql', { query: sql })
      
      if (error) {
        console.error(`❌ Error executing SQL: ${error.message}`)
        // Continue with other statements even if one fails
      } else {
        console.log(`✅ Success`)
      }
    }
    
    // Handle constraints separately since they might already exist
    for (const constraint of constraintStatements) {
      console.log(`📝 Adding constraint: ${constraint.name}`)
      
      // Check if constraint already exists
      const { data: existingConstraint, error: checkError } = await supabase
        .from('pg_constraint')
        .select('conname')
        .eq('conname', constraint.name)
        .limit(1)
      
      if (checkError) {
        console.error(`❌ Error checking constraint: ${checkError.message}`)
        continue
      }
      
      if (existingConstraint && existingConstraint.length > 0) {
        console.log(`✅ Constraint ${constraint.name} already exists`)
        continue
      }
      
      // Add the constraint
      const { error: constraintError } = await supabase.rpc('exec_sql', { query: constraint.sql })
      
      if (constraintError) {
        console.error(`❌ Error adding constraint: ${constraintError.message}`)
      } else {
        console.log(`✅ Added constraint: ${constraint.name}`)
      }
    }
    
    console.log('\n🎉 Schema fix completed! Testing...')
    
    // Test the schema
    const { data, error } = await supabase
      .from('orders')
      .select('currency, readable_order_id, customer_email, items, shipping_cost, subtotal, guest_checkout')
      .limit(0)
    
    if (error) {
      console.error('❌ Schema test failed:', error)
    } else {
      console.log('✅ Schema test passed - all columns are now available!')
      
      // Now redeploy the webhook function to clear schema cache
      console.log('\n🚀 Now run: supabase functions deploy stripe-webhook2')
      console.log('   This will refresh the schema cache in the Edge Function')
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

fixOrdersSchema()