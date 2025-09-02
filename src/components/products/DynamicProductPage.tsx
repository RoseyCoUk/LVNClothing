import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Check, 
  Truck, 
  Shield, 
  RefreshCw, 
  Plus, 
  Minus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Info,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import { Toast, useToast } from '../ui/Toast';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  printful_variant_id: string;
  price: number;
  in_stock: boolean;
  is_available: boolean;
  color?: string;
  size?: string;
  created_at: string;
  updated_at: string;
}

interface DynamicProductPageProps {
  onBack?: () => void;
}

export default function DynamicProductPage({ onBack }: DynamicProductPageProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isVisible, message, showToast, hideToast } = useToast();
  
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Selection state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch product and variants from database
  useEffect(() => {
    async function fetchProductData() {
      if (!slug) {
        console.error('❌ No slug provided to DynamicProductPage');
        setError('No product identifier provided.');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        
        // First, let's see what products exist in the database
        const { data: allProducts, error: allError } = await supabase
          .from('products')
          .select('id, name, slug')
          .limit(10);
        
        let productData = null;
        let productError = null;
        
        // First, try to fetch product by exact slug match
        const { data: slugData, error: slugError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
          
        if (slugError) {
          productError = slugError;
        } else if (slugData) {
          productData = slugData;
        } else {
          // If no slug match, try to find by generated slug from name
          
          const { data: nameSearchData, error: nameSearchError } = await supabase
            .from('products')
            .select('*');
            
          if (nameSearchError) {
            productError = nameSearchError;
          } else if (nameSearchData) {
            // Try to match slug generated from product name
            const matchedProduct = nameSearchData.find(product => {
              const generatedSlug = product.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single
                .trim();
              return generatedSlug === slug;
            });
            
            if (matchedProduct) {
              productData = matchedProduct;
            }
          }
        }
          
        if (productError) {
          setError(`Database error: ${productError.message}`);
          return;
        }
        
        if (!productData) {
          setError(`Product "${slug}" not found. It may have been removed or the URL is incorrect.`);
          return;
        }
        setProduct(productData);
        
        // Fetch variants for this product
        const { data: variantData, error: variantError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productData.id)
          .eq('is_available', true)
          .order('color', { ascending: true })
          .order('size', { ascending: true });
          
        if (variantError) {
          setError(`Failed to load product variants: ${variantError.message}`);
          return;
        }
        setVariants(variantData || []);
        
        // Select first available variant by default
        if (variantData && variantData.length > 0) {
          setSelectedVariant(variantData[0]);
        }

        // Fetch product images from database with enhanced query
        const { data: imageData, error: imageError } = await supabase
          .from('product_images')
          .select(`
            id,
            product_id,
            image_url,
            image_order,
            is_primary,
            variant_type,
            color,
            size
          `)
          .eq('product_id', productData.id)
          .order('image_order', { ascending: true });
          
        if (imageError) {
          // Don't fail the entire page for image errors, just use fallback
        } else {
          setProductImages(imageData || []);
        }
        
      } catch (err) {
        setError('Failed to load product data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProductData();
  }, [slug]);

  // Reset selected image when variant changes (especially color)
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedVariant?.color]);

  // Get product images from database based on selected variant with enhanced fallback logic
  const getProductImages = () => {
    if (productImages.length === 0) {
      // Fallback to product image or logo if no images in database
      return [product?.image_url || '/BackReformLogo.png'];
    }
    
    // If a color is selected, try to get color-specific images first
    if (selectedVariant?.color) {
      const selectedColor = selectedVariant.color.toLowerCase();
      
      // Priority 1: Exact color match with variant_type = 'color'
      const exactColorImages = productImages.filter(img => 
        img.variant_type === 'color' && 
        img.color?.toLowerCase() === selectedColor
      );
      
      if (exactColorImages.length > 0) {
        return exactColorImages
          .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          .map(img => img.image_url);
      }
      
      // Priority 2: Look for images with color field matching (any variant_type)
      const colorFieldImages = productImages.filter(img => 
        img.color?.toLowerCase() === selectedColor
      );
      
      if (colorFieldImages.length > 0) {
        return colorFieldImages
          .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          .map(img => img.image_url);
      }
    }
    
    // Priority 3: General product images (variant_type = 'product' or null)
    const generalImages = productImages.filter(img => 
      img.variant_type === 'product' || img.variant_type === null || img.variant_type === undefined
    );
    
    if (generalImages.length > 0) {
      return generalImages
        .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
        .map(img => img.image_url);
    }
    
    // Priority 4: Primary image if available
    const primaryImages = productImages.filter(img => img.is_primary === true);
    if (primaryImages.length > 0) {
      return primaryImages.map(img => img.image_url);
    }
    
    // Priority 5: All available images as final fallback
    return productImages.length > 0 
      ? productImages
          .sort((a, b) => (a.image_order || 0) - (b.image_order || 0))
          .map(img => img.image_url)
      : [product?.image_url || '/BackReformLogo.png'];
  };

  // Get available colors and sizes
  const getAvailableColors = () => {
    const colors = new Set(variants.filter(v => v.color).map(v => v.color!));
    return Array.from(colors);
  };

  const getAvailableSizes = () => {
    const sizes = new Set(variants.filter(v => v.size).map(v => v.size!));
    return Array.from(sizes).sort((a, b) => {
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
      return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
    });
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !product) {
      showToast('Please select a variant');
      return;
    }

    // Validate that printful_variant_id is numeric (not UUID)
    const variantId = selectedVariant.printful_variant_id?.toString();
    if (!variantId || !isValidPrintfulVariantId(variantId)) {
      showToast('Invalid product variant. Please refresh and try again.');
      return;
    }

    const cartItem = {
      id: `${product.id}-${selectedVariant.id}`,
      name: `${product.name} - ${selectedVariant.name}`,
      price: selectedVariant.price,
      quantity: quantity,
      image: getProductImages()[0],
      printful_variant_id: variantId, // Validated numeric Printful variant ID
      external_id: selectedVariant.id // Database UUID for internal tracking
    };

    addToCart(cartItem);
    showToast(`Added ${product.name} to cart!`);
  };

  // Validation function for Printful variant IDs
  const isValidPrintfulVariantId = (variantId: string): boolean => {
    // Check if it's a UUID (contains hyphens) - these are invalid
    const isUUID = variantId.includes('-') && variantId.length > 20;
    if (isUUID) return false;
    
    // Check if it's a numeric Printful variant ID
    const isNumeric = /^\d+$/.test(variantId);
    return isNumeric && parseInt(variantId) > 0;
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const nextImage = () => {
    const images = getProductImages();
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getProductImages();
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#009fe3] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested product could not be found.'}</p>
          <button
            onClick={() => onBack ? onBack() : navigate('/shop')}
            className="px-4 py-2 bg-[#009fe3] text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const images = getProductImages();
  const availableColors = getAvailableColors();
  const availableSizes = getAvailableSizes();

  return (
    <>
      <Toast 
        message={message}
        isVisible={isVisible}
        onClose={hideToast}
        duration={3000}
      />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <button onClick={() => onBack ? onBack() : navigate('/shop')} className="hover:text-[#009fe3] transition-colors">
                  Home
                </button>
                <span className="text-gray-400">/</span>
                <button onClick={() => onBack ? onBack() : navigate('/shop')} className="hover:text-[#009fe3] transition-colors">
                  Shop
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-[#009fe3] font-semibold">{product.name}</span>
              </div>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden shadow-lg">
                <img
                  src={images[selectedImage]}
                  alt={`${product.name} - Image ${selectedImage + 1}`}
                  className="w-full h-full object-cover aspect-square"
                />
                
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10" aria-label="Previous image">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10" aria-label="Next image">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {selectedVariant && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedVariant.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedVariant.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                )}
                
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs z-10">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {images.map((image: string, index: number) => (
                    <button 
                      key={index} 
                      onClick={() => setSelectedImage(index)} 
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-[#009fe3]' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover aspect-square" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600">(156 reviews)</span>
                </div>
                {selectedVariant && (
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-3xl font-bold text-[#009fe3]">£{selectedVariant.price.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-green-600 mb-6">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">Ships in 48H</span>
                </div>
              </div>

              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color: {selectedVariant?.color || 'Select color'}
                  </label>
                  <div className="flex space-x-2">
                    {availableColors.map((color) => {
                      const colorVariant = variants.find(v => v.color === color);
                      const isSelected = selectedVariant?.color === color;
                      
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            const newVariant = variants.find(v => v.color === color);
                            if (newVariant) setSelectedVariant(newVariant);
                          }}
                          className={`w-10 h-10 rounded-full border-2 transition-colors ${
                            isSelected ? 'border-[#009fe3] ring-2 ring-[#009fe3] ring-offset-2' : 'border-gray-300 hover:border-gray-400'
                          }`}
                          style={{ 
                            backgroundColor: color?.toLowerCase() === 'white' ? '#FFFFFF' : 
                                             color?.toLowerCase() === 'black' ? '#000000' :
                                             color?.toLowerCase() === 'navy' ? '#1c2330' :
                                             color?.toLowerCase() === 'red' ? '#8e0a1f' :
                                             color?.toLowerCase() === 'blue' ? '#009fe3' :
                                             '#6B7280'
                          }}
                          title={color}
                          disabled={!colorVariant?.is_available}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Size: {selectedVariant?.size || 'Select size'}
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {availableSizes.map((size) => {
                      const sizeVariant = variants.find(v => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color));
                      const isSelected = selectedVariant?.size === size;
                      
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            const newVariant = variants.find(v => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color));
                            if (newVariant) setSelectedVariant(newVariant);
                          }}
                          className={`py-2 px-3 text-sm border rounded-lg transition-colors ${
                            isSelected 
                              ? 'border-[#009fe3] bg-[#009fe3] text-white' 
                              : sizeVariant?.is_available
                              ? 'border-gray-300 hover:border-[#009fe3] hover:text-[#009fe3]'
                              : 'border-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                          disabled={!sizeVariant?.is_available}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Add to Cart & Actions */}
              <div className="space-y-3 pt-4">
                <button 
                  onClick={handleBuyNow}
                  disabled={!selectedVariant || !selectedVariant.is_available}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {selectedVariant ? `Buy Now - £${selectedVariant.price.toFixed(2)}` : 'Select Variant'}
                </button>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || !selectedVariant.is_available}
                  className="w-full bg-[#009fe3] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart{selectedVariant ? ` - £${(selectedVariant.price * quantity).toFixed(2)}` : ''}</span>
                </button>
                
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-[#009fe3] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Free UK Shipping Over £30</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-[#009fe3] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Secure Checkout</p>
                </div>
                <div className="text-center">
                  <RefreshCw className="w-6 h-6 text-[#009fe3] mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Information Tabs */}
          <div className="mt-16">
            <div className="border-b-2 border-gray-100">
              <nav className="flex space-x-2">
                {['description', 'variants', 'reviews', 'shipping'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 relative ${
                      activeTab === tab ? 'border-[#009fe3] text-[#009fe3] bg-blue-50/50' : 'border-transparent text-gray-600 hover:text-[#009fe3] hover:bg-gray-50'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="py-8">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || 'High-quality Reform UK merchandise. Show your support with our premium products.'}
                  </p>
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Category:</h4>
                    <p className="text-gray-700">{product.category || 'Merchandise'}</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'variants' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Variants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {variants.map((variant) => (
                      <div 
                        key={variant.id} 
                        className={`p-4 border rounded-lg ${variant.is_available ? 'border-gray-200' : 'border-gray-100 bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{variant.name}</h4>
                            <p className="text-sm text-gray-600">
                              {variant.color && `Color: ${variant.color}`}
                              {variant.color && variant.size && ' • '}
                              {variant.size && `Size: ${variant.size}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#009fe3]">£{variant.price.toFixed(2)}</p>
                            <p className={`text-xs ${variant.is_available ? 'text-green-600' : 'text-red-600'}`}>
                              {variant.is_available ? 'In Stock' : 'Out of Stock'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">(156 reviews)</span>
                    </div>
                  </div>
                  <p className="text-gray-600">Customer reviews coming soon!</p>
                </div>
              )}
              
              {activeTab === 'shipping' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-800 font-medium">Fast & Reliable Shipping</p>
                        <p className="text-blue-700 text-sm mt-1">
                          We use Printful for fulfillment with shipping times of 3-7 business days in the UK.
                          Free shipping on orders over £30.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}