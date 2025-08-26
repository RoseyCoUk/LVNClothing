// Shared performance monitoring utilities for edge functions

export interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  memoryUsage?: number;
  requestId: string;
  functionName: string;
  method: string;
  path: string;
  statusCode: number;
  errorCount: number;
  warnings: string[];
}

export class EdgeFunctionPerformanceMonitor {
  private startTime: number;
  private requestId: string;
  private functionName: string;
  private method: string;
  private path: string;
  private warnings: string[] = [];
  private errorCount: number = 0;

  constructor(functionName: string, method: string, path: string) {
    this.startTime = performance.now();
    this.requestId = this.generateRequestId();
    this.functionName = functionName;
    this.method = method;
    this.path = path;
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  addWarning(warning: string): void {
    this.warnings.push(warning);
    console.warn(`[${this.functionName}] Warning: ${warning}`);
  }

  incrementErrorCount(): void {
    this.errorCount++;
  }

  end(statusCode: number): PerformanceMetrics {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const metrics: PerformanceMetrics = {
      startTime: this.startTime,
      endTime,
      duration,
      requestId: this.requestId,
      functionName: this.functionName,
      method: this.method,
      path: this.path,
      statusCode,
      errorCount: this.errorCount,
      warnings: this.warnings
    };

    // Log performance metrics
    this.logMetrics(metrics);

    return metrics;
  }

  private logMetrics(metrics: PerformanceMetrics): void {
    const logLevel = metrics.duration > 1000 ? 'warn' : 'log';
    const message = `[${metrics.functionName}] ${metrics.method} ${metrics.path} - ${metrics.duration.toFixed(2)}ms - Status: ${metrics.statusCode}`;
    
    if (logLevel === 'warn') {
      console.warn(`⚠️ ${message}`);
    } else {
      console.log(`⚡ ${message}`);
    }

    // Log warnings if any
    if (metrics.warnings.length > 0) {
      console.warn(`[${metrics.functionName}] Warnings:`, metrics.warnings);
    }

    // Log errors if any
    if (metrics.errorCount > 0) {
      console.error(`[${metrics.functionName}] Errors: ${metrics.errorCount}`);
    }
  }
}

// Utility function to create a performance monitor
export function createPerformanceMonitor(functionName: string, req: Request): EdgeFunctionPerformanceMonitor {
  const url = new URL(req.url);
  return new EdgeFunctionPerformanceMonitor(
    functionName,
    req.method,
    url.pathname
  );
}

// Utility function to measure async operations
export async function measureAsyncOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = performance.now();
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation: ${operationName} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`⚡ ${operationName}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

// Utility function to check if function is under load
export function isUnderLoad(): boolean {
  // Simple heuristic: check if we're getting many requests in a short time
  // This is a basic implementation - in production you might want more sophisticated load detection
  return false; // Placeholder for now
}
