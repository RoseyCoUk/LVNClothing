import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAllVariants() {
  console.log('📋 Checking ALL product variants (with and without color_hex)...\n')
  
  const { data, error } = await supabase
    .from('product_variants')
    .select('id, product_id, color, color_hex, size, price')
    .order('product_id')
    .order('color')

  if (error) {
    console.error('❌ Error querying database:', error)
    return
  }

  if (!data || data.length === 0) {
    console.log('❌ No product variants found in database!')
    return
  }

  console.log(`📊 Found ${data.length} total product variants`)
  console.log('=======================================\n')

  const withColorHex = data.filter(v => v.color_hex)
  const withoutColorHex = data.filter(v => !v.color_hex)

  console.log(`✅ With color_hex: ${withColorHex.length}`)
  console.log(`❌ Without color_hex: ${withoutColorHex.length}\n`)

  if (withColorHex.length > 0) {
    console.log('Variants WITH color_hex:')
    console.log('=======================')
    withColorHex.forEach(v => {
      console.log(`${v.product_id} | ${v.color.padEnd(20)} | ${v.color_hex}`)
    })
  }

  if (withoutColorHex.length > 0) {
    console.log('\nVariants WITHOUT color_hex:')
    console.log('===========================')
    withoutColorHex.slice(0, 20).forEach(v => {
      console.log(`${v.product_id} | ${v.color.padEnd(20)} | ${v.size.padEnd(10)} | $${v.price}`)
    })
    if (withoutColorHex.length > 20) {
      console.log(`... and ${withoutColorHex.length - 20} more`)
    }
  }

  return data
}

async function checkProductsTable() {
  console.log('\n📋 Checking products table...\n')
  
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug')
    .order('name')

  if (error) {
    console.error('❌ Error querying products:', error)
    return
  }

  console.log(`📊 Found ${data?.length || 0} products:`)
  data?.forEach(p => {
    console.log(`${p.id} | ${p.name} | ${p.slug}`)
  })

  return data
}

async function main() {
  console.log('🔍 Database Color Hex Analysis')
  console.log('==============================\n')
  
  await checkProductsTable()
  await checkAllVariants()
}

main().catch(console.error)