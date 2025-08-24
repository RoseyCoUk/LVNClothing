import React, { useState, useEffect } from 'react'
import { Truck, Clock, Check } from 'lucide-react'
import type { ShippingOption } from '../../lib/shipping/types'
import { formatCurrency } from '../../lib/money'

interface ShippingMethodsProps {
  options: ShippingOption[]
  value?: string
  onChange: (opt: ShippingOption) => void
  loading?: boolean
  error?: string | null
  className?: string
}

export default function ShippingMethods({
  options,
  value,
  onChange,
  loading = false,
  error = null,
  className = ''
}: ShippingMethodsProps) {
  const [selected, setSelected] = useState<string | undefined>(value)

  // Update selected value when prop changes
  useEffect(() => {
    setSelected(value)
  }, [value])

  const handleOptionSelect = (option: ShippingOption) => {
    setSelected(option.id)
    onChange(option)
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5" />
          <span className="font-medium">Shipping Error</span>
        </div>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className={`text-gray-500 text-center py-8 ${className}`}>
        <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No shipping options available</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center space-x-2 mb-4">
        <Truck className="w-5 h-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">Shipping Methods</h3>
      </div>
      
      <div 
        role="radiogroup" 
        aria-label="Shipping method"
        className="space-y-3"
      >
        {options.map(opt => {
          const isSelected = selected === opt.id
          const deliveryDays = opt.minDeliveryDays && opt.maxDeliveryDays
            ? opt.minDeliveryDays === opt.maxDeliveryDays
              ? `${opt.minDeliveryDays} day${opt.minDeliveryDays !== 1 ? 's' : ''}`
              : `${opt.minDeliveryDays}-${opt.maxDeliveryDays} days`
            : null

          return (
            <label 
              key={opt.id} 
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="shipping"
                    value={opt.id}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(opt)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 ml-1" />
                  )}
                </div>
                
                <div>
                  <div className="font-medium text-gray-900">{opt.name}</div>
                  {deliveryDays && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{deliveryDays}</span>
                    </div>
                  )}
                  {opt.carrier && (
                    <div className="text-xs text-gray-400">{opt.carrier}</div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {formatCurrency(parseFloat(opt.rate), opt.currency)}
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
