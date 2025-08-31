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
    if (event === 'SIGNED_OUT') {
      
    } else if (event === 'TOKEN_REFRESHED') {
      
    } else if (event === 'SIGNED_IN') {
      
    } else if (event === 'USER_UPDATED') {
      
    } else if (event === 'PASSWORD_RECOVERY') {
      
    }
  }
});

export { createClient };