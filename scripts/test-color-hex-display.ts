import { TshirtVariants, tshirtColors } from '../src/hooks/tshirt-variants-merged-fixed'
import { HoodieVariants, hoodieColors } from '../src/hooks/hoodie-variants-merged-fixed'

console.log('🎨 Testing Color Hex Display')
console.log('============================\n')

// Test T-shirt colors
console.log('T-SHIRT COLORS:')
console.log('===============')
tshirtColors.forEach(color => {
  const variants = TshirtVariants.filter(v => v.color === color.name)
  const firstVariant = variants[0]
  const matches = firstVariant && firstVariant.colorHex === color.hex
  
  console.log(`${color.name.padEnd(20)} | ${color.hex} | ${firstVariant?.colorHex || 'N/A'} ${matches ? '✅' : '❌'}`)
})

console.log('\nHOODIE COLORS:')
console.log('==============')
hoodieColors.forEach(color => {
  const variants = HoodieVariants.filter(v => v.color === color.name)
  const firstVariant = variants[0]
  const matches = firstVariant && firstVariant.colorHex === color.hex
  
  console.log(`${color.name.padEnd(20)} | ${color.hex} | ${firstVariant?.colorHex || 'N/A'} ${matches ? '✅' : '❌'}`)
})

// Test specific problem colors
console.log('\nSPECIFIC COLOR TESTS:')
console.log('=====================')

const problemColors = [
  { name: 'Olive', expectedHex: '#5b642f' },
  { name: 'Army', expectedHex: '#5f5849' },
  { name: 'Autumn', expectedHex: '#c85313' },
  { name: 'Mustard', expectedHex: '#eda027' },
  { name: 'Pink', expectedHex: '#fdbfc7' }
]

problemColors.forEach(testColor => {
  const tshirtVariant = TshirtVariants.find(v => v.color === testColor.name)
  const colorOption = tshirtColors.find(c => c.name === testColor.name)
  
  console.log(`${testColor.name}:`)
  console.log(`  Expected: ${testColor.expectedHex}`)
  console.log(`  Variant:  ${tshirtVariant?.colorHex || 'NOT FOUND'}`)
  console.log(`  Color:    ${colorOption?.hex || 'NOT FOUND'}`)
  console.log(`  Match:    ${tshirtVariant?.colorHex === testColor.expectedHex ? '✅' : '❌'}`)
  console.log()
})

console.log('✅ Color hex display test completed!')