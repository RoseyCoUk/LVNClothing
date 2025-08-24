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
        throw new Error(errorData.error || `Failed to fetch shipping quotes: ${res.status}`)
      }

      const data = await res.json()
      setOptions(data.options ?? [])
      
    } catch (e: any) {
      setError(e.message ?? 'Error fetching shipping quotes')
      console.error('Shipping quotes error:', e)
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
