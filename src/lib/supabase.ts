import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Use configuration from config.ts
const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

// Validate configuration
if (!config.validate()) {
  throw new Error('Invalid Supabase configuration. Please check your environment variables.');
}

// Log configuration for debugging
if (config.features.enableDebugLogging) {
  console.log('🔧 Supabase client configuration:', {
    url: supabaseUrl,
    isLocalhost: config.isLocalhost,
    environment: config.isDevelopment ? 'development' : 'production',
    hasEnvVars: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  });
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
      console.log('🚪 User signed out, clearing any cached data');
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('🔄 Token refreshed successfully');
    } else if (event === 'SIGNED_IN') {
      console.log('✅ User signed in successfully');
    } else if (event === 'USER_UPDATED') {
      console.log('👤 User profile updated');
    } else if (event === 'PASSWORD_RECOVERY') {
      console.log('🔑 Password recovery initiated');
    }
  }
});

export { createClient };