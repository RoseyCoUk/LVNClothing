import { promises as fs } from 'fs'
import path from 'path'

// Exact Printful color hex values from the provided data
const correctPrintfulColors = {
  // Cap Colors
  'Black': '#181717', // Cap specific
  'Dark Grey': '#39353a', // Cap specific
  'Khaki': '#b49771',
  'Light Blue': '#b5cbda', // Cap specific
  'Navy': '#182031', // Cap specific
  'Pink': '#fab2ba', // Cap specific
  'Stone': '#d6bdad',
  'White': '#ffffff',

  // T-Shirt DARK Colors
  'Army': '#5f5849',
  'Asphalt': '#52514f', 
  'Autumn': '#c85313',
  'Black (T-Shirt)': '#0c0c0c', // T-shirt specific
  'Black Heather': '#0b0b0b',
  'Dark Grey Heather': '#3E3C3D',
  'Heather Deep Teal': '#447085',
  'Mauve': '#bf6e6e',
  'Navy (T-Shirt)': '#212642', // T-shirt specific
  'Olive': '#5b642f',
  'Red': '#d0071e', // T-shirt specific
  'Steel Blue': '#668ea7',

  // T-Shirt LIGHT Colors  
  'Ash': '#f0f1ea',
  'Athletic Heather': '#cececc',
  'Heather Dust': '#e5d9c9',
  'Heather Prism Peach': '#f3c2b2',
  'Mustard': '#eda027',
  'Pink (T-Shirt)': '#fdbfc7', // T-shirt specific
  'Yellow': '#ffd667',

  // Hoodie DARK Colors
  'Black (Hoodie)': '#0b0b0b', // Hoodie specific
  'Dark Heather': '#47484d',
  'Indigo Blue': '#395d82',
  'Navy (Hoodie)': '#131928', // Hoodie specific
  'Red (Hoodie)': '#da0a1a', // Hoodie specific

  // Hoodie LIGHT Colors
  'Light Blue (Hoodie)': '#a1c5e1', // Hoodie specific
  'Light Pink': '#f3d4e3',
  'Sport Grey': '#9b969c'
}

// Helper function to get correct hex for specific product context
function getCorrectHex(color: string, productType: 'tshirt' | 'hoodie' | 'cap'): string {
  // Handle product-specific variations
  if (color === 'Black') {
    if (productType === 'cap') return correctPrintfulColors['Black'] // '#181717'
    if (productType === 'tshirt') return correctPrintfulColors['Black (T-Shirt)'] // '#0c0c0c'
    if (productType === 'hoodie') return correctPrintfulColors['Black (Hoodie)'] // '#0b0b0b'
  }
  
  if (color === 'Navy') {
    if (productType === 'cap') return correctPrintfulColors['Navy'] // '#182031'
    if (productType === 'tshirt') return correctPrintfulColors['Navy (T-Shirt)'] // '#212642'
    if (productType === 'hoodie') return correctPrintfulColors['Navy (Hoodie)'] // '#131928'
  }
  
  if (color === 'Red') {
    if (productType === 'tshirt') return correctPrintfulColors['Red'] // '#d0071e'
    if (productType === 'hoodie') return correctPrintfulColors['Red (Hoodie)'] // '#da0a1a'
  }
  
  if (color === 'Pink') {
    if (productType === 'cap') return correctPrintfulColors['Pink'] // '#fab2ba'
    if (productType === 'tshirt') return correctPrintfulColors['Pink (T-Shirt)'] // '#fdbfc7'
  }
  
  if (color === 'Light Blue') {
    if (productType === 'cap') return correctPrintfulColors['Light Blue'] // '#b5cbda'
    if (productType === 'hoodie') return correctPrintfulColors['Light Blue (Hoodie)'] // '#a1c5e1'
  }

  // Direct mappings for colors that don't vary by product
  return correctPrintfulColors[color] || '#000000' // fallback to black if not found
}

