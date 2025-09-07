import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Shield,
  Truck,
  Package,
  Check,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import StripeCheckoutWrapper from './StripeCheckoutWrapper';
import { validateAndEnrichCart, getShippingRates, formatPrice } from '../../lib/payment-intents';
import type { CartItem, ShippingAddress } from '../../lib/payment-intents';

interface DynamicCheckoutPageProps {
  onBack?: () => void;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  country: string;
  phone?: string;
}

export default function DynamicCheckoutPage({ onBack }: DynamicCheckoutPageProps) {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Default back behavior - go to shop page
  const handleBack = onBack || (() => navigate('/shop'));
  
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>(
    cartItems.length === 0 ? 'success' : 'shipping'
  );
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    address: '',
    city: '',
    postcode: '',
    country: 'GB',
    phone: ''
  });
  const [enrichedCartItems, setEnrichedCartItems] = useState<CartItem[]>([]);
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [orderData, setOrderData] = useState<{
    order_id: string;
    order_number: string;
  } | null>(null);

  // Convert cart items to payment intent format
  useEffect(() => {
    async function enrichCart() {
      if (cartItems.length === 0) {
        setEnrichedCartItems([]);
        return;
      }
      
      // Debug: Log cart items to see what's missing
      console.log('🛒 DEBUG: Cart items received in checkout:');
      cartItems.forEach((item, index) => {
        console.log(`  Item ${index}:`, {
          id: item.id,
          name: item.name,
          price: item.price,
          printful_variant_id: item.printful_variant_id,
          color: item.color,
          size: item.size,
          hasVariantId: !!item.printful_variant_id,
          variantIdType: typeof item.printful_variant_id,
          allFields: Object.keys(item)
        });
      });

      // Validate printful_variant_id format - accept both numeric and alphanumeric formats
      // Special handling for discount items which don't need valid Printful variant IDs
      const validItems = cartItems.filter(item => {
        // Allow discount items through validation regardless of variant ID
        if (item.isDiscount) {
          console.log('Allowing discount item through validation:', {
            id: item.id,
            name: item.name,
            isDiscount: item.isDiscount
          });
          return true;
        }
        
        const variantId = item.printful_variant_id?.toString();
        if (!variantId) {
          console.warn(`Filtering out cart item with missing variant ID:`, {
            id: item.id,
            name: item.name,
            printful_variant_id: item.printful_variant_id,
            allFields: Object.keys(item)
          });
          return false;
        }
        
        // Accept numeric format (legacy): digits only
        const isNumeric = /^\d+$/.test(variantId);
        if (isNumeric) return true;
        
        // Accept alphanumeric format (Printful catalog IDs): letters, numbers, possible hyphens
        // This includes UUID-style Printful catalog variant IDs that are valid
        const isAlphanumeric = /^[a-zA-Z0-9\-_]{8,}$/.test(variantId);
        if (isAlphanumeric) return true;
        
        console.warn(`Filtering out cart item with invalid variant ID format: ${variantId}`);
        return false;
      });

      if (validItems.length < cartItems.length) {
        const invalidCount = cartItems.length - validItems.length;
        setError(`${invalidCount} items in your cart could not be validated. Please remove them and try adding them again.`);
      }
      
      const convertedItems: CartItem[] = validItems.map(item => ({
        id: item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        printful_variant_id: item.printful_variant_id?.toString() || item.id.toString(),
        product_type: item.isBundle ? 'bundle' : 'single',
        image: item.image, // Preserve the image URL for display in checkout
        color: item.color, // Preserve color variant
        size: item.size,   // Preserve size variant
        isDiscount: item.isDiscount // Preserve discount flag for shipping exclusion
      }));

      try {
        const enriched = await validateAndEnrichCart(convertedItems);
        
        // Debug: Log enriched items to see if variant info is preserved
        console.log('🎯 DEBUG: Enriched cart items:');
        enriched.forEach((item, index) => {
          console.log(`  Enriched Item ${index}:`, {
            id: item.id,
            name: item.name,
            color: item.color,
            size: item.size,
            allFields: Object.keys(item)
          });
        });
        
        setEnrichedCartItems(enriched);
      } catch (error) {
        console.error('Error enriching cart:', error);
        setEnrichedCartItems(convertedItems);
      }
    }

    enrichCart();
  }, [cartItems]);

  // Get shipping rates when shipping info changes
  useEffect(() => {
    async function fetchShippingRates() {
      if (enrichedCartItems.length === 0 || !isShippingComplete()) return;
      
      setLoading(true);
      try {
        const shippingAddress: ShippingAddress = {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          address1: shippingInfo.address,
          city: shippingInfo.city,
          country_code: shippingInfo.country,
          zip: shippingInfo.postcode,
          state_code: shippingInfo.country === 'US' ? 'CA' : undefined // Default for demo
        };

        console.log('🚚 Fetching shipping rates for:', { enrichedCartItems, shippingAddress });
        const rates = await getShippingRates(enrichedCartItems, shippingAddress);
        console.log('🚚 Shipping rates response:', rates);
        console.log('🚚 Raw API response options:', JSON.stringify(rates.options, null, 2));
        console.log('🚚 Individual shipping options:', rates.options?.map((opt, i) => ({
          index: i,
          id: opt.id,
          name: opt.name,
          rate: opt.rate,
          currency: opt.currency,
          minDeliveryDays: opt.minDeliveryDays,
          maxDeliveryDays: opt.maxDeliveryDays,
          deliveryDays: `${opt.minDeliveryDays}-${opt.maxDeliveryDays} days`
        })));
        
        if (rates.options && rates.options.length > 0) {
          console.log(`✅ Found ${rates.options.length} shipping options`);
          setShippingRates(rates.options);
          // Auto-select cheapest shipping option
          const cheapestRate = rates.options[0];
          setSelectedShipping(cheapestRate);
        } else {
          console.error('❌ No shipping rates in response:', rates);
          setError('No shipping options available for this address');
        }
      } catch (error) {
        console.error('Error fetching shipping rates:', error);
        setError('Failed to calculate shipping costs');
      } finally {
        setLoading(false);
      }
    }

    fetchShippingRates();
  }, [enrichedCartItems, shippingInfo.address, shippingInfo.city, shippingInfo.postcode, shippingInfo.country]);

  const isShippingComplete = () => {
    return shippingInfo.firstName && 
           shippingInfo.lastName && 
           shippingInfo.email && 
           shippingInfo.address && 
           shippingInfo.city && 
           shippingInfo.postcode && 
           shippingInfo.country;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isShippingComplete()) {
      setError('Please fill in all required shipping fields');
      return;
    }

    if (!selectedShipping) {
      setError('Please select a shipping method');
      return;
    }

    setError('');
    setStep('payment');
  };

  const handlePaymentSuccess = (data: { order_id: string; order_number: string }) => {
    console.log('Payment successful:', data);
    setOrderData(data);
    clearCart();
    setStep('success');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setError(error);
  };

  const getShippingAddress = (): ShippingAddress => ({
    name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
    address1: shippingInfo.address,
    city: shippingInfo.city,
    country_code: shippingInfo.country,
    zip: shippingInfo.postcode,
    state_code: shippingInfo.country === 'US' ? 'CA' : undefined
  });

  const calculateSubtotal = () => {
    const subtotal = enrichedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    console.log('💰 Frontend subtotal calculation:', {
      subtotal,
      items: enrichedCartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      }))
    });
    return subtotal;
  };

  // Success step
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          {orderData && (
            <>
              <p className="text-gray-600 mb-4">
                Your order <strong>{orderData.order_number}</strong> has been placed successfully.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You will receive an email confirmation shortly with tracking details.
              </p>
            </>
          )}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => window.location.href = '/account/orders'}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Order Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Shop
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {enrichedCartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          console.warn(`Failed to load image for ${item.name}:`, item.image);
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Package className={`w-8 h-8 text-gray-400 ${item.image ? 'hidden' : ''}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Qty: {item.quantity}</p>
                      {/* Show variant information if available */}
                      {(item.color || item.size) && (
                        <p>
                          {item.color && item.size ? `${item.color}, ${item.size}` : 
                           item.color ? item.color : item.size}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              {selectedShipping && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Shipping ({selectedShipping.name}):</span>
                    <span>{formatPrice(parseFloat(selectedShipping.rate))}</span>
                  </div>
                  {selectedShipping.minDeliveryDays && selectedShipping.maxDeliveryDays && (
                    <div className="text-xs text-gray-500 mt-1">
                      Estimated delivery: {selectedShipping.minDeliveryDays}-{selectedShipping.maxDeliveryDays} business days
                    </div>
                  )}
                  {/* Movement momentum notice */}
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
                    <p className="text-xs text-amber-800">
                      🔥 <strong>The movement is growing!</strong> Due to unprecedented demand from supporters across the UK, items may ship separately and delivery times are currently 3-7 business days. Thank you for joining thousands in showing your support!
                    </p>
                  </div>
                </>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>
                  {selectedShipping 
                    ? formatPrice(calculateSubtotal() + parseFloat(selectedShipping.rate))
                    : formatPrice(calculateSubtotal())
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {step === 'shipping' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
                
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                    {error.includes('could not be validated') && (
                      <button
                        onClick={() => {
                          clearCart();
                          setError('');
                        }}
                        className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.postcode}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, postcode: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      required
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="IT">Italy</option>
                      <option value="ES">Spain</option>
                    </select>
                  </div>

                  {/* Shipping Methods */}
                  {shippingRates.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Shipping Method *
                      </label>
                      <div className="space-y-3">
                        {shippingRates.map((rate, index) => (
                          <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500">
                            <input
                              type="radio"
                              name="shipping"
                              value={rate.id}
                              checked={selectedShipping?.id === rate.id}
                              onChange={() => setSelectedShipping(rate)}
                              className="mr-3"
                            />
                            <Truck className="w-5 h-5 text-gray-400 mr-3" />
                            <div className="flex-1">
                              <div className="font-medium">
                                {rate.name}
                                {rate.minDeliveryDays && rate.maxDeliveryDays && (
                                  <span className="ml-2 text-sm text-gray-500 font-normal">
                                    (Est. {rate.minDeliveryDays}-{rate.maxDeliveryDays} business days)
                                  </span>
                                )}
                              </div>
                              {rate.minDeliveryDays && rate.maxDeliveryDays && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Estimated delivery: {(() => {
                                    const today = new Date();
                                    const minDate = new Date(today);
                                    const maxDate = new Date(today);
                                    
                                    // Add business days
                                    let daysToAdd = rate.minDeliveryDays;
                                    let daysAdded = 0;
                                    while (daysAdded < daysToAdd) {
                                      minDate.setDate(minDate.getDate() + 1);
                                      if (minDate.getDay() !== 0 && minDate.getDay() !== 6) {
                                        daysAdded++;
                                      }
                                    }
                                    
                                    daysToAdd = rate.maxDeliveryDays;
                                    daysAdded = 0;
                                    while (daysAdded < daysToAdd) {
                                      maxDate.setDate(maxDate.getDate() + 1);
                                      if (maxDate.getDay() !== 0 && maxDate.getDay() !== 6) {
                                        daysAdded++;
                                      }
                                    }
                                    
                                    const formatDate = (date: Date) => {
                                      return date.toLocaleDateString('en-GB', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      });
                                    };
                                    
                                    if (minDate.getMonth() === maxDate.getMonth()) {
                                      return `${formatDate(minDate)}–${maxDate.getDate()}`;
                                    } else {
                                      return `${formatDate(minDate)}–${formatDate(maxDate)}`;
                                    }
                                  })()}
                                </div>
                              )}
                            </div>
                            <div className="font-medium">{formatPrice(parseFloat(rate.rate))}</div>
                          </label>
                        ))}
                      </div>
                      {/* Movement momentum notice for shipping selection */}
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-3">
                        <p className="text-sm text-amber-800">
                          🔥 <strong>The movement is growing!</strong> Due to unprecedented demand from supporters across the UK, items may ship separately and delivery times are currently 3-7 business days. Thank you for joining thousands in showing your support!
                        </p>
                      </div>
                    </div>
                  )}

                  {loading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Calculating shipping rates...</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!isShippingComplete() || !selectedShipping || loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <StripeCheckoutWrapper
                items={enrichedCartItems}
                shippingAddress={getShippingAddress()}
                customerEmail={shippingInfo.email}
                guestCheckout={!user}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onLoadingChange={setLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}