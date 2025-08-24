import React, { useState } from 'react'
import { useShipping } from '../../contexts/ShippingContext'
import ShippingSection from './ShippingSection'
import type { ShippingOption } from '../../lib/shipping/types'

export default function ShippingExample() {
  const { updatePaymentIntent } = useShipping()
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [orderDraftId, setOrderDraftId] = useState('')

  const handleShippingSelect = (option: ShippingOption) => {
    setSelectedShipping(option)
    console.log('Shipping option selected:', option)
  }

  const handleUpdatePaymentIntent = async () => {
    if (!selectedShipping || !paymentIntentId) {
      alert('Please select shipping and enter PaymentIntent ID')
      return
    }

    try {
      const result = await updatePaymentIntent(
        paymentIntentId,
        0, // taxTotal - adjust as needed
        orderDraftId || undefined
      )
      
      console.log('PaymentIntent updated successfully:', result)
      alert('PaymentIntent updated successfully!')
      
    } catch (error) {
      console.error('Failed to update PaymentIntent:', error)
      alert(`Failed to update PaymentIntent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout Example</h1>
        <p className="text-gray-600">Complete shipping information to see available options</p>
      </div>

      {/* Shipping Section */}
      <ShippingSection
        onShippingSelect={handleShippingSelect}
        selectedShipping={selectedShipping}
      />

      {/* PaymentIntent Update Section */}
      {selectedShipping && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update PaymentIntent</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PaymentIntent ID
              </label>
              <input
                type="text"
                value={paymentIntentId}
                onChange={(e) => setPaymentIntentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="pi_1234567890"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Draft ID (optional)
              </label>
              <input
                type="text"
                value={orderDraftId}
                onChange={(e) => setOrderDraftId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="draft_123"
              />
            </div>
            
            <button
              onClick={handleUpdatePaymentIntent}
              disabled={!paymentIntentId}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Update PaymentIntent with Shipping
            </button>
          </div>
        </div>
      )}

      {/* Selected Shipping Summary */}
      {selectedShipping && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Ready to Update PaymentIntent</h4>
          <div className="text-sm text-green-700">
            <p><strong>Shipping Method:</strong> {selectedShipping.name}</p>
            <p><strong>Cost:</strong> {selectedShipping.currency} {selectedShipping.rate}</p>
            {selectedShipping.minDeliveryDays && selectedShipping.maxDeliveryDays && (
              <p><strong>Delivery:</strong> {selectedShipping.minDeliveryDays}-{selectedShipping.maxDeliveryDays} days</p>
            )}
            {selectedShipping.carrier && (
              <p><strong>Carrier:</strong> {selectedShipping.carrier}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
