import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCostMarginData() {
  console.log('🔍 Checking Cost & Margin Data...\n')

  // Get products with their variant counts and missing data counts
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      product_variants (
        id,
        color,
        size,
        printful_cost,
        margin,
        printful_variant_id
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log(`📦 Found ${products.length} products in database\n`)

  let totalVariants = 0
  let missingCostTotal = 0
  let missingMarginTotal = 0
  let missingPrintfulIdTotal = 0
  let emptyProducts = []

  products.forEach(product => {
    const variants = product.product_variants || []
    const variantCount = variants.length
    
    totalVariants += variantCount

    if (variantCount === 0) {
      emptyProducts.push(product.name)
      console.log(`❌ ${product.name}: NO VARIANTS`)
      return
    }

    const missingCost = variants.filter(v => v.printful_cost === null).length
    const missingMargin = variants.filter(v => v.margin === null).length
    const missingPrintfulId = variants.filter(v => v.printful_variant_id === null).length

    missingCostTotal += missingCost
    missingMarginTotal += missingMargin
    missingPrintfulIdTotal += missingPrintfulId

    const status = missingCost === 0 && missingMargin === 0 && missingPrintfulId === 0 ? '✅' : '⚠️'
    
    console.log(`${status} ${product.name}:`)
    console.log(`  - Variants: ${variantCount}`)
    console.log(`  - Missing cost: ${missingCost}`)
    console.log(`  - Missing margin: ${missingMargin}`)
    console.log(`  - Missing Printful ID: ${missingPrintfulId}`)
    
    if (missingCost > 0 || missingMargin > 0) {
      // Show some sample missing data
      const sampleMissing = variants
        .filter(v => v.printful_cost === null || v.margin === null)
        .slice(0, 3)
      
      sampleMissing.forEach(v => {
        console.log(`    Sample: ${v.color} / ${v.size} - Cost: ${v.printful_cost || 'NULL'}, Margin: ${v.margin || 'NULL'}`)
      })
    }
    console.log('')
  })

  console.log('============================================================')
  console.log('📊 COST & MARGIN DATA REPORT')
  console.log('============================================================')
  console.log(`📦 Total products: ${products.length}`)
  console.log(`📋 Total variants: ${totalVariants}`)
  console.log(`💰 Missing cost values: ${missingCostTotal}`)
  console.log(`📈 Missing margin values: ${missingMarginTotal}`)
  console.log(`🔗 Missing Printful IDs: ${missingPrintfulIdTotal}`)
  
  if (emptyProducts.length > 0) {
    console.log(`\n❌ Empty products (${emptyProducts.length}):`)
    emptyProducts.forEach(name => console.log(`  - ${name}`))
  }

  console.log('\n🎯 Expected: 10 products with 158 total variants')
  console.log(`📊 Actual: ${products.length} products with ${totalVariants} total variants`)
  
  if (products.length > 10) {
    console.log(`\n⚠️  ISSUE: ${products.length - 10} extra products detected`)
  }
  
  if (missingCostTotal > 0 || missingMarginTotal > 0) {
    console.log(`\n⚠️  ISSUE: Missing cost/margin data needs population`)
  }
}

checkCostMarginData().catch(console.error)