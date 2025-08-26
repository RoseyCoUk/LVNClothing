import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createPerformanceMonitor, measureAsyncOperation } from "../_shared/performance.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface PerformanceTestRequest {
  testType: 'load' | 'latency' | 'memory' | 'concurrency';
  iterations?: number;
  delay?: number;
  payload?: any;
}

interface PerformanceTestResponse {
  success: boolean;
  testType: string;
  results: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    minLatency: number;
    maxLatency: number;
    totalDuration: number;
    requestsPerSecond: number;
  };
  timestamp: string;
  functionName: string;
}

serve(async (req: Request) => {
  const performanceMonitor = createPerformanceMonitor('performance-test', req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      // Simple health check endpoint
      const response = {
        message: 'Performance test endpoint is working!',
        timestamp: new Date().toISOString(),
        functionName: 'performance-test',
        availableTests: ['load', 'latency', 'memory', 'concurrency']
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST') {
      const body: PerformanceTestRequest = await req.json();
      const { testType, iterations = 10, delay = 100, payload } = body;

      console.log(`Starting performance test: ${testType} with ${iterations} iterations`);

      let results;
      
      switch (testType) {
        case 'load':
          results = await runLoadTest(iterations, delay, payload);
          break;
        case 'latency':
          results = await runLatencyTest(iterations);
          break;
        case 'memory':
          results = await runMemoryTest(iterations);
          break;
        case 'concurrency':
          results = await runConcurrencyTest(iterations);
          break;
        default:
          throw new Error(`Unknown test type: ${testType}`);
      }

      const response: PerformanceTestResponse = {
        success: true,
        testType,
        results,
        timestamp: new Date().toISOString(),
        functionName: 'performance-test'
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Performance test error:', error);
    performanceMonitor.incrementErrorCount();
    
    return new Response(JSON.stringify({ 
      error: 'Performance test failed',
      message: error.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } finally {
    performanceMonitor.end(200);
  }
});

async function runLoadTest(iterations: number, delay: number, payload?: any) {
  const startTime = performance.now();
  const latencies: number[] = [];
  let successfulRequests = 0;
  let failedRequests = 0;

  for (let i = 0; i < iterations; i++) {
    const requestStart = performance.now();
    
    try {
      // Simulate some work
      await simulateWork(payload);
      const requestLatency = performance.now() - requestStart;
      latencies.push(requestLatency);
      successfulRequests++;
      
      // Add delay between requests
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      failedRequests++;
      console.error(`Request ${i + 1} failed:`, error);
    }
  }

  const totalDuration = performance.now() - startTime;
  const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  const requestsPerSecond = (successfulRequests / totalDuration) * 1000;

  return {
    totalRequests: iterations,
    successfulRequests,
    failedRequests,
    averageLatency,
    minLatency,
    maxLatency,
    totalDuration,
    requestsPerSecond
  };
}

async function runLatencyTest(iterations: number) {
  const latencies: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await simulateWork();
    const latency = performance.now() - start;
    latencies.push(latency);
  }

  const averageLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  return {
    totalRequests: iterations,
    successfulRequests: iterations,
    failedRequests: 0,
    averageLatency,
    minLatency,
    maxLatency,
    totalDuration: latencies.reduce((a, b) => a + b, 0),
    requestsPerSecond: (iterations / (latencies.reduce((a, b) => a + b, 0))) * 1000
  };
}

async function runMemoryTest(iterations: number) {
  const startMemory = performance.memory?.usedJSHeapSize || 0;
  const latencies: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await simulateWork();
    const latency = performance.now() - start;
    latencies.push(latency);
  }

  const endMemory = performance.memory?.usedJSHeapSize || 0;
  const memoryDelta = endMemory - startMemory;

  return {
    totalRequests: iterations,
    successfulRequests: iterations,
    failedRequests: 0,
    averageLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    minLatency: Math.min(...latencies),
    maxLatency: Math.max(...latencies),
    totalDuration: latencies.reduce((a, b) => a + b, 0),
    requestsPerSecond: (iterations / (latencies.reduce((a, b) => a + b, 0))) * 1000,
    memoryDelta
  };
}

async function runConcurrencyTest(iterations: number) {
  const startTime = performance.now();
  const promises = [];
  
  for (let i = 0; i < iterations; i++) {
    promises.push(simulateWork());
  }

  try {
    await Promise.all(promises);
    const totalDuration = performance.now() - startTime;
    
    return {
      totalRequests: iterations,
      successfulRequests: iterations,
      failedRequests: 0,
      averageLatency: totalDuration / iterations,
      minLatency: totalDuration / iterations,
      maxLatency: totalDuration / iterations,
      totalDuration,
      requestsPerSecond: (iterations / totalDuration) * 1000
    };
  } catch (error) {
    console.error('Concurrency test failed:', error);
    return {
      totalRequests: iterations,
      successfulRequests: 0,
      failedRequests: iterations,
      averageLatency: 0,
      minLatency: 0,
      maxLatency: 0,
      totalDuration: performance.now() - startTime,
      requestsPerSecond: 0
    };
  }
}

async function simulateWork(payload?: any): Promise<void> {
  // Simulate various types of work based on payload
  if (payload?.type === 'heavy') {
    // Simulate heavy computation
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }
  } else if (payload?.type === 'network') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  } else if (payload?.type === 'database') {
    // Simulate database operation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
  } else {
    // Default light work
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
  }
}
