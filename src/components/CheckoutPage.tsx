import React, { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Shield,
  Truck,
  Package,
  Check,
  AlertCircle,
  Info,
  Gift,
  Percent,
  MapPin,
  User,
  Mail,
  Phone,
  Calendar,
  X
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CheckoutPageProps {
  onBack: () => void;
}

const CheckoutPage = ({ onBack }: CheckoutPageProps) => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
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
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    saveCard: false
  });
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  
  const [cardErrors, setCardErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [cardTouched, setCardTouched] = useState({
    cardNumber: false,
    expiryDate: false,
    cvv: false
  });
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  const subtotal = getTotalPrice();
  const shipping = shippingMethod === 'express' ? 4.99 : (subtotal >= 30 ? 0 : 3.99);
  const promoDiscount = appliedPromo === 'REFORM10' ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - promoDiscount;
  
  const shippingOptions = [
    { id: 'standard', name: 'Standard Delivery', time: '3-5 business days', price: subtotal >= 30 ? 0 : 3.99 },
    { id: 'express', name: 'Express Delivery', time: '1-2 business days', price: 4.99 }
  ];
  
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
      if (cardTouched.cardNumber) {
        if (!formattedValue.trim()) {
          error = 'Card number is required';
        } else if (!validateCardNumber(formattedValue)) {
          error = 'Card number must be 16 digits';
        }
      }
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
      if (cardTouched.expiryDate) {
        if (!formattedValue.trim()) {
          error = 'Expiry date is required';
        } else if (!validateExpiryDate(formattedValue)) {
          error = 'Please enter a valid future date (MM/YY)';
        }
      }
    } else if (field === 'cvv') {
      // Only allow digits for CVV
      formattedValue = value.replace(/\D/g, '');
      const cardType = getCardType(paymentInfo.cardNumber);
      const maxLength = cardType === 'amex' ? 4 : 3;
      formattedValue = formattedValue.slice(0, maxLength);
      
      if (cardTouched.cvv) {
        if (!formattedValue.trim()) {
          error = 'CVV is required';
        } else if (!validateCVV(formattedValue, paymentInfo.cardNumber)) {
          const expectedLength = cardType === 'amex' ? '4' : '3';
          error = `CVV must be ${expectedLength} digits${cardType === 'amex' ? ' (Amex)' : ' (Visa/Mastercard)'}`;
        }
      }
    }
    
    setPaymentInfo(prev => ({ ...prev, [field]: formattedValue }));
    setCardErrors(prev => ({ ...prev, [field]: error }));
  };
  
  // Handle card field blur
  const handleCardBlur = (field: string) => {
    setCardTouched(prev => ({ ...prev, [field]: true }));
    
    const value = paymentInfo[field as keyof typeof paymentInfo] as string;
    let error = '';
    
    if (field === 'cardNumber') {
      if (!value.trim()) {
        error = 'Card number is required';
      } else if (!validateCardNumber(value)) {
        error = 'Card number must be 16 digits';
      }
    } else if (field === 'expiryDate') {
      if (!value.trim()) {
        error = 'Expiry date is required';
      } else if (!validateExpiryDate(value)) {
        error = 'Please enter a valid future date (MM/YY)';
      }
    } else if (field === 'cvv') {
      if (!value.trim()) {
        error = 'CVV is required';
      } else if (!validateCVV(value, paymentInfo.cardNumber)) {
        const cardType = getCardType(paymentInfo.cardNumber);
        const expectedLength = cardType === 'amex' ? '4' : '3';
        error = `CVV must be ${expectedLength} digits${cardType === 'amex' ? ' (Amex)' : ' (Visa/Mastercard)'}`;
      }
    }
    
    setCardErrors(prev => ({ ...prev, [field]: error }));
  };
  
  const handleInputChange = (section: 'shipping' | 'payment', field: string, value: string) => {
    if (section === 'shipping') {
      if (field === 'email') {
        handleEmailChange(value);
      } else {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
      }
    } else {
      if (['cardNumber', 'expiryDate', 'cvv'].includes(field)) {
        handleCardInputChange(field, value);
      } else {
        setPaymentInfo(prev => ({ ...prev, [field]: value }));
      }
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
      return isEmailValid && shippingInfo.firstName && shippingInfo.lastName && 
             shippingInfo.address && shippingInfo.city && shippingInfo.postcode;
    }
    if (step === 2) {
      const isCardNumberValid = validateCardNumber(paymentInfo.cardNumber);
      const isExpiryValid = validateExpiryDate(paymentInfo.expiryDate);
      const isCvvValid = validateCVV(paymentInfo.cvv, paymentInfo.cardNumber);
      const isNameValid = paymentInfo.nameOnCard.trim().length > 0;
      
      return isCardNumberValid && isExpiryValid && isCvvValid && isNameValid;
    }
    return true;
  };
  
  const hasPaymentErrors = () => {
    return Object.values(cardErrors).some(error => error !== '');
  };
  
  const handleNext = () => {
    if (currentStep === 1) {
      setEmailTouched(true);
      handleEmailBlur();
      
      setTimeout(() => {
        if (validateStep(currentStep) && !emailError) {
          setCurrentStep(prev => prev + 1);
        }
      }, 100);
    } else if (currentStep === 2) {
      // Force validation of all card fields
      setCardTouched({ cardNumber: true, expiryDate: true, cvv: true });
      handleCardBlur('cardNumber');
      handleCardBlur('expiryDate');
      handleCardBlur('cvv');
      
      setTimeout(() => {
        if (validateStep(currentStep) && !hasPaymentErrors()) {
          setCurrentStep(prev => prev + 1);
        }
      }, 100);
    } else if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
    setOrderComplete(true);
    clearCart();
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
            Thank you for supporting Reform UK. Your order has been confirmed and will be shipped within 24 hours.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-bold text-gray-900">#RUK-{Date.now().toString().slice(-6)}</p>
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
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
              { step: 2, title: 'Payment', icon: CreditCard },
              { step: 3, title: 'Review', icon: Package }
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
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h3>
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <label key={option.id} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#009fe3] transition-colors">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={shippingMethod === option.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="text-[#009fe3] focus:ring-[#009fe3]"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{option.name}</span>
                            <span className="font-bold text-gray-900">
                              {option.price === 0 ? 'FREE' : `£${option.price.toFixed(2)}`}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{option.time}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
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
            
            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                        onBlur={() => handleCardBlur('cardNumber')}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors ${
                          cardErrors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {cardErrors.cardNumber && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                      )}
                    </div>
                    {cardErrors.cardNumber && (
                      <div className="mt-2 flex items-start space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{cardErrors.cardNumber}</span>
                      </div>
                    )}
                    {!cardErrors.cardNumber && paymentInfo.cardNumber && validateCardNumber(paymentInfo.cardNumber) && (
                      <div className="mt-2 flex items-center space-x-2 text-green-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Valid card number</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                          onBlur={() => handleCardBlur('expiryDate')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors ${
                            cardErrors.expiryDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        {cardErrors.expiryDate && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {cardErrors.expiryDate && (
                        <div className="mt-2 flex items-start space-x-2 text-red-600">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{cardErrors.expiryDate}</span>
                        </div>
                      )}
                      {!cardErrors.expiryDate && paymentInfo.expiryDate && validateExpiryDate(paymentInfo.expiryDate) && (
                        <div className="mt-2 flex items-center space-x-2 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Valid expiry date</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={paymentInfo.cvv}
                          onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                          onBlur={() => handleCardBlur('cvv')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent transition-colors ${
                            cardErrors.cvv ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder={getCardType(paymentInfo.cardNumber) === 'amex' ? '1234' : '123'}
                          maxLength={getCardType(paymentInfo.cardNumber) === 'amex' ? 4 : 3}
                        />
                        {cardErrors.cvv && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                        )}
                      </div>
                      {cardErrors.cvv && (
                        <div className="mt-2 flex items-start space-x-2 text-red-600">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{cardErrors.cvv}</span>
                        </div>
                      )}
                      {!cardErrors.cvv && paymentInfo.cvv && validateCVV(paymentInfo.cvv, paymentInfo.cardNumber) && (
                        <div className="mt-2 flex items-center space-x-2 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Valid CVV</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name on Card <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.nameOnCard}
                      onChange={(e) => handleInputChange('payment', 'nameOnCard', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009fe3] focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={paymentInfo.saveCard}
                      onChange={(e) => handleInputChange('payment', 'saveCard', e.target.checked.toString())}
                      className="text-[#009fe3] focus:ring-[#009fe3]"
                    />
                    <span className="text-sm text-gray-700">Save card for future purchases</span>
                  </label>
                </div>
                
                <div className="mt-6">
                  {hasPaymentErrors() && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</h4>
                          <ul className="text-sm text-red-700 space-y-1">
                            {Object.entries(cardErrors).map(([field, error]) => 
                              error && <li key={field}>• {error}</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!validateStep(2) || hasPaymentErrors()}
                      className="flex-1 bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Review Order</span>
                      {validateStep(2) && !hasPaymentErrors() && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {(!validateStep(2) || hasPaymentErrors()) && (
                    <p className="mt-2 text-sm text-gray-600 text-center">
                      Please fill in all payment fields with valid information to continue
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
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
                      **** **** **** {paymentInfo.cardNumber.slice(-4)}<br />
                      {paymentInfo.nameOnCard}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
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
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedPromo})</span>
                    <span>-£{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
              
              {/* Trust Badges */}
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>SSL Encrypted Checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Free UK Shipping Over £30</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span>Ships Within 24 Hours</span>
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