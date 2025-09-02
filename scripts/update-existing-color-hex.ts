#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

// Correct color mappings from PRINTFUL_PRODUCT_VARIANTS_LIST.md
const colorHexMap = {
  // Key colors we need to fix
  'Olive': '#5b642f',
  'Steel Blue': '#668ea7',
  'Army': '#5f5849',
  'Autumn': '#c85313',
  'Mustard': '#eda027',
  'Heather Dust': '#e5d9c9',
  'Heather Prism Peach': '#f3c2b2',
  'Black': '#0c0c0c', // for t-shirts
  'Navy': '#212642', // for t-shirt dark
  'Red': '#d0071e',
  'Pink': '#fdbfc7', // for t-shirt light
  'Yellow': '#ffd667',
  'White': '#ffffff'
}

async function updateColorHexValues() {
  console.log('🚀 Updating existing product variants with correct color_hex values...')
  
  // Get all existing variants
  const { data: existingVariants, error: fetchError } = await supabase
    .from('product_variants')
    .select('*')

  if (fetchError) {
    console.error('❌ Error fetching variants:', fetchError)
    return
  }

  console.log(`📊 Found ${existingVariants?.length || 0} existing variants`)

  if (!existingVariants || existingVariants.length === 0) {
    console.log('ℹ️ No existing variants to update. Database might be empty.')
    return
  }

  let updatedCount = 0

  for (const variant of existingVariants) {
    const correctHex = colorHexMap[variant.color]
    
    if (correctHex && variant.color_hex !== correctHex) {
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ color_hex: correctHex })
        .eq('id', variant.id)

      if (updateError) {
        console.error(`❌ Error updating variant ${variant.id}:`, updateError)
      } else {
        console.log(`✅ Updated ${variant.color}: ${variant.color_hex} → ${correctHex}`)
        updatedCount++
      }
    }
  }

  console.log(`🎯 Updated ${updatedCount} variants with correct color_hex values`)

  // Verify critical colors
  const { data: oliveVariants } = await supabase
    .from('product_variants')
    .select('color, color_hex')
    .eq('color', 'Olive')

  if (oliveVariants && oliveVariants.length > 0) {
    const olive = oliveVariants[0]
    if (olive.color_hex === '#5b642f') {
      console.log('✅ Olive color verified: #5b642f (correct dark olive green)')
    } else {
      console.log(`❌ Olive color still wrong: ${olive.color_hex} (should be #5b642f)`)
    }
  } else {
    console.log('ℹ️ No Olive variants found in database')
  }
}

updateColorHexValues().then(() => {
  console.log('✨ Color hex update complete!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})