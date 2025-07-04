import React, { useState } from 'react';
import { CreditCard, ShoppingCart, CheckCircle, AlertTriangle, Package, Clock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { createCheckoutSession } from '../lib/stripe';
import { supabase } from '../lib/supabase';

const TestPaymentFlow = () => {
  const { addToCart, cartItems, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

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

  const addTestResult = (step: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
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
      
    } catch (error: any) {
      addTestResult('Step 1', 'error', 'Failed to add items to cart', error.message);
    }
  };

  const testStep2_AuthCheck = async () => {
    setCurrentStep(2);
    addTestResult('Step 2', 'info', 'Testing authentication status...');
    
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
    } catch (error: any) {
      addTestResult('Step 2', 'error', 'Auth check exception', error.message);
      return false;
    }
  };

  const testStep3_CreateCheckout = async () => {
    setCurrentStep(3);
    addTestResult('Step 3', 'info', 'Testing checkout session creation...');
    
    try {
      // Use a test product from our Stripe config
      const testPriceId = 'price_1RgXAlFJg5cU61Wl3C0w9uy3'; // Reform UK Hoodie
      
      const checkoutData = {
        price_id: testPriceId,
        success_url: `${window.location.origin}?success=true&test=true`,
        cancel_url: `${window.location.origin}?canceled=true&test=true`,
        mode: 'payment'
      };
      
      addTestResult('Step 3', 'info', 'Calling createCheckoutSession...', checkoutData);
      
      const response = await createCheckoutSession(checkoutData);
      
      addTestResult('Step 3', 'success', 'Checkout session created successfully!', {
        sessionId: response.sessionId,
        url: response.url
      });
      
      addTestResult('Step 3', 'info', 'In a real scenario, user would be redirected to Stripe checkout');
      
      return response;
      
    } catch (error: any) {
      addTestResult('Step 3', 'error', 'Failed to create checkout session', error.message);
      return null;
    }
  };

  const testStep4_WebhookSimulation = () => {
    setCurrentStep(4);
    addTestResult('Step 4', 'info', 'Simulating webhook processing...');
    
    // Simulate what happens when Stripe sends a webhook
    const mockWebhookData = {
      event_type: 'checkout.session.completed',
      session_id: 'cs_test_123456789',
      customer_id: 'cus_test_123456789',
      payment_status: 'paid',
      amount_total: 4999, // £49.99 in pence
      currency: 'gbp'
    };
    
    addTestResult('Step 4', 'success', 'Mock webhook data created', mockWebhookData);
    addTestResult('Step 4', 'info', 'In production, this would trigger order creation in database');
    addTestResult('Step 4', 'info', 'User would receive confirmation email');
  };

  const runFullTest = async () => {
    setIsProcessing(true);
    setTestResults([]);
    setCurrentStep(0);
    
    addTestResult('Test Start', 'info', 'Beginning full payment flow test...');
    
    // Step 1: Add to Cart
    testStep1_AddToCart();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Check Authentication
    const isAuthenticated = await testStep2_AuthCheck();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!isAuthenticated) {
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
            <CreditCard className="w-12 h-12 text-[#009fe3] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Flow Test</h1>
            <p className="text-gray-600">Test the complete payment integration from cart to completion</p>
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
                        {result.details && (
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
              <p>1. <strong>Sign in first</strong> - The payment flow requires authentication</p>
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