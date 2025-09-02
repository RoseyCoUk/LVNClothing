#!/usr/bin/env tsx
/**
 * Fix duplicate product slugs by updating them to be unique
 * This is safer than deleting products that may have variants
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixDuplicateSlugs() {
  console.log('🔧 Analyzing and Fixing Duplicate Product Slugs...\n')

  // The 4 duplicate products
  const duplicateProducts = [
    {
      id: '30a908ed-86ed-40f3-97e4-90055ee35098',
      name: 'Unisex Hoodie DARK',
      currentSlug: 'reform-uk-hoodie',
      correctSlug: 'unisex-hoodie-dark'
    },
    {
      id: '3b72a572-6607-4df3-81d9-32ffe77740af', 
      name: 'Unisex t-shirt DARK',
      currentSlug: 'reform-uk-tshirt',
      correctSlug: 'unisex-tshirt-dark'
    },
    {
      id: 'a75eab61-ccbd-48ec-b136-795000bbde4b',
      name: 'Unisex t-shirt LIGHT', 
      currentSlug: 'reform-uk-tshirt',
      correctSlug: 'unisex-tshirt-light'
    },
    {
      id: 'c0bc0ec4-168c-49ee-bddd-ca9374f41124',
      name: 'Unisex Hoodie LIGHT',
      currentSlug: 'reform-uk-hoodie', 
      correctSlug: 'unisex-hoodie-light'
    }
  ]

  // Step 1: Check if these products have variants
  console.log('🔍 Checking for linked variants...')
  
  for (const product of duplicateProducts) {
    try {
      const { data: variants, error } = await supabase
        .from('product_variants')
        .select('id, printful_variant_id, color, size')
        .eq('product_id', product.id)
      
      if (error) {
        console.log(`⚠️  Could not check variants for ${product.name}: ${error.message}`)
        continue
      }
      
      console.log(`📦 ${product.name}:`)
      console.log(`   Current slug: ${product.currentSlug}`)
      console.log(`   Variants: ${variants?.length || 0}`)
      
      if (variants && variants.length > 0) {
        console.log(`   Sample variants: ${variants.slice(0, 3).map(v => `${v.color || ''}/${v.size || ''}`).join(', ')}`)
      }
    } catch (e) {
      console.log(`❌ Error checking ${product.name}: ${e.message}`)
    }
  }

  console.log('\n🔧 Recommended Actions:')
  console.log('=' * 50)
  
  for (const product of duplicateProducts) {
    console.log(`\n${product.name}:`)
    console.log(`  UPDATE products SET slug = '${product.correctSlug}' WHERE id = '${product.id}';`)
  }
  
  console.log('\n📋 Manual Steps:')
  console.log('1. Run the UPDATE statements above to fix slug uniqueness')
  console.log('2. Verify no other systems reference the old slugs')  
  console.log('3. Update frontend routing if needed')
  
  console.log('\n⚠️  DO NOT DELETE these products directly!')
  console.log('   They likely contain important variant data for fulfillment')
}

fixDuplicateSlugs().catch(console.error)