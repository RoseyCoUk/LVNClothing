import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, Shield, Truck, Lock, CreditCard, Heart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { stripePromise, stripeAppearance } from '../lib/stripe';
import { supabase } from '../lib/supabase';

interface CheckoutFormProps {
  clientSecret: string;
  orderTotal: number;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, orderTotal }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      postal_code: '',
      country: 'GB'
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          receipt_email: customerInfo.email,
          shipping: {
            name: `${customerInfo.firstName} ${customerInfo.lastName}`,
            address: customerInfo.address
          }
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Create order record in database
        await createOrderRecord(paymentIntent.id);
        
        // Clear cart
        clearCart();
        
        // Redirect to success page
        navigate('/success', { 
          state: { 
            paymentIntentId: paymentIntent.id,
            orderTotal 
          }
        });
      }

    } catch (err) {
      setErrorMessage('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  const createOrderRecord = async (paymentIntentId: string) => {
    try {
      const orderData = {
        payment_intent_id: paymentIntentId,
        customer_email: customerInfo.email,
        customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        total_amount: orderTotal,
        status: 'confirmed',
        items: cartItems.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: customerInfo.address,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) {
        console.error('Failed to create order record:', error);
      }
    } catch (error) {
      console.error('Error creating order record:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              required
              value={customerInfo.firstName}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              required
              value={customerInfo.lastName}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
          />
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 1 *
            </label>
            <input
              type="text"
              required
              value={customerInfo.address.line1}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, line1: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line 2
            </label>
            <input
              type="text"
              value={customerInfo.address.line2}
              onChange={(e) => setCustomerInfo(prev => ({ 
                ...prev, 
                address: { ...prev.address, line2: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={customerInfo.address.city}
                onChange={(e) => setCustomerInfo(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, city: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={customerInfo.address.postal_code}
                onChange={(e) => setCustomerInfo(prev => ({ 
                  ...prev, 
                  address: { ...prev.address, postal_code: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Information
        </h3>
        
        <PaymentElement />
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2 text-green-600" />
            SSL Secured
          </div>
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-2 text-green-600" />
            256-bit Encryption
          </div>
          <div className="flex items-center">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            Faith-Based Business
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-lvn-maroon text-white font-semibold py-4 px-6 rounded-xl text-lg hover:bg-lvn-maroon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            <span>Complete Order - £{orderTotal.toFixed(2)}</span>
          </>
        )}
      </button>
    </form>
  );
};

interface StripeCheckoutPageProps {
  onBack: () => void;
}

const StripeCheckoutPage: React.FC<StripeCheckoutPageProps> = ({ onBack }) => {
  const { cartItems, getTotalPrice } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= 60 ? 0 : 4.99;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (cartItems.length === 0) {
      setIsLoading(false);
      return;
    }

    createPaymentIntent();
  }, [cartItems]);

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      
      // Call Supabase Edge Function to create payment intent
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: Math.round(total * 100), // Convert to pence
          currency: 'gbp',
          metadata: {
            order_source: 'lvn_website',
            items_count: cartItems.length.toString(),
            cart_id: Date.now().toString()
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.client_secret) {
        setClientSecret(data.client_secret);
      } else {
        throw new Error('No client secret received');
      }

    } catch (err: any) {
      console.error('Payment intent creation failed:', err);
      setError(err.message || 'Failed to initialize payment');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-lvnBg py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
            <button onClick={onBack} className="btn-lvn-primary">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lvnBg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lvn-maroon mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-lvnBg py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-4">
              <button onClick={createPaymentIntent} className="btn-lvn-primary">
                Try Again
              </button>
              <button onClick={onBack} className="btn-lvn-outline">
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lvnBg py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-sm text-gray-600">LVN Clothing - Premium Christian Streetwear</p>
          </div>
          
          <div className="flex items-center space-x-2 text-green-600">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Secure</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            {clientSecret && (
              <Elements 
                stripe={stripePromise} 
                options={{
                  clientSecret,
                  appearance: stripeAppearance,
                }}
              >
                <CheckoutForm clientSecret={clientSecret} orderTotal={total} />
              </Elements>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg border sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      £{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}</span>
                </div>
                
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Elements */}
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-lvn-maroon" />
                    <span className="text-sm text-gray-600">
                      {shippingCost === 0 ? 'Free UK shipping' : 'Standard UK shipping'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">SSL secured checkout</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-600">Supporting Kingdom work</span>
                  </div>
                </div>
              </div>

              {/* Scripture */}
              <div className="mt-6 pt-6 border-t bg-gray-50 p-3 rounded">
                <p className="text-xs italic text-gray-600 text-center">
                  "He who dwells in the shelter of the Most High will abide in the shadow of the almighty"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutPage;
