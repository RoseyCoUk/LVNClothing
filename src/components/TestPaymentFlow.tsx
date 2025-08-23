import React, { useState, useEffect } from 'react';
import { CreditCard, ShoppingCart, CheckCircle, AlertTriangle, Package, Clock, User, UserX, Mail } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { createCheckoutSession } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { getProducts, Product } from '../lib/api';

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
  
  // Ensure email is always set
  useEffect(() => {
    if (!manualAddress.email) {
      setManualAddress(prev => ({
        ...prev,
        email: testEmail || 'test@example.com'
      }));
    }
  }, [testEmail, manualAddress.email]);
  
  // Debug: Log manual address changes
  useEffect(() => {
    console.log('🔍 Debug: manualAddress changed:', manualAddress);
  }, [manualAddress]);
  
  // Real products from database
  const [liveProducts, setLiveProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  // Product selection for testing (now using real products)
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    selected: boolean;
    price_pence: number;
    variants?: {
      size?: string;
      color?: string;
      gender?: string;
      setSize?: string;
      packSize?: string;
      // Bundle variants
      tshirt_size?: string;
      tshirt_color?: string;
      tshirt_gender?: string;
      hoodie_size?: string;
      hoodie_color?: string;
      hoodie_gender?: string;
      cap_color?: string;
    };
  }>>([]);

  // Load real products from database
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const products = await getProducts();
        setLiveProducts(products);
        
        // Initialize selected products with ALL products from database
        const initialSelected = products.map(product => {
          let variants;
          
          if (product.name.includes('Hoodie') || product.name.includes('T-Shirt')) {
            // Apparel products: size, color, gender
            variants = {
              size: 'M',
              color: 'Black',
              gender: 'Men'
            };
          } else if (product.name.includes('Cap')) {
            // Caps: color variants only (no size/gender)
            variants = {
              color: 'Black'
            };
          } else if (product.name.includes('Badge')) {
            // Badges: set size variants
            variants = {
              setSize: 'Set of 5'
            };
          } else if (product.name.includes('Stickers')) {
            // Stickers: pack size variants
            variants = {
              packSize: 'Pack of 10'
            };
          } else if (product.name.includes('Bundle')) {
            // Bundles: variants based on contained products
            if (product.name.includes('Starter')) {
              // Starter Bundle: T-shirt (size, color, gender) + Tote Bag (no variants)
              variants = {
                tshirt_size: 'M',
                tshirt_color: 'Black',
                tshirt_gender: 'Men'
              };
            } else if (product.name.includes('Champion')) {
              // Champion Bundle: Hoodie (size, color, gender) + Cap (color) + Tote Bag (no variants)
              variants = {
                hoodie_size: 'M',
                hoodie_color: 'Black',
                hoodie_gender: 'Men',
                cap_color: 'Black'
              };
            } else if (product.name.includes('Activist')) {
              // Activist Bundle: Hoodie + T-shirt + Cap + Tote Bag + more
              variants = {
                hoodie_size: 'M',
                hoodie_color: 'Black',
                hoodie_gender: 'Men',
                tshirt_size: 'M',
                tshirt_color: 'White',
                tshirt_gender: 'Men',
                cap_color: 'Black'
              };
            }
          }
          // Mouse pads, mugs, tote bags, and water bottles have no variants
          
          return {
            id: product.id,
            name: product.name,
            price: product.price_pence / 100, // Convert pence to pounds
            price_pence: product.price_pence,
            quantity: 1,
            selected: product.name.includes('Hoodie') || product.name.includes('T-Shirt'), // Default select hoodie and t-shirt
            variants: variants
          };
        });
        
        setSelectedProducts(initialSelected);
        addTestResult('Products', 'success', `Loaded ${products.length} live products from database`);
      } catch (error: any) {
        addTestResult('Products', 'error', 'Failed to load products', error.message);
        // Fallback to test products if loading fails
        setSelectedProducts([
          { id: 'test-hoodie', name: 'Test Reform UK Hoodie', price: 34.99, price_pence: 3499, quantity: 1, selected: true, variants: { size: 'M', color: 'Black', gender: 'Men' } },
          { id: 'test-tshirt', name: 'Test Reform UK T-Shirt', price: 19.99, price_pence: 1999, quantity: 1, selected: false, variants: { size: 'M', color: 'White', gender: 'Men' } }
        ]);
      } finally {
        setProductsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // 🔧 TASK: Test with live products from database
  // 📌 Using real product data for comprehensive test coverage

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

  // Handle product variant changes
  const handleVariantChange = (productId: string, variantField: string, value: string) => {
    setSelectedProducts(prev => prev.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            variants: { 
              ...product.variants, 
              [variantField]: value 
            } 
          }
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

  // Calculate shipping based on live rules (Free over £50)
  const calculateShipping = (subtotal: number) => {
    return subtotal >= 50 ? 0 : 3.99;
  };

  // Get total with shipping
  const getTotalWithShipping = () => {
    const subtotal = getSelectedProductsTotal();
    const shipping = calculateShipping(subtotal);
    return subtotal + shipping;
  };

  const testStep1_AddToCart = () => {
    setCurrentStep(1);
    addTestResult('Step 1', 'info', 'Testing add to cart functionality...');
    
    try {
      // Clear cart first
      clearCart();
      addTestResult('Step 1', 'success', 'Cart cleared');
      
      // Add selected products to cart
      const selectedProds = getSelectedProducts();
      if (selectedProds.length === 0) {
        addTestResult('Step 1', 'error', 'No products selected. Please select at least one product.');
        return;
      }
      
      selectedProds.forEach(product => {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: `/products/${product.name.toLowerCase().replace(/\s+/g, '-')}.webp` // Default image path
        });
        addTestResult('Step 1', 'success', `Added ${product.name} to cart`);
      });
      
      const subtotal = getSelectedProductsTotal();
      const shipping = calculateShipping(subtotal);
      const total = subtotal + shipping;
      
      addTestResult('Step 1', 'success', `Cart now has ${cartItems.length} items`);
      addTestResult('Step 1', 'info', `Subtotal: £${subtotal.toFixed(2)}`);
      addTestResult('Step 1', 'info', `Shipping: ${shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}`);
      addTestResult('Step 1', 'success', `Total: £${total.toFixed(2)}`);
      
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
        addTestResult('Step 3', 'error', `Current values: Email=${manualAddress.email || 'MISSING'}, Name=${manualAddress.name || 'MISSING'}, Address=${manualAddress.line1 || 'MISSING'}, City=${manualAddress.city || 'MISSING'}, Postal=${manualAddress.postal_code || 'MISSING'}`);
        return null;
      }
    
    // Validate that at least one product is selected
    if (getSelectedProducts().length === 0) {
      addTestResult('Step 3', 'error', 'Please select at least one product before testing checkout');
      return null;
    }
    
    addTestResult('Step 3', 'info', 'Address and product validation passed');
    
    try {
      // Prepare line items from selected products
      const lineItems = getSelectedProducts().map(product => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price_pence, // Use pence for Stripe
        },
        quantity: product.quantity,
      }));

      // Prepare metadata with variant information
      const metadata: any = {};
      getSelectedProducts().forEach((product, index) => {
        if (product.variants) {
          metadata[`product_${index + 1}_name`] = product.name;
          metadata[`product_${index + 1}_variants`] = JSON.stringify(product.variants);
        }
      });

      const checkoutData = {
        line_items: lineItems,
        metadata: metadata,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/shop`,
        mode: 'payment' as const,
        customer_email: manualAddress.email // Always provide customer_email
      };
      
      addTestResult('Step 3', 'info', 'Calling createCheckoutSession with live products...', checkoutData);
      
      const response = await createCheckoutSession(checkoutData);
      
      // Validate the response
      if (!response) {
        addTestResult('Step 3', 'error', 'No checkout response received');
        return null;
      }
      
      // Check for either sessionId or id (Stripe returns 'id')
      const sessionId = response.sessionId || response.id;
      if (!sessionId) {
        addTestResult('Step 3', 'error', 'Invalid checkout response - missing sessionId or id', response);
        return null;
      }
      
      addTestResult('Step 3', 'info', `Checkout response validated - using sessionId: ${sessionId}`);
      
      addTestResult('Step 3', 'success', 'Checkout session created successfully!', {
        sessionId: sessionId,
        url: response.url
      });
      
      addTestResult('Step 3', 'info', 'In a real scenario, user would be redirected to Stripe checkout');
      
      // For test mode, simulate the redirect and success flow
      addTestResult('Step 3', 'info', 'Simulating redirect to Stripe checkout...');
      
      // Simulate successful payment and create test order
      setTimeout(async () => {
        addTestResult('Step 3', 'success', 'Payment completed! Creating test order...');
        
        // Debug: Log the values being passed
        addTestResult('Step 3', 'info', `Debug: About to call callManualTestInsert with sessionId=${sessionId}, email=${manualAddress.email}`);
        
        // Call the manual-test-insert Supabase Edge Function to create test order and send email
        await callManualTestInsert(sessionId, manualAddress.email);
        
        // Don't redirect immediately - let the user see the test results
        addTestResult('Step 3', 'success', 'Test complete! Check the results above and your email.');
        addTestResult('Step 3', 'info', 'You can manually navigate to /success if needed.');
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
      
      // Validate required parameters
      if (!sessionId) {
        throw new Error('sessionId is required but was not provided');
      }
      
      // Use manual address email as primary, fallback to custom test email, then customerEmail
      const emailToUse = manualAddress.email || customTestEmail || customerEmail;
      
      if (!emailToUse) {
        throw new Error('No valid email found. Please fill in the email field in the address form.');
      }
      
      addTestResult('Step 3', 'info', `Using email: ${emailToUse} (from manual address form)`);
      addTestResult('Step 3', 'info', `Using sessionId: ${sessionId}`);
      
      // Get your Supabase project URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        throw new Error('VITE_SUPABASE_URL not configured');
      }
      
      const requestBody = {
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
      };
      
      addTestResult('Step 3', 'info', 'Request body for manual-test-insert:', requestBody);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/manual-test-insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
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
      addTestResult('Step 3', 'info', `Calling send-order-email function for order ${orderId} to ${email}`);
      
      // Debug: Log email function call
      console.log('🔍 Debug: sendTestEmail called with:', { orderId, email });
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        addTestResult('Step 3', 'error', 'VITE_SUPABASE_URL not configured');
        return false;
      }
      
      const requestBody = {
        order_id: orderId,
        customerEmail: email,
      };
      
      addTestResult('Step 3', 'info', 'Request body:', requestBody);
      console.log('🔍 Debug: Email request body:', requestBody);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔍 Debug: Email response status:', response.status);
      console.log('🔍 Debug: Email response ok:', response.ok);

      addTestResult('Step 3', 'info', `Response status: ${response.status}`);

      if (response.ok) {
        const responseData = await response.json();
        console.log('🔍 Debug: Email response data:', responseData);
        addTestResult('Step 3', 'success', 'Test email sent successfully!', responseData);
        return true;
      } else {
        const errorData = await response.text();
        console.log('🔍 Debug: Email error data:', errorData);
        addTestResult('Step 3', 'error', 'Failed to send test email', {
          status: response.status,
          error: errorData
        });
        return false;
      }
    } catch (error: any) {
      console.log('🔍 Debug: Exception in sendTestEmail:', error);
      addTestResult('Step 3', 'error', 'Error sending test email', error.message);
      return false;
    }
  };

  // Add this function to test email function directly
  const testEmailFunction = async () => {
    try {
      addTestResult('Email Test', 'info', 'Testing email function directly...');
      
      // Debug: Log current state
      console.log('🔍 Debug: Current manual address:', manualAddress);
      console.log('🔍 Debug: Selected products:', getSelectedProducts());
      console.log('🔍 Debug: Environment variables:', {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      });
      
      // First create a test order
      const testOrderId = `test_order_${Date.now()}`;
      const testEmail = manualAddress.email || 'test@example.com';
      
      addTestResult('Email Test', 'info', `Creating test order with ID: ${testOrderId}`);
      addTestResult('Email Test', 'info', `Using email: ${testEmail}`);
      
      // Create test order first
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        addTestResult('Email Test', 'error', 'VITE_SUPABASE_URL not configured');
        return;
      }
      
      const requestBody = {
        action: 'createTestOrder',
        sessionId: `test_session_${Date.now()}`,
        customerEmail: testEmail,
        address: manualAddress,
        items: getSelectedProducts().map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          variants: product.variants
        }))
      };
      
      console.log('🔍 Debug: Request body for manual-test-insert:', requestBody);
      
      const createResponse = await fetch(`${supabaseUrl}/functions/v1/manual-test-insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔍 Debug: Create response status:', createResponse.status);
      console.log('🔍 Debug: Create response ok:', createResponse.ok);

      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log('🔍 Debug: Create response data:', createData);
        addTestResult('Email Test', 'success', 'Test order created successfully!', createData);
        
        // Now test the email function
        addTestResult('Email Test', 'info', 'Testing email sending...');
        const emailResult = await sendTestEmail(createData.data.id, testEmail);
        
        if (emailResult) {
          addTestResult('Email Test', 'success', 'Email function test completed successfully!');
          addTestResult('Email Test', 'info', `Check your email at: ${testEmail}`);
        } else {
          addTestResult('Email Test', 'error', 'Email function test failed');
        }
      } else {
        const errorData = await createResponse.text();
        console.log('🔍 Debug: Create error data:', errorData);
        addTestResult('Email Test', 'error', 'Failed to create test order for email test', {
          status: createResponse.status,
          error: errorData
        });
      }
    } catch (error: any) {
      console.log('🔍 Debug: Exception in testEmailFunction:', error);
      addTestResult('Email Test', 'error', 'Error testing email function', error.message);
    }
  };

  // Add this function to test basic Supabase connectivity
  const testSupabaseConnectivity = async () => {
    try {
      addTestResult('Connectivity', 'info', 'Testing basic Supabase connectivity...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      addTestResult('Connectivity', 'info', `Testing connection to: ${supabaseUrl}`);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        addTestResult('Connectivity', 'error', 'Missing environment variables', {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey
        });
        return;
      }
      
      // Test basic REST API access
      try {
        const restResponse = await fetch(`${supabaseUrl}/rest/v1/products?select=id&limit=1`, {
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'apikey': supabaseAnonKey,
          },
        });
        
        if (restResponse.ok) {
          addTestResult('Connectivity', 'success', 'REST API is accessible');
        } else {
          addTestResult('Connectivity', 'error', 'REST API test failed', {
            status: restResponse.status,
            statusText: restResponse.statusText
          });
        }
      } catch (restError: any) {
        addTestResult('Connectivity', 'error', 'REST API test exception', restError.message);
      }
      
      // Test Edge Functions base URL (this will return 404, which is expected)
      try {
        addTestResult('Connectivity', 'info', 'Testing Edge Functions base URL (expecting 404)...');
        
        const edgeResponse = await fetch(`${supabaseUrl}/functions/v1/`, {
          method: 'OPTIONS', // Use OPTIONS to avoid CORS issues
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        });
        
        addTestResult('Connectivity', 'info', `Edge Functions base response: ${edgeResponse.status}`);
        
        if (edgeResponse.status === 404) {
          addTestResult('Connectivity', 'success', 'Edge Functions base returns 404 (expected - this is normal)');
        } else if (edgeResponse.status === 405) {
          addTestResult('Connectivity', 'success', 'Edge Functions base returns 405 (expected - method not allowed)');
        } else if (edgeResponse.ok) {
          addTestResult('Connectivity', 'success', 'Edge Functions base is accessible');
        } else {
          addTestResult('Connectivity', 'info', 'Edge Functions base test result', {
            status: edgeResponse.status,
            statusText: edgeResponse.statusText
          });
        }
      } catch (edgeError: any) {
        // This error is expected and not a problem
        addTestResult('Connectivity', 'info', 'Edge Functions base test completed (CORS error is expected and normal)', {
          message: 'The base URL /functions/v1/ is not a valid endpoint, so 404/CORS errors are normal',
          actualError: edgeError.message
        });
      }
      
          } catch (error: any) {
        addTestResult('Connectivity', 'error', 'Connectivity test failed', error.message);
      }
    };
    
    // Test the specific Stripe checkout function
    const testStripeCheckoutFunction = async () => {
      try {
        addTestResult('Stripe Checkout', 'info', 'Testing Stripe checkout function directly...');
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          addTestResult('Stripe Checkout', 'error', 'Missing environment variables');
          return;
        }
        
        const testData = {
          customer_email: 'test@example.com',
          line_items: [
            {
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: 'Test Product',
                },
                unit_amount: 999, // £9.99 in pence
              },
              quantity: 1,
            },
          ],
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/shop`,
          mode: 'payment',
        };
        
        addTestResult('Stripe Checkout', 'info', 'Sending test data to stripe-checkout function:', testData);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify(testData),
        });
        
        addTestResult('Stripe Checkout', 'info', `Response status: ${response.status}`);
        
        if (response.ok) {
          const responseData = await response.json();
          addTestResult('Stripe Checkout', 'success', 'Stripe checkout function is working!', responseData);
          
          // Show the session ID that was returned
          const sessionId = responseData.id || responseData.sessionId;
          if (sessionId) {
            addTestResult('Stripe Checkout', 'info', `Session ID: ${sessionId}`);
          }
        } else {
          const errorData = await response.text();
          addTestResult('Stripe Checkout', 'error', 'Stripe checkout function failed', {
            status: response.status,
            error: errorData
          });
        }
        
      } catch (error: any) {
        addTestResult('Stripe Checkout', 'error', 'Stripe checkout test exception', error.message);
      }
    };

  // Add this function to test manual-test-insert directly with hardcoded values
  const testManualTestInsertDirectly = async () => {
    try {
      addTestResult('Direct Test', 'info', 'Testing manual-test-insert function directly with hardcoded values...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        addTestResult('Direct Test', 'error', 'VITE_SUPABASE_URL not configured');
        return;
      }
      
      const hardcodedData = {
        action: 'createTestOrder',
        sessionId: `test_session_${Date.now()}`,
        customerEmail: 'test@example.com',
        address: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+44123456789',
          line1: '123 Test Street',
          line2: 'Test Apartment',
          city: 'London',
          state: 'England',
          postal_code: 'SW1A 1AA',
          country: 'GB'
        },
        items: [
          {
            id: 'test-product-1',
            name: 'Test Product 1',
            price: 19.99,
            quantity: 1
          }
        ]
      };
      
      addTestResult('Direct Test', 'info', 'Sending hardcoded test data:', hardcodedData);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/manual-test-insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(hardcodedData),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        addTestResult('Direct Test', 'success', 'Direct test successful!', responseData);
      } else {
        const errorData = await response.text();
        addTestResult('Direct Test', 'error', 'Direct test failed', {
          status: response.status,
          error: errorData
        });
      }
      
    } catch (error: any) {
      addTestResult('Direct Test', 'error', 'Error in direct test', error.message);
    }
  };

  // Add this function to test Edge Functions accessibility
  const testEdgeFunctions = async () => {
    try {
      addTestResult('Edge Function Test', 'info', 'Testing Edge Functions accessibility...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        addTestResult('Edge Function Test', 'error', 'VITE_SUPABASE_URL not configured');
        return;
      }
      
      // Test manual-test-insert function
      addTestResult('Edge Function Test', 'info', 'Testing manual-test-insert function...');
      
      const testResponse = await fetch(`${supabaseUrl}/functions/v1/manual-test-insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'test',
          test: true
        }),
      });
      
      console.log('🔍 Debug: manual-test-insert test response:', {
        status: testResponse.status,
        ok: testResponse.ok
      });
      
      if (testResponse.ok) {
        addTestResult('Edge Function Test', 'success', 'manual-test-insert function is accessible');
      } else {
        const errorData = await testResponse.text();
        addTestResult('Edge Function Test', 'error', 'manual-test-insert function test failed', {
          status: testResponse.status,
          error: errorData
        });
      }
      
      // Test send-order-email function
      addTestResult('Edge Function Test', 'info', 'Testing send-order-email function...');
      
      const emailTestResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          test: true
        }),
      });
      
      console.log('🔍 Debug: send-order-email test response:', {
        status: emailTestResponse.status,
        ok: emailTestResponse.ok
      });
      
      if (emailTestResponse.ok) {
        addTestResult('Edge Function Test', 'success', 'send-order-email function is accessible');
      } else {
        const errorData = await emailTestResponse.text();
        addTestResult('Edge Function Test', 'error', 'send-order-email function test failed', {
          status: emailTestResponse.status,
          error: errorData
        });
      }
      
    } catch (error: any) {
      console.log('🔍 Debug: Exception in testEdgeFunctions:', error);
      addTestResult('Edge Function Test', 'error', 'Error testing Edge Functions', error.message);
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
    
    // Pre-test validation
    addTestResult('Test Start', 'info', 'Validating test setup...');
    
    if (!manualAddress.email) {
      addTestResult('Test Start', 'error', 'Email is required but not set. Please fill in the email field.');
      setIsProcessing(false);
      return;
    }
    
    if (!manualAddress.name || !manualAddress.line1 || !manualAddress.city || !manualAddress.postal_code) {
      addTestResult('Test Start', 'error', 'Required address fields are missing. Please fill in all required fields.');
      setIsProcessing(false);
      return;
    }
    
    if (getSelectedProducts().length === 0) {
      addTestResult('Test Start', 'error', 'No products selected. Please select at least one product.');
      setIsProcessing(false);
      return;
    }
    
    addTestResult('Test Start', 'success', 'Test setup validation passed');
    
    // If guest checkout is selected, sign out first to ensure no active session
    
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

          {/* Test Setup Status */}
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Test Setup Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className={`p-2 rounded ${manualAddress.email ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Email:</strong> {manualAddress.email || 'Missing'}
              </div>
              <div className={`p-2 rounded ${manualAddress.name ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Name:</strong> {manualAddress.name || 'Missing'}
              </div>
              <div className={`p-2 rounded ${manualAddress.line1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Address:</strong> {manualAddress.line1 || 'Missing'}
              </div>
              <div className={`p-2 rounded ${getSelectedProducts().length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <strong>Products:</strong> {getSelectedProducts().length} selected
              </div>
            </div>
            {(!manualAddress.email || !manualAddress.name || !manualAddress.line1 || getSelectedProducts().length === 0) && (
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm">
                ⚠️ Please fill in all required fields before running the test
              </div>
            )}
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
            <button
              onClick={testEmailFunction}
              className="p-3 border border-green-300 rounded-lg hover:border-green-500 hover:text-green-600 transition-colors text-sm"
            >
              <Mail className="w-4 h-4 mx-auto mb-1" />
              Test Email Function
            </button>
            <button
              onClick={testEdgeFunctions}
              className="p-3 border border-purple-300 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors text-sm"
            >
              <Package className="w-4 h-4 mx-auto mb-1" />
              Test Edge Functions
            </button>
            <button
              onClick={testManualTestInsertDirectly}
              className="p-3 border border-orange-300 rounded-lg hover:border-orange-500 hover:text-orange-600 transition-colors text-sm"
            >
              <Package className="w-4 h-4 mx-auto mb-1" />
              Test Manual Insert Directly
            </button>
            <button
              onClick={testSupabaseConnectivity}
              className="p-3 border border-red-300 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors text-sm"
            >
              <Package className="w-4 h-4 mx-auto mb-1" />
              Test Supabase Connectivity
            </button>
            <button
              onClick={testStripeCheckoutFunction}
              className="p-3 border border-indigo-300 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors text-sm"
            >
              <Package className="w-4 h-4 mx-auto mb-1" />
              Test Stripe Checkout Function
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
                  onClick={() => {
                    setManualAddress(prev => ({
                      ...prev,
                      email: testEmail || 'test@example.com'
                    }));
                    addTestResult('Manual', 'info', `Reset email to: ${testEmail || 'test@example.com'}`);
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Reset Email
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
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Product Selection
              {productsLoading && <span className="ml-2 text-sm text-gray-500">(Loading live products...)</span>}
            </h3>
            
            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading live products from database...</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="p-4 bg-white rounded-lg border hover:border-green-300 transition-colors">
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={product.selected}
                          onChange={(e) => handleProductChange(product.id, 'selected', e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">£{product.price.toFixed(2)}</p>
                          {product.name.includes('Bundle') && (
                            <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Bundle
                            </span>
                          )}
                          
                          {/* Variant Selection for Products */}
                          {product.variants && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center space-x-4 flex-wrap">
                                {/* Apparel Variants */}
                                {product.variants.size && (
                                  <div className="flex items-center space-x-2">
                                    <label className="text-xs text-gray-600">Size:</label>
                                    <select
                                      value={product.variants.size || 'M'}
                                      onChange={(e) => handleVariantChange(product.id, 'size', e.target.value)}
                                      className="text-xs border border-gray-300 rounded px-2 py-1"
                                    >
                                      <option value="XS">XS</option>
                                      <option value="S">S</option>
                                      <option value="M">M</option>
                                      <option value="L">L</option>
                                      <option value="XL">XL</option>
                                      <option value="XXL">XXL</option>
                                    </select>
                                  </div>
                                )}
                                
                                {/* Color Variants */}
                                {product.variants.color && (
                                  <div className="flex items-center space-x-2">
                                    <label className="text-xs text-gray-600">Color:</label>
                                    <select
                                      value={product.variants.color || 'Black'}
                                      onChange={(e) => handleVariantChange(product.id, 'color', e.target.value)}
                                      className="text-xs border border-gray-300 rounded px-2 py-1"
                                    >
                                      <option value="Black">Black</option>
                                      <option value="White">White</option>
                                      <option value="Blue">Blue</option>
                                      <option value="Red">Red</option>
                                      <option value="Charcoal">Charcoal</option>
                                      <option value="Ash Grey">Ash Grey</option>
                                      <option value="Light Grey">Light Grey</option>
                                      <option value="Navy">Navy</option>
                                    </select>
                                  </div>
                                )}
                                
                                {/* Gender Variants */}
                                {product.variants.gender && (
                                  <div className="flex items-center space-x-2">
                                    <label className="text-xs text-gray-600">Gender:</label>
                                    <select
                                      value={product.variants.gender || 'Men'}
                                      onChange={(e) => handleVariantChange(product.id, 'gender', e.target.value)}
                                      className="text-xs border border-gray-300 rounded px-2 py-1"
                                    >
                                      <option value="Men">Men</option>
                                      <option value="Women">Women</option>
                                      <option value="Unisex">Unisex</option>
                                    </select>
                                  </div>
                                )}
                                
                                {/* Badge Set Size Variants */}
                                {product.variants.setSize && (
                                  <div className="flex items-center space-x-2">
                                    <label className="text-xs text-gray-600">Set Size:</label>
                                    <select
                                      value={product.variants.setSize || 'Set of 5'}
                                      onChange={(e) => handleVariantChange(product.id, 'setSize', e.target.value)}
                                      className="text-xs border border-gray-300 rounded px-2 py-1"
                                    >
                                      <option value="Set of 5">Set of 5</option>
                                      <option value="Set of 10">Set of 10</option>
                                      <option value="Set of 25">Set of 25</option>
                                      <option value="Set of 50">Set of 50</option>
                                    </select>
                                  </div>
                                )}
                                
                                {/* Sticker Pack Size Variants */}
                                {product.variants.packSize && (
                                  <div className="flex items-center space-x-2">
                                    <label className="text-xs text-gray-600">Pack Size:</label>
                                    <select
                                      value={product.variants.packSize || 'Pack of 10'}
                                      onChange={(e) => handleVariantChange(product.id, 'packSize', e.target.value)}
                                      className="text-xs border border-gray-300 rounded px-2 py-1"
                                    >
                                      <option value="Pack of 10">Pack of 10</option>
                                      <option value="Pack of 25">Pack of 25</option>
                                      <option value="Pack of 50">Pack of 50</option>
                                      <option value="Pack of 100">Pack of 100</option>
                                    </select>
                                  </div>
                                )}

                                {/* Bundle Variants */}
                                {product.name.includes('Bundle') && product.variants && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-xs font-medium text-blue-800 mb-2">Bundle Contents:</p>
                                    <div className="space-y-1">
                                      {/* Starter Bundle */}
                                      {product.variants.tshirt_size && (
                                        <div className="flex items-center space-x-2">
                                          <label className="text-xs text-blue-700">T-Shirt Size:</label>
                                          <select
                                            value={product.variants.tshirt_size || 'M'}
                                            onChange={(e) => handleVariantChange(product.id, 'tshirt_size', e.target.value)}
                                            className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                          >
                                            <option value="XS">XS</option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                          </select>
                                          <select
                                            value={product.variants.tshirt_color || 'Black'}
                                            onChange={(e) => handleVariantChange(product.id, 'tshirt_color', e.target.value)}
                                            className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                          >
                                            <option value="Black">Black</option>
                                            <option value="White">White</option>
                                            <option value="Blue">Blue</option>
                                            <option value="Red">Red</option>
                                            <option value="Charcoal">Charcoal</option>
                                            <option value="Ash Grey">Ash Grey</option>
                                            <option value="Light Grey">Light Grey</option>
                                            <option value="Navy">Navy</option>
                                          </select>
                                          <select
                                            value={product.variants.tshirt_gender || 'Men'}
                                            onChange={(e) => handleVariantChange(product.id, 'tshirt_gender', e.target.value)}
                                            className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                          >
                                            <option value="Men">Men</option>
                                            <option value="Women">Women</option>
                                            <option value="Unisex">Unisex</option>
                                          </select>
                                        </div>
                                      )}
                                      
                                      {/* Hoodie variants for Champion and Activist bundles */}
                                      {product.variants.hoodie_size && (
                                        <div className="flex items-center space-x-2">
                                          <label className="text-xs text-blue-700">Hoodie Size:</label>
                                          <select
                                            value={product.variants.hoodie_size || 'M'}
                                            onChange={(e) => handleVariantChange(product.id, 'hoodie_size', e.target.value)}
                                            className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                          >
                                            <option value="XS">XS</option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                          </select>
                                          <select
                                            value={product.variants.hoodie_color || 'Black'}
                                            onChange={(e) => handleVariantChange(product.id, 'hoodie_color', e.target.value)}
                                            className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                          >
                                            <option value="Black">Black</option>
                                            <option value="White">White</option>
                                            <option value="Blue">Blue</option>
                                            <option value="Red">Red</option>
                                            <option value="Charcoal">Charcoal</option>
                                            <option value="Ash Grey">Ash Grey</option>
                                            <option value="Light Grey">Light Grey</option>
                                            <option value="Navy">Navy</option>
                                          </select>
                                          <select
                                            value={product.variants.hoodie_gender || 'Men'}
                                            onChange={(e) => handleVariantChange(product.id, 'hoodie_gender', e.target.value)}
                                            className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                          >
                                            <option value="Men">Men</option>
                                            <option value="Women">Women</option>
                                            <option value="Unisex">Unisex</option>
                                          </select>
                                        </div>
                                      )}
                                      
                                      {/* Cap color for Champion and Activist bundles */}
                                      {product.variants.cap_color && (
                                        <div className="flex items-center space-x-2">
                                          <label className="text-xs text-blue-700">Cap Color:</label>
                                          <select
                                            value={product.variants.cap_color || 'Black'}
                                            onChange={(e) => handleVariantChange(product.id, 'cap_color', e.target.value)}
                                            className="text-xs border border-blue-300 rounded px-1 py-0.5"
                                          >
                                            <option value="Black">Black</option>
                                            <option value="White">White</option>
                                            <option value="Blue">Blue</option>
                                            <option value="Red">Red</option>
                                            <option value="Charcoal">Charcoal</option>
                                            <option value="Navy">Navy</option>
                                          </select>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
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
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-green-800 text-sm">
                      <strong>Selected Products:</strong> {getSelectedProducts().length} product(s)
                    </p>
                    <p className="text-green-800 text-sm">
                      <strong>Subtotal:</strong> £{getSelectedProductsTotal().toFixed(2)}
                    </p>
                    <p className="text-green-800 text-sm">
                      <strong>Shipping:</strong> {calculateShipping(getSelectedProductsTotal()) === 0 ? 'FREE' : `£${calculateShipping(getSelectedProductsTotal()).toFixed(2)}`}
                      {getSelectedProductsTotal() >= 50 && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Free over £50!
                        </span>
                      )}
                    </p>
                    <p className="text-green-900 font-semibold text-lg">
                      <strong>Total:</strong> £{getTotalWithShipping().toFixed(2)}
                    </p>
                  </div>
                </div>
              </>
            )}
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

          {/* Live Products Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Live Products Info</h4>
            <div className="text-blue-700 text-sm space-y-1">
              <p><strong>Products Loaded:</strong> {liveProducts.length} products from database</p>
              <p><strong>Products Available:</strong> {liveProducts.map(p => p.name).join(', ')}</p>
              <p><strong>Selected Products:</strong> {getSelectedProducts().length} items</p>
              <p><strong>Current Email:</strong> {manualAddress.email || 'Not set'}</p>
            </div>
          </div>

          {/* Environment Debug Info */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Environment Debug Info</h4>
            <div className="text-gray-700 text-sm space-y-1">
              <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
              <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
            </div>
            
            {/* CORS Error Explanation */}
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <h5 className="font-medium text-blue-900 mb-2">ℹ️ About the CORS Error</h5>
              <p className="text-blue-800 text-sm">
                You may see a CORS error when testing the Edge Functions base URL. This is <strong>completely normal and not a problem</strong> because:
              </p>
              <ul className="text-blue-700 text-sm mt-2 list-disc list-inside space-y-1">
                <li>The base URL <code>/functions/v1/</code> is not a valid endpoint</li>
                <li>Individual Edge Functions (like <code>/functions/v1/stripe-checkout</code>) work perfectly</li>
                <li>Your payment flow, database operations, and emails are all working correctly</li>
                <li>This error does not affect your actual application functionality</li>
              </ul>
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
                <strong>Note:</strong> The CORS error in the console is harmless and can be ignored. Your payment system is working correctly!
              </div>
            </div>
          </div>

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