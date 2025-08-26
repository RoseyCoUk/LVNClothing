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
      className="card-lvn rounded-none shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-1 duration-200 focus:outline-none focus:ring-2 focus:ring-lvn-maroon group w-full h-full"
      aria-label={`View details for ${product.name}`}
    >
      {/* Product Image */}
      <div className="bg-lvn-off-white aspect-square w-full flex items-center justify-center relative">
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
        <div className={`w-full h-full flex items-center justify-center text-lvn-black/40 ${product.image_url ? 'hidden' : ''}`}>
          {product.image_url ? 'Image Failed to Load' : 'No Image'}
        </div>
        
        {/* Faith Badge */}
        <div className="absolute top-2 left-2 bg-lvn-maroon text-lvn-white px-2 py-1 text-xs font-semibold rounded-none">
          LVN
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-4 md:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-lvn-black mb-1 group-hover:text-lvn-maroon transition-colors">
            {product.name}
          </h3>
          
          {/* Scripture snippet if available */}
          {product.description && (
            <p className="text-xs text-lvn-maroon italic mb-2 scripture-quote">
              "{product.description.substring(0, 60)}..."
            </p>
          )}
          
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#facc15" />
            <span className="text-sm font-semibold text-lvn-black">
              {product.rating?.toFixed(1) ?? '5.0'}
            </span>
            <span className="ml-2 text-xs text-lvn-black/60">
              ({product.reviews?.toLocaleString() ?? 0})
            </span>
          </div>
          
          <div className="text-xl font-bold text-lvn-maroon mb-2">
            £{(product.price_pence / 100).toFixed(2)}
          </div>
          
          <div className="flex items-center text-lvn-black/70 text-sm font-medium mb-4">
            <Truck className="w-4 h-4 mr-1" /> 
            Free UK shipping over £60
          </div>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={handleAddToCart}
            className="btn-lvn-primary w-full flex items-center justify-center gap-2 text-base"
          >
            <ShoppingCart className="w-5 h-5" /> 
            Add to Cart
          </button>
          
          <button className="btn-lvn-outline w-full flex items-center justify-center gap-2 text-base">
            <ChevronRight className="w-5 h-5" /> 
            View Options
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 