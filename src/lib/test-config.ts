// Test configuration for ReformUK application
// This file is used to override production settings during testing

export const testConfig = {
  // Override Supabase configuration for testing
  supabase: {
    url: 'http://127.0.0.1:54321', // Local Supabase instance
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  },
  
  // Test-specific settings
  testing: {
    enableMockData: true,
    enableNetworkLogging: true,
    timeout: 10000, // 10 seconds for tests
    retryAttempts: 1, // Minimal retries for tests
  },
  
  // Feature flags for testing
  features: {
    enableDebugLogging: true,
    enableAnalytics: false,
    enableErrorReporting: false,
  },
  
  // API configuration for testing
  api: {
    timeout: 10000, // 10 seconds
    retryAttempts: 1,
    retryDelay: 100, // 100ms for tests
  },
  
  // Authentication configuration for testing
  auth: {
    sessionTimeout: 1800, // 30 minutes for tests
    refreshThreshold: 300, // 5 minutes before expiry
    enableAutoRefresh: true,
  },
  
  // Test data
  testData: {
    testUser: {
      email: 'test@reformuk.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    },
    testProduct: {
      id: 'test-product-1',
      name: 'Test Product',
      price: 19.99
    }
  },
  
  // Debug information for testing
  getDebugInfo() {
    return {
      environment: 'testing',
      isLocalhost: true,
      supabaseUrl: this.supabase.url,
      hasSupabaseKey: !!this.supabase.anonKey,
      features: this.features,
      testing: this.testing,
      timestamp: new Date().toISOString(),
    };
  },
  
  // Validate test configuration
  validate() {
    const errors: string[] = [];
    
    if (!this.supabase.url) {
      errors.push('Missing test Supabase URL');
    }
    
    if (!this.supabase.anonKey) {
      errors.push('Missing test Supabase anon key');
    }
    
    if (errors.length > 0) {
      console.error('❌ Test configuration validation failed:', errors);
      return false;
    }
    
    console.log('✅ Test configuration validation passed');
    return true;
  },
};

// Log test configuration on import
console.log('🧪 ReformUK Test Configuration:', testConfig.getDebugInfo());

// Validate test configuration on import
testConfig.validate();
