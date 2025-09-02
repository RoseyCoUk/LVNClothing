import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProductsStructure() {
  console.log('🔍 Checking Products Table Structure...\n')

  // Get all products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(3) // Just get a few samples

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log(`📦 Found products. Sample structure:`)
  if (products.length > 0) {
    console.log(`\nSample product:`)
    console.log(JSON.stringify(products[0], null, 2))
    
    console.log(`\nColumns available:`)
    Object.keys(products[0]).forEach(key => {
      console.log(`  - ${key}: ${typeof products[0][key]}`)
    })
  }

  // Get total count
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
  
  console.log(`\n📊 Total products: ${count}`)

  // Check if variants field contains array data
  if (products.length > 0 && products[0].variants) {
    console.log(`\n📋 Sample variants structure:`)
    console.log(JSON.stringify(products[0].variants, null, 2))
  }
}

checkProductsStructure().catch(console.error)