import { cacheGet, cacheSet } from '../cache/memoryCache'
import type { 
  ShippingQuoteRequest, 
  ShippingQuoteResponse, 
  ShippingOption,
  Recipient,
  CartItem 
} from './types'

/**
 * Get shipping rates from Printful for the given address and cart items
 */
export async function getShippingRates(
  request: ShippingQuoteRequest
): Promise<ShippingQuoteResponse> {
  // Create cache key based on request
  const cacheKey = createCacheKey(request)
  
  // Check cache first
  const cached = cacheGet<ShippingQuoteResponse>(cacheKey)
  if (cached) {
    return cached
  }

  try {

    // Call our Supabase Edge Function for shipping quotes
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const response = await fetch(`${supabaseUrl}/functions/v1/shipping-quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Shipping API error: ${response.status} - ${errorData.error || response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.options || !Array.isArray(data.options)) {
      throw new Error('Invalid response from shipping API')
    }

    const result: ShippingQuoteResponse = {
      options: data.options,
      ttlSeconds: data.ttlSeconds || 300
    }

    // Cache the result
    cacheSet(cacheKey, result, result.ttlSeconds)

    return result

  } catch (error) {
    // Return fallback options if API fails
    return {
      options: [
        {
          id: 'fallback_standard',
          name: 'Standard Delivery',
          rate: '3.99',
          currency: 'GBP',
          minDeliveryDays: 3,
          maxDeliveryDays: 5
        }
      ],
      ttlSeconds: 60 // Short cache for fallback
    }
  }
}

/**
 * Create a cache key for shipping rate requests
 */
function createCacheKey(request: ShippingQuoteRequest): string {
  const { recipient, items } = request
  
  // Sort items for consistent cache keys
  const sortedItems = [...items].sort((a, b) => 
    a.printful_variant_id - b.printful_variant_id
  )
  
  const itemsKey = sortedItems
    .map(item => `${item.printful_variant_id}:${item.quantity}`)
    .join(',')
  
  const addressKey = `${recipient.country_code}:${recipient.state_code || ''}:${recipient.zip}`
  
  return `shipping:${addressKey}:${itemsKey}`
}

/**
 * Validate shipping address for Printful
 */
export function validateShippingAddress(recipient: Recipient): string[] {
  const errors: string[] = []
  
  if (!recipient.address1?.trim()) {
    errors.push('Address is required')
  }
  
  if (!recipient.city?.trim()) {
    errors.push('City is required')
  }
  
  if (!recipient.country_code?.trim()) {
    errors.push('Country is required')
  }
  
  if (!recipient.zip?.trim()) {
    errors.push('Postal code is required')
  }
  
  // Validate country code format
  if (recipient.country_code && !/^[A-Z]{2}$/.test(recipient.country_code)) {
    errors.push('Invalid country code format')
  }
  
  return errors
}

/**
 * Convert country name to ISO-2 code
 */
export function getCountryCode(countryName: string): string {
  const countryMap: Record<string, string> = {
    'United Kingdom': 'GB',
    'United States': 'US',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Ireland': 'IE',
    'Austria': 'AT',
    'Switzerland': 'CH',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Poland': 'PL',
    'Czech Republic': 'CZ',
    'Hungary': 'HU',
    'Romania': 'RO',
    'Bulgaria': 'BG',
    'Croatia': 'HR',
    'Slovenia': 'SI',
    'Slovakia': 'SK',
    'Lithuania': 'LT',
    'Latvia': 'LV',
    'Estonia': 'EE',
    'Cyprus': 'CY',
    'Malta': 'MT',
    'Luxembourg': 'LU'
  }
  
  return countryMap[countryName] || 'GB'
}