async function fixTshirtColors() {
  const filePath = path.join(process.cwd(), 'src/hooks/tshirt-variants-merged-fixed.ts')
  console.log('🔧 Fixing T-shirt color hex values...')
  
  let content = await fs.readFile(filePath, 'utf8')
  
  // Fix specific T-shirt color hex values
  const tshirtColorFixes = [
    { color: 'Army', incorrect: '#4B5320', correct: '#5f5849' },
    { color: 'Asphalt', incorrect: '#2F4F4F', correct: '#52514f' },
    { color: 'Autumn', incorrect: '#8B4513', correct: '#c85313' },
    { color: 'Black', incorrect: '#000000', correct: '#0c0c0c' },
    { color: 'Black Heather', incorrect: '#1C1C1C', correct: '#0b0b0b' },
    { color: 'Dark Grey Heather', incorrect: '#696969', correct: '#3E3C3D' },
    { color: 'Heather Deep Teal', incorrect: '#2F4F4F', correct: '#447085' },
    { color: 'Mauve', incorrect: '#E0B0FF', correct: '#bf6e6e' },
    { color: 'Navy', incorrect: '#000080', correct: '#212642' },
    { color: 'Olive', incorrect: '#808000', correct: '#5b642f' },
    { color: 'Red', incorrect: '#FF0000', correct: '#d0071e' },
    { color: 'Steel Blue', incorrect: '#4682B4', correct: '#668ea7' },
    { color: 'Ash', incorrect: '#F0F1EA', correct: '#f0f1ea' },
    { color: 'Athletic Heather', incorrect: '#CECECC', correct: '#cececc' },
    { color: 'Heather Dust', incorrect: '#E5D9C9', correct: '#e5d9c9' },
    { color: 'Heather Prism Peach', incorrect: '#F3C2B2', correct: '#f3c2b2' },
    { color: 'Mustard', incorrect: '#FFDB58', correct: '#eda027' },
    { color: 'Pink', incorrect: '#FFC0CB', correct: '#fdbfc7' },
    { color: 'White', incorrect: '#FFFFFF', correct: '#ffffff' },
    { color: 'Yellow', incorrect: '#FFFF00', correct: '#ffd667' }
  ]
  
  let fixCount = 0
  for (const fix of tshirtColorFixes) {
    const oldPattern = new RegExp(`colorHex: "${fix.incorrect}"`, 'g')
    const newContent = content.replace(oldPattern, `colorHex: "${fix.correct}"`)
    if (newContent !== content) {
      const matches = (content.match(oldPattern) || []).length
      console.log(`  ✅ Fixed ${matches} instances of ${fix.color}: ${fix.incorrect} → ${fix.correct}`)
      fixCount += matches
      content = newContent
    }
  }
  
  // Also fix the tshirtColors array at the bottom
  const colorArrayFixes = [
    { name: 'Army', oldHex: '#4B5320', newHex: '#5f5849' },
    { name: 'Asphalt', oldHex: '#2F4F4F', newHex: '#52514f' },
    { name: 'Autumn', oldHex: '#8B4513', newHex: '#c85313' },
    { name: 'Black', oldHex: '#000000', newHex: '#0c0c0c' },
    { name: 'Black Heather', oldHex: '#1C1C1C', newHex: '#0b0b0b' },
    { name: 'Dark Grey Heather', oldHex: '#696969', newHex: '#3E3C3D' },
    { name: 'Heather Deep Teal', oldHex: '#2F4F4F', newHex: '#447085' },
    { name: 'Mauve', oldHex: '#E0B0FF', newHex: '#bf6e6e' },
    { name: 'Navy', oldHex: '#000080', newHex: '#212642' },
    { name: 'Olive', oldHex: '#808000', newHex: '#5b642f' },
    { name: 'Red', oldHex: '#FF0000', newHex: '#d0071e' },
    { name: 'Steel Blue', oldHex: '#4682B4', newHex: '#668ea7' },
    { name: 'Mustard', oldHex: '#FFDB58', newHex: '#eda027' },
    { name: 'Pink', oldHex: '#FFC0CB', newHex: '#fdbfc7' },
    { name: 'Yellow', oldHex: '#FFFF00', newHex: '#ffd667' }
  ]
  
  for (const fix of colorArrayFixes) {
    const oldPattern = new RegExp(`{ name: '${fix.name}', hex: '${fix.oldHex}'`, 'g')
    const newReplacement = `{ name: '${fix.name}', hex: '${fix.newHex}'`
    const newContent = content.replace(oldPattern, newReplacement)
    if (newContent !== content) {
      console.log(`  ✅ Fixed color array for ${fix.name}: ${fix.oldHex} → ${fix.newHex}`)
      content = newContent
    }
  }
  
  await fs.writeFile(filePath, content, 'utf8')
  console.log(`📝 Updated ${filePath} with ${fixCount} color hex fixes`)
}

