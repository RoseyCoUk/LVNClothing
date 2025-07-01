import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartDrawerProps {
  onCheckoutClick: () => void;
}

const CartDrawer = ({ onCheckoutClick }: CartDrawerProps) => {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice,
    clearCart
  } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    onCheckoutClick();
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Cart Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6" />
              <span>Your Cart</span>
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some Reform UK merchandise to get started!</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-4 mb-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-[#009fe3] font-bold">£{item.price.toFixed(2)}</p>
                        {item.isBundle && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Package className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Bundle Deal</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Bundle Contents */}
                    {item.isBundle && item.bundleContents && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-700 mb-2">Bundle includes:</p>
                        <div className="space-y-1">
                          {item.bundleContents.map((content, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <img 
                                src={content.image} 
                                alt={content.name}
                                className="w-6 h-6 object-cover rounded"
                              />
                              <span className="text-xs text-gray-600">
                                {content.name} ({content.variant})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-[#009fe3]">£{getTotalPrice().toFixed(2)}</span>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={clearCart}
                  className="w-full border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Clear Cart
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                🇬🇧 Free UK shipping over £30 • Secure checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;