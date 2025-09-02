import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAdminProducts } from '../admin/contexts/AdminProductsContext';
import { 
  Package, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Image as ImageIcon,
  ShoppingCart,
  Heart,
  Eye,
  Loader2,
  Star,
  Tag,
  Gift
} from 'lucide-react';

interface BundleDisplayProps {
  bundleId: string;
  bundleName: string;
  bundleDescription?: string;
  basePrice?: number;
  onAddToCart?: (bundleId: string) => void;
  onQuickView?: (bundleId: string) => void;
  onWishlist?: (bundleId: string) => void;
  showActions?: boolean;
  className?: string;
}

interface BundleData {
  id: string;
  name: string;
  description: string;
  customPrice: number;
  isActive: boolean;
  products: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    imageUrl?: string;
    price: number;
    isAvailable: boolean;
  }>;
  totalValue: number;
  savings: number;
  savingsPercentage: number;
  availability: {
    isInStock: boolean;
    stockLevel: number;
    estimatedDelivery?: string;
    lastUpdated: string;
  };
}

const BundleDisplay: React.FC<BundleDisplayProps> = ({
  bundleId,
  bundleName,
  bundleDescription,
  basePrice,
  onAddToCart,
  onQuickView,
  onWishlist,
  showActions = true,
  className = ''
}) => {
  const { 
    getBundles, 
    getBundleItems,
    getProductOverrides,
    getProductImages
  } = useAdminProducts();

  // State management
  const [bundleData, setBundleData] = useState<BundleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  // Load bundle data
  useEffect(() => {
    const loadBundleData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load bundle details
        const bundles = await getBundles();
        const bundle = bundles.find(b => b.id === bundleId);

        if (!bundle) {
          throw new Error('Bundle not found');
        }

        // Load bundle items
        const bundleItems = await getBundleItems(bundleId);

        // Load product details for each item
        const productsWithDetails = await Promise.all(
          bundleItems.map(async (item) => {
            try {
              // Get product override
              const overrides = await getProductOverrides(item.product_id);
              const override = overrides.find(o => o.printfulProductId === item.product_id);

              // Get product images
              const images = await getProductImages(item.product_id);
              const primaryImage = images.find(img => img.isPrimary) || images[0];

              return {
                id: item.id,
                productId: item.product_id,
                productName: override?.customDescription || `Product ${item.product_id}`,
                quantity: item.quantity,
                imageUrl: primaryImage?.imageUrl,
                price: override?.customRetailPrice || 0,
                isAvailable: override?.isActive ?? true
              };
            } catch (err) {
              console.error(`Failed to load product ${item.product_id}:`, err);
              return {
                id: item.id,
                productId: item.product_id,
                productName: `Product ${item.product_id}`,
                quantity: item.quantity,
                imageUrl: undefined,
                price: 0,
                isAvailable: false
              };
            }
          })
        );

        // Calculate totals
        const totalValue = productsWithDetails.reduce((sum, product) => 
          sum + (product.price * product.quantity), 0
        );
        const savings = totalValue - bundle.custom_price;
        const savingsPercentage = totalValue > 0 ? (savings / totalValue) * 100 : 0;

        // Check overall availability
        const isInStock = productsWithDetails.every(product => product.isAvailable);
        const stockLevel = Math.min(...productsWithDetails.map(p => p.isAvailable ? 999 : 0));

        const data: BundleData = {
          id: bundle.id,
          name: bundle.name,
          description: bundle.description,
          customPrice: bundle.custom_price,
          isActive: bundle.is_active,
          products: productsWithDetails,
          totalValue,
          savings,
          savingsPercentage,
          availability: {
            isInStock,
            stockLevel,
            estimatedDelivery: '3-5 business days',
            lastUpdated: new Date().toISOString()
          }
        };

        setBundleData(data);

        // Initialize image loading states
        const imageStates: Record<string, boolean> = {};
        productsWithDetails.forEach(product => {
          if (product.imageUrl) {
            imageStates[product.id] = true;
          }
        });
        setImageLoading(imageStates);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bundle data');
      } finally {
        setLoading(false);
      }
    };

    loadBundleData();
  }, [bundleId, getBundles, getBundleItems, getProductOverrides, getProductImages]);

  // Memoized calculations
  const displayPrice = useMemo(() => {
    if (!bundleData) return basePrice || 0;
    return bundleData.customPrice;
  }, [bundleData, basePrice]);

  const displayDescription = useMemo(() => {
    if (!bundleData) return bundleDescription || '';
    return bundleData.description || bundleDescription || '';
  }, [bundleData, bundleDescription]);

  const isAvailable = useMemo(() => {
    if (!bundleData) return false;
    return bundleData.isActive && bundleData.availability.isInStock;
  }, [bundleData]);

  const stockStatus = useMemo(() => {
    if (!bundleData) return { status: 'unknown', text: 'Stock unknown', color: 'text-gray-500' };
    
    const { stockLevel, isInStock } = bundleData.availability;
    
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
  }, [bundleData]);

  // Image loading handlers
  const handleImageLoad = useCallback((productId: string) => {
    setImageLoading(prev => ({ ...prev, [productId]: false }));
  }, []);

  const handleImageError = useCallback((productId: string) => {
    setImageLoading(prev => ({ ...prev, [productId]: false }));
  }, []);

  // Action handlers
  const handleAddToCart = useCallback(() => {
    if (onAddToCart && isAvailable) {
      onAddToCart(bundleId);
    }
  }, [onAddToCart, bundleId, isAvailable]);

  const handleQuickView = useCallback(() => {
    if (onQuickView) {
      onQuickView(bundleId);
    }
  }, [onQuickView, bundleId]);

  const handleWishlist = useCallback(() => {
    if (onWishlist) {
      onWishlist(bundleId);
    }
  }, [onWishlist, bundleId]);

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
            <p className="font-medium">Failed to load bundle</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Bundle not found or inactive
  if (!bundleData || !bundleData.isActive) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center space-x-3 text-gray-500">
          <Package className="h-5 w-5" />
          <div>
            <p className="font-medium">Bundle unavailable</p>
            <p className="text-sm">This bundle is not currently available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 ${className}`}>
      {/* Bundle Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <Gift className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Bundle</span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-1">{bundleData.name}</h3>
        
        {displayDescription && (
          <p className="text-sm text-gray-600 line-clamp-2">{displayDescription}</p>
        )}
      </div>

      {/* Bundle Products Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {bundleData.products.map((product) => (
            <div key={product.id} className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.imageUrl ? (
                  <>
                    {imageLoading[product.id] && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      </div>
                    )}
                    
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className={`w-full h-full object-cover transition-opacity duration-200 ${
                        imageLoading[product.id] ? 'opacity-0' : 'opacity-100'
                      }`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(product.id)}
                      onError={() => handleImageError(product.id)}
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Quantity badge */}
                <div className="absolute top-1 right-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {product.quantity}
                  </span>
                </div>
                
                {/* Availability indicator */}
                {!product.isAvailable && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-700 mt-1 text-center line-clamp-2">
                {product.productName}
              </p>
            </div>
          ))}
        </div>

        {/* Bundle Info */}
        <div className="space-y-3 mb-4">
          {/* Price and Savings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                £{displayPrice.toFixed(2)}
              </span>
              {basePrice && displayPrice !== basePrice && (
                <span className="text-lg text-gray-500 line-through">
                  £{basePrice.toFixed(2)}
                </span>
              )}
            </div>
            
            {bundleData.savings > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-500">Total Value:</div>
                <div className="text-lg font-semibold text-gray-900">
                  £{bundleData.totalValue.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Savings Display */}
          {bundleData.savings > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">You Save:</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-800">
                    £{bundleData.savings.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600">
                    {bundleData.savingsPercentage.toFixed(0)}% off
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Availability:</span>
            <span className={`inline-flex items-center space-x-1 text-sm font-medium ${stockStatus.color}`}>
              {stockStatus.status === 'out-of-stock' && <XCircle className="h-4 w-4" />}
              {stockStatus.status === 'low-stock' && <AlertCircle className="h-4 w-4" />}
              {stockStatus.status === 'limited-stock' && <AlertCircle className="h-4 w-4" />}
              {stockStatus.status === 'in-stock' && <CheckCircle className="h-4 w-4" />}
              <span>{stockStatus.text}</span>
            </span>
          </div>

          {/* Delivery Info */}
          {bundleData.availability.estimatedDelivery && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estimated Delivery:</span>
              <span className="text-sm text-gray-900">{bundleData.availability.estimatedDelivery}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{isAvailable ? 'Add Bundle to Cart' : 'Bundle Out of Stock'}</span>
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

        {/* Bundle Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">
              Bundle includes {bundleData.products.length} products
            </p>
            <p className="text-xs text-gray-500">
              Last updated: {new Date(bundleData.availability.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleDisplay;
