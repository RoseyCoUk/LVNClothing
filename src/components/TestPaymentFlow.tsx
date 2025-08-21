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
  const [customTestEmail, setCustomTestEmail] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [manualSessionId, setManualSessionId] = useState('');
  
  // Manual address entry for testing
  const [manualAddress, setManualAddress] = useState({
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '+44123456789',
    line1: '123 Test Street',
    line2: 'Test Apartment',
    city: 'London',
    state: 'England',
    postal_code: 'SW1A 1AA',
    country: 'GB'
  });
  
  // Product selection for testing
  const [selectedProducts, setSelectedProducts] = useState([
    { id: 'test-hoodie', name: 'Test Reform UK Hoodie', price: 34.99, quantity: 1, selected: true },
    { id: 'test-tshirt', name: 'Test Reform UK T-Shirt', price: 19.99, quantity: 1, selected: false }
  ]);

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

  // Handle address field changes
  const handleAddressChange = (field: string, value: string) => {
    setManualAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle product selection and quantity changes
  const handleProductChange = (productId: string, field: 'selected' | 'quantity', value: boolean | number) => {
    setSelectedProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, [field]: value }
        : product
    ));
  };

  // Get selected products for testing
  const getSelectedProducts = () => {
    return selectedProducts.filter(product => product.selected);
  };

  // Calculate total for selected products
  const getSelectedProductsTotal = () => {
    return getSelectedProducts().reduce((total, product) => total + (product.price * product.quantity), 0);
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
    
    // Validate that required address fields are filled
    if (!manualAddress.email || !manualAddress.name || !manualAddress.line1 || !manualAddress.city || !manualAddress.postal_code) {
      addTestResult('Step 3', 'error', 'Please fill in all required address fields before testing checkout');
      addTestResult('Step 3', 'info', 'Required: Email, Name, Address Line 1, City, Postal Code');
      return null;
    }
    
    // Validate that at least one product is selected
    if (getSelectedProducts().length === 0) {
      addTestResult('Step 3', 'error', 'Please select at least one product before testing checkout');
      return null;
    }
    
    addTestResult('Step 3', 'info', 'Address and product validation passed');
    
    try {
      const checkoutData = {
        price_id: testPriceId,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/shop`,
        mode: 'payment' as const,
        customer_email: checkoutType === 'guest' ? manualAddress.email : undefined
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
      setTimeout(async () => {
        addTestResult('Step 3', 'success', 'Payment completed! Creating test order...');
        
        // Call the manual-test-insert Supabase Edge Function to create test order and send email
        await callManualTestInsert(response.sessionId, manualAddress.email);
        
        addTestResult('Step 3', 'success', 'Test complete! Redirecting to success page...');
        
        // Redirect to success page with test parameters
        window.location.href = `/success?test=payment&session_id=${response.sessionId}&email=${encodeURIComponent(manualAddress.email)}`;
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

  // Function to call the manual-test-insert Supabase Edge Function (test mode only)
  const callManualTestInsert = async (sessionId: string, customerEmail: string) => {
    try {
      addTestResult('Step 3', 'info', 'Creating test order in database...');
      
      // Use manual address email as primary, fallback to custom test email, then customerEmail
      const emailToUse = manualAddress.email || customTestEmail || customerEmail;
      addTestResult('Step 3', 'info', `Using email: ${emailToUse} (from manual address form)`);
      
      // Get your Supabase project URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/manual-test-insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'createTestOrder',
          sessionId: sessionId,
          customerEmail: emailToUse,
          address: manualAddress,
          items: getSelectedProducts().map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity
          }))
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        addTestResult('Step 3', 'success', 'Test order created successfully!', responseData);
        
        // Show what was used for the test
        addTestResult('Step 3', 'info', 'Test order created with:', {
          customer: manualAddress.name,
          email: emailToUse,
          address: `${manualAddress.line1}, ${manualAddress.city}, ${manualAddress.postal_code}`,
          products: getSelectedProducts().map(p => `${p.name} x${p.quantity}`),
          total: `£${getSelectedProductsTotal().toFixed(2)}`
        });
        
        // Show the complete data structure being sent
        addTestResult('Step 3', 'info', 'Complete test data sent:', {
          sessionId: sessionId,
          customerEmail: emailToUse,
          address: manualAddress,
          items: getSelectedProducts().map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: product.quantity
          }))
        });
        
        // Now call the send-order-email function with the created order
        addTestResult('Step 3', 'info', 'Sending test email...');
        await sendTestEmail(responseData.data.id, emailToUse);
        
        // Verify the order was created with correct data
        addTestResult('Step 3', 'info', 'Verifying order data in database...');
        await verifyOrderData(responseData.data.id);
        
      } else {
        const errorData = await response.text();
        addTestResult('Step 3', 'error', 'Failed to create test order', {
          status: response.status,
          error: errorData
        });
      }
    } catch (error: any) {
      addTestResult('Step 3', 'error', 'Error creating test order', error.message);
    }
  };

  // Add this function to send test email
  const sendTestEmail = async (orderId: string, email: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          customerEmail: email,
        }),
      });

      if (response.ok) {
        addTestResult('Step 3', 'success', 'Test email sent successfully!');
      } else {
        const errorData = await response.text();
        addTestResult('Step 3', 'error', 'Failed to send test email', errorData);
      }
    } catch (error: any) {
      addTestResult('Step 3', 'error', 'Error sending test email', error.message);
    }
  };

  // Add this function to verify order data in database
  const verifyOrderData = async (orderId: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=*`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      });

      if (response.ok) {
        const orderData = await response.json();
        if (orderData && orderData.length > 0) {
          const order = orderData[0];
          addTestResult('Step 3', 'success', 'Order verified in database:', {
            id: order.id,
            customer_email: order.customer_email,
            customer_details: order.customer_details,
            items: order.items,
            created_at: order.created_at
          });
        } else {
          addTestResult('Step 3', 'error', 'Order not found in database');
        }
      } else {
        addTestResult('Step 3', 'error', 'Failed to verify order data');
      }
    } catch (error: any) {
      addTestResult('Step 3', 'error', 'Error verifying order data', error.message);
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

  // Function to manually insert test data into orders table
  const insertManualTestData = async () => {
    try {
      addTestResult('Manual Test', 'info', 'Inserting manual test data...');
      
      const sessionId = manualSessionId || `cs_test_manual_${Date.now()}`;
      const email = customTestEmail || testEmail;
      
      const testOrderData = {
        sessionId: sessionId,
        customerEmail: email,
        items: [
          {
            id: 'test-hoodie',
            name: 'Test Reform UK Hoodie',
            price: 3499,
            quantity: 1
          }
        ]
      };
      
      addTestResult('Manual Test', 'info', 'Test order data prepared', testOrderData);
      
      // Call the manual-test-insert Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-ref.supabase.co';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/manual-test-insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'}`,
        },
        body: JSON.stringify(testOrderData),
      });

      if (response.ok) {
        const result = await response.json();
        addTestResult('Manual Test', 'success', 'Test data inserted successfully!', {
          id: result.order.id,
          stripe_session_id: result.order.stripe_session_id,
          readable_order_id: result.order.readable_order_id,
          customer_email: result.order.customer_email
        });
        
        addTestResult('Manual Test', 'success', 'Email function called automatically by the Edge Function');
      } else {
        const errorData = await response.text();
        addTestResult('Manual Test', 'error', 'Failed to insert test data', {
          status: response.status,
          error: errorData
        });
      }
      
    } catch (error: any) {
      addTestResult('Manual Test', 'error', 'Error inserting test data', error.message);
    }
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
              <div className="space-y-3">
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
                
                {/* Custom Test Email for Edge Function Testing */}
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={customTestEmail}
                    onChange={(e) => setCustomTestEmail(e.target.value)}
                    placeholder="Custom email for Edge Function testing (optional)"
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                  />
                  <button
                    onClick={() => setCustomTestEmail('')}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm"
                  >
                    Clear
                  </button>
                </div>
                
                <p className="text-xs text-blue-700">
                  <strong>Primary email:</strong> Used for Stripe checkout and order confirmation<br/>
                  <strong>Custom email:</strong> Used specifically for testing Edge Function email delivery
                </p>
              </div>
            </div>
          )}

          {/* Manual Test Mode */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-yellow-900">Manual Test Mode</h4>
              <button
                onClick={() => setTestMode(!testMode)}
                className={`px-3 py-1 rounded text-sm ${
                  testMode 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {testMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>
            
            {testMode && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={manualSessionId}
                    onChange={(e) => setManualSessionId(e.target.value)}
                    placeholder="Manual session ID (optional)"
                    className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                  />
                  <button
                    onClick={() => setManualSessionId('')}
                    className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm"
                  >
                    Clear
                  </button>
                </div>
                
                <button
                  onClick={insertManualTestData}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                >
                  Insert Manual Test Data
                </button>
                
                <p className="text-xs text-yellow-700">
                  <strong>⚠️ Test Mode:</strong> This will insert test data directly into the orders table.<br/>
                  Use this when Stripe CLI is not available to test the complete flow.
                </p>
              </div>
            )}
          </div>

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
          
          {/* Additional Test Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={insertManualTestData}
              className="p-3 border border-gray-300 rounded-lg hover:border-[#009fe3] hover:text-[#009fe3] transition-colors text-sm"
            >
              <Package className="w-4 h-4 mx-auto mb-1" />
              Manual Test Data
            </button>
            <button
              onClick={runFullTest}
              disabled={isProcessing}
              className="p-3 border border-[#009fe3] bg-[#009fe3] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mx-auto mb-1" />
              {isProcessing ? 'Running...' : 'Run Full Test'}
            </button>
          </div>

          {/* Manual Address Entry Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900">Manual Address Entry</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setManualAddress({
                    name: 'John Smith',
                    email: 'john.smith@example.com',
                    phone: '+44123456789',
                    line1: '456 Oak Avenue',
                    line2: 'Flat 2B',
                    city: 'Manchester',
                    state: 'Greater Manchester',
                    postal_code: 'M1 1AA',
                    country: 'GB'
                  })}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Load UK Address
                </button>
                <button
                  onClick={() => setManualAddress({
                    name: 'Test Customer',
                    email: 'test@example.com',
                    phone: '+44123456789',
                    line1: '123 Test Street',
                    line2: 'Test Apartment',
                    city: 'London',
                    state: 'England',
                    postal_code: 'SW1A 1AA',
                    country: 'GB'
                  })}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Load Test Address
                </button>
                <button
                  onClick={() => setManualAddress({
                    name: '',
                    email: '',
                    phone: '',
                    line1: '',
                    line2: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    country: ''
                  })}
                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
            
            {/* Test Summary */}
            <div className="mb-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm font-medium">Test Order Summary:</p>
              <p className="text-blue-700 text-sm">
                Customer: <strong>{manualAddress.name || 'Not set'}</strong> | 
                Email: <strong>{manualAddress.email || 'Not set'}</strong> | 
                Address: <strong>{manualAddress.line1 && manualAddress.city ? `${manualAddress.line1}, ${manualAddress.city}` : 'Incomplete'}</strong>
              </p>
              <p className="text-blue-700 text-sm">
                Products: <strong>{getSelectedProducts().length} selected</strong> | 
                Total: <strong>£{getSelectedProductsTotal().toFixed(2)}</strong>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualAddress.name}
                  onChange={(e) => handleAddressChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    !manualAddress.name ? 'border-red-300 bg-red-50' : 'border-blue-300'
                  }`}
                  placeholder="Customer Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={manualAddress.email}
                  onChange={(e) => handleAddressChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    !manualAddress.email ? 'border-red-300 bg-red-50' : 'border-blue-300'
                  }`}
                  placeholder="customer@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Phone</label>
                <input
                  type="tel"
                  value={manualAddress.phone}
                  onChange={(e) => handleAddressChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm"
                  placeholder="+44123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualAddress.line1}
                  onChange={(e) => handleAddressChange('line1', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    !manualAddress.line1 ? 'border-red-300 bg-red-50' : 'border-blue-300'
                  }`}
                  placeholder="Street Address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Address Line 2</label>
                <input
                  type="text"
                  value={manualAddress.line2}
                  onChange={(e) => handleAddressChange('line2', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm"
                  placeholder="Apartment, Suite, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    !manualAddress.city ? 'border-red-300 bg-red-50' : 'border-blue-300'
                  }`}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">State/County</label>
                <input
                  type="text"
                  value={manualAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm"
                  placeholder="State or County"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualAddress.postal_code}
                  onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    !manualAddress.postal_code ? 'border-red-300 bg-red-50' : 'border-blue-300'
                  }`}
                  placeholder="Postal Code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Country</label>
                <input
                  type="text"
                  value={manualAddress.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm"
                  placeholder="GB"
                />
              </div>
            </div>
          </div>

          {/* Product Selection Section */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Product Selection</h3>
            <div className="space-y-4">
              {selectedProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4 p-3 bg-white rounded-lg border">
                  <input
                    type="checkbox"
                    checked={product.selected}
                    onChange={(e) => handleProductChange(product.id, 'selected', e.target.checked)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">£{product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(product.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-green-800 font-medium">
                  Selected Products Total: £{getSelectedProductsTotal().toFixed(2)}
                </p>
                <p className="text-green-700 text-sm">
                  {getSelectedProducts().length} product(s) selected
                </p>
              </div>
            </div>
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
              <p>2. <strong>Customize Address & Products</strong> - Use the forms above to set test data</p>
              <p>3. <strong>Test Checkout</strong> - Creates Stripe session, test order with your data, and sends email</p>
              <p>4. <strong>Run Full Test</strong> - Tests the complete flow automatically</p>
              <p>5. <strong>Manual Test Data</strong> - Manually insert test data and test email</p>
              <p>6. <strong>Check Results</strong> - Review the detailed test results below</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPaymentFlow;