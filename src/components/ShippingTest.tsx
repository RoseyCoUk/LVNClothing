import React, { useState } from 'react'
import { useShipping } from '../contexts/ShippingContext'
import { useCart } from '../contexts/CartContext'
import ShippingOptions from './ShippingOptions'

const ShippingTest: React.FC = () => {
  const { addToCart, cartItems } = useCart()
  const { fetchShippingRates, selectedShippingOption, getShippingCost, getTotalWithShipping } = useShipping()
  
  const [testAddress, setTestAddress] = useState({
    address1: '123 Test Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'United Kingdom'
  })

  const addTestItem = () => {
    addToCart({
      id: 'test-1',
      name: 'Test T-Shirt',
      price: 19.99,
      image: '/test-image.jpg',
      printful_variant_id: 1001 // Example Printful variant ID
    })
  }

  const testShippingRates = async () => {
    try {
      await fetchShippingRates({
        address1: testAddress.address1,
        city: testAddress.city,
        country_code: 'GB',
        zip: testAddress.postcode
      })
    } catch (error) {
      // Test failed silently
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shipping System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <button
              onClick={addTestItem}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Test Item to Cart
            </button>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Address</label>
              <input
                type="text"
                value={testAddress.address1}
                onChange={(e) => setTestAddress(prev => ({ ...prev, address1: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">City</label>
              <input
                type="text"
                value={testAddress.city}
                onChange={(e) => setTestAddress(prev => ({ ...prev, city: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Postcode</label>
              <input
                type="text"
                value={testAddress.postcode}
                onChange={(e) => setTestAddress(prev => ({ ...prev, postcode: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            
            <button
              onClick={testShippingRates}
              className="w-full bg-green-600 text-white px-4 py-2 rounded"
            >
              Test Shipping Rates
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Current State</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Cart Items ({cartItems.length})</h3>
              <div className="text-sm text-gray-600">
                {cartItems.map(item => (
                  <div key={item.id}>
                    {item.name} x{item.quantity} - £{item.price}
                    {item.printful_variant_id && ` (Variant: ${item.printful_variant_id})`}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium">Selected Shipping</h3>
              <div className="text-sm text-gray-600">
                {selectedShippingOption ? (
                  <div>
                    {selectedShippingOption.name} - £{selectedShippingOption.rate}
                  </div>
                ) : (
                  'None selected'
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium">Shipping Cost</h3>
              <div className="text-sm text-gray-600">
                £{(getShippingCost() / 100).toFixed(2)}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium">Total with Shipping</h3>
              <div className="text-sm text-gray-600">
                £{(getTotalWithShipping() / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Shipping Options</h2>
        <ShippingOptions />
      </div>
    </div>
  )
}

export default ShippingTest
