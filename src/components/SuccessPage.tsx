import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, ArrowRight, Mail, Clock, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SuccessPageProps {
  onBackToShop: () => void;
  sessionId?: string;
  email?: string;
  readableOrderId?: string;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ onBackToShop, sessionId, email, readableOrderId }) => {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: ''
  });
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  useEffect(() => {
    const handleEmailSending = async () => {
      // Enhanced retry function to fetch order with readable_order_id
      const fetchLatestOrder = async (session_id: string) => {
        const maxRetries = 5;
        const retryDelay = 1000;
        let retries = 0;

        while (retries < maxRetries) {
          try {
            const { data: orders, error } = await supabase
              .from('orders')
              .select('readable_order_id, customer_email, created_at, customer_details, stripe_session_id')
              .eq('stripe_session_id', session_id)
              .limit(1);

            if (!error && orders && orders.length > 0) {
              const order = orders[0];
              if (order.readable_order_id) {
                return order;
              }
            }
          } catch (error) {
            // Silent error handling for production
          }

          retries++;
          
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }

        return null;
      };

      // Try to get order details from sessionId
      let orderDetails = null;
      if (sessionId) {
        try {
          orderDetails = await fetchLatestOrder(sessionId);
        } catch (error) {
          // Silent error handling for production
        }
      }

      // If we still don't have order details, try to get them from the URL
      if (!orderDetails) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const urlSessionId = urlParams.get('session_id');
          
          if (urlSessionId) {
            orderDetails = await fetchLatestOrder(urlSessionId);
          }
        } catch (error) {
          // Silent error handling for production
        }
      }

      // Check if this is a test payment
      const urlParams = new URLSearchParams(window.location.search);
      const isTestPayment = urlParams.get('test') === 'true';
      const urlSessionId = urlParams.get('session_id');
      const urlEmail = urlParams.get('email');

      // Determine final sessionId and email
      const finalSessionId = sessionId || urlSessionId;
      const finalEmail = email || urlEmail;

      if (isTestPayment && finalSessionId && finalEmail) {
        try {
          await callSendOrderEmail(finalSessionId, finalEmail);
        } catch (error) {
          // Silent error handling for production
        }
      }

      setOrderDetails(orderDetails);
      setIsLoading(false);
    };

    handleEmailSending();
  }, [sessionId, email, readableOrderId]);

  const callSendOrderEmail = async (sessionId: string, email: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          sessionId,
          email,
          testMode: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending order email:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lvn-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lvn-maroon mx-auto mb-4"></div>
          <p className="text-lvn-black/70">Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lvn-off-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-lvn-maroon rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-lvn-white" />
          </div>
          <h1 className="text-4xl font-bold text-lvn-black mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-lg text-lvn-black/70 mb-6">
            Your LVN Clothing order has been confirmed. <br />
            <span className="text-lvn-maroon font-medium">Psalm 91 – He is your refuge.</span>
          </p>
          
          {readableOrderId && (
            <div className="bg-lvn-white border border-lvn-black/10 rounded-none p-4 inline-block">
              <p className="text-sm text-lvn-black/70">Order ID:</p>
              <p className="font-bold text-lvn-maroon">{readableOrderId}</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="bg-lvn-white rounded-none shadow-sm border border-lvn-black/10 p-8 mb-8">
          <h2 className="text-2xl font-bold text-lvn-black mb-6">Order Summary</h2>
          
          {orderDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lvn-black mb-2">Order Details</h3>
                  <p className="text-lvn-black/70">
                    <strong>Order ID:</strong> {orderDetails.readable_order_id || 'Processing...'}
                  </p>
                  <p className="text-lvn-black/70">
                    <strong>Date:</strong> {new Date(orderDetails.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-lvn-black/70">
                    <strong>Email:</strong> {orderDetails.customer_email}
                  </p>
                </div>
                
                {orderDetails.customer_details && (
                  <div>
                    <h3 className="font-semibold text-lvn-black mb-2">Shipping Address</h3>
                    <div className="text-lvn-black/70">
                      {orderDetails.customer_details.address && (
                        <>
                          <p>{orderDetails.customer_details.address.line1}</p>
                          {orderDetails.customer_details.address.line2 && (
                            <p>{orderDetails.customer_details.address.line2}</p>
                          )}
                          <p>
                            {orderDetails.customer_details.address.city}, {orderDetails.customer_details.address.state} {orderDetails.customer_details.address.postal_code}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lvn-black/70">Order details are being processed...</p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-lvn-white rounded-none border border-lvn-black/10 p-6 text-center">
            <Mail className="w-8 h-8 text-lvn-maroon mx-auto mb-3" />
            <h3 className="font-semibold text-lvn-black mb-2">Confirmation Email</h3>
            <p className="text-sm text-lvn-black/70">
              You'll receive a confirmation email shortly with your order details.
            </p>
          </div>
          
          <div className="bg-lvn-white rounded-none border border-lvn-black/10 p-6 text-center">
            <Package className="w-8 h-8 text-lvn-maroon mx-auto mb-3" />
            <h3 className="font-semibold text-lvn-black mb-2">Order Processing</h3>
            <p className="text-sm text-lvn-black/70">
              Your order is being processed and will ship within 1-2 business days.
            </p>
          </div>
          
          <div className="bg-lvn-white rounded-none border border-lvn-black/10 p-6 text-center">
            <Clock className="w-8 h-8 text-lvn-maroon mx-auto mb-3" />
            <h3 className="font-semibold text-lvn-black mb-2">Free UK Shipping</h3>
            <p className="text-sm text-lvn-black/70">
              Free UK shipping on orders over £60. Delivery typically 3-5 business days.
            </p>
          </div>
        </div>

        {/* Scripture Quote */}
        <div className="bg-lvn-maroon text-lvn-white rounded-none p-8 text-center mb-8">
          <div className="scripture-quote text-2xl mb-2">
            "For he will command his angels concerning you to guard you in all your ways."
          </div>
          <p className="text-lvn-white/80">Psalm 91:11</p>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <button
            onClick={onBackToShop}
            className="btn-lvn-primary inline-flex items-center space-x-2 px-8 py-3 text-lg"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <div className="text-sm text-lvn-black/70">
            <p>Questions about your order? Contact us at support@lvnclothing.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;