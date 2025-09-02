import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testPrintfulSync() {
  console.log('🧪 Testing Printful sync function...')
  
  try {
    const { data, error } = await supabase.functions.invoke('printful-sync', {
      body: { action: 'full_sync' }
    })
    
    if (error) {
      console.error('❌ Sync function error:', error)
      return
    }
    
    console.log('✅ Sync function response:', data)
    
    // Check the database state after sync
    console.log('\n📊 Checking database state after sync...')
    
    const { data: products } = await supabase
      .from('products')
      .select('*')
    
    const { data: variants } = await supabase
      .from('product_variants')
      .select('*')
    
    const { data: images } = await supabase
      .from('product_images')
      .select('*')
    
    console.log(`Products: ${products?.length || 0}`)
    console.log(`Variants: ${variants?.length || 0}`)
    console.log(`Images: ${images?.length || 0}`)
    
    if (products && products.length > 0) {
      console.log('\n📦 PRODUCTS:')
      products.forEach(product => {
        console.log(`- ${product.name} (${product.slug}) - Category: ${product.category}`)
      })
    }
    
    if (variants && variants.length > 0) {
      console.log(`\n🎨 VARIANTS (showing first 20):`)
      variants.slice(0, 20).forEach(variant => {
        console.log(`- ${variant.name} - Color: ${variant.color}, Size: ${variant.size}, Price: ${variant.price}`)
      })
    }

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testPrintfulSync()