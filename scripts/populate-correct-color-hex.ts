#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

// Correct color mappings from PRINTFUL_PRODUCT_VARIANTS_LIST.md
const colorMappings = {
  // Cap colors
  'cap': {
    'Black': '#181717',
    'Dark Grey': '#39353a',
    'Khaki': '#b49771',
    'Light Blue': '#b5cbda',
    'Navy': '#182031',
    'Pink': '#fab2ba',
    'Stone': '#d6bdad',
    'White': '#ffffff'
  },
  // T-shirt DARK colors
  'tshirt_dark': {
    'Army': '#5f5849',
    'Asphalt': '#52514f',
    'Autumn': '#c85313',
    'Black': '#0c0c0c',
    'Black Heather': '#0b0b0b',
    'Dark Grey Heather': '#3E3C3D',
    'Heather Deep Teal': '#447085',
    'Mauve': '#bf6e6e',
    'Navy': '#212642',
    'Olive': '#5b642f',
    'Red': '#d0071e',
    'Steel Blue': '#668ea7'
  },
  // T-shirt LIGHT colors
  'tshirt_light': {
    'Ash': '#f0f1ea',
    'Athletic Heather': '#cececc',
    'Heather Dust': '#e5d9c9',
    'Heather Prism Peach': '#f3c2b2',
    'Mustard': '#eda027',
    'Pink': '#fdbfc7',
    'White': '#ffffff',
    'Yellow': '#ffd667'
  },
  // Hoodie DARK colors
  'hoodie_dark': {
    'Black': '#0b0b0b',
    'Dark Heather': '#47484d',
    'Indigo Blue': '#395d82',
    'Navy': '#131928',
    'Red': '#da0a1a'
  },
  // Hoodie LIGHT colors
  'hoodie_light': {
    'Light Blue': '#a1c5e1',
    'Light Pink': '#f3d4e3',
    'Sport Grey': '#9b969c',
    'White': '#ffffff'
  }
}

async function populateProducts() {
  console.log('🚀 Creating products and variants with correct color_hex values...')
  
  // Create products first
  const products = [
    {
      name: 'Reform UK Cap',
      description: 'High-quality Reform UK cap with authentic colors',
      slug: 'reform-uk-cap',
      category: 'accessories',
      price: 1999, // £19.99
      rating: 4.8,
      is_active: true
    },
    {
      name: 'Unisex t-shirt DARK',
      description: 'Premium dark colors Reform UK t-shirt collection',
      slug: 'reform-uk-tshirt-dark',
      category: 'apparel',
      price: 2499, // £24.99
      rating: 4.7,
      is_active: true
    },
    {
      name: 'Unisex t-shirt LIGHT',
      description: 'Premium light colors Reform UK t-shirt collection',
      slug: 'reform-uk-tshirt-light',
      category: 'apparel',
      price: 2499, // £24.99
      rating: 4.7,
      is_active: true
    },
    {
      name: 'Unisex Hoodie DARK',
      description: 'Premium dark colors Reform UK hoodie collection',
      slug: 'reform-uk-hoodie-dark',
      category: 'apparel',
      price: 3999, // £39.99
      rating: 4.6,
      is_active: true
    },
    {
      name: 'Unisex Hoodie LIGHT',
      description: 'Premium light colors Reform UK hoodie collection',
      slug: 'reform-uk-hoodie-light',
      category: 'apparel',
      price: 3999, // £39.99
      rating: 4.6,
      is_active: true
    }
  ]

  // Clear existing products
  await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const { data: insertedProducts, error: productError } = await supabase
    .from('products')
    .insert(products)
    .select('*')

  if (productError) {
    console.error('❌ Error creating products:', productError)
    return
  }

  console.log(`✅ Created ${insertedProducts.length} products`)

  // Create variants for each product
  const variants = []
  const sizes = ['S', 'M', 'L', 'XL', '2XL']

  for (const product of insertedProducts) {
    let colorMap = {}
    
    if (product.name.includes('Cap')) {
      colorMap = colorMappings.cap
    } else if (product.name.includes('t-shirt DARK')) {
      colorMap = colorMappings.tshirt_dark
    } else if (product.name.includes('t-shirt LIGHT')) {
      colorMap = colorMappings.tshirt_light
    } else if (product.name.includes('Hoodie DARK')) {
      colorMap = colorMappings.hoodie_dark
    } else if (product.name.includes('Hoodie LIGHT')) {
      colorMap = colorMappings.hoodie_light
    }

    for (const [colorName, colorHex] of Object.entries(colorMap)) {
      if (product.name.includes('Cap')) {
        // Caps are one size
        variants.push({
          product_id: product.id,
          color: colorName,
          color_hex: colorHex,
          size: 'One Size',
          stock: 50,
          is_available: true,
          printful_variant_id: Math.floor(Math.random() * 1000000).toString()
        })
      } else {
        // T-shirts and Hoodies have multiple sizes
        for (const size of sizes) {
          variants.push({
            product_id: product.id,
            color: colorName,
            color_hex: colorHex,
            size: size,
            stock: 50,
            is_available: true,
            printful_variant_id: Math.floor(Math.random() * 1000000).toString()
          })
        }
      }
    }
  }

  const { data: insertedVariants, error: variantError } = await supabase
    .from('product_variants')
    .insert(variants)
    .select('*')

  if (variantError) {
    console.error('❌ Error creating variants:', variantError)
    return
  }

  console.log(`✅ Created ${insertedVariants.length} variants with correct color_hex values`)

  // Verify the colors
  const { data: capVariants } = await supabase
    .from('product_variants')
    .select('color, color_hex')
    .eq('color', 'Olive')

  console.log('🔍 Olive color verification:', capVariants)
  
  const oliveVariant = capVariants?.find(v => v.color === 'Olive')
  if (oliveVariant?.color_hex === '#5b642f') {
    console.log('✅ Olive color is correct: #5b642f (dark olive green)')
  } else {
    console.log(`❌ Olive color is wrong: ${oliveVariant?.color_hex} (should be #5b642f)`)
  }
}

populateProducts().then(() => {
  console.log('🎯 Color hex population complete!')
  process.exit(0)
}).catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})