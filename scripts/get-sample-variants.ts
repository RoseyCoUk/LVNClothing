#!/usr/bin/env tsx

/**
 * Get Sample Variant IDs for Testing
 */

const PRINTFUL_TOKEN = 'dHfrvwWHc1abLufS0xz4EEEqgE0XboN7cDMX24mB'
const PRINTFUL_STORE_ID = '16651763'

async function getSampleVariants() {
  // Get T-shirt variants (product ID 390630122)
  const tshirtResponse = await fetch('https://api.printful.com/store/products/390630122', {
    headers: {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'X-PF-Store-Id': PRINTFUL_STORE_ID
    }
  })
  const tshirtData = await tshirtResponse.json()

  // Get Hoodie variants (product ID 390628740)
  const hoodieResponse = await fetch('https://api.printful.com/store/products/390628740', {
    headers: {
      'Authorization': `Bearer ${PRINTFUL_TOKEN}`,
      'X-PF-Store-Id': PRINTFUL_STORE_ID
    }
  })
  const hoodieData = await hoodieResponse.json()

  console.log('Sample T-shirt variant ID:', tshirtData.result.sync_variants[0].id)
  console.log('T-shirt name:', tshirtData.result.sync_variants[0].name)
  
  console.log('Sample Hoodie variant ID:', hoodieData.result.sync_variants[0].id)
  console.log('Hoodie name:', hoodieData.result.sync_variants[0].name)

  // Sticker (from previous debug)
  console.log('Sticker variant ID: 4938952082')
}

getSampleVariants()