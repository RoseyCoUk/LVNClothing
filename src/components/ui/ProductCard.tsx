import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Truck, ChevronRight, ShoppingCart } from 'lucide-react';
import { Product } from '../../lib/api';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Define which products have variants and require color/size selection
  const hasVariants = (productName: string): boolean => {
    const variantProducts = ['reform uk t-shirt', 'reform uk hoodie', 'reform uk cap'];
    return variantProducts.some(variantProduct => 
      productName.toLowerCase().includes(variantProduct)
    );
  };
  
  // Generate proper URL slug with fallback logic
  const getProductUrl = () => {
    // If we have a proper slug (not a UUID), use it
    if (product.slug && !isUUID(product.slug)) {
      return `/product/${product.slug}`;
    }
    
    // Generate slug from product name if no proper slug exists
    const nameSlug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    return `/product/${nameSlug}`;
  };
  
  // Helper function to check if string is a UUID
  const isUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };
  
  const productUrl = getProductUrl();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // For merged products, use the first available variant's printful_variant_id
    const firstVariant = (product as any).variants?.[0];
    const printfulVariantId = firstVariant?.printful_variant_id;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price_pence / 100,
      // Ensure we use the product.image_url which now contains the prioritized thumbnail
      image: product.image_url || '/BackReformLogo.png',
      quantity: 1,
      printful_variant_id: printfulVariantId,
      // Include size and color from first variant if available
      size: firstVariant?.size,
      color: firstVariant?.color
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
      <div className="bg-gray-100 aspect-square w-full flex items-center justify-center relative overflow-hidden">
        {/* Loading skeleton */}
        {imageLoading && product.image_url && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400 text-sm">Loading...</div>
          </div>
        )}
        
        {product.image_url && !imageError ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            loading="lazy" // Add lazy loading for performance
            className={`object-cover w-full h-full group-hover:scale-105 transition-transform duration-200 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            } transition-opacity duration-200`}
            onLoad={() => {
              setImageLoading(false);
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
              
              // Log error for monitoring
              console.warn(`Failed to load image for ${product.name}:`, product.image_url);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center p-4">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">
                {imageError ? 'Image Failed to Load' : 'No Image Available'}
              </span>
            </div>
          </div>
        )}
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
          {/* Show Add to Cart button only for non-variant products */}
          {!hasVariants(product.name) && (
            <button 
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#009fe3] hover:bg-blue-600 text-white font-bold rounded-xl text-base transition-colors"
            >
              <ShoppingCart className="w-5 h-5" /> 
              Add to Cart
            </button>
          )}
          
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-800 text-base transition-colors group-hover:bg-gray-200">
            <ChevronRight className="w-5 h-5" /> 
            View Product
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 