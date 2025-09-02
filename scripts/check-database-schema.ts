import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('🔍 Checking Database Schema...\n')

  // Get all tables
  const { data: tables, error } = await supabase.rpc('get_schema_info')

  if (error) {
    // Fallback: check specific table names we expect
    console.log('Checking for expected tables...')
    
    const tablesToCheck = ['products', 'product_variants', 'variants', 'items']
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase.from(tableName).select('*').limit(1)
        if (error) {
          console.log(`❌ Table '${tableName}': ${error.message}`)
        } else {
          console.log(`✅ Table '${tableName}' exists with ${data.length >= 0 ? 'data' : 'no data'}`)
          
          // Get column info
          const { data: firstRow } = await supabase.from(tableName).select('*').limit(1)
          if (firstRow && firstRow[0]) {
            console.log(`   Columns: ${Object.keys(firstRow[0]).join(', ')}`)
          }
        }
      } catch (e) {
        console.log(`❌ Table '${tableName}': ${e.message}`)
      }
    }
  } else {
    console.log('Tables found:', tables)
  }
}

checkSchema().catch(console.error)