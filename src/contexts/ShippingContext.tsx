import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { useCart } from './CartContext'
import { getShippingRates, validateShippingAddress, getCountryCode } from '../lib/shipping/printful'
import { updatePaymentIntentWithShipping, createShippingSelectionRequest, validateShippingSelection } from '../lib/shipping/checkout'
import { toMinor } from '../lib/money'
import type { 
  ShippingOption, 
  Recipient, 
  CartItem as ShippingCartItem,
  ShippingQuoteResponse 
} from '../lib/shipping/types'

interface ShippingContextType {
  // State
  shippingOptions: ShippingOption[]
  selectedShippingOption: ShippingOption | null
  isLoadingRates: boolean
  shippingError: string | null
  
  // Actions
  fetchShippingRates: (recipient: Recipient) => Promise<void>
  selectShippingOption: (option: ShippingOption) => void
  updatePaymentIntent: (paymentIntentId: string, taxTotal?: number, orderDraftId?: string) => Promise<any>
  clearShippingRates: () => void
  getShippingCost: () => number
  getTotalWithShipping: () => number
  
  // Utilities
  isAddressComplete: (recipient: Partial<Recipient>) => boolean
  convertToRecipient: (shippingInfo: any) => Recipient
}

const ShippingContext = createContext<ShippingContextType | undefined>(undefined)

export const useShipping = () => {
  const context = useContext(ShippingContext)
  if (!context) {
    throw new Error('useShipping must be used within a ShippingProvider')
  }
  return context
}

interface ShippingProviderProps {
  children: ReactNode
}

export const ShippingProvider: React.FC<ShippingProviderProps> = ({ children }) => {
  const { cartItems, getTotalPrice } = useCart()
  
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null)
  const [isLoadingRates, setIsLoadingRates] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)

  // Convert cart items to shipping format
  const getShippingCartItems = useCallback((): ShippingCartItem[] => {
    return cartItems.map(item => ({
      printful_variant_id: item.printful_variant_id || parseInt(item.id.toString()), // Use printful_variant_id if available, fallback to id
      quantity: item.quantity
    }))
  }, [cartItems])

  // Fetch shipping rates from Printful
  const fetchShippingRates = useCallback(async (recipient: Recipient) => {
    if (cartItems.length === 0) {
      setShippingError('No items in cart')
      return
    }

    setIsLoadingRates(true)
    setShippingError(null)

    try {
      const request = {
        recipient,
        items: getShippingCartItems()
      }

      const response: ShippingQuoteResponse = await getShippingRates(request)
      
      setShippingOptions(response.options)
      
      // Auto-select the first option if none selected
      if (!selectedShippingOption && response.options.length > 0) {
        setSelectedShippingOption(response.options[0])
      }
      
    } catch (error) {
      console.error('Failed to fetch shipping rates:', error)
      setShippingError('Failed to fetch shipping rates. Please try again.')
    } finally {
      setIsLoadingRates(false)
    }
  }, [cartItems, getShippingCartItems, selectedShippingOption])

  // Select a shipping option
  const selectShippingOption = useCallback((option: ShippingOption) => {
    setSelectedShippingOption(option)
  }, [])

  // Update PaymentIntent with selected shipping option
  const updatePaymentIntent = useCallback(async (
    paymentIntentId: string,
    taxTotal?: number,
    orderDraftId?: string
  ) => {
    if (!selectedShippingOption) {
      throw new Error('No shipping option selected')
    }

    const itemsTotal = getTotalPrice() / 100 // Convert from pence to pounds
    
    // Validate the request
    const validationErrors = validateShippingSelection(
      paymentIntentId,
      itemsTotal,
      selectedShippingOption
    )
    
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
    }

    try {
      const request = createShippingSelectionRequest(
        paymentIntentId,
        itemsTotal,
        selectedShippingOption,
        taxTotal,
        orderDraftId
      )

      const response = await updatePaymentIntentWithShipping(request)
      
      console.log('PaymentIntent updated successfully:', response)
      return response
      
    } catch (error) {
      console.error('Failed to update PaymentIntent:', error)
      throw error
    }
  }, [selectedShippingOption, getTotalPrice])

  // Clear shipping rates
  const clearShippingRates = useCallback(() => {
    setShippingOptions([])
    setSelectedShippingOption(null)
    setShippingError(null)
  }, [])

  // Get shipping cost in pence
  const getShippingCost = useCallback((): number => {
    if (!selectedShippingOption) return 0
    return toMinor(selectedShippingOption.rate, selectedShippingOption.currency)
  }, [selectedShippingOption])

  // Get total with shipping in pence
  const getTotalWithShipping = useCallback((): number => {
    return getTotalPrice() + getShippingCost()
  }, [getTotalPrice, getShippingCost])

  // Check if address is complete for shipping calculation
  const isAddressComplete = useCallback((recipient: Partial<Recipient>): boolean => {
    return !!(recipient.address1 && recipient.city && recipient.country_code && recipient.zip)
  }, [])

  // Convert checkout form data to recipient format
  const convertToRecipient = useCallback((shippingInfo: any): Recipient => {
    return {
      name: `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim(),
      address1: shippingInfo.address,
      address2: shippingInfo.apartment,
      city: shippingInfo.city,
      state_code: shippingInfo.state || undefined,
      country_code: getCountryCode(shippingInfo.country),
      zip: shippingInfo.postcode,
      phone: shippingInfo.phone,
      email: shippingInfo.email
    }
  }, [])

  const value: ShippingContextType = {
    // State
    shippingOptions,
    selectedShippingOption,
    isLoadingRates,
    shippingError,
    
    // Actions
    fetchShippingRates,
    selectShippingOption,
    updatePaymentIntent,
    clearShippingRates,
    getShippingCost,
    getTotalWithShipping,
    
    // Utilities
    isAddressComplete,
    convertToRecipient
  }

  return (
    <ShippingContext.Provider value={value}>
      {children}
    </ShippingContext.Provider>
  )
}