async function fixHoodieColors() {
  const filePath = path.join(process.cwd(), 'src/hooks/hoodie-variants-merged-fixed.ts')
  console.log('🔧 Fixing Hoodie color hex values...')
  
  try {
    let content = await fs.readFile(filePath, 'utf8')
    
    // Fix specific Hoodie color hex values
    const hoodieColorFixes = [
      { color: 'Black', incorrect: '#000000', correct: '#0b0b0b' },
      { color: 'Dark Heather', incorrect: '#47484d', correct: '#47484d' }, // already correct
      { color: 'Indigo Blue', incorrect: '#4B0082', correct: '#395d82' },
      { color: 'Navy', incorrect: '#000080', correct: '#131928' },
      { color: 'Red', incorrect: '#FF0000', correct: '#da0a1a' },
      { color: 'Light Blue', incorrect: '#ADD8E6', correct: '#a1c5e1' },
      { color: 'Light Pink', incorrect: '#FFB6C1', correct: '#f3d4e3' },
      { color: 'Sport Grey', incorrect: '#9B9B9B', correct: '#9b969c' },
      { color: 'White', incorrect: '#FFFFFF', correct: '#ffffff' }
    ]
    
    let fixCount = 0
    for (const fix of hoodieColorFixes) {
      const oldPattern = new RegExp(`colorHex: "${fix.incorrect}"`, 'g')
      const newContent = content.replace(oldPattern, `colorHex: "${fix.correct}"`)
      if (newContent !== content) {
        const matches = (content.match(oldPattern) || []).length
        console.log(`  ✅ Fixed ${matches} instances of ${fix.color}: ${fix.incorrect} → ${fix.correct}`)
        fixCount += matches
        content = newContent
      }
    }
    
    await fs.writeFile(filePath, content, 'utf8')
    console.log(`📝 Updated ${filePath} with ${fixCount} color hex fixes`)
  } catch (error) {
    console.log(`⚠️  Hoodie variants file not found: ${filePath}`)
  }
}

async function checkForCapVariants() {
  const filePath = path.join(process.cwd(), 'src/hooks/cap-variants-merged-fixed.ts')
  console.log('🔧 Checking for Cap color variants...')
  
  try {
    let content = await fs.readFile(filePath, 'utf8')
    
    // Cap colors should use the cap-specific hex values
    const capColorFixes = [
      { color: 'Black', correct: '#181717' },
      { color: 'Dark Grey', correct: '#39353a' },
      { color: 'Khaki', correct: '#b49771' },
      { color: 'Light Blue', correct: '#b5cbda' },
      { color: 'Navy', correct: '#182031' },
      { color: 'Pink', correct: '#fab2ba' },
      { color: 'Stone', correct: '#d6bdad' },
      { color: 'White', correct: '#ffffff' }
    ]
    
    let needsUpdates = false
    for (const fix of capColorFixes) {
      if (content.includes(`color: "${fix.color}"`)) {
        needsUpdates = true
        console.log(`  📋 Found ${fix.color} - should use ${fix.correct}`)
      }
    }
    
    if (needsUpdates) {
      console.log(`⚠️  Cap variants found but manual review needed for specific hex values`)
    }
  } catch (error) {
    console.log(`⚠️  Cap variants file not found: ${filePath}`)
  }
}

async function main() {
  console.log('🎨 Fixing Printful Color Hex Values')
  console.log('=====================================\n')
  
  await fixTshirtColors()
  console.log()
  
  await fixHoodieColors() 
  console.log()
  
  await checkForCapVariants()
  console.log()
  
  console.log('✅ Color hex value fixes completed!')
  console.log('\n📋 Next steps:')
  console.log('   1. Test the frontend to verify color swatches now match Printful colors')
  console.log('   2. Check if any database sync is needed for product_variants table')
  console.log('   3. Verify color picker functionality on product pages')
}

main().catch(console.error)