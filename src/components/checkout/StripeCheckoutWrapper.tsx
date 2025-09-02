import React, { useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import DynamicCheckoutForm from './DynamicCheckoutForm';
import PaymentIntentInitializer from './PaymentIntentInitializer';
import type { CartItem, ShippingAddress } from '../../lib/payment-intents';

// Load Stripe with your publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...'
);

interface StripeCheckoutWrapperProps {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  customerEmail: string;
  guestCheckout?: boolean;
  onSuccess: (orderData: { order_id: string; order_number: string }) => void;
  onError: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function StripeCheckoutWrapper(props: StripeCheckoutWrapperProps) {
  const [clientSecret, setClientSecret] = React.useState<string>('');
  const [paymentData, setPaymentData] = React.useState<{
    subtotal: number;
    shippingCost: number;
    total: number;
    paymentIntentId: string;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Handle when payment intent is ready
  const handleClientSecretReady = React.useCallback((secret: string, data: {
    subtotal: number;
    shippingCost: number;
    total: number;
    paymentIntentId: string;
  }) => {
    setClientSecret(secret);
    setPaymentData(data);
    setLoading(false);
  }, []);

  // Stripe Elements options with clientSecret when available
  const options = useMemo(() => {
    // Base appearance configuration (used for both loading and ready states)
    const baseAppearance = {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          borderColor: '#d1d5db',
        },
        '.Input:focus': {
          borderColor: '#2563eb',
          boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)',
        },
        '.Label': {
          color: '#374151',
          fontSize: '14px',
          fontWeight: '500',
        },
      },
    };

    if (!clientSecret) {
      // While waiting for clientSecret, use mode-based options
      return {
        mode: 'payment' as const,
        currency: 'gbp',
        appearance: baseAppearance,
        locale: 'en-GB' as const,
      };
    }

    // When clientSecret is available, use it directly (no currency/mode needed)
    return {
      clientSecret,
      appearance: baseAppearance,
      locale: 'en-GB' as const,
    };
  }, [clientSecret]);

  // Check if Stripe is properly configured
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
        <h3 className="font-medium text-yellow-800">Stripe Not Configured</h3>
        <p className="text-yellow-700 text-sm mt-1">
          Stripe publishable key is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables.
        </p>
        <p className="text-yellow-600 text-xs mt-2">
          This is expected in development environment.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Order</h2>
            <p className="text-gray-600 text-sm">
              Calculating total amount and preparing payment...
            </p>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          
          {/* Initialize payment intent in background - no Stripe hooks here */}
          <PaymentIntentInitializer
            items={props.items}
            shippingAddress={props.shippingAddress}
            customerEmail={props.customerEmail}
            guestCheckout={props.guestCheckout}
            onClientSecretReady={handleClientSecretReady}
            onError={props.onError}
          />
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Order</h2>
            <p className="text-gray-600 text-sm">
              Secure payment powered by Stripe with dynamic pricing and real-time shipping costs.
            </p>
          </div>
          
          <DynamicCheckoutForm 
            {...props} 
            clientSecret={clientSecret}
            paymentData={paymentData}
          />
        </div>
      </div>
    </Elements>
  );
}