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
                {/* Group bundle items together */}
                {(() => {
                  const bundleGroups = new Map<string, typeof cartItems>();
                  const regularItems: typeof cartItems = [];
                  
                  cartItems.forEach(item => {
                    if (item.isPartOfBundle && item.bundleId) {
                      if (!bundleGroups.has(item.bundleId)) {
                        bundleGroups.set(item.bundleId, []);
                      }
                      bundleGroups.get(item.bundleId)?.push(item);
                    } else {
                      regularItems.push(item);
                    }
                  });
                  
                  return (
                    <>
                      {/* Display bundle groups */}
                      {Array.from(bundleGroups.entries()).map(([bundleId, bundleItems]) => (
                        <div key={bundleId} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <Package className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-gray-900">{bundleItems[0]?.bundleName || 'Bundle'}</h4>
                            <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">Bundle Deal</span>
                          </div>
                          <div className="space-y-2">
                            {bundleItems.map((item) => (
                              <div key={item.id} className="flex items-center space-x-3 bg-white/50 rounded p-2">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                                  {(item.color || item.size) && (
                                    <p className="text-xs text-gray-600">
                                      {item.color && item.size ? `${item.color}, ${item.size}` : 
                                       item.color ? item.color : item.size}
                                    </p>
                                  )}
                                  {item.price !== 0 && (
                                    item.isDiscount ? (
                                      <p className="text-sm text-green-600 font-bold flex items-center space-x-1">
                                        <span>💸</span>
                                        <span>{item.price < 0 ? '-' : ''}£{Math.abs(item.price).toFixed(2)} discount</span>
                                      </p>
                                    ) : (
                                      <p className="text-sm text-[#009fe3] font-bold">£{item.price.toFixed(2)}</p>
                                    )
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {/* Bundle total price and savings */}
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Bundle Total:</span>
                              <span className="text-lg font-bold text-[#009fe3]">
                                £{bundleItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                              </span>
                            </div>
                            {/* Show bundle savings if this is a known bundle */}
                            {bundleId.includes('bundle') && (
                              <div className="mt-1 text-xs text-green-600">
                                Bundle savings applied!
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Display regular items */}
                      {regularItems.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-4 mb-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                              {/* Show variant information if available */}
                              {(item.color || item.size) && (
                                <p className="text-sm text-gray-600 mb-1">
                                  {item.color && item.size ? `${item.color}, ${item.size}` : 
                                   item.color ? item.color : item.size}
                                </p>
                              )}
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
                                onClick={() => {
                                  try {
                                    updateQuantity(item.id, item.quantity - 1);
                                  } catch (error) {
                                    console.error('Failed to update quantity:', error);
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  try {
                                    updateQuantity(item.id, item.quantity + 1);
                                  } catch (error) {
                                    console.error('Failed to update quantity:', error);
                                  }
                                }}
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
                    </>
                  );
                })()}
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
                🇬🇧 Secure checkout • Best shipping rates
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;