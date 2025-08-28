import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Share2, Eye, Star, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Product } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface WishlistItem {
  id: string;
  product_id: string;
  added_at: string;
  notes?: string;
  product: Product;
}

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWishlist();
    }
  }, [user]);

  const loadWishlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_wishlist')
        .select(`
          id,
          product_id,
          added_at,
          notes,
          products:product_id (
            id,
            name,
            description,
            price,
            image_url,
            category,
            rating,
            reviews,
            in_stock
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform data to match our interface
      const transformedData = data?.map(item => ({
        id: item.id,
        product_id: item.product_id,
        added_at: item.added_at,
        notes: item.notes,
        product: item.products as Product
      })) || [];

      setWishlistItems(transformedData);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    try {
      const { error } = await supabase
        .from('user_wishlist')
        .delete()
        .eq('id', wishlistItemId);

      if (error) throw error;

      setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCartFromWishlist = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: 1
    });
  };

  const moveAllToCart = () => {
    wishlistItems.forEach(item => {
      if (item.product.in_stock) {
        addToCartFromWishlist(item.product);
      }
    });
  };

  const shareWishlist = async () => {
    setIsSharing(true);
    try {
      const shareText = `Check out my LVN Clothing wishlist! Premium Christian streetwear inspired by Matthew 13:33.`;
      const shareUrl = `${window.location.origin}/wishlist/${user?.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'My LVN Clothing Wishlist',
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Wishlist link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing wishlist:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-lvnBg py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your wishlist.</p>
            <button 
              onClick={() => navigate('/login')}
              className="btn-lvn-primary"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lvnBg py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lvnBg py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="w-8 h-8 text-red-500 mr-3" />
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          <div className="flex space-x-3">
            {wishlistItems.length > 0 && (
              <>
                <button
                  onClick={shareWishlist}
                  disabled={isSharing}
                  className="btn-lvn-outline flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isSharing ? 'Sharing...' : 'Share List'}</span>
                </button>

                <button
                  onClick={moveAllToCart}
                  className="btn-lvn-primary flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add All to Cart</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Scripture Quote */}
        <div className="bg-gradient-to-r from-lvn-maroon to-red-800 text-white p-6 rounded-lg mb-8">
          <div className="text-center">
            <p className="italic text-lg mb-2">
              "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
            </p>
            <p className="text-sm text-white/80">Matthew 13:33</p>
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your Wishlist is Empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your collection of Kingdom-inspired streetwear. Save your favorite pieces for later!
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="btn-lvn-primary"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    <button
                      onClick={() => navigate(`/product/${item.product.id}`)}
                      className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => addToCartFromWishlist(item.product)}
                      disabled={!item.product.in_stock}
                      className="bg-lvn-maroon text-white p-2 rounded-full hover:bg-lvn-maroon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stock Status */}
                  {!item.product.in_stock && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 leading-tight">
                      {item.product.name}
                    </h3>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-5 h-5 fill-current text-red-500" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.product.description}
                  </p>

                  {/* Rating and Reviews */}
                  {item.product.rating && (
                    <div className="flex items-center space-x-1 mb-3">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (item.product.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({item.product.reviews || 0})
                      </span>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-lvn-maroon">
                        £{item.product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.product.category}
                      </span>
                    </div>
                  </div>

                  {/* Added Date */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Added {new Date(item.added_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-700 italic">
                        "{item.notes}"
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => addToCartFromWishlist(item.product)}
                    disabled={!item.product.in_stock}
                    className="w-full mt-4 bg-lvn-maroon text-white py-2 px-4 rounded-lg hover:bg-lvn-maroon/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {item.product.in_stock ? (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Out of Stock</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {wishlistItems.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 text-center">
                Personalized recommendations based on your wishlist coming soon!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
