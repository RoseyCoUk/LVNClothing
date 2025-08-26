// Performance monitoring utilities to help identify and resolve performance issues

export interface PerformanceMetrics {
  pageLoadTime: number;
  resourceLoadTime: number;
  authenticationTime: number;
  errors: string[];
  isMobileMode: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    resourceLoadTime: 0,
    authenticationTime: 0,
    errors: [],
    isMobileMode: false
  };

  setMobileMode(isMobile: boolean) {
    this.metrics.isMobileMode = isMobile;
    console.log(`📱 Performance mode set to: ${isMobile ? 'Mobile' : 'Desktop'}`);
  }

  startPageLoadTimer() {
    if (typeof performance !== 'undefined') {
      performance.mark('page-load-start');
    }
  }

  endPageLoadTimer() {
    if (typeof performance !== 'undefined') {
      performance.mark('page-load-end');
      performance.measure('page-load', 'page-load-start', 'page-load-end');
      
      const measure = performance.getEntriesByName('page-load')[0];
      this.metrics.pageLoadTime = measure.duration;
      
      // Log performance data
      console.log(`⚡ Page load time: ${this.metrics.pageLoadTime.toFixed(2)}ms`);
      
      // Check if performance targets are met
      if (this.metrics.pageLoadTime > 3000) {
        console.warn(`⚠️ Page load time (${this.metrics.pageLoadTime.toFixed(2)}ms) exceeds 3-second target`);
      }
    }
  }

  startResourceLoadTimer() {
    if (typeof performance !== 'undefined') {
      performance.mark('resource-load-start');
    }
  }

  endResourceLoadTimer() {
    if (typeof performance !== 'undefined') {
      performance.mark('resource-load-end');
      performance.measure('resource-load', 'resource-load-start', 'resource-load-end');
      
      const measure = performance.getEntriesByName('resource-load')[0];
      this.metrics.resourceLoadTime = measure.duration;
      
      console.log(`⚡ Resource load time: ${this.metrics.resourceLoadTime.toFixed(2)}ms`);
    }
  }

  startAuthTimer() {
    if (typeof performance !== 'undefined') {
      performance.mark('auth-start');
    }
  }

  endAuthTimer() {
    if (typeof performance !== 'undefined') {
      performance.mark('auth-end');
      performance.measure('auth-time', 'auth-start', 'auth-end');
      
      const measure = performance.getEntriesByName('auth-time')[0];
      this.metrics.authenticationTime = measure.duration;
      
      console.log(`🔐 Authentication time: ${this.metrics.authenticationTime.toFixed(2)}ms`);
      
      // Check if authentication is taking too long
      if (this.metrics.authenticationTime > 2000) {
        console.warn(`⚠️ Authentication is taking longer than expected: ${this.metrics.authenticationTime.toFixed(2)}ms`);
      }
    }
  }

  recordError(error: string) {
    this.metrics.errors.push(error);
    console.error(`❌ Performance error: ${error}`);
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      pageLoadTime: 0,
      resourceLoadTime: 0,
      authenticationTime: 0,
      errors: [],
      isMobileMode: false
    };
  }

  // Check if performance targets are met for Test 16
  checkPerformanceTargets(): boolean {
    const targets = {
      pageLoad: this.metrics.pageLoadTime <= 3000,
      auth: this.metrics.authenticationTime <= 2000,
      noErrors: this.metrics.errors.length === 0
    };

    console.log('🎯 Performance targets:', targets);
    
    return targets.pageLoad && targets.auth && targets.noErrors;
  }
}

export const performanceMonitor = new PerformanceMonitor();
