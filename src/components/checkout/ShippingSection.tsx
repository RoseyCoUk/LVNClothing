import React, { useState, useEffect } from 'react'
import { MapPin, AlertCircle } from 'lucide-react'
import { useShippingQuotes } from '../../hooks/useShippingQuotes'
import ShippingMethods from './ShippingMethods'
import type { ShippingOption, Recipient } from '../../lib/shipping/types'
import { getCountryCode } from '../../lib/shipping/printful'
import { useCart } from '../../contexts/CartContext'

interface ShippingSectionProps {
  onShippingSelect?: (option: ShippingOption) => void
  selectedShipping?: ShippingOption | null
  className?: string
}

export default function ShippingSection({
  onShippingSelect,
  selectedShipping,
  className = ''
}: ShippingSectionProps) {
  const { cartItems } = useCart()
  const { loading, options, error, fetchQuotes, clearQuotes } = useShippingQuotes()
  
  const [address, setAddress] = useState({
    address1: '',
    city: '',
    postcode: '',
    country: 'United Kingdom'
  })

  const [addressComplete, setAddressComplete] = useState(false)

  // Check if address is complete enough to fetch shipping quotes
  useEffect(() => {
    const isComplete = !!(address.address1 && address.city && address.postcode)
    setAddressComplete(isComplete)
    
    // Clear quotes when address becomes incomplete
    if (!isComplete) {
      clearQuotes()
    }
  }, [address.address1, address.city, address.postcode, clearQuotes])

  // Fetch shipping quotes when address is complete and cart has items
  useEffect(() => {
    if (addressComplete && cartItems.length > 0) {
      const recipient: Recipient = {
        address1: address.address1,
        city: address.city,
        country_code: getCountryCode(address.country),
        zip: address.postcode
      }

      const request = {
        recipient,
        items: cartItems.map(item => ({
          printful_variant_id: item.printful_variant_id || parseInt(item.id.toString()),
          quantity: item.quantity
        }))
      }

      fetchQuotes(request)
    }
  }, [addressComplete, cartItems, address, fetchQuotes])

  const handleAddressChange = (field: keyof typeof address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
  }

  const handleShippingSelect = (option: ShippingOption) => {
    onShippingSelect?.(option)
  }

  const handleCountryChange = (country: string) => {
    setAddress(prev => ({ ...prev, country }))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Address Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 *
            </label>
            <input
              type="text"
              value={address.address1}
              onChange={(e) => handleAddressChange('address1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Main Street"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="London"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode *
            </label>
            <input
              type="text"
              value={address.postcode}
              onChange={(e) => handleAddressChange('postcode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="SW1A 1AA"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <select
              value={address.country}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Ireland">Ireland</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Belgium">Belgium</option>
              <option value="Switzerland">Switzerland</option>
            </select>
          </div>
        </div>

        {!addressComplete && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Please complete your shipping address to see available shipping options
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Shipping Methods */}
      {addressComplete && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <ShippingMethods
            options={options}
            value={selectedShipping?.id}
            onChange={handleShippingSelect}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {/* Selected Shipping Summary */}
      {selectedShipping && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Selected Shipping</h4>
              <p className="text-sm text-blue-700">
                {selectedShipping.name} • {selectedShipping.currency} {selectedShipping.rate}
                {selectedShipping.minDeliveryDays && selectedShipping.maxDeliveryDays && 
                  ` • ${selectedShipping.minDeliveryDays}-${selectedShipping.maxDeliveryDays} days`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="font-medium text-blue-900">
                {selectedShipping.currency} {selectedShipping.rate}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
