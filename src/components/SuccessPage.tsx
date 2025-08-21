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

      // Enhanced retry function to fetch order with readable_order_id
      const fetchLatestOrder = async (session_id: string) => {
        let retries = 0;
        const maxRetries = 3;
        const retryDelay = 500; // 500ms delay between retries
        
        console.log(`[SuccessPage] Starting order fetch for session_id: ${session_id}`);
        
        while (retries < maxRetries) {
          console.log(`[SuccessPage] Attempt ${retries + 1}/${maxRetries} to fetch order for session_id: ${session_id}`);
          
                      try {
              const { data: orders, error } = await supabase
                .from('orders')
                .select('readable_order_id, customer_email, created_at, customer_details, stripe_session_id')
                .eq('stripe_session_id', session_id)
                .limit(1);

            if (!error && orders && orders.length > 0) {
              const data = orders[0];
              console.log(`[SuccessPage] Order found:`, {
                readable_order_id: data.readable_order_id,
                customer_email: data.customer_email,
                created_at: data.created_at
              });
              
              if (data.readable_order_id) {
                console.log(`[SuccessPage] ✅ Order has readable_order_id: ${data.readable_order_id}`);
                return data;
              } else {
                console.log(`[SuccessPage] ⚠️ Order found but readable_order_id is null/undefined, retrying...`);
              }
            } else if (error) {
              console.log(`[SuccessPage] ❌ Error fetching order:`, error);
            } else {
              console.log(`[SuccessPage] ❌ Order not found for session_id: ${session_id}`);
            }
          } catch (fetchError) {
            console.log(`[SuccessPage] ❌ Exception during order fetch:`, fetchError);
          }

          retries++;
          if (retries < maxRetries) {
            console.log(`[SuccessPage] ⏳ Waiting ${retryDelay}ms before retry ${retries + 1}...`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }

        console.log(`[SuccessPage] ❌ Failed to fetch order after ${maxRetries} retries for session_id: ${session_id}`);
        throw new Error(`Order not found or readable_order_id missing after ${maxRetries} retries for session_id: ${session_id}`);
      };

      // Fetch order details with readable order ID
      const fetchOrderDetails = async () => {
        try {
          // Use sessionId to fetch the specific order with readable_order_id
          if (sessionId) {
            try {
              const data = await fetchLatestOrder(sessionId);
              setOrderDetails(data);
              console.log(`[SuccessPage] ✅ Successfully fetched order with readable_order_id: ${data.readable_order_id}`);
            } catch (error: any) {
              console.error(`[SuccessPage] ❌ Failed to fetch order after retries for session_id: ${sessionId}:`, error);
              
              // Log additional context for debugging
              console.log(`[SuccessPage] 📊 Debug info:`, {
                session_id: sessionId,
                customer_email: email,
                timestamp: new Date().toISOString(),
                error_message: error?.message || 'Unknown error'
              });
              
              // Set a fallback order details object
              setOrderDetails({
                readable_order_id: null,
                customer_email: email,
                created_at: new Date().toISOString()
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

  // Pre-populate address form when order details are loaded
  useEffect(() => {
    if (orderDetails?.customer_details?.address) {
      const address = orderDetails.customer_details.address;
      setAddressForm({
        line1: address.line1 || '',
        line2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postal_code || ''
      });
    }
  }, [orderDetails]);

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

  // Check if order is missing address information
  const isAddressIncomplete = (order: any) => {
    if (!order?.customer_details?.address) return true;
    const address = order.customer_details.address;
    return !address.line1 || !address.city || !address.postal_code;
  };

  // Update address information
  const updateAddress = async () => {
    if (!orderDetails?.stripe_session_id) return;
    
    setIsUpdatingAddress(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          customer_details: {
            ...orderDetails.customer_details,
            address: {
              ...orderDetails.customer_details?.address,
              ...addressForm
            }
          }
        })
        .eq('stripe_session_id', orderDetails.stripe_session_id);

      if (error) {
        console.error('Error updating address:', error);
        alert('Failed to update address. Please contact support.');
      } else {
        // Refresh order details
        const { data: updatedOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_session_id', orderDetails.stripe_session_id)
          .single();
        
        if (updatedOrder) {
          setOrderDetails(updatedOrder);
          setShowAddressForm(false);
          alert('Address updated successfully!');
        }
      }
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address. Please contact support.');
    } finally {
      setIsUpdatingAddress(false);
    }
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
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(orderDetails.created_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">
                    {orderDetails.customer_email}
                  </span>
                </div>
              </div>
              
              {/* Address Completion Section */}
              {isAddressIncomplete(orderDetails) && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-3">
                    ⚠️ Address Information Incomplete
                  </h4>
                  <p className="text-yellow-700 text-sm mb-4">
                    We noticed your order is missing some address information. Please complete the details below to ensure proper delivery.
                  </p>
                  
                  {!showAddressForm ? (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Complete Address
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-yellow-800 mb-1">
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            value={addressForm.line1}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, line1: e.target.value }))}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm"
                            placeholder="Street address"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-yellow-800 mb-1">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={addressForm.line2}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, line2: e.target.value }))}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm"
                            placeholder="Apartment, suite, etc."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-yellow-800 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm"
                            placeholder="City"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-yellow-800 mb-1">
                            State/County
                          </label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm"
                            placeholder="State or County"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-yellow-800 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            value={addressForm.postal_code}
                            onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
                            className="w-full px-3 py-2 border border-yellow-300 rounded-md text-sm"
                            placeholder="Postal code"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 pt-2">
                        <button
                          onClick={updateAddress}
                          disabled={isUpdatingAddress || !addressForm.line1 || !addressForm.city || !addressForm.postal_code}
                          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium"
                        >
                          {isUpdatingAddress ? 'Updating...' : 'Update Address'}
                        </button>
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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