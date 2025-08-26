import { useState } from 'react'
import type { ShippingQuoteRequest, ShippingOption } from '../lib/shipping/types'

export function useShippingQuotes() {
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [error, setError] = useState<string | null>(null)

  async function fetchQuotes(req: ShippingQuoteRequest) {
    setLoading(true)
    setError(null)
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      if (!supabaseUrl || !anonKey) {
        throw new Error('Missing Supabase configuration')
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/shipping-quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify(req)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        
        // Use fallback shipping options instead of throwing error
        console.warn('Shipping API failed, using fallback options:', errorData);
        
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
          },
          {
            id: 'international-standard',
            name: 'International Standard',
            rate: '12.99',
            currency: 'GBP',
            minDeliveryDays: 7,
            maxDeliveryDays: 14,
            carrier: 'Royal Mail International'
          }
        ];
        
        setOptions(fallbackOptions);
        setError('Using standard shipping rates (live quotes unavailable)');
        return;
      }

      const data = await res.json()
      setOptions(data.options ?? [])
      
    } catch (e: any) {
      console.warn('Shipping quotes error, using fallback options:', e);
      
      // Use fallback shipping options on any error
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
        },
        {
          id: 'international-standard',
          name: 'International Standard',
          rate: '12.99',
          currency: 'GBP',
          minDeliveryDays: 7,
          maxDeliveryDays: 14,
          carrier: 'Royal Mail International'
        }
      ];
      
      setOptions(fallbackOptions);
      setError('Using standard shipping rates (live quotes unavailable)');
    } finally {
      setLoading(false)
    }
  }

  function clearQuotes() {
    setOptions([])
    setError(null)
  }

  return { 
    loading, 
    options, 
    error, 
    fetchQuotes,
    clearQuotes
  }
}
