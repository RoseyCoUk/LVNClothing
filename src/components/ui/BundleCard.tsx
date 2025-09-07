import React from 'react';
import { Package, Tag, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BundleKey, BUNDLES, DISCOUNTS } from '../../lib/bundle-pricing';

interface BundleCardProps {
  bundleKey: BundleKey;
  price: number;
  originalPrice: number;
  onAddToCart?: () => void;
}

const BundleCard: React.FC<BundleCardProps> = ({
  bundleKey,
  price,
  originalPrice,
  onAddToCart
}) => {
  const navigate = useNavigate();
  const bundle = BUNDLES[bundleKey];
  const discount = DISCOUNTS[bundleKey];
  const savings = originalPrice - price;

  // Bundle descriptions
  const bundleDescriptions: Record<BundleKey, string> = {
    starter: 'Perfect for new supporters. Get the essentials to show your support.',
    champion: 'For dedicated reformers. A complete collection of premium items.',
    activist: 'The ultimate bundle. Everything you need to lead the movement.'
  };

  // Bundle colors for visual differentiation
  const bundleColors: Record<BundleKey, string> = {
    starter: 'from-blue-500 to-cyan-500',
    champion: 'from-purple-500 to-pink-500',
    activist: 'from-amber-500 to-orange-500'
  };

  const handleClick = () => {
    // Navigate to the specific bundle page
    navigate(`/product/${bundleKey}-bundle`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
      <div onClick={handleClick} className="relative">
        {/* Bundle Badge */}
        <div className={`absolute top-4 left-4 z-10 bg-gradient-to-r ${bundleColors[bundleKey]} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
          <Tag className="w-3 h-3" />
          <span>Save {Math.round(discount * 100)}%</span>
        </div>

        {/* Bundle Image Placeholder */}
        <div className={`relative h-64 bg-gradient-to-br ${bundleColors[bundleKey]} flex items-center justify-center`}>
          <Package className="w-24 h-24 text-white/80" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
        </div>

        {/* Bundle Info */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{bundleDescriptions[bundleKey]}</p>

          {/* Products Included */}
          <div className="mb-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Includes:</p>
            <div className="flex flex-wrap gap-1">
              {bundle.products.map((product, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {product.name}
                </span>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">£{price.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through">£{originalPrice.toFixed(2)}</span>
              </div>
              <p className="text-sm text-green-600 font-semibold">You save £{savings.toFixed(2)}</p>
            </div>
          </div>

          {/* View Bundle Button - Always navigate to bundle page */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick(); // Always navigate to the bundle page
            }}
            className="w-full bg-[#009fe3] hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Bundle</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BundleCard;