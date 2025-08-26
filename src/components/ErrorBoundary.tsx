import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-lvnBg flex items-center justify-center p-4">
          <div className="bg-lvn-white p-8 rounded-none shadow-sm max-w-md text-center">
            <h1 className="text-2xl font-bold text-lvn-black mb-4">
              Something went wrong
            </h1>
            <p className="text-lvn-black/70 mb-6">
              We're experiencing technical difficulties. Please refresh the page or contact support.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-lvn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
