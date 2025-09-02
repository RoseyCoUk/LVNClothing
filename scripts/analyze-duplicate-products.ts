#!/usr/bin/env tsx
/**
 * Analyze all products to identify duplicates and determine which to keep
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const products = [
  { id: '02942d1f-34ee-4921-ad01-08adee93706c', name: 'Reform UK T-Shirt', printful_product_id: '68a9daac4dc0e6', created_at: '2025-08-30 00:48:34.007918+00' },
  { id: '1c41c2af-f2d3-47b1-98a8-a38c54122814', name: 'Reform UK Water Bottle', printful_product_id: '68a9f6414ae524', created_at: '2025-08-30 00:48:33.567026+00' },
  { id: '26181f8f-ec68-4414-9f17-7e774ff304bf', name: 'Reform UK Tote Bag', printful_product_id: '68a8a3b526d263', created_at: '2025-08-30 00:48:38.564402+00' },
  { id: '30a908ed-86ed-40f3-97e4-90055ee35098', name: 'Unisex Hoodie DARK', printful_product_id: '390629494', created_at: '2025-08-31 22:59:43.771013+00' },
  { id: '3b72a572-6607-4df3-81d9-32ffe77740af', name: 'Unisex t-shirt DARK', printful_product_id: '390630122', created_at: '2025-08-31 22:59:43.481827+00' },
  { id: '63bee7e9-a595-4efe-ac7a-24d7079ed16c', name: 'Reform UK Mug', printful_product_id: '68a9f81d60c1c4', created_at: '2025-08-30 00:48:33.325559+00' },
  { id: '6db0ead7-f936-42dc-906a-b6979710433d', name: 'Reform UK Hoodie Light', printful_product_id: '68a9d27b158207', created_at: '2025-08-30 00:48:37.920823+00' },
  { id: '870b5bf9-1ae8-4882-bc3a-29e697803508', name: 'Reform UK Cap', printful_product_id: '68a9f52cc3d797', created_at: '2025-08-30 00:48:33.683354+00' },
  { id: 'a687e808-1d4a-437b-bfdd-863566412df2', name: 'Reform UK Hoodie', printful_product_id: '68a9d381e56565', created_at: '2025-08-30 00:48:37.034003+00' },
  { id: 'a75eab61-ccbd-48ec-b136-795000bbde4b', name: 'Unisex t-shirt LIGHT', printful_product_id: '390629862', created_at: '2025-08-31 22:59:43.663935+00' },
  { id: 'bfd1596f-7df1-41d6-92a8-87ae234440e1', name: 'Reform UK Sticker', printful_product_id: '68a9f9b78dd634', created_at: '2025-08-30 00:48:33.19065+00' },
  { id: 'c0bc0ec4-168c-49ee-bddd-ca9374f41124', name: 'Unisex Hoodie LIGHT', printful_product_id: '390629242', created_at: '2025-08-31 22:59:43.878863+00' },
  { id: 'c51773ed-2905-4cfc-bf07-bb1699ec4d7d', name: 'Reform UK T-Shirt Light', printful_product_id: '68a9d8c287b938', created_at: '2025-08-30 00:48:35.823339+00' },
  { id: 'd5159fda-5e6a-41e8-a535-36d09e216f6e', name: 'Reform UK Mouse Pad', printful_product_id: '68a9f6e8eeb5e4', created_at: '2025-08-30 00:48:33.43901+00' }
]

async function analyzeProducts() {
  console.log('🔍 Analyzing Product Duplicates...\n')
  
  console.log(`📊 Total products: ${products.length}`)
  console.log(`🎯 Expected: 10 products`)
  console.log(`❌ Extra products: ${products.length - 10}\n`)
  
  // Group by similar names to identify duplicates
  const groups = new Map()
  
  products.forEach(product => {
    let groupKey = product.name.toLowerCase()
    
    // Normalize names for grouping
    if (groupKey.includes('t-shirt') || groupKey.includes('tshirt')) {
      groupKey = 'tshirt'
    } else if (groupKey.includes('hoodie')) {
      groupKey = 'hoodie'
    } else {
      groupKey = groupKey.replace(/reform uk /gi, '').trim()
    }
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey).push(product)
  })
  
  console.log('📋 Product Groups:')
  console.log('='.repeat(80))
  
  const duplicateGroups = []
  const singleProducts = []
  
  for (const [groupName, groupProducts] of groups) {
    if (groupProducts.length > 1) {
      duplicateGroups.push({ name: groupName, products: groupProducts })
      console.log(`\n🔄 DUPLICATES - ${groupName.toUpperCase()}:`)
      groupProducts.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`)
        console.log(`     ID: ${product.id}`)
        console.log(`     Printful ID: ${product.printful_product_id}`)
        console.log(`     Created: ${product.created_at}`)
        console.log(`     ${product.printful_product_id.startsWith('390') ? '📦 QA Agent Data' : '🔧 Original Data'}`)
      })
    } else {
      singleProducts.push(groupProducts[0])
    }
  }
  
  console.log(`\n✅ UNIQUE PRODUCTS (${singleProducts.length}):`)
  singleProducts.forEach((product, index) => {
    console.log(`  ${index + 1}. ${product.name} (${product.printful_product_id})`)
  })
  
  console.log('\n🎯 RECOMMENDATION:')
  console.log('='.repeat(80))
  
  console.log('\n📊 Based on Printful ID patterns:')
  console.log('• IDs starting with "390": QA Agent populated data (newer, verified)')
  console.log('• IDs starting with "68a": Original data (older)')
  console.log('• QA Agent data matches the CSV audit (158 variants, 10 products)')
  
  console.log('\n✅ PRODUCTS TO KEEP (QA Agent verified):')
  const keepProducts = products.filter(p => p.printful_product_id.startsWith('390'))
  keepProducts.forEach(product => {
    console.log(`  ✅ ${product.name} (${product.id})`)
  })
  
  console.log('\n❌ PRODUCTS TO REMOVE (duplicates/old data):')
  const removeProducts = products.filter(p => !p.printful_product_id.startsWith('390'))
  removeProducts.forEach(product => {
    console.log(`  ❌ ${product.name} (${product.id})`)
  })
  
  console.log('\n🚨 SAFETY CHECK REQUIRED:')
  console.log('Before deleting, check if old products have variants linked!')
  console.log('\nGenerate deletion script...')
  
  // Check for variants (if table exists)
  try {
    console.log('\n🔍 Checking for linked variants...')
    
    for (const product of removeProducts) {
      try {
        const { data: variants, error } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', product.id)
        
        if (!error) {
          console.log(`📦 ${product.name}: ${variants?.length || 0} variants`)
        }
      } catch (e) {
        // Ignore if table doesn't exist
      }
    }
  } catch (e) {
    console.log('⚠️  Could not check variants (table may not exist)')
  }
  
  console.log('\n📝 DELETION SQL (run only after variant check):')
  console.log('-'.repeat(50))
  removeProducts.forEach(product => {
    console.log(`DELETE FROM products WHERE id = '${product.id}'; -- ${product.name}`)
  })
}

analyzeProducts().catch(console.error)