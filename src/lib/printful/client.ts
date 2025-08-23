import createClient from 'openapi-fetch'
import type { paths } from '../../types/printful'

export const pf = createClient<paths>({
  baseUrl: 'https://nsmrxwnrtsllxvplazmm.supabase.co/functions/v1/printful-proxy',
})

function authHeaders(extra: HeadersInit = {}): HeadersInit {
  // Get Supabase anon key for Edge Function authentication
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseAnonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY environment variable is not set');
  }
  
  return {
    ...extra,
    // Supabase Edge Functions require authentication
    Authorization: `Bearer ${supabaseAnonKey}`,
    // Add any additional headers you need here
    // The edge function will automatically add the Printful token
  }
}

export function h(extra?: HeadersInit) {
  return authHeaders(extra)
}

// Optional: localize catalog texts (e.g., size guides) to GB English
export function withLocale(locale = 'en_GB') {
  return { 'X-PF-Language': locale }
}

export default pf
