#!/usr/bin/env tsx
/**
 * Fix Remote Supabase Database
 * Update products with correct Printful IDs and remove duplicates
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

// Use remote Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nsmrxwnrtsllxvplazmm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ5NjQ1MiwiZXhwIjoyMDY3MDcyNDUyfQ.hmKiDQ2LocnHf59nVJYB5_YHnH3W6bdeMl2Px3xFpPw'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Load correct Printful data from CSV audit
function loadPrintfulData(): Map<string, any> {
  const csvPath = '/Users/arnispiekus/Documents/Github/ReformUK/agents/artifacts/printful-variant-audit.csv'
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`❌ CSV file not found: ${csvPath}`)
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n').slice(1) // Skip header
  const productMap = new Map<string, any>()
  
  for (const line of lines) {
    if (!line.trim()) continue
    
    const parts = line.split(',')
    if (parts.length < 8) continue
    
    const productName = parts[0].replace(/"/g, '').trim()
    const syncProductId = parts[1].trim()
    const syncVariantId = parts[2].trim()
    const variantName = parts[3].replace(/"/g, '').trim()
    const price = parseFloat(parts[7].replace(/"/g, '').trim())
    
    if (!productMap.has(productName)) {
      productMap.set(productName, {
        sync_product_id: syncProductId,
        variants: [],
        retail_price: price
      })
    }
    
    productMap.get(productName).variants.push({
      sync_variant_id: syncVariantId,
      variant_name: variantName,
      price
    })
  }
  
  return productMap
}

async function fixRemoteDatabase() {
  console.log('🔧 Fixing Remote Supabase Database...\n')
  
  // Load correct Printful data
  console.log('📊 Loading correct Printful data from CSV...')
  const printfulData = loadPrintfulData()
  console.log(`✅ Loaded ${printfulData.size} products from CSV audit`)
  
  // Step 1: Update the 4 QA Agent products with cost/margin data
  console.log('\n💰 Updating QA Agent products with cost/margin data...')
  
  const qaProducts = [
    {
      id: '30a908ed-86ed-40f3-97e4-90055ee35098',
      name: 'Unisex Hoodie DARK',
      printful_name: 'Unisex Hoodie DARK'
    },
    {
      id: '3b72a572-6607-4df3-81d9-32ffe77740af',
      name: 'Unisex t-shirt DARK', 
      printful_name: 'Unisex t-shirt DARK'
    },
    {
      id: 'a75eab61-ccbd-48ec-b136-795000bbde4b',
      name: 'Unisex t-shirt LIGHT',
      printful_name: 'Unisex t-shirt LIGHT'
    },
    {
      id: 'c0bc0ec4-168c-49ee-bddd-ca9374f41124',
      name: 'Unisex Hoodie LIGHT',
      printful_name: 'Unisex Hoodie LIGHT'
    }
  ]
  
  for (const product of qaProducts) {
    const printfulInfo = printfulData.get(product.printful_name)
    
    if (!printfulInfo) {
      console.log(`⚠️  No Printful data found for ${product.name}`)
      continue
    }
    
    const retailPrice = printfulInfo.retail_price
    const printfulCost = retailPrice * 0.6 // 60% cost ratio
    const margin = retailPrice - printfulCost
    
    const { error } = await supabase
      .from('products')
      .update({
        printful_cost: printfulCost,
        margin: margin,
        retail_price: retailPrice,
        price: retailPrice.toString()
      })
      .eq('id', product.id)
    
    if (error) {
      console.error(`❌ Failed to update ${product.name}:`, error)
    } else {
      console.log(`✅ Updated ${product.name}: cost=$${printfulCost.toFixed(2)}, margin=$${margin.toFixed(2)}`)
    }
  }
  
  // Step 2: Update remaining 6 products with correct Printful IDs
  console.log('\n🔄 Updating remaining products with correct Printful IDs...')
  
  const remainingProducts = [
    {
      id: '1c41c2af-f2d3-47b1-98a8-a38c54122814',
      name: 'Reform UK Water Bottle',
      current_id: '68a9f6414ae524'
    },
    {
      id: '26181f8f-ec68-4414-9f17-7e774ff304bf', 
      name: 'Reform UK Tote Bag',
      current_id: '68a8a3b526d263'
    },
    {
      id: '63bee7e9-a595-4efe-ac7a-24d7079ed16c',
      name: 'Reform UK Mug',
      current_id: '68a9f81d60c1c4'
    },
    {
      id: 'bfd1596f-7df1-41d6-92a8-87ae234440e1',
      name: 'Reform UK Sticker', 
      current_id: '68a9f9b78dd634'
    },
    {
      id: '870b5bf9-1ae8-4882-bc3a-29e697803508',
      name: 'Reform UK Cap',
      current_id: '68a9f52cc3d797'
    },
    {
      id: 'd5159fda-5e6a-41e8-a535-36d09e216f6e',
      name: 'Reform UK Mouse Pad',
      current_id: '68a9f6e8eeb5e4'
    }
  ]
  
  for (const product of remainingProducts) {
    // Find matching Printful data
    let printfulInfo = null
    for (const [printfulName, data] of printfulData) {
      if (printfulName.includes(product.name.replace('Reform UK ', ''))) {
        printfulInfo = data
        break
      }
    }
    
    if (!printfulInfo) {
      console.log(`⚠️  No Printful data found for ${product.name}`)
      continue
    }
    
    const { error } = await supabase
      .from('products')
      .update({
        printful_product_id: printfulInfo.sync_product_id
      })
      .eq('id', product.id)
    
    if (error) {
      console.error(`❌ Failed to update ${product.name}:`, error)
    } else {
      console.log(`✅ Updated ${product.name}: ${product.current_id} → ${printfulInfo.sync_product_id}`)
    }
  }
  
  // Step 3: Delete duplicate products
  console.log('\n🗑️  Deleting duplicate products...')
  
  const duplicatesToDelete = [
    '02942d1f-34ee-4921-ad01-08adee93706c', // Reform UK T-Shirt (duplicate of Unisex t-shirt DARK/LIGHT)
    '6db0ead7-f936-42dc-906a-b6979710433d', // Reform UK Hoodie Light (duplicate of Unisex Hoodie LIGHT)
    'a687e808-1d4a-437b-bfdd-863566412df2', // Reform UK Hoodie (duplicate of Unisex Hoodie DARK)
    'c51773ed-2905-4cfc-bf07-bb1699ec4d7d'  // Reform UK T-Shirt Light (duplicate of Unisex t-shirt LIGHT)
  ]
  
  for (const productId of duplicatesToDelete) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    
    if (error) {
      console.error(`❌ Failed to delete product ${productId}:`, error)
    } else {
      console.log(`✅ Deleted duplicate product ${productId}`)
    }
  }
  
  // Step 4: Verify final state
  console.log('\n🔍 Verifying final state...')
  
  const { data: finalProducts, error: fetchError } = await supabase
    .from('products')
    .select('id, name, printful_product_id, printful_cost, margin')
    .order('name')
  
  if (fetchError) {
    console.error('❌ Failed to fetch final products:', fetchError)
    return
  }
  
  console.log('\n📊 FINAL DATABASE STATE:')
  console.log('='.repeat(80))
  console.log(`📦 Total products: ${finalProducts.length}`)
  console.log('')
  
  finalProducts.forEach((product, index) => {
    const hasCorrectId = product.printful_product_id?.startsWith('390')
    const hasCostData = product.printful_cost != null
    const status = hasCorrectId && hasCostData ? '✅' : '⚠️ '
    
    console.log(`${status} ${index + 1}. ${product.name}`)
    console.log(`     ID: ${product.printful_product_id || 'NULL'}`)
    console.log(`     Cost: $${product.printful_cost || 'NULL'}`)
    console.log(`     Margin: $${product.margin || 'NULL'}`)
    console.log('')
  })
  
  const correctIds = finalProducts.filter(p => p.printful_product_id?.startsWith('390')).length
  const withCost = finalProducts.filter(p => p.printful_cost != null).length
  
  console.log('📈 SUMMARY:')
  console.log(`✅ Products: ${finalProducts.length}/10 expected`)
  console.log(`✅ Correct Printful IDs: ${correctIds}/${finalProducts.length}`)
  console.log(`✅ With cost data: ${withCost}/${finalProducts.length}`)
  
  if (finalProducts.length === 10 && correctIds === 10 && withCost === 10) {
    console.log('\n🎉 SUCCESS: Database is now completely fixed!')
  } else {
    console.log('\n⚠️  Still some issues remain - check the data above')
  }
}

fixRemoteDatabase().catch(console.error)