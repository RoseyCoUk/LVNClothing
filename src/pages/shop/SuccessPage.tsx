import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, ArrowRight, Mail, Clock, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

      // Clean up URL parameters
      if (isTestPayment) {
        window.history.replaceState({}, document.title, '/success');
      }

      // Set order details in state
      if (orderDetails) {
        setOrderDetails(orderDetails);
      }

      setIsLoading(false);
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase configuration');
      }

      const requestBody = {
        sessionId,
        customerEmail
      };

      const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Email function failed: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const responseData = await response.json();
      return responseData;
      
    } catch (error) {
      // Silent error handling for production
      throw error;
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