import React, { useState, useEffect } from 'react';
import { 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { 
  createPaymentIntent, 
  confirmPaymentIntent,
  validateAndEnrichCart,
  formatPrice,
  requiresPaymentAction,
  isPaymentSuccessful,
  getPaymentStatusText,
  type CartItem,
  type ShippingAddress 
} from '../../lib/payment-intents';

interface DynamicCheckoutFormProps {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  customerEmail: string;
  guestCheckout?: boolean;
  onSuccess: (orderData: { order_id: string; order_number: string }) => void;
  onError: (error: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  clientSecret?: string;
  paymentData?: {
    subtotal: number;
    shippingCost: number;
    total: number;
    paymentIntentId: string;
  } | null;
}

export default function DynamicCheckoutForm({
  items,
  shippingAddress,
  customerEmail,
  guestCheckout = false,
  onSuccess,
  onError,
  onLoadingChange,
  clientSecret: externalClientSecret,
  paymentData: externalPaymentData
}: DynamicCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Use external client secret and payment data
  const clientSecret = externalClientSecret || '';
  const paymentIntentId = externalPaymentData?.paymentIntentId || '';
  const paymentDetails = externalPaymentData ? {
    subtotal: externalPaymentData.subtotal,
    shippingCost: externalPaymentData.shippingCost,
    total: externalPaymentData.total
  } : null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setMessage('Stripe has not loaded yet. Please wait.');
      return;
    }

    if (!clientSecret) {
      setMessage('Payment not ready. Please refresh and try again.');
      return;
    }

    setProcessing(true);
    setMessage('Processing payment...');
    onLoadingChange?.(true);

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment confirmation error:', error);
        setMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent) {
        console.log('Payment intent status:', paymentIntent.status);
        
        if (isPaymentSuccessful(paymentIntent.status)) {
          // Payment succeeded, create order
          setMessage('Payment successful! Creating your order...');
          
          const confirmResponse = await confirmPaymentIntent({
            payment_intent_id: paymentIntent.id
          });
          
          if (confirmResponse.success) {
            setMessage('Order created successfully!');
            onSuccess({
              order_id: confirmResponse.order_id!,
              order_number: confirmResponse.order_number!
            });
          } else {
            setMessage('Payment successful but failed to create order. Please contact support.');
            onError('Failed to create order after successful payment');
          }
        } else if (requiresPaymentAction(paymentIntent.status)) {
          setMessage('Additional authentication required. Please follow the prompts.');
        } else {
          setMessage(getPaymentStatusText(paymentIntent.status));
          onError(`Payment not successful: ${paymentIntent.status}`);
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      setMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
      onLoadingChange?.(false);
    }
  };

  // Don't show anything if we don't have the payment data yet
  if (!externalPaymentData || !clientSecret) {
    return null; // The wrapper handles the loading state
  }

  // Debug: Log the client secret and payment data
  console.log('🔐 DynamicCheckoutForm rendering with:', {
    clientSecret: clientSecret ? `${clientSecret.substring(0, 20)}...` : 'MISSING',
    paymentData: externalPaymentData,
    hasStripe: !!stripe,
    hasElements: !!elements
  });

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      {paymentDetails && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(paymentDetails.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{formatPrice(paymentDetails.shippingCost)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-medium text-base">
              <span>Total:</span>
              <span>{formatPrice(paymentDetails.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Information</h4>
          {clientSecret ? (
            <PaymentElement 
              options={{
                layout: 'tabs'
              }}
              onReady={() => console.log('💳 PaymentElement is ready')}
              onError={(error) => console.error('💳 PaymentElement error:', error)}
            />
          ) : (
            <div className="text-red-600 text-sm">
              Missing client secret for payment form
            </div>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('successful') || message.includes('ready') 
              ? 'bg-green-50 text-green-600 border border-green-200'
              : message.includes('error') || message.includes('failed')
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || !elements || processing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            processing || !stripe || !elements
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {processing ? 'Processing Payment...' : `Pay ${paymentDetails ? formatPrice(paymentDetails.total) : ''}`}
        </button>

        {/* Security Notice */}
        <p className="text-xs text-gray-500 text-center">
          🔒 Your payment information is secured by Stripe. We never store your card details.
        </p>
      </form>
    </div>
  );
}