import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanDatabase() {
  console.log('🧹 Cleaning database with proper delete syntax...')
  
  try {
    // Delete all records without specific conditions - more straightforward
    console.log('Deleting product variants...')
    const { data: deletedVariants, error: variantError } = await supabase
      .from('product_variants')
      .delete()
      .neq('id', -1) // This will delete all records since no ID is -1
    
    console.log('Deleting product images...')
    const { data: deletedImages, error: imageError } = await supabase
      .from('product_images')
      .delete()
      .neq('id', -1) // This will delete all records since no ID is -1
    
    console.log('Deleting products...')
    const { data: deletedProducts, error: productError } = await supabase
      .from('products')
      .delete()
      .neq('name', '') // This will delete all products since all have names
    
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