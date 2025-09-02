import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminProducts } from '../admin/contexts/AdminProductsContext';
import { 
  Package, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Image as ImageIcon,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Loader2
} from 'lucide-react';

interface ProductDisplayProps {
  printfulProductId: string;
  productName: string;
  productDescription?: string;
  category?: string;
  basePrice?: number;
  onAddToCart?: (productId: string, variantId: string) => void;
  onQuickView?: (productId: string) => void;
  onWishlist?: (productId: string) => void;
  showActions?: boolean;
  variant?: string;
  size?: string;
  color?: string;
  className?: string;
}

interface ProductData {
  id: string;
  printfulProductId: string;
  customRetailPrice?: number;
  customDescription?: string;
  isActive: boolean;
  images: Array<{
    id: string;
    imageUrl: string;
    imageOrder: number;
    isPrimary: boolean;
  }>;
  variants: Array<{
    id: string;
    size?: string;
    color?: string;
    material?: string;
    stock: number;
    isAvailable: boolean;
    customPrice?: number;
  }>;
  availability: {
    isInStock: boolean;
    stockLevel: number;
    estimatedDelivery?: string;
    lastUpdated: string;
  };
  syncStatus: {
    lastSync: string;
    isConnected: boolean;
    hasErrors: boolean;
  };
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({
  printfulProductId,
  productName,
  productDescription,
  category,
  basePrice,
  onAddToCart,
  onQuickView,
  onWishlist,
  showActions = true,
  variant,
  size,
  color,
  className = ''
}) => {
  const { 
    getProductOverrides, 
    getProductImages,
    getPrintfulSyncStatus 
  } = useAdminProducts();

  // State management
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Load product data
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load product overrides
        const overrides = await getProductOverrides(printfulProductId);
        const override = overrides.find(o => o.printfulProductId === printfulProductId);

        // Load product images
        const images = await getProductImages(printfulProductId);

        // Load sync status
        const syncStatus = await getPrintfulSyncStatus();

        // Create product data object
        const data: ProductData = {
          id: override?.id || printfulProductId,
          printfulProductId,
          customRetailPrice: override?.customRetailPrice,
          customDescription: override?.customDescription,
          isActive: override?.isActive ?? true,
          images: images.map(img => ({
            id: img.id,
            imageUrl: img.imageUrl,
            imageOrder: img.imageOrder,
            isPrimary: img.isPrimary
          })),
          variants: [
            // Mock variants - in real implementation, this would come from Printful API
            {
              id: 'variant-1',
              size: 'M',
              color: 'Blue',
              material: 'Cotton',
              stock: 25,
              isAvailable: true,
              customPrice: undefined
            },
            {
              id: 'variant-2',
              size: 'L',
              color: 'Blue',
              material: 'Cotton',
              stock: 15,
              isAvailable: true,
              customPrice: undefined
            }
          ],
          availability: {
            isInStock: true,
            stockLevel: 40,
            estimatedDelivery: '3-5 business days',
            lastUpdated: new Date().toISOString()
          },
          syncStatus: {
            lastSync: syncStatus.lastSync || new Date().toISOString(),
            isConnected: syncStatus.isConnected || false,
            hasErrors: syncStatus.syncErrors?.length > 0 || false
          }
        };

        setProductData(data);
        
        // Auto-select variant if size/color specified
        if (size || color) {
          const matchingVariant = data.variants.find(v => 
            (!size || v.size === size) && (!color || v.color === color)
          );
          if (matchingVariant) {
            setSelectedVariant(matchingVariant.id);
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [printfulProductId, getProductOverrides, getProductImages, getPrintfulSyncStatus, size, color]);

  // Memoized calculations
  const displayPrice = useMemo(() => {
    if (!productData) return basePrice || 0;
    return productData.customRetailPrice || basePrice || 0;
  }, [productData, basePrice]);

  const displayDescription = useMemo(() => {
    if (!productData) return productDescription || '';
    return productData.customDescription || productDescription || '';
  }, [productData, productDescription]);

  const primaryImage = useMemo(() => {
    if (!productData?.images.length) return null;
    return productData.images.find(img => img.isPrimary) || productData.images[0];
  }, [productData?.images]);

  const isAvailable = useMemo(() => {
    if (!productData) return true;
    return productData.isActive && productData.availability.isInStock;
  }, [productData]);

  const stockStatus = useMemo(() => {
    if (!productData) return { status: 'unknown', text: 'Stock unknown', color: 'text-gray-500' };
    
    const { stockLevel, isInStock } = productData.availability;
    
    if (!isInStock) {
      return { status: 'out-of-stock', text: 'Out of stock', color: 'text-red-600' };
    }
    
    if (stockLevel <= 5) {
      return { status: 'low-stock', text: `Only ${stockLevel} left`, color: 'text-orange-600' };
    }
    
    if (stockLevel <= 20) {
      return { status: 'limited-stock', text: `${stockLevel} in stock`, color: 'text-yellow-600' };
    }
    
    return { status: 'in-stock', text: 'In stock', color: 'text-green-600' };
  }, [productData]);

  // Image loading handlers
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  // Variant selection
  const handleVariantSelect = useCallback((variantId: string) => {
    setSelectedVariant(variantId);
  }, []);

  // Action handlers
  const handleAddToCart = useCallback(() => {
    if (onAddToCart && selectedVariant) {
      onAddToCart(printfulProductId, selectedVariant);
    }
  }, [onAddToCart, selectedVariant, printfulProductId]);

  const handleQuickView = useCallback(() => {
    if (onQuickView) {
      onQuickView(printfulProductId);
    }
  }, [onQuickView, printfulProductId]);

  const handleWishlist = useCallback(() => {
    if (onWishlist) {
      onWishlist(printfulProductId);
    }
  }, [onWishlist, printfulProductId]);

  // Loading state
  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-4 rounded mb-2"></div>
          <div className="bg-gray-200 h-4 rounded mb-2 w-3/4"></div>
          <div className="bg-gray-200 h-6 rounded mb-4 w-1/2"></div>
          <div className="bg-gray-200 h-8 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-4 ${className}`}>
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">Failed to load product</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Product not found or inactive
  if (!productData || !productData.isActive) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center space-x-3 text-gray-500">
          <Package className="h-5 w-5" />
          <div>
            <p className="font-medium">Product unavailable</p>
            <p className="text-sm">This product is not currently available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        {primaryImage ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            )}
            
            <img
              src={primaryImage.imageUrl}
              alt={productName}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            
            {/* Image overlay for actions */}
            {showActions && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={handleQuickView}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    title="Quick view"
                  >
                    <Eye className="h-4 w-4 text-gray-700" />
                  </button>
                  <button
                    onClick={handleWishlist}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    title="Add to wishlist"
                  >
                    <Heart className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Stock status badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white shadow-sm ${stockStatus.color}`}>
            {stockStatus.status === 'out-of-stock' && <XCircle className="h-3 w-3 mr-1" />}
            {stockStatus.status === 'low-stock' && <AlertCircle className="h-3 w-3 mr-1" />}
            {stockStatus.status === 'limited-stock' && <Clock className="h-3 w-3 mr-1" />}
            {stockStatus.status === 'in-stock' && <CheckCircle className="h-3 w-3 mr-1" />}
            {stockStatus.text}
          </span>
        </div>

        {/* Sync status indicator */}
        {productData.syncStatus.hasErrors && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Sync Error
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <p className="text-sm text-gray-500 mb-2">{category}</p>
        )}

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:line-clamp-none transition-all duration-200">
          {productName}
        </h3>

        {/* Description */}
        {displayDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 hover:line-clamp-none transition-all duration-200">
            {displayDescription}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            £{displayPrice.toFixed(2)}
          </span>
          {productData.customRetailPrice && basePrice && productData.customRetailPrice !== basePrice && (
            <span className="text-sm text-gray-500 line-through">
              £{basePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Variant Selection */}
        {productData.variants.length > 1 && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Select Variant:</p>
            <div className="flex flex-wrap gap-2">
              {productData.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => handleVariantSelect(variant.id)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedVariant === variant.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {variant.size} {variant.color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Availability Info */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Stock:</span>
            <span className={stockStatus.color}>{stockStatus.text}</span>
          </div>
          {productData.availability.estimatedDelivery && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Delivery:</span>
              <span className="text-gray-900">{productData.availability.estimatedDelivery}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable || !selectedVariant}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={handleQuickView}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Quick View</span>
              </button>
              <button
                onClick={handleWishlist}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Heart className="h-4 w-4" />
                <span>Wishlist</span>
              </button>
            </div>
          </div>
        )}

        {/* Sync Status */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Last updated:</span>
            <span>{new Date(productData.availability.lastUpdated).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Sync status:</span>
            <span className={`flex items-center space-x-1 ${
              productData.syncStatus.isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {productData.syncStatus.isConnected ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              <span>{productData.syncStatus.isConnected ? 'Connected' : 'Disconnected'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
