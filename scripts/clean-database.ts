import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanDatabase() {
  console.log('🧹 Manually cleaning database...')
  
  try {
    // Delete in correct order due to foreign key constraints
    console.log('Deleting product variants...')
    const { error: variantError } = await supabase
      .from('product_variants')
      .delete()
      .gte('id', 0)
    
    console.log('Deleting product images...')
    const { error: imageError } = await supabase
      .from('product_images')
      .delete()
      .gte('id', 0)
    
    console.log('Deleting products...')
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .neq('id', '')
    
    if (variantError) console.error('Variant cleanup error:', variantError)
    if (imageError) console.error('Image cleanup error:', imageError)
    if (productError) console.error('Product cleanup error:', productError)
    
    console.log('✅ Database cleaned successfully')
    
    // Check final state
    const { data: products } = await supabase.from('products').select('*')
    const { data: variants } = await supabase.from('product_variants').select('*')
    const { data: images } = await supabase.from('product_images').select('*')
    
    console.log(`Final state: ${products?.length || 0} products, ${variants?.length || 0} variants, ${images?.length || 0} images`)
    
  } catch (error) {
    console.error('❌ Clean error:', error)
  }
}

cleanDatabase()