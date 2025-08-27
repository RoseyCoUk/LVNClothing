import React, { useState, useEffect } from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface PrintfulStatusProps {
  className?: string;
}

const PrintfulStatus: React.FC<PrintfulStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkPrintfulStatus = async () => {
      try {
        // Try to import and check the Printful client
        const { pf } = await import('../lib/printful/client');
        
        if (pf && (pf as any).h) {
          setStatus('available');
          setMessage('Printful API is available');
        } else {
          setStatus('unavailable');
          setMessage('Printful API not configured - using mock data');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error checking Printful status');
      }
    };

    checkPrintfulStatus();
  }, []);

  // Don't show anything while checking or when API is available
  if (status === 'checking' || status === 'available') {
    return null;
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'unavailable':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'unavailable':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default PrintfulStatus;
