import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Product } from '../lib/api';

interface BuyNowButtonProps {
  product: Product;
  className?: string;
  variant?: 'primary' | 'secondary';
}

const BuyNowButton: React.FC<BuyNowButtonProps> = ({ 
  product, 
  className = '', 
  variant = 'primary' 
}) => {
  const navigate = useNavigate();
  const { addToCart, clearCart } = useCart();
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleQuickBuy = () => {
    // Clear cart and add only this item
    clearCart();
    addToCart({
      id: product.id,
      name: `${product.name} - ${selectedSize}`,
      price: product.price,
      quantity: 1,
      image: product.image_url || ''
    });
    
    // Go directly to checkout
    navigate('/checkout');
  };

  const baseClasses = variant === 'primary' 
    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
    : 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white';

  return (
    <>
      <button
        onClick={() => setShowQuickBuy(true)}
        className={`${baseClasses} font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center space-x-2 ${className}`}
      >
        <Zap className="w-5 h-5" />
        <span>Buy Now</span>
      </button>

      {/* Quick Buy Modal */}
      {showQuickBuy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Quick Purchase</h3>
              <button
                onClick={() => setShowQuickBuy(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-lg font-bold text-green-600">£{product.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Size
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`border-2 rounded-lg py-2 text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="bg-green-50 p-3 rounded-lg">
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ Secure payment processing</li>
                  <li>✓ Free UK shipping over £60</li>
                  <li>✓ 30-day return guarantee</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleQuickBuy}
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition-colors"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Express Checkout - £{product.price.toFixed(2)}</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowQuickBuy(false)}
                  className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuyNowButton;
