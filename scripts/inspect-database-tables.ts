import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function inspectDatabase() {
  console.log('🔍 Inspecting Database Tables...\n')

  // Query system tables to see what exists
  const { data, error } = await supabase.rpc('sql', {
    query: `
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `
  })

  if (error) {
    console.log('❌ Could not query system tables directly')
    
    // Fallback: try known table names
    const knownTables = [
      'products', 'product_variants', 'variants', 
      'orders', 'bundles', 'admin_users', 
      'admin_roles', 'product_overrides',
      'product_images', 'bundle_items'
    ]
    
    console.log('Checking known table names...')
    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase.from(tableName).select('*').limit(0)
        if (!error) {
          console.log(`✅ ${tableName} - exists`)
          
          // Try to get a sample record to see structure
          const { data: sample } = await supabase.from(tableName).select('*').limit(1)
          if (sample && sample[0]) {
            console.log(`   Columns: ${Object.keys(sample[0]).join(', ')}`)
          }
        }
      } catch (e) {
        console.log(`❌ ${tableName} - not accessible`)
      }
    }
    
  } else {
    console.log('📋 Tables found in public schema:')
    data?.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`)
    })
  }
}

inspectDatabase().catch(console.error)