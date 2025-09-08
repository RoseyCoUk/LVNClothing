// Error handling utilities for LVNClothing application

export interface ErrorDetails {
  code?: string;
  message: string;
  status?: number;
  context?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export class LVNClothingError extends Error {
  public details: ErrorDetails;
  
  constructor(message: string, details: Partial<ErrorDetails> = {}) {
    super(message);
    this.name = 'LVNClothingError';
    this.details = {
      message,
      timestamp: new Date().toISOString(),
      ...details
    };
  }
}

export class AuthenticationError extends LVNClothingError {
  constructor(message: string, details: Partial<ErrorDetails> = {}) {
    super(message, { ...details, context: 'authentication' });
    this.name = 'AuthenticationError';
  }
}

export class APIError extends LVNClothingError {
  constructor(message: string, details: Partial<ErrorDetails> = {}) {
    super(message, { ...details, context: 'api' });
    this.name = 'APIError';
  }
}

export class DatabaseError extends LVNClothingError {
  constructor(message: string, details: Partial<ErrorDetails> = {}) {
    super(message, { ...details, context: 'database' });
    this.name = 'DatabaseError';
  }
}

// Error message mapping for user-friendly messages
export const ERROR_MESSAGES = {
  // Authentication errors
  'Invalid login credentials': 'Invalid email or password. Please try again.',
  'Email not confirmed': 'Please check your email and confirm your account before signing in.',
  'Too many requests': 'Too many login attempts. Please wait a moment before trying again.',
  'User not found': 'No account found with this email address. Please sign up first.',
  'User already registered': 'An account with this email already exists. Please sign in instead.',
  'Password should be at least': 'Password must be at least 6 characters long.',
  'Invalid email': 'Please enter a valid email address.',
  
  // API errors
  'Failed to fetch products': 'Unable to load products. Please try again later.',
  'Failed to fetch product variants': 'Unable to load product options. Please try again later.',
  'User not authenticated': 'Please log in again to continue.',
  'Order not found': 'Order not found. Please check the order ID and try again.',
  'already cancelled': 'This order has already been cancelled.',
  
  // Network errors
  'Network Error': 'Network connection failed. Please check your internet connection.',
  'Request timeout': 'Request timed out. Please try again.',
  'Service unavailable': 'Service temporarily unavailable. Please try again later.',
  
  // Generic errors
  'Unexpected error': 'An unexpected error occurred. Please try again.',
  'Unknown error': 'Something went wrong. Please try again later.',
};

// Error handler function
export function handleError(error: any, context?: string): LVNClothingError {
  let reformError: LVNClothingError;
  
  // If it's already a LVNClothingError, return it
  if (error instanceof LVNClothingError) {
    return error;
  }
  
  // Handle Supabase errors
  if (error?.code && error?.message) {
    const userMessage = ERROR_MESSAGES[error.message as keyof typeof ERROR_MESSAGES] || error.message;
    
    if (error.code === 'PGRST116') {
      reformError = new APIError(userMessage, {
        code: error.code,
        status: 404,
        context: context || 'database'
      });
    } else if (error.code === '23505') {
      reformError = new DatabaseError(userMessage, {
        code: error.code,
        status: 409,
        context: context || 'database'
      });
    } else if (error.status === 401) {
      reformError = new AuthenticationError(userMessage, {
        code: error.code,
        status: 401,
        context: context || 'authentication'
      });
    } else {
      reformError = new APIError(userMessage, {
        code: error.code,
        status: error.status || 500,
        context: context || 'api'
      });
    }
  }
  // Handle fetch/network errors
  else if (error?.name === 'TypeError' && error.message.includes('fetch')) {
    reformError = new APIError('Network connection failed. Please check your internet connection.', {
      context: context || 'network'
    });
  }
  // Handle generic errors
  else {
    const message = error?.message || 'An unexpected error occurred';
    const userMessage = ERROR_MESSAGES[message as keyof typeof ERROR_MESSAGES] || message;
    
    reformError = new LVNClothingError(userMessage, {
      context: context || 'unknown'
    });
  }
  
  // Log error for debugging
  console.error('❌ Error handled:', {
    originalError: error,
    reformError: reformError.details
  });
  
  return reformError;
}

// Error logging utility
export function logError(error: any, context?: string, additionalInfo?: Record<string, any>) {
  const errorDetails = {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context,
    additionalInfo,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  };
  
  console.error('🚨 Error logged:', errorDetails);
  
  // In production, you might want to send this to an error reporting service
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    // Example: send to error reporting service
    // errorReportingService.captureException(error, errorDetails);
  }
}

// Error recovery utilities
export function isRecoverableError(error: any): boolean {
  if (error instanceof LVNClothingError) {
    // Network errors are usually recoverable
    if (error.details.context === 'network') {
      return true;
    }
    // Authentication errors might be recoverable
    if (error.details.context === 'authentication' && error.details.status === 401) {
      return true;
    }
    // 5xx errors are usually recoverable
    if (error.details.status && error.details.status >= 500) {
      return true;
    }
  }
  
  return false;
}

export function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
  // Exponential backoff with jitter
  const delay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * delay;
  return Math.min(delay + jitter, 30000); // Max 30 seconds
}
