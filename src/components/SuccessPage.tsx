import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, ArrowRight, Download, Mail, Clock, Phone } from 'lucide-react';
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

  useEffect(() => {
    const handleEmailSending = async () => {
      // Enhanced logging for debugging
      console.log('SuccessPage: Component mounted');
      console.log('SuccessPage: Current URL:', window.location.href);
      console.log('SuccessPage: Pathname:', window.location.pathname);
      console.log('SuccessPage: Search params:', window.location.search);
      
      // Log the sessionId and email to console
      if (sessionId) {
        console.log('SuccessPage: sessionId received via props:', sessionId);
      } else {
        console.log('SuccessPage: No sessionId received via props');
      }
      if (email) {
        console.log('SuccessPage: email received via props:', email);
      } else {
        console.log('SuccessPage: No email received via props');
      }

      // Retry function to fetch order with readable_order_id
      const fetchLatestOrder = async (session_id: string) => {
        let retries = 0;
        const maxRetries = 3;
        const retryDelay = 500; // 500ms delay between retries
        
        while (retries < maxRetries) {
          console.log(`SuccessPage: Attempt ${retries + 1}/${maxRetries} to fetch order for session_id:`, session_id);
          
          const { data, error } = await supabase
            .from('orders')
            .select('readable_order_id, customer_email, created_at, amount_total, currency, order_status')
            .eq('stripe_session_id', session_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (!error && data?.readable_order_id) {
            console.log('SuccessPage: Order found with readable_order_id:', data.readable_order_id);
            return data;
          }

          if (error) {
            console.log('SuccessPage: Error fetching order:', error);
          } else if (data && !data.readable_order_id) {
            console.log('SuccessPage: Order found but readable_order_id is missing, retrying...');
          } else {
            console.log('SuccessPage: Order not found, retrying...');
          }

          retries++;
          if (retries < maxRetries) {
            console.log(`SuccessPage: Waiting ${retryDelay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }

        throw new Error(`Order not found or readable_order_id missing after ${maxRetries} retries`);
      };

      // Fetch order details with readable order ID
      const fetchOrderDetails = async () => {
        try {
          // Use sessionId to fetch the specific order with readable_order_id
          if (sessionId) {
            try {
              const data = await fetchLatestOrder(sessionId);
              setOrderDetails(data);
            } catch (error) {
              console.error('SuccessPage: Failed to fetch order after retries:', error);
              // Set a fallback order details object
              setOrderDetails({
                readable_order_id: null,
                customer_email: email,
                created_at: new Date().toISOString(),
                amount_total: 0,
                currency: 'gbp',
                order_status: 'processing'
              });
            }
          } else {
            // Fallback: Get the most recent order for the user
            const { data, error } = await supabase
              .from('stripe_user_orders')
              .select('*')
              .order('order_date', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (error) {
              console.error('Error fetching order details:', error);
            } else if (data) {
              setOrderDetails(data);
            }
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrderDetails();

      // Check if this is a test payment flow by looking for URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const isTestPayment = urlParams.get('test') === 'payment';
      const urlSessionId = urlParams.get('session_id');
      const urlEmail = urlParams.get('email');

      console.log('SuccessPage: URL params - test:', isTestPayment);
      console.log('SuccessPage: URL params - session_id:', urlSessionId);
      console.log('SuccessPage: URL params - email:', urlEmail);

      // Use props if available, otherwise fall back to URL parameters
      const finalSessionId = sessionId || urlSessionId;
      const finalEmail = email || urlEmail;

      console.log('SuccessPage: Final sessionId:', finalSessionId);
      console.log('SuccessPage: Final email:', finalEmail);

      if (isTestPayment && finalSessionId && finalEmail) {
        console.log('SuccessPage: Calling send-order-email function for test payment');
        console.log("Attempting to send email", { sessionId: finalSessionId, email: finalEmail });
        
        // Call the send-order-email function for test payments
        try {
          await callSendOrderEmail(finalSessionId, finalEmail);
          console.log("✅ Email function called successfully");
        } catch (error) {
          console.error("❌ Email function failed to send:", error);
        }
      }

      // Clean up URL parameters
      if (isTestPayment) {
        console.log('SuccessPage: Cleaning up URL parameters');
        window.history.replaceState({}, document.title, '/success');
      }
    };

    handleEmailSending();
  }, [sessionId, email]);

  // Function to call the send-order-email Supabase Edge Function
  const callSendOrderEmail = async (sessionId: string, customerEmail: string) => {
    try {
      console.log('SuccessPage: callSendOrderEmail - Starting email send process');
      console.log('SuccessPage: callSendOrderEmail - sessionId:', sessionId);
      console.log('SuccessPage: callSendOrderEmail - customerEmail:', customerEmail);
      
      // Get Supabase environment variables (same as supabase.ts)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      // Validate environment variables
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required');
      }
      
      console.log('SuccessPage: callSendOrderEmail - supabaseUrl:', supabaseUrl);
      console.log('SuccessPage: callSendOrderEmail - supabaseAnonKey exists:', !!supabaseAnonKey);
      
      const requestBody = {
        orderId: sessionId,
        customerEmail: customerEmail,
      };
      
      console.log('SuccessPage: callSendOrderEmail - Request body:', requestBody);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('SuccessPage: callSendOrderEmail - Response status:', response.status);
      console.log('SuccessPage: callSendOrderEmail - Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.text();
        console.log('SuccessPage: callSendOrderEmail - Response data:', responseData);
        console.log('SuccessPage: callSendOrderEmail - Email sent successfully!');
      } else {
        const errorData = await response.text();
        console.error('SuccessPage: callSendOrderEmail - Failed to send order notification email');
        console.error('SuccessPage: callSendOrderEmail - Error status:', response.status);
        console.error('SuccessPage: callSendOrderEmail - Error data:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }
    } catch (error: any) {
      console.error('SuccessPage: callSendOrderEmail - Error calling send-order-email function');
      console.error('SuccessPage: callSendOrderEmail - Error message:', error.message);
      console.error('SuccessPage: callSendOrderEmail - Error stack:', error.stack);
      throw error; // Re-throw to be caught by the calling function
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank you for your order!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your payment has been processed successfully. We've received your order and will send you a confirmation email shortly.
            </p>
            
            {/* Display order information */}
            {orderDetails?.readable_order_id && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Order Details:</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Order ID:</strong> {orderDetails.readable_order_id}
                </p>
                {email && (
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {email}
                  </p>
                )}
              </div>
            )}
            {/* Fallback for older orders without readable order ID */}
            {!orderDetails?.readable_order_id && sessionId && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Order Details:</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Order ID:</strong> Processing...
                </p>
                {email && (
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {email}
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center justify-center text-gray-600">
                <Package className="w-5 h-5 mr-2" />
                <span>Your order is being processed</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <Mail className="w-5 h-5 mr-2" />
                <span>Confirmation email sent to {email || 'your email'}</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <Phone className="w-5 h-5 mr-2" />
                <span>Contact support if you have questions</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          {isLoading ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
              </div>
            </div>
          ) : orderDetails ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-gray-900">#{orderDetails.readable_order_id || 'Processing...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(orderDetails.amount_total, orderDetails.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(orderDetails.order_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {orderDetails.order_status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <p className="text-gray-600">Order details will be available shortly.</p>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center justify-center">
              <Package className="w-5 h-5 mr-2" />
              What happens next?
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start space-x-3">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>You'll receive an order confirmation email shortly</p>
              </div>
              <div className="flex items-start space-x-3">
                <Package className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Your order will be processed and packed within 48 hours</p>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Standard delivery takes 3-5 business days</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={onBackToShop}
              className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="flex space-x-4">
              <button className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </button>
              
              <button className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-[#009fe3] hover:text-[#009fe3] font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Track Order</span>
              </button>
            </div>
          </div>

          {/* Support Message */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@backreform.co.uk" className="text-[#009fe3] hover:underline">
                support@backreform.co.uk
              </a>
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thank you for supporting Reform UK
          </h3>
          <p className="text-gray-600 mb-4">
            Your purchase directly supports Reform UK's mission to bring real change to Britain. 
            Every item you buy helps fund our campaigns and initiatives across the country.
          </p>
          <div className="bg-[#009fe3]/5 border border-[#009fe3]/20 rounded-lg p-4">
            <p className="text-[#009fe3] font-semibold text-center">
              🇬🇧 100% of proceeds support Reform UK initiatives
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;