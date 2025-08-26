import React from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface CartDrawerProps {
  onCheckoutClick?: () => void;
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
    // Add small delay to ensure cart drawer closes before navigation
    setTimeout(() => {
      onCheckoutClick();
    }, 100);
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
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-lvn-white shadow-xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-lvn-black/10">
            <h2 className="text-xl font-bold text-lvn-black flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6" />
              <span>Your Cart</span>
            </h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-lvn-off-white rounded-none transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-lvn-black/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-lvn-black mb-2">Your cart is empty</h3>
                <p className="text-lvn-black/70 mb-6">Add some LVN Clothing to get started!</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="btn-lvn-primary"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-lvn-off-white rounded-none p-4">
                    <div className="flex items-center space-x-4 mb-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-none"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lvn-black mb-1">{item.name}</h3>
                        <p className="text-lvn-maroon font-bold">£{item.price.toFixed(2)}</p>
                        {item.isBundle && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Package className="w-3 h-3 text-lvn-maroon" />
                            <span className="text-xs text-lvn-maroon font-medium">Collection Deal</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            try {
                              updateQuantity(item.id, item.quantity - 1);
                            } catch (error) {
                              console.error('Failed to update quantity:', error);
                            }
                          }}
                          className="p-1 hover:bg-lvn-black/10 rounded-none transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-lvn-black">{item.quantity}</span>
                        <button
                          onClick={() => {
                            try {
                              updateQuantity(item.id, item.quantity + 1);
                            } catch (error) {
                              console.error('Failed to update quantity:', error);
                            }
                          }}
                          className="p-1 hover:bg-lvn-black/10 rounded-none transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-lvn-black/70">
                        Total: £{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-lvn-maroon hover:text-lvn-black transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-lvn-black/10 p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-lg font-bold text-lvn-black">
                  <span>Total</span>
                  <span>£{getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="text-sm text-lvn-black/70 bg-lvn-off-white p-3 rounded-none">
                  <p className="flex items-center space-x-2 mb-1">
                    <Package className="w-4 h-4 text-lvn-maroon" />
                    <span>Free UK shipping on orders over £60</span>
                  </p>
                  {getTotalPrice() < 60 && (
                    <p className="text-lvn-maroon font-medium">
                      Add £{(60 - getTotalPrice()).toFixed(2)} more for free shipping
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full btn-lvn-primary text-lg"
                >
                  Proceed to Checkout
                </button>
                
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full btn-lvn-outline"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;