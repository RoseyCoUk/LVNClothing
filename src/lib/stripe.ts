import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef...'; // Placeholder

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Please add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables.');
}

// This is safe to call on the client side
export const stripePromise = loadStripe(stripePublishableKey);

// Payment intent creation function
export const createPaymentIntent = async (amount: number, currency: string = 'gbp', metadata?: any) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to pence
        currency,
        metadata
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Helper function to format price for Stripe
export const formatPriceForStripe = (price: number): number => {
  return Math.round(price * 100); // Convert pounds to pence
};

// Helper function to format price for display
export const formatPriceForDisplay = (priceInPence: number): string => {
  return (priceInPence / 100).toFixed(2);
};

// Stripe appearance configuration for LVN branding
export const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#800000', // LVN maroon
    colorBackground: '#ffffff',
    colorText: '#000000',
    colorDanger: '#df1b41',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
  rules: {
    '.Input': {
      border: '1px solid #e5e7eb',
      boxShadow: 'none',
    },
    '.Input:focus': {
      borderColor: '#800000',
      boxShadow: '0 0 0 2px rgba(128, 0, 0, 0.1)',
    },
    '.Label': {
      fontWeight: '500',
      marginBottom: '8px',
    },
  },
};

export default stripePromise;