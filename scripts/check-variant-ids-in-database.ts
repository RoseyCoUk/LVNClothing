#!/usr/bin/env tsx

/**
 * Check Variant IDs in Database
 * 
 * Checks if the database has the correct catalog variant IDs stored
 * and compares them with what we know should be the real ones.
 */

const SUPABASE_URL = 'https://nsmrxwnrtsllxvplazmm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbXJ4d25ydHNsbHh2cGxhem1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0OTY0NTIsImV4cCI6MjA2NzA3MjQ1Mn0.XyHiuQHXW_laGE4Caond1-8xK-2B4NzDzIOX8baD4UM'

async function checkDatabaseVariantIds() {
  console.log('🔍 Checking variant IDs stored in database...')
  
  try {
    // Check product_variants table
    const variantsResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_variants?select=*&limit=10`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    })

    const variantsData = await variantsResponse.json()
    
    console.log('\n📋 PRODUCT_VARIANTS TABLE SAMPLE:')
    console.log('=================================')
    
    if (Array.isArray(variantsData) && variantsData.length > 0) {
      variantsData.forEach((variant, index) => {
        console.log(`${index + 1}. ID: ${variant.id}`)
        console.log(`   Product: ${variant.product_id}`)
        console.log(`   Color: ${variant.color}`)
        console.log(`   Size: ${variant.size}`)
        console.log(`   Printful Variant ID: ${variant.printful_variant_id}`)
        console.log(`   SKU: ${variant.sku}`)
        console.log('')
      })
    } else {
      console.log('No variants found or unexpected response format')
    }

    // Check product_images table for any printful references
    const imagesResponse = await fetch(`${SUPABASE_URL}/rest/v1/product_images?select=*&limit=5`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    })

    const imagesData = await imagesResponse.json()
    
    console.log('📸 PRODUCT_IMAGES TABLE SAMPLE:')
    console.log('================================')
    
    if (Array.isArray(imagesData) && imagesData.length > 0) {
      imagesData.forEach((image, index) => {
        console.log(`${index + 1}. ID: ${image.id}`)
        console.log(`   Product: ${image.product_id}`)
        console.log(`   Image URL: ${image.image_url}`)
        console.log(`   Color: ${image.color}`)
        console.log('')
      })
    } else {
      console.log('No images found or unexpected response format')
    }

    // Try to check if there are any tables with sync_variant_id or catalog_variant_id
    console.log('🔍 CHECKING FOR PRINTFUL-RELATED TABLES:')
    console.log('==========================================')
    
    // This might not work due to permissions, but worth trying
    try {
      const tablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/?select=*`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        }
      })
      console.log('Tables response status:', tablesResponse.status)
    } catch (e) {
      console.log('Cannot list tables (expected with anon key)')
    }

  } catch (error) {
    console.error('❌ Error checking database:', error)
  }
}

// Also check what happens when we call the products API directly
async function checkProductsAPI() {
  console.log('\n🌐 CHECKING PRODUCTS API:')
  console.log('=========================')
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&limit=3`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    })

    const data = await response.json()
    
    if (Array.isArray(data)) {
      data.forEach((product, index) => {
        console.log(`${index + 1}. Product:`)
        console.log(`   ID: ${product.id}`)
        console.log(`   Name: ${product.name}`)
        console.log(`   Category: ${product.category}`)
        console.log(`   Slug: ${product.slug}`)
        console.log('')
      })
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

async function main() {
  console.log('🔍 DATABASE VARIANT ID INVESTIGATION')
  console.log('====================================')
  console.log('This script checks if the database contains the correct Printful catalog variant IDs.')
  console.log('')
  
  await checkDatabaseVariantIds()
  await checkProductsAPI()
  
  console.log('\n💡 ANALYSIS:')
  console.log('=============')
  console.log('1. If printful_variant_id is NULL or 0: Database needs to be updated with real IDs')
  console.log('2. If printful_variant_id has values: Check if they match the real catalog IDs we found')
  console.log('3. Real catalog IDs we discovered: 8923 (T-shirt), 5530 (Hoodie), 10163 (Sticker)')
  console.log('4. If database IDs are different, we need to update them or the frontend mapping')
}

main()