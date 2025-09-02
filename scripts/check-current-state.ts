import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCurrentState() {
  console.log('🔍 Checking Current Database State...\n')

  const tablesToCheck = ['products', 'product_variants']
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase.from(tableName).select('*').limit(1)
      if (error) {
        console.log(`❌ Table '${tableName}': ${error.message}`)
      } else {
        console.log(`✅ Table '${tableName}' exists`)
        
        // Get counts
        const { count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        console.log(`   Records: ${count}`)
        
        // Get sample columns
        if (data && data[0]) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`)
        }
        
        console.log('')
      }
    } catch (e) {
      console.log(`❌ Table '${tableName}': ${e.message}`)
    }
  }

  // If product_variants exists, check what data needs to be populated
  try {
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('*')
    
    if (!error && variants) {
      console.log(`📋 Found ${variants.length} variants`)
      
      const missingCost = variants.filter(v => v.printful_cost === null).length
      const missingMargin = variants.filter(v => v.margin === null).length
      const missingPrintfulId = variants.filter(v => v.printful_variant_id === null).length
      
      console.log(`💰 Missing cost: ${missingCost}`)
      console.log(`📈 Missing margin: ${missingMargin}`) 
      console.log(`🔗 Missing Printful ID: ${missingPrintfulId}`)
    }
  } catch (e) {
    console.log('Could not check variant details:', e.message)
  }
}

checkCurrentState().catch(console.error)