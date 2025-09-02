import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Use configuration from config.ts
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

// Validate configuration
if (!config.validate()) {
  throw new Error('Invalid Supabase configuration. Please check your environment variables.');
}



export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: config.auth.enableAutoRefresh,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'reformuk-web'
    }
  }
});

// Add error handling for authentication failures
supabase.auth.onAuthStateChange((event, session) => {
  if (config.features.enableDebugLogging) {
    console.log(`Auth state changed: ${event}`, session ? 'with session' : 'no session');
  }
  
  // Clear invalid tokens on sign out or auth errors
  if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
    if (config.features.enableDebugLogging) {
      console.log('Clearing invalid auth tokens');
    }
  }
});

// Handle auth errors gracefully
supabase.auth.getSession().catch((error) => {
  if (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token')) {
    console.warn('Auth token issue detected, clearing session');
    supabase.auth.signOut({ scope: 'local' });
  }
});

export { createClient };