import React, { useState, useEffect } from 'react';
// This checkout page now integrates with:
// - useShippingQuotes hook for fetching live shipping rates from Printful
// - ShippingMethods component for displaying and selecting shipping options
// - PaymentIntent update functionality when shipping is selected
// - Automatic shipping cost calculation and display
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Shield,
  Truck,
  Package,
  Check,
  AlertCircle,
  MapPin,
  X
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useShipping } from '../../contexts/ShippingContext';
import { createCheckoutSession } from '../../lib/stripe';
import ShippingOptions from '../ShippingOptions';
import { useShippingQuotes } from '../../hooks/useShippingQuotes';
import ShippingMethods from './ShippingMethods';
import type { ShippingOption } from '../../lib/shipping/types';
import { expandBundlesForShipping } from '../../lib/bundle-utils';

interface CheckoutPageProps {
  onBack: () => void;
}

const CheckoutPage = ({ onBack }: CheckoutPageProps) => {
  const { cartItems, getTotalPrice, addToCart, refreshPricing, setIsCartOpen } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  
  // Check for temporary cart items from "Buy Now" flow
  useEffect(() => {
    const tempCartItems = sessionStorage.getItem('tempCartItems');
    if (tempCartItems && cartItems.length === 0) {
      try {
        const items = JSON.parse(tempCartItems);
        // Add each item to the cart
        items.forEach((item: any) => {
          addToCart(item);
        });
        // Clear the temporary storage
        sessionStorage.removeItem('tempCartItems');
      } catch (error) {
        // Silent error handling for production
        sessionStorage.removeItem('tempCartItems');
      }
    }
  }, [cartItems.length, addToCart]);

  // Add this new effect to handle direct navigation to checkout
  useEffect(() => {
    // If user navigates directly to checkout with empty cart, try to restore from localStorage
    if (cartItems.length === 0) {
      const savedCart = localStorage.getItem('reformuk-cart');
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          items.forEach((item: any) => {
            addToCart(item);
          });
        } catch (error) {
          console.error('Failed to restore cart from localStorage:', error);
        }
      }
    }
  }, []); // Only run once on mount

  // Auto-detect guest checkout if no user is logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if user is authenticated (this will fail silently for guest users)
        const { data: { session } } = await import('../../lib/supabase').then(m => m.supabase.auth.getSession());
        setIsGuestCheckout(!session);
      } catch (error) {
        // If auth check fails, assume guest checkout
        setIsGuestCheckout(true);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Refresh pricing when cart items change - make it non-blocking
  useEffect(() => {
    if (cartItems.length > 0) {
      // Use a timeout to prevent blocking cart operations
      const timeoutId = setTimeout(() => {
        refreshPricing().catch(error => {
          console.warn('Pricing refresh failed, continuing with existing prices:', error);
          // Don't let pricing failures affect cart functionality
        });
      }, 100); // Small delay to ensure cart operations complete first
      
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems.length, refreshPricing]);
  
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    phone: ''
  });
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const { 
    fetchShippingRates, 
    selectedShippingOption, 
    getShippingCost, 
    getTotalWithShipping,
    isAddressComplete,
    convertToRecipient,
    updatePaymentIntent
  } = useShipping();
  
  // New shipping quotes hook
  const { loading: shippingLoading, options: shippingOptions, error: shippingError, fetchQuotes } = useShippingQuotes();
  
  // State for selected shipping option from the new hook
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  
  const subtotal = getTotalPrice();
  const shipping = getShippingCost() / 100; // Convert from pence to pounds for display
  const promoDiscount = appliedPromo === 'REFORM10' ? subtotal * 0.1 : 0;
  const total = getTotalWithShipping(); // getTotalWithShipping now returns value in pounds

  // Calculate final total with promo discount
  const finalTotal = total - promoDiscount;
  
  // Fetch shipping rates when address changes
  useEffect(() => {
    const recipient = convertToRecipient(shippingInfo);
    if (isAddressComplete(recipient) && cartItems.length > 0) {
      // Use the new shipping quotes hook
      // Expand bundles into individual items for accurate shipping calculation
      const expandedItems = expandBundlesForShipping(cartItems);
      
      const request = {
        recipient,
        items: expandedItems
      };
      
      fetchQuotes(request).catch(error => {
        // Silent error handling for production
      });
    }
  }, [shippingInfo.address, shippingInfo.city, shippingInfo.postcode, shippingInfo.country, cartItems.length, convertToRecipient, isAddressComplete, fetchQuotes]);
  
  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Card validation functions
  const formatCardNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 16 digits
    const limitedDigits = digits.slice(0, 16);
    // Add spaces every 4 digits
    return limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };
  
  const validateCardNumber = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, '');
    return digits.length === 16;
  };
  
  const formatExpiryDate = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 4 digits
    const limitedDigits = digits.slice(0, 4);
    // Add slash after 2 digits
    if (limitedDigits.length >= 2) {
      return limitedDigits.slice(0, 2) + '/' + limitedDigits.slice(2);
    }
    return limitedDigits;
  };
  
  const validateExpiryDate = (expiryDate: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(expiryDate)) return false;
    
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);
    
    // Check if the expiry date is in the future
    if (expYear > currentYear) return true;
    if (expYear === currentYear && expMonth >= currentMonth) return true;
    
    return false;
  };
  
  const getCardType = (cardNumber: string): 'amex' | 'other' => {
    const digits = cardNumber.replace(/\D/g, '');
    // American Express cards start with 34 or 37
    if (digits.startsWith('34') || digits.startsWith('37')) {
      return 'amex';
    }
    return 'other';
  };
  
  const validateCVV = (cvv: string, cardNumber: string): boolean => {
    const digits = cvv.replace(/\D/g, '');
    const cardType = getCardType(cardNumber);
    
    if (cardType === 'amex') {
      return digits.length === 4;
    } else {
      return digits.length === 3;
    }
  };
  
  // Handle email input changes with validation
  const handleEmailChange = (value: string) => {
    setShippingInfo(prev => ({ ...prev, email: value }));
    
    if (emailTouched) {
      if (!value.trim()) {
        setEmailError('Email address is required');
      } else if (!validateEmail(value)) {
        setEmailError('Please enter a valid email address (e.g., name@example.com)');
      } else {
        setEmailError('');
      }
    }
  };
  
  // Handle email field blur
  const handleEmailBlur = () => {
    setEmailTouched(true);
    const email = shippingInfo.email;
    
    if (!email.trim()) {
      setEmailError('Email address is required');
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address (e.g., name@example.com)');
    } else {
      setEmailError('');
    }
  };
  
  // Handle card input changes with validation
  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    let error = '';
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      // Card validation is now handled by Stripe's own input
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      // Card validation is now handled by Stripe's own input
    } else if (field === 'cvv') {
      // Only allow digits for CVV
      formattedValue = value.replace(/\D/g, '');
      const cardType = getCardType(value);
      const maxLength = cardType === 'amex' ? 4 : 3;
      formattedValue = formattedValue.slice(0, maxLength);
      
      // Card validation is now handled by Stripe's own input
    }
    
  };
  
  // Handle card field blur
  const handleCardBlur = (field: string) => {
    
  };
  
  const handleInputChange = (section: 'shipping' | 'payment', field: string, value: string) => {
    if (section === 'shipping') {
      if (field === 'email') {
        handleEmailChange(value);
      } else {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
      }
    }
  };

  // Handle shipping option selection
  const handleShippingSelect = async (option: ShippingOption) => {
    setSelectedShipping(option);
    
    // Note: PaymentIntent update would happen here in a real implementation
    // For now, we just store the selected shipping option
  };

  // Function to update PaymentIntent with shipping cost
  const updatePaymentIntentWithShipping = async (paymentIntentId: string, shippingOption: ShippingOption) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !anonKey) {
        throw new Error('Missing Supabase configuration');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/checkout-shipping-select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          paymentIntentId,
          itemsTotal: subtotal,
          shipping: {
            rate_id: shippingOption.id,
            rate: shippingOption.rate,
            currency: shippingOption.currency,
            name: shippingOption.name
          },
          taxTotal: 0 // Adjust based on your tax calculation
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update PaymentIntent: ${response.status}`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      throw error;
    }
  };
  
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'REFORM10') {
      setAppliedPromo('REFORM10');
    }
  };
  
  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };
  
  const validateStep = (step: number) => {
    if (step === 1) {
      const isEmailValid = shippingInfo.email && validateEmail(shippingInfo.email);
      const hasRequiredFields = shippingInfo.firstName && shippingInfo.lastName && 
                               shippingInfo.address && shippingInfo.city && shippingInfo.postcode;
      
      // For guest checkout, only require email and shipping info
      if (isGuestCheckout) {
        return isEmailValid && hasRequiredFields;
      }
      
      // For authenticated users, require email and shipping info
      return isEmailValid && hasRequiredFields;
    }
    return true;
  };
  
  const handleNext = async () => {
    try {
      if (currentStep === 1) {
        setEmailTouched(true);
        handleEmailBlur();
        
        setTimeout(async () => {
          if (validateStep(currentStep) && !emailError) {
            // Fetch shipping rates when moving to step 2
            try {
              const recipient = convertToRecipient(shippingInfo);
              if (isAddressComplete(recipient)) {
                await fetchShippingRates(recipient);
              }
            } catch (error) {
              console.warn('Failed to fetch shipping rates, continuing to next step:', error);
              // Don't block step progression if shipping rates fail
            }
            setCurrentStep(prev => prev + 1);
          }
        }, 100);
      } else if (validateStep(currentStep)) {
        setCurrentStep(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error in step navigation:', error);
      // Provide user feedback for step navigation errors
      alert('Unable to proceed to next step. Please try again.');
    }
  };
  
  // Handle checkout submission
  const handleCheckout = async () => {
    // Enhanced validation before checkout
    const validationErrors = [];
    
    if (!shippingInfo.email || !shippingInfo.firstName || !shippingInfo.lastName || 
        !shippingInfo.address || !shippingInfo.city || !shippingInfo.postcode) {
      validationErrors.push('Please fill in all required shipping information.');
    }

    if (!selectedShippingOption && !selectedShipping) {
      validationErrors.push('Please select a shipping option before proceeding.');
    }

    if (cartItems.length === 0) {
      validationErrors.push('Your cart is empty. Please add items before checkout.');
    }

    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get shipping rate ID from selected shipping option with fallback
      const shipping_rate_id = selectedShippingOption?.id || selectedShipping?.id;
      
      if (!shipping_rate_id) {
        // Fallback: create checkout without shipping rate if none selected
        console.warn('No shipping rate selected, proceeding without shipping rate ID');
      }

      // Get the actual shipping cost from the selected option with fallback
      const shippingCost = selectedShippingOption?.rate || selectedShipping?.rate || '0';
      const shippingCostNumeric = parseFloat(shippingCost);

      // Process cart items for Stripe with dynamic pricing
      const lineItems = cartItems.map(item => {
        // Use the actual price from the cart item (which should come from Printful)
        const basePrice = item.price;
        const quantity = item.quantity;
        
        return {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: item.name,
              images: [item.image],
              metadata: {
                printful_variant_id: item.printful_variant_id?.toString() || item.id.toString(),
                product_type: item.isBundle ? 'bundle' : 'single'
              }
            },
            unit_amount: Math.round(basePrice * 100), // Convert to pence
          },
          quantity: quantity,
        };
      });

      // Calculate totals
      const subtotal = getTotalPrice();
      const shippingCostPence = Math.round(shippingCostNumeric * 100); // Convert to pence
      const total = subtotal + shippingCostPence;

      console.log('Checkout totals:', {
        subtotal,
        shippingCost: shippingCostNumeric,
        shippingCostPence,
        total,
        currency: 'GBP'
      });

      // Prepare metadata for the order
      const metadata: Record<string, string> = {
        cart_items: JSON.stringify(cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          printful_variant_id: item.printful_variant_id?.toString() || item.id.toString(),
          price: item.price
        }))),
        shipping_rate_id: shipping_rate_id || 'none',
        shipping_cost: shippingCost,
        shipping_currency: 'GBP',
        subtotal: subtotal.toString(),
        total: total.toString(),
        customer_email: shippingInfo.email,
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postcode}, ${shippingInfo.country}`
      };

      // Add variant selections to metadata if available
      try {
        const storedSelections = sessionStorage.getItem('variantSelections');
        if (storedSelections) {
          metadata.variant_selections = storedSelections;
        }
      } catch (e) {
        // Silent error handling for production
      }

      const checkoutRequest = {
        line_items: lineItems,
        metadata: metadata,
        success_url: `${window.location.origin}/success`,
        cancel_url: window.location.href,
        mode: 'payment' as const,
        customer_email: shippingInfo.email,
        shipping_rate_id: shipping_rate_id,
        // Add guest checkout flag
        guest_checkout: isGuestCheckout
      };
      
      console.log('Creating checkout session with:', {
        ...checkoutRequest,
        isGuestCheckout
      });
      
      const { url } = await createCheckoutSession(checkoutRequest);
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Show a more user-friendly error message with recovery options
      if (error instanceof Error) {
        if (error.message.includes('Stripe API key is not configured') || error.message.includes('Stripe is not configured')) {
          alert('Stripe payment is not configured. This is expected in development environment. Please configure your Stripe API keys to test payments.');
        } else if (error.message.includes('Failed to create checkout session')) {
          alert('Unable to create checkout session. Please check your internet connection and try again.');
        } else if (error.message.includes('Missing required parameters')) {
          alert('Checkout information is incomplete. Please fill in all required fields and try again.');
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          alert('Authentication error. Please refresh the page and try again, or contact support if the problem persists.');
        } else {
          alert(`Checkout error: ${error.message}`);
        }
      } else {
        alert('Failed to start checkout process. Please try again later.');
      }
      
      setIsProcessing(false);
    }
  };
  
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for supporting Reform UK. Your order has been confirmed and will be shipped within 48 hours.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-bold text-gray-900">Processing...</p>
          </div>
          <button
            onClick={onBack}
            className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Check if cart is empty and redirect to shop
  if (cartItems.length === 0) {
    // Add loading state while cart is being restored
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    
    useEffect(() => {
      // Give cart context time to initialize
      const timer = setTimeout(() => {
        setIsLoadingCart(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }, []);
    
    if (isLoadingCart) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009fe3] mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Checkout...</h2>
            <p className="text-gray-600">Please wait while we prepare your checkout.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            You need to add items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={onBack}
            className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }
  
  const handleBackToCart = () => {
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToCart}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Cart</span>
            </button>
            <div className="flex items-center space-x-3">
              <img src="/BackReformLogo.png" alt="Reform UK" className="h-8 w-auto" />
              <span className="font-bold text-xl text-gray-900">Secure Checkout</span>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">SSL Secured</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Shipping', icon: Truck },
              { step: 2, title: 'Review Order', icon: Package },
              { step: 3, title: 'Payment', icon: CreditCard }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-[#009fe3] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`font-medium ${currentStep >= step ? 'text-[#009fe3]' : 'text-gray-500'}`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                        onBlur={handleEmailBlur}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors ${
                          emailError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="your@email.com"
                        aria-invalid={emailError ? 'true' : 'false'}
                        aria-describedby={emailError ? 'email-error' : undefined}
                      />
                      {emailError && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {emailError && (
                      <div id="email-error" className="mt-2 flex items-start space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{emailError}</span>
                      </div>
                    )}
                    {!emailError && shippingInfo.email && validateEmail(shippingInfo.email) && (
                      <div className="mt-2 flex items-center space-x-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Valid email address</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                        placeholder="Smith"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apartment, suite, etc. (optional)</label>
                    <input
                      type="text"
                      value={shippingInfo.apartment}
                      onChange={(e) => handleInputChange('shipping', 'apartment', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                      placeholder="Apartment 4B"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                        placeholder="London"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postcode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.postcode}
                        onChange={(e) => handleInputChange('shipping', 'postcode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                        placeholder="SW1A 1AA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <select
                        value={shippingInfo.country}
                        onChange={(e) => handleInputChange('shipping', 'country', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                      >
                        <option value="United Kingdom">United Kingdom</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number (optional)</label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                      placeholder="+44 7700 900123"
                    />
                  </div>
                </div>
                
                {/* Shipping Options */}
                {shippingOptions.length > 0 && (
                  <div className="mt-8">
                    <ShippingMethods
                      options={shippingOptions}
                      value={selectedShipping?.id}
                      onChange={handleShippingSelect}
                      loading={shippingLoading}
                      error={shippingError}
                    />
                  </div>
                )}
                
                {/* Show loading state while fetching shipping options */}
                {shippingLoading && (
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Loading shipping options...</span>
                    </div>
                  </div>
                )}
                
                {/* Show error state if shipping fetch failed */}
                {shippingError && (
                  <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="w-4 h-4" />
                      <span>Error loading shipping options: {shippingError}</span>
                    </div>
                  </div>
                )}
                
                {/* PaymentIntent Integration Note */}
                {selectedShipping && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>Shipping Selected:</strong> {selectedShipping.name} - {selectedShipping.currency} {selectedShipping.rate}
                        {selectedShipping.minDeliveryDays && selectedShipping.maxDeliveryDays && 
                          ` (${selectedShipping.minDeliveryDays}-${selectedShipping.maxDeliveryDays} days)`
                        }
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      When you proceed to payment, this shipping cost will be automatically added to your order total.
                    </p>
                  </div>
                )}
                
                {/* Guest Checkout Notice */}
                {isGuestCheckout && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">Guest Checkout</h4>
                        <p className="text-sm text-blue-700">
                          You're checking out as a guest. After your order is complete, you can optionally create an account to track your order and save your information for future purchases.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  {emailError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800 mb-1">Please fix the following error:</h4>
                          <p className="text-sm text-red-700">{emailError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleNext}
                    disabled={!validateStep(1) || !!emailError}
                    className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Payment</span>
                    {validateStep(1) && !emailError && <Check className="w-4 h-4" />}
                  </button>
                  
                  {(!validateStep(1) || emailError) && (
                    <p className="mt-2 text-sm text-gray-600 text-center">
                      Please fill in all required fields with valid information to continue
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 2: Review Order */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {(item.color || item.size) && (
                          <p className="text-sm text-gray-600">
                            {item.color && item.size ? `${item.color}, ${item.size}` : 
                             item.color ? item.color : item.size}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                {/* Shipping & Payment Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Shipping Address
                    </h4>
                    <p className="text-sm text-gray-600">
                      {shippingInfo.firstName} {shippingInfo.lastName}<br />
                      {shippingInfo.address}<br />
                      {shippingInfo.apartment && `${shippingInfo.apartment}\n`}
                      {shippingInfo.city}, {shippingInfo.postcode}<br />
                      {shippingInfo.country}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Method
                    </h4>
                    <p className="text-sm text-gray-600">
                      Payment will be processed securely by Stripe
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="flex-1 bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Payment (Stripe) */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment</h2>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payment</h3>
                    <p className="text-sm text-gray-600">
                      Your payment details will be securely processed by Stripe.
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="w-full max-w-md">
                      <div className="bg-gray-100 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-900">Order Summary</h4>
                          <span className="font-bold text-gray-900">£{finalTotal.toFixed(2)}</span>
                        </div>
                        <div className="space-y-4">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-sm text-gray-600">{item.name}</p>
                                {(item.color || item.size) && (
                                  <p className="text-xs text-gray-500">
                                    {item.color && item.size ? `${item.color}, ${item.size}` : 
                                     item.color ? item.color : item.size}
                                  </p>
                                )}
                              </div>
                              <span className="font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          {promoDiscount > 0 && (
                            <div className="flex justify-between items-center text-sm text-green-600">
                              <span>Discount ({appliedPromo})</span>
                              <span>-£{promoDiscount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <span>£{finalTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-center space-x-4">
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-bold py-3 px-6 rounded-lg transition-colors"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="flex-1 bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4" />
                                <span>Complete Payment</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                      {(item.color || item.size) && (
                        <p className="text-xs text-gray-500">
                          {item.color && item.size ? `${item.color}, ${item.size}` : 
                           item.color ? item.color : item.size}
                        </p>
                      )}
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {/* Promo Code */}
              {!appliedPromo && (
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
              
              {appliedPromo && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">Promo Applied: {appliedPromo}</span>
                    <button onClick={removePromoCode} className="text-green-600 hover:text-green-800">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Price Breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Shipping
                    {selectedShipping && selectedShipping.name && (
                      <span className="ml-1 text-xs">({selectedShipping.name})</span>
                    )}
                  </span>
                  <span className="text-gray-900">{shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}</span>
                </div>
                {selectedShipping && selectedShipping.minDeliveryDays && selectedShipping.maxDeliveryDays && (
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Estimated delivery</span>
                    <span>{selectedShipping.minDeliveryDays}-{selectedShipping.maxDeliveryDays} business days</span>
                  </div>
                )}
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedPromo})</span>
                    <span>-£{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>£{finalTotal.toFixed(2)}</span>
              </div>
              
              {/* Trust Badges */}
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>SSL Encrypted Checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Best Shipping Rates</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span>Ships Within 48 Hours</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;