import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabaseState() {
  console.log('🔍 Checking current database state...')
  
  try {
    // Get product count
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
    
    if (productsError) {
      console.error('Error fetching products:', productsError)
      return
    }

    // Get variant count
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
    
    if (variantsError) {
      console.error('Error fetching variants:', variantsError)
      return
    }

    // Get image count
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
    
    if (imagesError) {
      console.error('Error fetching images:', imagesError)
      return
    }

    console.log('\n📊 DATABASE STATE:')
    console.log(`Products: ${products?.length || 0}`)
    console.log(`Variants: ${variants?.length || 0}`)
    console.log(`Images: ${images?.length || 0}`)
    
    if (products && products.length > 0) {
      console.log('\n📦 PRODUCTS:')
      products.forEach(product => {
        console.log(`- ID: ${product.id}, Name: "${product.name}", Slug: "${product.slug}", Printful ID: ${product.printful_product_id || 'NULL'}`)
      })
    }
    
    if (variants && variants.length > 0) {
      console.log(`\n🎨 VARIANTS (showing first 20):`)
      variants.slice(0, 20).forEach(variant => {
        console.log(`- ID: ${variant.id}, Product ID: ${variant.product_id}, Color: ${variant.color || 'N/A'}, Size: ${variant.size || 'N/A'}, Printful Variant ID: ${variant.printful_variant_id || 'NULL'}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

checkDatabaseState()