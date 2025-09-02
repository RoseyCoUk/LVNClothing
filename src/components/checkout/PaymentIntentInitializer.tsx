import React, { useEffect } from 'react';
import { 
  createPaymentIntent,
  validateAndEnrichCart,
  type CartItem,
  type ShippingAddress 
} from '../../lib/payment-intents';

interface PaymentIntentInitializerProps {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  customerEmail: string;
  guestCheckout?: boolean;
  onClientSecretReady: (clientSecret: string, paymentData: {
    subtotal: number;
    shippingCost: number;
    total: number;
    paymentIntentId: string;
  }) => void;
  onError: (error: string) => void;
}

export default function PaymentIntentInitializer({
  items,
  shippingAddress,
  customerEmail,
  guestCheckout = false,
  onClientSecretReady,
  onError
}: PaymentIntentInitializerProps) {
  
  useEffect(() => {
    async function initializePayment() {
      try {
        // Validate and enrich cart with real-time pricing
        const enrichedItems = await validateAndEnrichCart(items);
        
        console.log('Creating payment intent with enriched items:', enrichedItems);
        
        // Create payment intent with dynamic pricing and shipping
        const paymentResponse = await createPaymentIntent({
          items: enrichedItems,
          shipping_address: shippingAddress,
          customer_email: customerEmail,
          guest_checkout: guestCheckout,
          metadata: {
            checkout_type: 'dynamic_payment_intent',
            timestamp: new Date().toISOString()
          }
        });
        
        console.log('Payment intent created:', {
          ...paymentResponse,
          client_secret: paymentResponse.client_secret ? `${paymentResponse.client_secret.substring(0, 20)}...` : 'MISSING'
        });
        
        if (!paymentResponse.client_secret) {
          throw new Error('No client_secret returned from payment intent');
        }
        
        onClientSecretReady(paymentResponse.client_secret, {
          subtotal: paymentResponse.subtotal,
          shippingCost: paymentResponse.shipping_cost,
          total: paymentResponse.total,
          paymentIntentId: paymentResponse.payment_intent_id
        });
        
      } catch (error) {
        console.error('Error initializing payment:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
        onError(errorMessage);
      }
    }

    if (items.length > 0 && shippingAddress && customerEmail) {
      initializePayment();
    }
  }, [items, shippingAddress, customerEmail, guestCheckout, onClientSecretReady, onError]);

  // This component doesn't render anything - it's just for the side effect
  return null;
}