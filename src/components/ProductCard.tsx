import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Truck, ChevronRight } from 'lucide-react';
import { Product } from '../lib/api';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Use the product slug for the URL, with fallback to product ID
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
  
  return (
    <Link
      to={productUrl}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200 focus:outline-none focus:ring-2 focus:ring-[#009fe3] group"
      aria-label={`View details for ${product.name}`}
    >
      {/* Product Image */}
      <div className="bg-gray-100 aspect-w-1 aspect-h-1 flex items-center justify-center">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
                            className="object-cover w-full h-64 group-hover:scale-105 transition-transform duration-200 aspect-square" 
            onError={(e) => {
              console.error('Image failed to load:', product.image_url);
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-64 flex items-center justify-center text-gray-400 ${product.image_url ? 'hidden' : ''}`}>
          {product.image_url ? 'Image Failed to Load' : 'No Image'}
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#009fe3] transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#facc15" />
            <span className="text-sm font-semibold text-gray-700">
              {product.rating?.toFixed(1) ?? '5.0'}
            </span>
            <span className="ml-2 text-xs text-gray-500">
              ({product.reviews?.toLocaleString() ?? 0})
            </span>
          </div>
          
          <div className="text-xl font-bold text-[#009fe3] mb-2">
            £{(product.price_pence / 100).toFixed(2)}
          </div>
          
          <div className="flex items-center text-green-600 text-sm font-medium mb-4">
            <Truck className="w-4 h-4 mr-1" /> 
            Ships in 48H
          </div>
        </div>
        
        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-800 text-base transition-colors mt-auto group-hover:bg-[#009fe3] group-hover:text-white">
          <ChevronRight className="w-5 h-5" /> 
          View Options
        </button>
      </div>
    </Link>
  );
};

export default ProductCard; 