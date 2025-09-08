// Configuration management for ReformUK application
export const config = {
  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key',
  },
  
  // Environment Detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isLocalhost: typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('localhost')),
  
  // Feature Flags
  features: {
    enableDebugLogging: import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEBUG === 'true',
    enableAnalytics: import.meta.env.PROD && import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    enableErrorReporting: import.meta.env.PROD && import.meta.env.VITE_ENABLE_ERROR_REPORTING !== 'false',
  },
  
  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  
  // Authentication Configuration
  auth: {
    sessionTimeout: 3600, // 1 hour
    refreshThreshold: 300, // 5 minutes before expiry
    enableAutoRefresh: true,
  },
  
  // Debug Information
  getDebugInfo() {
    return {
      environment: this.isDevelopment ? 'development' : 'production',
      isLocalhost: this.isLocalhost,
      supabaseUrl: this.supabase.url,
      hasSupabaseKey: !!this.supabase.anonKey,
      features: this.features,
      timestamp: new Date().toISOString(),
    };
  },
  
  // Validate Configuration
  validate() {
    const errors: string[] = [];
    
    if (!this.supabase.url) {
      errors.push('Missing VITE_SUPABASE_URL');
    }
    
    if (!this.supabase.anonKey) {
      errors.push('Missing VITE_SUPABASE_ANON_KEY');
    }
    
    if (errors.length > 0) {
      console.error('❌ Configuration validation failed:', errors);
      return false;
    }
    

    return true;
  },
};

// Log configuration on import
if (config.features.enableDebugLogging) {
  console.log('🔍 Environment Variables Debug:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  console.log('VITE_SUPABASE_ANON_KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0);
  console.log('Raw env object keys:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
}

// Validate configuration on import
config.validate();
