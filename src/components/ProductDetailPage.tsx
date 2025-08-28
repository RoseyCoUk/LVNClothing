import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Truck, 
  Shield, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Gift,
  Users,
  CheckCircle
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getProducts, Product } from '../lib/api';
import { supabase } from '../lib/supabase';
import ReviewSystem from './ReviewSystem';

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description');

  // Mock product data - replace with real API call
  const mockProduct: Product = {
    id: productId || '1',
    name: 'LVN Kingdom Leaven Hoodie',
    description: 'Premium Christian hoodie crafted with the finest materials. Inspired by Matthew 13:33, this hoodie represents the transformative power of the Kingdom. Soft, comfortable, and built to last - perfect for everyday wear while sharing your faith.',
    price: 89.99,
    image_url: '/Hoodie/Men/ReformHoodieMenBlackFront1.webp',
    category: 'Hoodies',
    stock_quantity: 15,
    tags: ['hoodie', 'men', 'premium', 'christian'],
    slug: 'lvn-kingdom-leaven-hoodie',
    reviews: 24,
    rating: 4.8
  };

  const productImages = [
    '/Hoodie/Men/ReformHoodieMenBlackFront1.webp',
    '/Hoodie/Men/ReformHoodieMenBlackBack1.webp',
    '/Hoodie/Men/ReformHoodieMenBlackSide1.webp',
    '/Hoodie/Men/ReformHoodieMenBlackDetail1.webp'
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const availableColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Navy', value: '#1e3a8a' },
    { name: 'Maroon', value: '#800000' },
    { name: 'White', value: '#ffffff' }
  ];

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        // In real implementation, fetch by productId
        // const fetchedProduct = await getProductById(productId);
        setProduct(mockProduct);
        setSelectedColor(availableColors[0].name);
        setSelectedSize(availableSizes[2]); // Default to M
        
        // Check if product is in user's wishlist
        if (user && productId) {
          await checkWishlistStatus();
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId, user]);

  const checkWishlistStatus = async () => {
    if (!user || !productId) return;

    try {
      const { data, error } = await supabase
        .from('user_wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsWishlisted(!!data);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user || !productId) {
      navigate('/login');
      return;
    }

    setIsWishlistLoading(true);
    try {
      if (isWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from('user_wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        setIsWishlisted(false);
      } else {
        // Add to wishlist
        const { error } = await supabase
          .from('user_wishlist')
          .insert([{
            user_id: user.id,
            product_id: productId,
            notes: `Added ${product?.name || 'product'} to wishlist`
          }]);

        if (error) throw error;
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    
    addToCart({
      id: product.id,
      name: `${product.name} - ${selectedColor} - ${selectedSize}`,
      price: product.price,
      quantity: quantity,
      image: productImages[0]
    });
    
    // Show success feedback
    // TODO: Add toast notification
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lvnBg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lvn-maroon"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-lvnBg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-lvn-black mb-4">Product Not Found</h1>
          <button 
            onClick={() => navigate('/shop')}
            className="btn-lvn-primary"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lvnBg py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-lvn-maroon">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/shop')} className="hover:text-lvn-maroon">Shop</button>
          <span>/</span>
          <span className="text-lvn-black">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden aspect-square">
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image Navigation */}
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Zoom Button */}
              <button className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 transition-colors">
                <ZoomIn className="w-5 h-5" />
              </button>

              {/* Low Stock Badge */}
              {product.stock_quantity <= 5 && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Only {product.stock_quantity} left!
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-lvn-maroon' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-lvn-black mb-2">{product.name}</h1>
              
              {/* Rating & Reviews */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-lvn-maroon mb-4">
                £{product.price.toFixed(2)}
              </div>

              {/* Scripture Quote */}
              <div className="bg-lvn-white p-4 rounded-lg border-l-4 border-lvn-maroon mb-6">
                <p className="text-sm italic text-gray-700">
                  "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
                </p>
                <p className="text-xs text-lvn-maroon font-medium mt-1">— Matthew 13:33</p>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">Size</label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-sm text-lvn-maroon hover:underline"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border-2 rounded-lg py-2 px-3 text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-lvn-maroon bg-lvn-maroon text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-3 block">Color: {selectedColor}</label>
              <div className="flex space-x-2">
                {availableColors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-4 transition-colors ${
                      selectedColor === color.name
                        ? 'border-lvn-maroon'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-3 block">Quantity</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock_quantity > 10 ? 'In Stock' : `Only ${product.stock_quantity} left`}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleBuyNow}
                disabled={!selectedSize}
                className="w-full bg-lvn-maroon text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-lvn-maroon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Buy Now - £{(product.price * quantity).toFixed(2)}
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className="flex items-center justify-center space-x-2 border-2 border-lvn-maroon text-lvn-maroon py-3 px-6 rounded-xl font-semibold hover:bg-lvn-maroon hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                
                <button
                  onClick={toggleWishlist}
                  disabled={isWishlistLoading}
                  className={`flex items-center justify-center space-x-2 border-2 py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  <span>{isWishlistLoading ? 'Saving...' : (isWishlisted ? 'In Wishlist' : 'Add to Wishlist')}</span>
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-6 h-6 text-lvn-maroon mx-auto mb-2" />
                <p className="text-xs text-gray-600">Free UK Shipping Over £60</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-lvn-maroon mx-auto mb-2" />
                <p className="text-xs text-gray-600">30-Day Returns</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-lvn-maroon mx-auto mb-2" />
                <p className="text-xs text-gray-600">Secure Checkout</p>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">Share:</span>
              <button className="text-gray-600 hover:text-lvn-maroon transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: `Reviews (${product.reviews})` },
                { id: 'shipping', label: 'Shipping & Returns' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-lvn-maroon text-lvn-maroon'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <h3 className="text-lg font-semibold text-lvn-black mb-4">Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Premium 100% cotton blend</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Soft fleece lining</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Adjustable drawstring hood</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Kangaroo pocket</span>
                      </li>
                      <li className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Reinforced seams</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-lvn-black mb-4">Care Instructions</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Machine wash cold (30°C)</li>
                      <li>• Tumble dry low heat</li>
                      <li>• Do not bleach</li>
                      <li>• Iron inside out if needed</li>
                      <li>• Do not dry clean</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewSystem 
                productId={product.id}
                productName={product.name}
                averageRating={product.rating}
                totalReviews={product.reviews}
                onRatingUpdate={(newRating, totalReviews) => {
                  if (product) {
                    setProduct({
                      ...product,
                      rating: newRating,
                      reviews: totalReviews
                    });
                  }
                }}
              />
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-lvn-black mb-4">Shipping Information</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-lvn-maroon mt-0.5" />
                      <div>
                        <p className="font-medium">Free Standard Shipping</p>
                        <p className="text-sm text-gray-600">Orders over £60 • 3-5 business days</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-lvn-maroon mt-0.5" />
                      <div>
                        <p className="font-medium">Express Shipping - £4.99</p>
                        <p className="text-sm text-gray-600">1-2 business days</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Gift className="w-5 h-5 text-lvn-maroon mt-0.5" />
                      <div>
                        <p className="font-medium">Gift Wrapping Available</p>
                        <p className="text-sm text-gray-600">Beautiful presentation for £2.99</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-lvn-black mb-4">Returns & Exchanges</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <RotateCcw className="w-5 h-5 text-lvn-maroon mt-0.5" />
                      <div>
                        <p className="font-medium">30-Day Returns</p>
                        <p className="text-sm text-gray-600">Free returns on all orders</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-lvn-maroon mt-0.5" />
                      <div>
                        <p className="font-medium">Size Exchange</p>
                        <p className="text-sm text-gray-600">Free size exchanges within 30 days</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-lvn-black mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Related products will be populated here */}
            <div className="text-center py-8 text-gray-500">
              Related products coming soon...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
