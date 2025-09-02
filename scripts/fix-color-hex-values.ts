import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Exact Printful color hex values from the provided data
const correctColorHexValues = {
  // Cap Colors
  'Black': '#181717', // Cap, T-shirt, Hoodie
  'Dark Grey': '#39353a', // Cap
  'Khaki': '#b49771', // Cap
  'Light Blue': '#b5cbda', // Cap
  'Navy': '#182031', // Cap
  'Pink': '#fab2ba', // Cap
  'Stone': '#d6bdad', // Cap
  'White': '#ffffff', // Cap, T-shirt, Hoodie

  // T-Shirt DARK Colors
  'Army': '#5f5849',
  'Asphalt': '#52514f', 
  'Autumn': '#c85313',
  'Black Heather': '#0b0b0b',
  'Dark Grey Heather': '#3E3C3D',
  'Heather Deep Teal': '#447085',
  'Mauve': '#bf6e6e',
  'Olive': '#5b642f',
  'Red': '#d0071e',
  'Steel Blue': '#668ea7',

  // T-Shirt LIGHT Colors  
  'Ash': '#f0f1ea',
  'Athletic Heather': '#cececc',
  'Heather Dust': '#e5d9c9',
  'Heather Prism Peach': '#f3c2b2',
  'Mustard': '#eda027',
  'Yellow': '#ffd667',

  // Hoodie DARK Colors
  'Dark Heather': '#47484d',
  'Indigo Blue': '#395d82',

  // Hoodie LIGHT Colors
  'Light Pink': '#f3d4e3',
  'Sport Grey': '#9b969c',

  // Special cases for overlapping colors
  'Navy (T-Shirt)': '#212642', // Different from Cap navy
  'Black (T-Shirt)': '#0c0c0c', // Different from Cap/Hoodie black  
  'Black (Hoodie)': '#0b0b0b', // Different from Cap/T-shirt black
  'Navy (Hoodie)': '#131928', // Different from Cap/T-shirt navy
  'Red (Hoodie)': '#da0a1a', // Different from T-shirt red
  'Pink (T-Shirt)': '#fdbfc7', // Different from Cap pink
  'Light Blue (Hoodie)': '#a1c5e1', // Different from Cap light blue
}

async function checkCurrentColorHexValues() {
  console.log('🔍 Checking current color_hex values in database...\n')
  
  const { data, error } = await supabase
    .from('product_variants')
    .select('id, product_id, color, color_hex')
    .not('color_hex', 'is', null)
    .order('product_id')
    .order('color')

  if (error) {
    console.error('❌ Error querying database:', error)
    return
  }

  console.log('Current color_hex values:')
  console.log('========================')
  
  const issues: any[] = []
  
  data?.forEach(variant => {
    const expectedHex = getExpectedHex(variant.color, variant.product_id)
    const isCorrect = variant.color_hex === expectedHex
    
    console.log(`${variant.product_id} | ${variant.color.padEnd(20)} | ${variant.color_hex} ${isCorrect ? '✅' : '❌ Should be: ' + expectedHex}`)
    
    if (!isCorrect && expectedHex) {
      issues.push({
        id: variant.id,
        product_id: variant.product_id,
        color: variant.color,
        current_hex: variant.color_hex,
        correct_hex: expectedHex
      })
    }
  })

  console.log(`\n📊 Found ${issues.length} color hex issues to fix`)
  return issues
}

function getExpectedHex(color: string, productId: string): string | null {
  // Handle product-specific color variations
  if (color === 'Navy') {
    if (productId.includes('cap')) return correctColorHexValues['Navy'] // Cap navy
    if (productId.includes('tshirt')) return correctColorHexValues['Navy (T-Shirt)']
    if (productId.includes('hoodie')) return correctColorHexValues['Navy (Hoodie)']
  }
  
  if (color === 'Black') {
    if (productId.includes('cap')) return correctColorHexValues['Black'] // Cap black
    if (productId.includes('tshirt')) return correctColorHexValues['Black (T-Shirt)']
    if (productId.includes('hoodie')) return correctColorHexValues['Black (Hoodie)']
  }
  
  if (color === 'Red') {
    if (productId.includes('hoodie')) return correctColorHexValues['Red (Hoodie)']
    return correctColorHexValues['Red'] // T-shirt red
  }
  
  if (color === 'Pink') {
    if (productId.includes('tshirt')) return correctColorHexValues['Pink (T-Shirt)']
    return correctColorHexValues['Pink'] // Cap pink
  }
  
  if (color === 'Light Blue') {
    if (productId.includes('hoodie')) return correctColorHexValues['Light Blue (Hoodie)']
    return correctColorHexValues['Light Blue'] // Cap light blue
  }

  // Direct mapping for other colors
  return correctColorHexValues[color] || null
}

async function fixColorHexValues(issues: any[]) {
  console.log('\n🔧 Fixing color hex values...\n')
  
  for (const issue of issues) {
    const { error } = await supabase
      .from('product_variants')
      .update({ color_hex: issue.correct_hex })
      .eq('id', issue.id)

    if (error) {
      console.error(`❌ Failed to update ${issue.product_id} ${issue.color}:`, error)
    } else {
      console.log(`✅ Fixed ${issue.product_id} | ${issue.color}: ${issue.current_hex} → ${issue.correct_hex}`)
    }
  }
}

async function main() {
  console.log('🎨 Fixing Color Hex Values to Match Printful Data')
  console.log('================================================\n')
  
  const issues = await checkCurrentColorHexValues()
  
  if (!issues || issues.length === 0) {
    console.log('✅ All color hex values are already correct!')
    return
  }
  
  console.log('\nProceeding with fixes...\n')
  await fixColorHexValues(issues)
  
  console.log('\n🔍 Verifying fixes...\n')
  await checkCurrentColorHexValues()
  
  console.log('\n✅ Color hex value fixes completed!')
}

main().catch(console.error)