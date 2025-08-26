import React, { useState } from 'react';
import { ArrowLeft, CreditCard, ShoppingBag, Shield } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CheckoutPageProps {
  onBack: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack }) => {
  const { cartItems, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const totalPrice = getTotalPrice();
  const shippingCost = totalPrice >= 60 ? 0 : 4.99;
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    // Simulate checkout process
    setTimeout(() => {
      setIsProcessing(false);
      setOrderSuccess(true);
      clearCart();
    }, 2000);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-lvnBg py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-lvn-white p-8 rounded-none shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-lvn-black mb-4">
              Order Confirmed!
            </h1>
            <p className="text-lvn-black/70 mb-8">
              Thank you for your order. You will receive a confirmation email shortly.
            </p>
            <div className="text-lvn-maroon italic text-lg mb-8">
              "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty."
            </div>
            <button
              onClick={onBack}
              className="btn-lvn-primary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lvnBg py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-lvn-maroon hover:text-lvn-black transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </button>
          <h1 className="text-4xl font-bold text-lvn-black mb-2">Checkout</h1>
          <p className="text-lvn-black/70">Complete your LVN Clothing order</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-lvn-white p-6 rounded-none shadow-sm">
            <h2 className="text-xl font-bold text-lvn-black mb-4 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-lvn-off-white rounded-none mr-3 flex items-center justify-center">
                      <span className="text-xs font-bold text-lvn-maroon">LVN</span>
                    </div>
                    <div>
                      <div className="font-semibold text-lvn-black">{item.name}</div>
                      <div className="text-sm text-lvn-black/60">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-semibold text-lvn-maroon">
                    £{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-lvn-black">Subtotal:</span>
                <span className="font-semibold text-lvn-black">£{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lvn-black">Shipping:</span>
                <span className="font-semibold text-lvn-maroon">
                  {shippingCost === 0 ? 'FREE' : `£${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                <span className="text-lvn-black">Total:</span>
                <span className="text-lvn-maroon">£{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Free Shipping Notice */}
            {totalPrice < 60 && (
              <div className="mt-4 p-3 bg-lvn-maroon/10 border border-lvn-maroon/20 rounded-none">
                <p className="text-sm text-lvn-maroon">
                  Add £{(60 - totalPrice).toFixed(2)} more for FREE UK shipping!
                </p>
              </div>
            )}
          </div>

          {/* Checkout Form */}
          <div className="bg-lvn-white p-6 rounded-none shadow-sm">
            <h2 className="text-xl font-bold text-lvn-black mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Payment Information
            </h2>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-lvn-black mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lvn-black mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-lvn-black mb-2">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lvn-black mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                    placeholder="London"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lvn-black mb-2">
                    Postcode
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                    placeholder="SW1A 1AA"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-lvn-black mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-lvn-black mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-lvn-black mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-none focus:outline-none focus:ring-2 focus:ring-lvn-maroon focus:border-transparent"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing || cartItems.length === 0}
                className="w-full btn-lvn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lvn-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `Complete Order • £${finalTotal.toFixed(2)}`
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-lvn-off-white rounded-none text-center">
              <Shield className="w-5 h-5 text-lvn-maroon mx-auto mb-2" />
              <p className="text-sm text-lvn-black/70">
                Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;