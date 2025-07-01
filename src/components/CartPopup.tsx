import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartPopup = () => {
  const { getTotalItems, getTotalPrice, setIsCartOpen } = useCart();
  
  const totalItems = getTotalItems();
  
  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setIsCartOpen(true)}
        className="bg-[#009fe3] hover:bg-blue-600 text-white rounded-lg p-4 shadow-lg transition-all duration-300 hover:scale-105 min-w-[200px]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
          </div>
          <div className="text-right">
            <div className="font-bold">£{getTotalPrice().toFixed(2)}</div>
            <div className="text-xs opacity-90">View Cart</div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default CartPopup;