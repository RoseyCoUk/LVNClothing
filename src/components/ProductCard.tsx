import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Truck, ChevronRight, ShoppingCart } from 'lucide-react';
import { Product } from '../lib/api';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  // Use the product slug for the URL, with fallback to product ID
  const productUrl = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price_pence / 100,
      image: product.image_url || '',
      quantity: 1
    };
    
    addToCart(cartItem);
  };
  
  return (
    <Link
      to={productUrl}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl duration-200 focus:outline-none focus:ring-2 focus:ring-[#009fe3] group w-full h-full"
      aria-label={`View details for ${product.name}`}
    >
      {/* Product Image */}
      <div className="bg-gray-100 aspect-square w-full flex items-center justify-center">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center text-gray-400 ${product.image_url ? 'hidden' : ''}`}>
          {product.image_url ? 'Image Failed to Load' : 'No Image'}
        </div>
      </div>
      
      {/* Product Details - Always visible on mobile, positioned below image on desktop */}
      <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
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
        
        <div className="space-y-2">
          <button 
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#009fe3] hover:bg-blue-600 text-white font-bold rounded-xl text-base transition-colors"
          >
            <ShoppingCart className="w-5 h-5" /> 
            Add to Cart
          </button>
          
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-800 text-base transition-colors group-hover:bg-gray-200">
            <ChevronRight className="w-5 h-5" /> 
            View Options
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 