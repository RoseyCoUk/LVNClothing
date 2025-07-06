import React, { useState } from 'react';
import { CreditCard, ShoppingCart, CheckCircle, AlertTriangle, Package, Clock, User, UserX } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { createCheckoutSession } from '../lib/stripe';
import { supabase } from '../lib/supabase';

const TestPaymentFlow = () => {
  const { addToCart, cartItems, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    step: string;
    status: 'success' | 'error' | 'info';
    message: string;
    details?: unknown;
    timestamp: string;
  }>>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutType, setCheckoutType] = useState<'user' | 'guest'>('user');
  const [testEmail, setTestEmail] = useState('test@example.com');

  const testProducts = [
    {
      id: 'test-hoodie',
      name: 'Test Reform UK Hoodie',
      price: 34.99,
      image: 'Hoodie/Men/ReformMenHoodieBlack1.webp'
    },
    {
      id: 'test-tshirt',
      name: 'Test Reform UK T-Shirt',
      price: 19.99,
      image: 'Tshirt/Men/ReformMenTshirtWhite1.webp'
    }
  ];

  // 🔧 TASK: Test with Reform UK Hoodie (live mode price ID)
  // 📌 Using the live price ID for comprehensive test coverage
  const testPriceId = 'price_1Rhsh5GDbOGEgNLwpqIVX80W'; // Reform UK Hoodie

  const addTestResult = (step: string, status: 'success' | 'error' | 'info', message: string, details?: unknown) => {
    setTestResults(prev => [...prev, {
      step,
      status,
      message,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testStep1_AddToCart = () => {
    setCurrentStep(1);
    addTestResult('Step 1', 'info', 'Testing add to cart functionality...');
    
    try {
      // Clear cart first
      clearCart();
      addTestResult('Step 1', 'success', 'Cart cleared');
      
      // Add test products
      testProducts.forEach(product => {
        addToCart(product);
        addTestResult('Step 1', 'success', `Added ${product.name} to cart`);
      });
      
      addTestResult('Step 1', 'success', `Cart now has ${cartItems.length + testProducts.length} items, total: £${(getTotalPrice() + testProducts.reduce((sum, p) => sum + p.price, 0)).toFixed(2)}`);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult('Step 1', 'error', 'Failed to add items to cart', errorMessage);
    }
  };

  const testStep2_AuthCheck = async () => {
    setCurrentStep(2);
    addTestResult('Step 2', 'info', 'Testing authentication status...');
    
    // If guest checkout is selected, skip auth check
    if (checkoutType === 'guest') {
      addTestResult('Step 2', 'success', 'Authentication check skipped for guest checkout');
      return true;
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addTestResult('Step 2', 'error', 'Auth check failed', error.message);
        return false;
      }
      
      if (session) {
        addTestResult('Step 2', 'success', `User authenticated: ${session.user.email}`);
        addTestResult('Step 2', 'info', `User ID: ${session.user.id}`);
        return true;
      } else {
        addTestResult('Step 2', 'error', 'User not authenticated - please sign in first');
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addTestResult('Step 2', 'error', 'Auth check exception', errorMessage);
      return false;
    }
  };

  const testStep3_CreateCheckout = async () => {
    setCurrentStep(3);
    addTestResult('Step 3', 'info', 'Testing checkout session creation...');
    addTestResult('Step 3', 'info', 'Note: This test will fail if Stripe environment variables are not configured');
    
    try {
      const checkoutData = {
        price_id: testPriceId,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/shop`,
        mode: 'payment' as const,
        customer_email: checkoutType === 'guest' ? testEmail : undefined
      };
      
      addTestResult('Step 3', 'info', 'Calling createCheckoutSession...', checkoutData);
      
      const response = await createCheckoutSession(checkoutData);
      
      addTestResult('Step 3', 'success', 'Checkout session created successfully!', {
        sessionId: response.sessionId,
        url: response.url
      });
      
      addTestResult('Step 3', 'info', 'In a real scenario, user would be redirected to Stripe checkout');
      
      // For test mode, simulate the redirect and success flow
      addTestResult('Step 3', 'info', 'Simulating redirect to Stripe checkout...');
      
      // Simulate successful payment and redirect to success page
      setTimeout(() => {
        addTestResult('Step 3', 'success', 'Payment completed! Redirecting to success page...');
        
        // Call the send-order-email Supabase Edge Function (test mode only)
        callSendOrderEmail(response.sessionId, testEmail);
        
        // Redirect to success page with test parameters
        window.location.href = `/success?test=payment&session_id=${response.sessionId}&email=${encodeURIComponent(testEmail)}`;
      }, 2000);

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      
      if (errorMessage.includes('Stripe API key is not configured')) {
        addTestResult('Step 3', 'error', 'Stripe API key is not configured in Supabase Edge Functions');
        addTestResult('Step 3', 'info', 'To fix this, add STRIPE_SECRET_KEY to your Supabase project environment variables');
      } else {
        addTestResult('Step 3', 'error', 'Failed to create checkout session', errorMessage);
      }
      
      return null;
    }
  };

  // Function to call the send-order-email Supabase Edge Function (test mode only)
  const callSendOrderEmail = async (sessionId: string, customerEmail: string) => {
    try {
      addTestResult('Step 3', 'info', 'Calling send-order-email Supabase Edge Function...');
      
      // Get your Supabase project URL from environment or replace with actual URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'}`,
        },
        body: JSON.stringify({
          orderId: sessionId, // Using sessionId as orderId for test
          customerEmail: customerEmail,
        }),
      });

      if (response.ok) {
        addTestResult('Step 3', 'success', 'Order notification email sent successfully!');
      } else {
        const errorData = await response.text();
        addTestResult('Step 3', 'error', 'Failed to send order notification email', errorData);
      }
    } catch (error: any) {
      addTestResult('Step 3', 'error', 'Error calling send-order-email function', error.message);
    }
  };

  const testStep4_WebhookSimulation = () => {
    setCurrentStep(4);
    addTestResult('Step 4', 'info', 'Simulating webhook processing...');
    
    // Simulate what happens when Stripe sends a webhook
    const mockWebhookData = {
      id: `cs_test_${Date.now()}`,
      event_type: 'checkout.session.completed',
      session_id: 'cs_test_123456789',
      customer_id: 'cus_test_123456789',
      payment_status: 'paid',
      amount_total: 4999, // £49.99 in pence
      currency: 'gbp',
      customer_email: checkoutType === 'guest' ? testEmail : undefined
    };
    
    addTestResult('Step 4', 'success', 'Mock webhook data created', mockWebhookData);
    addTestResult('Step 4', 'info', 'In production, this would trigger order creation in database');
    addTestResult('Step 4', 'info', 'User would receive confirmation email');
    addTestResult('Step 4', 'info', 'Order notification email would be sent to support@backreform.co.uk');
    
    // Simulate the email notification content
    const emailContent = {
      to: 'support@backreform.co.uk',
      subject: `New Order #${mockWebhookData.id} - Reform UK Shop`,
      orderDetails: {
        orderId: mockWebhookData.id,
        customerId: mockWebhookData.customer_id,
        customerEmail: mockWebhookData.customer_email || 'Unknown',
        amount: `£${(mockWebhookData.amount_total / 100).toFixed(2)}`,
        status: mockWebhookData.payment_status,
        date: new Date().toISOString()
      }
    };
    
    addTestResult('Step 4', 'success', 'Order notification email simulation', emailContent);
  };

  const runFullTest = async () => {
    setIsProcessing(true);
    setTestResults([]);
    setCurrentStep(0);
    
    // If guest checkout is selected, sign out first to ensure no active session
    if (checkoutType === 'guest') {
      addTestResult('Test Start', 'info', 'Preparing for guest checkout test...');
      try {
        await supabase.auth.signOut();
        addTestResult('Test Start', 'success', 'Signed out any existing user for guest checkout test');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addTestResult('Test Start', 'error', 'Error signing out user', errorMessage);
      }
    } else {
      addTestResult('Test Start', 'info', 'Preparing for user checkout test...');
    }
    
    addTestResult('Test Start', 'info', 'Beginning full payment flow test...');
    
    // Step 1: Add to Cart
    testStep1_AddToCart();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Check Authentication
    const isAuthenticated = await testStep2_AuthCheck();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!isAuthenticated && checkoutType === 'user') {
      addTestResult('Test End', 'error', 'Test stopped - authentication required');
      setIsProcessing(false);
      return;
    }
    
    // Step 3: Create Checkout Session
    const checkoutResponse = await testStep3_CreateCheckout();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!checkoutResponse) {
      addTestResult('Test End', 'error', 'Test stopped - checkout creation failed');
      setIsProcessing(false);
      return;
    }
    
    // Step 4: Simulate Webhook
    testStep4_WebhookSimulation();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addTestResult('Test End', 'success', 'Payment flow test completed successfully!');
    setCurrentStep(5);
    setIsProcessing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {checkoutType === 'user' ? (
                <User className="w-12 h-12 text-[#009fe3]" />
              ) : (
                <UserX className="w-12 h-12 text-[#009fe3]" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Flow Test</h1>
            <p className="text-gray-600">Test the complete payment integration from cart to completion</p>
          </div>

          {/* Checkout Type Selector */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Checkout Type</h3>
              <div className="flex items-center justify-center space-x-6">
                <button
                  onClick={() => setCheckoutType('user')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    checkoutType === 'user' 
                      ? 'bg-[#009fe3] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>User Checkout</span>
                  {checkoutType === 'user' && <CheckCircle className="w-4 h-4 ml-1" />}
                </button>
                
                <button
                  onClick={() => setCheckoutType('guest')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    checkoutType === 'guest' 
                      ? 'bg-[#009fe3] text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <UserX className="w-5 h-5" />
                  <span>Guest Checkout</span>
                  {checkoutType === 'guest' && <CheckCircle className="w-4 h-4 ml-1" />}
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 text-center">
                {checkoutType === 'user' ? (
                  <p>Testing checkout flow with user authentication</p>
                ) : (
                  <p>Testing checkout flow without user authentication (guest mode)</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Guest Email Input */}
          {checkoutType === 'guest' && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Guest Checkout Email</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter test email address"
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                />
                <button
                  onClick={() => setTestEmail('test@example.com')}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm"
                >
                  Reset
                </button>
              </div>
              <p className="mt-2 text-xs text-blue-700">
                This email will be used for guest checkout and order confirmation emails
              </p>
            </div>
          )}

          {/* Test Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Test Progress</h2>
              <span className="text-sm text-gray-500">Step {currentStep} of 5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#009fe3] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="mb-8 text-center">
            <button
              onClick={runFullTest}
              disabled={isProcessing}
              className="bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Running Test...</span>
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  <span>Run Full Payment Test</span>
                </>
              )}
            </button>
          </div>

          {/* Individual Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <button
              onClick={testStep1_AddToCart}
              className="p-3 border border-gray-300 rounded-lg hover:border-[#009fe3] hover:text-[#009fe3] transition-colors text-sm"
            >
              <ShoppingCart className="w-4 h-4 mx-auto mb-1" />
              Test Cart
            </button>
            <button
              onClick={testStep2_AuthCheck}
              className="p-3 border border-gray-300 rounded-lg hover:border-[#009fe3] hover:text-[#009fe3] transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4 mx-auto mb-1" />
              Test Auth
            </button>
            <button
              onClick={testStep3_CreateCheckout}
              className="p-3 border border-gray-300 rounded-lg hover:border-[#009fe3] hover:text-[#009fe3] transition-colors text-sm"
            >
              <CreditCard className="w-4 h-4 mx-auto mb-1" />
              Test Checkout
            </button>
            <button
              onClick={testStep4_WebhookSimulation}
              className="p-3 border border-gray-300 rounded-lg hover:border-[#009fe3] hover:text-[#009fe3] transition-colors text-sm"
            >
              <Package className="w-4 h-4 mx-auto mb-1" />
              Test Webhook
            </button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}>
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{result.step}</span>
                          <span className="text-xs opacity-75">{result.timestamp}</span>
                        </div>
                        <p className="text-sm mt-1">{result.message}</p>
                        {result.details !== undefined && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer opacity-75">View Details</summary>
                            <pre className="text-xs mt-1 p-2 bg-black/10 rounded overflow-x-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Cart Status */}
          {cartItems.length > 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Current Cart Status</h4>
              <p className="text-blue-800 text-sm">
                {cartItems.length} items in cart, Total: £{getTotalPrice().toFixed(2)}
              </p>
              <div className="mt-2 space-y-1">
                {cartItems.map((item, index) => (
                  <div key={index} className="text-xs text-blue-700">
                    {item.name} - £{item.price.toFixed(2)} x {item.quantity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Test Instructions</h4>
            <div className="text-yellow-800 text-sm space-y-2">              
              {checkoutType === 'user' ? (
                <p>1. <strong>Sign in first</strong> - User checkout requires authentication</p>
              ) : (
                <p>1. <strong>No sign-in needed</strong> - Guest checkout works without authentication</p>
              )}
              <p>2. <strong>Run Full Test</strong> - This will test the complete flow automatically</p>
              <p>3. <strong>Individual Tests</strong> - Use the buttons above to test specific components</p>
              <p>4. <strong>Check Results</strong> - Review the detailed test results below</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPaymentFlow;