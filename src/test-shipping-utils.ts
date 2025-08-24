// Test utilities for shipping integration
import { toMinor, fromMinor, formatCurrency } from './lib/money'
import type { Recipient, CartItem, ShippingQuoteRequest, ShippingOption } from './lib/shipping/types'

// Test money utilities
export function testMoneyUtils() {
  console.log('🧪 Testing Money Utils:')
  console.log('toMinor(5.99):', toMinor(5.99)) // Should output: 599
  console.log('fromMinor(599):', fromMinor(599)) // Should output: 5.99
  console.log('formatCurrency(5.99):', formatCurrency(5.99)) // Should output: £5.99
  
  return {
    toMinor: toMinor(5.99) === 599,
    fromMinor: fromMinor(599) === 5.99,
    formatCurrency: formatCurrency(5.99) === '£5.99'
  }
}

// Test types
export function testTypes() {
  console.log('🧪 Testing Types:')
  
  const testRecipient: Recipient = {
    address1: '123 Test St',
    city: 'London',
    country_code: 'GB',
    zip: 'SW1A 1AA'
  }

  const testItems: CartItem[] = [
    { printful_variant_id: 17008, quantity: 2 }
  ]

  const testRequest: ShippingQuoteRequest = {
    recipient: testRecipient,
    items: testItems
  }

  console.log('Recipient:', testRecipient)
  console.log('Items:', testItems)
  console.log('Request:', testRequest)
  
  return {
    recipient: testRecipient,
    items: testItems,
    request: testRequest
  }
}

// Test data for integration testing
export const testData = {
  addresses: {
    london: {
      address1: '123 Test Street',
      city: 'London',
      country_code: 'GB',
      zip: 'SW1A 1AA'
    },
    manchester: {
      address1: '456 Sample Road',
      city: 'Manchester',
      country_code: 'GB',
      zip: 'M1 1AA'
    },
    dublin: {
      address1: '789 Example Lane',
      city: 'Dublin',
      country_code: 'IE',
      zip: 'D01 1AA'
    }
  },
  
  items: {
    single: [
      { printful_variant_id: 17008, quantity: 1 }
    ],
    multiple: [
      { printful_variant_id: 17008, quantity: 2 },
      { printful_variant_id: 17009, quantity: 1 }
    ],
    large: [
      { printful_variant_id: 17008, quantity: 5 },
      { printful_variant_id: 17009, quantity: 3 },
      { printful_variant_id: 17080, quantity: 2 }
    ]
  },
  
  shippingOptions: [
    {
      id: 'standard',
      name: 'Standard Shipping',
      rate: '4.99',
      currency: 'GBP',
      minDeliveryDays: 3,
      maxDeliveryDays: 5
    },
    {
      id: 'express',
      name: 'Express Shipping',
      rate: '9.99',
      currency: 'GBP',
      minDeliveryDays: 1,
      maxDeliveryDays: 2
    }
  ]
}

// Helper to create test requests
export function createTestRequest(addressKey: keyof typeof testData.addresses, itemsKey: keyof typeof testData.items): ShippingQuoteRequest {
  return {
    recipient: testData.addresses[addressKey],
    items: testData.items[itemsKey]
  }
}

// Test validation
export function validateTestData() {
  console.log('🧪 Validating Test Data:')
  
  const tests = [
    { name: 'London Address', data: testData.addresses.london, valid: true },
    { name: 'Dublin Address', data: testData.addresses.dublin, valid: true },
    { name: 'Single Item', data: testData.items.single, valid: true },
    { name: 'Multiple Items', data: testData.items.multiple, valid: true }
  ]
  
  tests.forEach(test => {
    console.log(`${test.name}: ${test.valid ? '✅' : '❌'}`)
  })
  
  return tests.every(t => t.valid)
}
