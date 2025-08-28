import React from 'react';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      errorInfo: error.message || 'Unknown error occurred'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LVN App Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service (e.g., Sentry)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={this.handleReset} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-lvnBg flex items-center justify-center p-4">
          <div className="bg-lvn-white p-8 rounded-none shadow-lg max-w-lg text-center border-l-4 border-red-500">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-lvn-black mb-3">
              Oops! Something went wrong
            </h1>
            
            <p className="text-lvn-black/70 mb-6 leading-relaxed">
              We're experiencing technical difficulties. This has been automatically reported to our team.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="bg-gray-100 p-3 rounded mb-6 text-left">
                <p className="text-xs text-gray-600 font-mono">
                  {this.state.errorInfo}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={this.handleReset}
                className="flex items-center justify-center space-x-2 bg-lvn-maroon text-white px-6 py-3 rounded-none hover:bg-lvn-maroon/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              
              <button 
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-none hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>
              
              <button 
                onClick={() => window.location.href = '/contact'}
                className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-none hover:bg-gray-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Support</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                LVN Clothing • If this problem persists, please contact our support team
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
