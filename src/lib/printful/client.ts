import createClient from 'openapi-fetch'
import type { paths } from '../../types/printful'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Create the Printful client
export const pf = createClient<paths>({
  baseUrl: 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-proxy',
})

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  // Get Supabase anon key for Edge Function authentication
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseAnonKey) {
    console.warn('VITE_SUPABASE_ANON_KEY environment variable is not set');
    // Return basic headers without auth if key is missing
    return {
      ...extra,
      'Content-Type': 'application/json',
    }
  }
  
  return {
    ...extra,
    'Content-Type': 'application/json',
    // Supabase Edge Functions require authentication
    Authorization: `Bearer ${supabaseAnonKey}`,
    // Add any additional headers you need here
    // The edge function will automatically add the Printful token
  }
}

// Add the h function to the pf object
(pf as any).h = function(extra?: HeadersInit) {
  try {
    return authHeaders(extra)
  } catch (error) {
    console.error('Error creating auth headers:', error)
    // Return basic headers as fallback
    return {
      ...extra,
      'Content-Type': 'application/json',
    }
  }
}

// Also export h separately for backward compatibility
export function h(extra?: HeadersInit) {
  return authHeaders(extra)
}

// Optional: localize catalog texts (e.g., size guides) to GB English
export function withLocale(locale = 'en_GB') {
  return { 'X-PF-Language': locale }
}

// Debug logging
if (isBrowser) {
  console.log('Printful client initialized:', {
    hasH: !!(pf as any).h,
    baseUrl: 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-proxy',
    hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  })
}

export default pf
