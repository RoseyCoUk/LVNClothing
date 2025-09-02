import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCostMarginData() {
  console.log('🔍 Checking Cost & Margin Data...\n')

  // First get all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug')
    .order('name')

  if (productsError) {
    console.error('Error fetching products:', productsError)
    return
  }

  console.log(`📦 Found ${products.length} products in database\n`)

  // Get all variants
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('id, product_id, color, size, printful_cost, margin, printful_variant_id')

  if (variantsError) {
    console.error('Error fetching variants:', variantsError)
    return
  }

  let totalVariants = 0
  let missingCostTotal = 0
  let missingMarginTotal = 0
  let missingPrintfulIdTotal = 0
  let emptyProducts = []

  products.forEach(product => {
    const productVariants = variants.filter(v => v.product_id === product.id)
    const variantCount = productVariants.length
    
    totalVariants += variantCount

    if (variantCount === 0) {
      emptyProducts.push(product.name)
      console.log(`❌ ${product.name}: NO VARIANTS`)
      return
    }

    const missingCost = productVariants.filter(v => v.printful_cost === null).length
    const missingMargin = productVariants.filter(v => v.margin === null).length
    const missingPrintfulId = productVariants.filter(v => v.printful_variant_id === null).length

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
      const sampleMissing = productVariants
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
    
    console.log(`\n🧹 Products to clean up:`)
    const emptyProductIds = products.filter(p => 
      variants.filter(v => v.product_id === p.id).length === 0
    ).map(p => p.id)
    console.log(`Product IDs to delete: ${emptyProductIds.join(', ')}`)
  }

  console.log('\n🎯 Expected: 10 products with 158 total variants')
  console.log(`📊 Actual: ${products.length} products with ${totalVariants} total variants`)
  
  if (products.length > 10) {
    console.log(`\n⚠️  ISSUE: ${products.length - 10} extra products detected`)
  }
  
  if (missingCostTotal > 0 || missingMarginTotal > 0) {
    console.log(`\n⚠️  ISSUE: Missing cost/margin data needs population`)
  }

  // Show which products need cost/margin population
  const productsNeedingData = products.filter(product => {
    const productVariants = variants.filter(v => v.product_id === product.id)
    const missingCost = productVariants.filter(v => v.printful_cost === null).length
    const missingMargin = productVariants.filter(v => v.margin === null).length
    return missingCost > 0 || missingMargin > 0
  })

  if (productsNeedingData.length > 0) {
    console.log(`\n💰 Products needing cost/margin data:`)
    productsNeedingData.forEach(product => {
      console.log(`  - ${product.name} (${product.slug})`)
    })
  }
}

checkCostMarginData().catch(console.error)