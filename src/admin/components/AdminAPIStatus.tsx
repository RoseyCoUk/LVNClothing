import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Clock,
  AlertCircle,
  Server
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface APIStatus {
  name: string;
  status: 'connected' | 'failed' | 'checking';
  lastChecked: Date | null;
  lastError: string | null;
  responseTime?: number;
}

const AdminAPIStatus: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<APIStatus[]>([
    { name: 'Stripe', status: 'checking', lastChecked: null, lastError: null },
    { name: 'Printful', status: 'checking', lastChecked: null, lastError: null },
    { name: 'Supabase', status: 'checking', lastChecked: null, lastError: null },
    { name: 'Resend', status: 'checking', lastChecked: null, lastError: null }
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const checkStripeStatus = async (): Promise<APIStatus> => {
    const startTime = Date.now();
    try {
      // Call a simple Stripe endpoint through our edge function
      const response = await fetch('/api/stripe/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          name: 'Stripe',
          status: 'connected',
          lastChecked: new Date(),
          lastError: null,
          responseTime
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: 'Stripe',
        status: 'failed',
        lastChecked: new Date(),
        lastError: error instanceof Error ? error.message : 'Connection failed',
        responseTime: Date.now() - startTime
      };
    }
  };

  const checkPrintfulStatus = async (): Promise<APIStatus> => {
    const startTime = Date.now();
    try {
      // Check Printful through our edge function
      const response = await fetch('/api/printful/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          name: 'Printful',
          status: 'connected',
          lastChecked: new Date(),
          lastError: null,
          responseTime
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: 'Printful',
        status: 'failed',
        lastChecked: new Date(),
        lastError: error instanceof Error ? error.message : 'Connection failed',
        responseTime: Date.now() - startTime
      };
    }
  };

  const checkSupabaseStatus = async (): Promise<APIStatus> => {
    const startTime = Date.now();
    try {
      // Simple health check query
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      
      if (error) throw error;
      
      return {
        name: 'Supabase',
        status: 'connected',
        lastChecked: new Date(),
        lastError: null,
        responseTime
      };
    } catch (error) {
      return {
        name: 'Supabase',
        status: 'failed',
        lastChecked: new Date(),
        lastError: error instanceof Error ? error.message : 'Database connection failed',
        responseTime: Date.now() - startTime
      };
    }
  };

  const checkResendStatus = async (): Promise<APIStatus> => {
    const startTime = Date.now();
    try {
      // Check Resend through our edge function
      const response = await fetch('/api/resend/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          name: 'Resend',
          status: 'connected',
          lastChecked: new Date(),
          lastError: null,
          responseTime
        };
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        name: 'Resend',
        status: 'failed',
        lastChecked: new Date(),
        lastError: error instanceof Error ? error.message : 'Connection failed',
        responseTime: Date.now() - startTime
      };
    }
  };

  const checkAllStatuses = async () => {
    setIsChecking(true);
    
    try {
      const results = await Promise.all([
        checkStripeStatus(),
        checkPrintfulStatus(),
        checkSupabaseStatus(),
        checkResendStatus()
      ]);
      
      setApiStatuses(results);
    } catch (error) {
      console.error('Error checking API statuses:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAllStatuses();
    
    // Check every 30 seconds
    const interval = setInterval(checkAllStatuses, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: 'connected' | 'failed' | 'checking') => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: 'connected' | 'failed' | 'checking') => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const formatResponseTime = (ms?: number) => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Server className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">API Status</h3>
          </div>
          <button
            onClick={checkAllStatuses}
            disabled={isChecking}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        <div className="space-y-3">
          {apiStatuses.map((api) => (
            <div
              key={api.name}
              className={`rounded-lg border p-4 ${getStatusColor(api.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(api.status)}
                  <span className="ml-3 font-medium">{api.name}</span>
                  {api.responseTime && (
                    <span className="ml-2 text-sm opacity-75">
                      ({formatResponseTime(api.responseTime)})
                    </span>
                  )}
                </div>
                
                <div className="text-sm">
                  {api.status === 'connected' && (
                    <span className="flex items-center text-green-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Connected
                    </span>
                  )}
                  {api.status === 'failed' && (
                    <span className="flex items-center text-red-700">
                      <XCircle className="h-4 w-4 mr-1" />
                      Failed
                    </span>
                  )}
                  {api.status === 'checking' && (
                    <span className="flex items-center text-blue-700">
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      Checking
                    </span>
                  )}
                </div>
              </div>

              {api.lastChecked && (
                <div className="mt-2 flex items-center text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Last checked: {api.lastChecked.toLocaleTimeString()}
                </div>
              )}

              {api.lastError && (
                <div className="mt-2 flex items-start text-xs">
                  <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{api.lastError}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Overall Status Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">System Status:</span>
            {apiStatuses.every(api => api.status === 'connected') ? (
              <span className="flex items-center text-green-600 font-medium">
                <CheckCircle className="h-4 w-4 mr-1" />
                All Systems Operational
              </span>
            ) : apiStatuses.some(api => api.status === 'failed') ? (
              <span className="flex items-center text-red-600 font-medium">
                <XCircle className="h-4 w-4 mr-1" />
                Some Services Unavailable
              </span>
            ) : (
              <span className="flex items-center text-blue-600 font-medium">
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                Checking Services
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAPIStatus;