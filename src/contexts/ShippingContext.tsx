import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { useCart } from './CartContext'
import { getShippingRates, validateShippingAddress, getCountryCode } from '../lib/shipping/printful'
import { updatePaymentIntentWithShipping, createShippingSelectionRequest, validateShippingSelection } from '../lib/shipping/checkout'
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

      console.log('🚚 ShippingContext: Sending request to Printful:', {
        recipient,
        items: request.items,
        cartItems: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          printful_variant_id: item.printful_variant_id,
          quantity: item.quantity
        }))
      });

      const response: ShippingQuoteResponse = await getShippingRates(request)
      
      console.log('🚚 ShippingContext: Received response:', {
        hasOptions: !!response.options,
        optionsLength: response.options?.length || 0,
        options: response.options,
        ttlSeconds: response.ttlSeconds
      });
      
      if (response.options && response.options.length > 0) {
        setShippingOptions(response.options)
        
        // Auto-select the first option if none selected
        if (!selectedShippingOption && response.options.length > 0) {
          setSelectedShippingOption(response.options[0])
        }
      } else {
        // Use fallback shipping options if no options returned
        const fallbackOptions: ShippingOption[] = [
          {
            id: 'standard-uk',
            name: 'Standard UK Delivery',
            rate: '4.99',
            currency: 'GBP',
            minDeliveryDays: 3,
            maxDeliveryDays: 5,
            carrier: 'Royal Mail'
          },
          {
            id: 'express-uk',
            name: 'Express UK Delivery',
            rate: '8.99',
            currency: 'GBP',
            minDeliveryDays: 1,
            maxDeliveryDays: 2,
            carrier: 'DHL Express'
          }
        ];
        
        setShippingOptions(fallbackOptions)
        if (!selectedShippingOption) {
          setSelectedShippingOption(fallbackOptions[0])
        }
      }
      
    } catch (error) {
      console.warn('Failed to fetch shipping rates, using fallback options:', error);
      
      // Use fallback shipping options on error
      const fallbackOptions: ShippingOption[] = [
        {
          id: 'standard-uk',
          name: 'Standard UK Delivery',
          rate: '4.99',
          currency: 'GBP',
          minDeliveryDays: 3,
          maxDeliveryDays: 5,
          carrier: 'Royal Mail'
        },
        {
          id: 'express-uk',
          name: 'Express UK Delivery',
          rate: '8.99',
          currency: 'GBP',
          minDeliveryDays: 1,
          maxDeliveryDays: 2,
          carrier: 'DHL Express'
        }
      ];
      
      setShippingOptions(fallbackOptions)
      if (!selectedShippingOption) {
        setSelectedShippingOption(fallbackOptions[0])
      }
      
      setShippingError('Using standard shipping rates (live quotes unavailable)')
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

    const itemsTotal = getTotalPrice() // getTotalPrice returns value in pounds
    
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
      
      return response
      
    } catch (error) {
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
    if (!selectedShippingOption) return 0;
    const rate = parseFloat(selectedShippingOption.rate);
    return Math.round(rate * 100); // Convert to pence
  }, [selectedShippingOption]);

  // Get total with shipping in pounds
  const getTotalWithShipping = useCallback((): number => {
    const subtotal = getTotalPrice();
    const shippingCost = getShippingCost() / 100; // Convert from pence to pounds
    return subtotal + shippingCost;
  }, [getTotalPrice, getShippingCost]);

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
