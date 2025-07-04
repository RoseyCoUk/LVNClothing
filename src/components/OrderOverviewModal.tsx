import React from 'react';
import { X, ShoppingCart, Check, Info } from 'lucide-react';

interface OrderVariants {
  gender?: string;
  size?: string;
  color?: string;
  packSize?: string;
  setSize?: string;
  [key: string]: string | undefined;
}

interface BundleContent {
  name: string;
  variant: string;
  image: string;
}

interface ProductDetails {
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  priceId: string;
  variants: OrderVariants;
  isBundle?: boolean;
  bundleContents?: BundleContent[];
}

interface OrderOverviewModalProps {
  productDetails: ProductDetails;
  onClose: () => void;
  onConfirm: () => void;
}

const OrderOverviewModal: React.FC<OrderOverviewModalProps> = ({
  productDetails,
  onClose,
  onConfirm
}) => {
  const {
    productName,
    productImage,
    price,
    quantity,
    variants,
    isBundle,
    bundleContents
  } = productDetails;

  const totalPrice = price * quantity;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Order Overview</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-start space-x-4">
              <img 
                src={productImage} 
                alt={productName}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{productName}</h3>
                <p className="text-[#009fe3] font-bold">£{price.toFixed(2)}</p>
                
                {isBundle && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Bundle Deal</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Selected Variants */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Your Selection:</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {variants.color && (
                <p>Color: <span className="font-medium text-gray-900">{variants.color}</span></p>
              )}
              {variants.gender && (
                <p>Gender: <span className="font-medium text-gray-900">{variants.gender}</span></p>
              )}
              {variants.size && (
                <p>Size: <span className="font-medium text-gray-900">{variants.size}</span></p>
              )}
              {variants.packSize && (
                <p>Pack Size: <span className="font-medium text-gray-900">{variants.packSize} items</span></p>
              )}
              {variants.setSize && (
                <p>Set Size: <span className="font-medium text-gray-900">{variants.setSize} items</span></p>
              )}
              <p>Quantity: <span className="font-medium text-gray-900">{quantity}</span></p>
            </div>
          </div>
          
          {/* Bundle Contents */}
          {isBundle && bundleContents && bundleContents.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Bundle Contents:</h4>
              <div className="space-y-2">
                {bundleContents.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.variant}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Price Summary */}
          <div className="border-t border-b py-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Price:</span>
              <span className="text-gray-900">£{price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Quantity:</span>
              <span className="text-gray-900">{quantity}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-[#009fe3]">£{totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Info Note */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p>Clicking "Proceed to Checkout" will take you to our secure payment page.</p>
              <p className="mt-1">If you're not signed in, you'll be asked for your email address to receive order confirmation.</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderOverviewModal;