import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Eye, 
  ShoppingCart, 
  Heart, 
  Star, 
  Clock,
  Zap,
  Target,
  Brain,
  Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { Product } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface UserBehavior {
  recently_viewed: Product[];
  browsing_categories: string[];
  price_preferences: {
    min: number;
    max: number;
    average: number;
  };
  style_preferences: string[];
  purchase_history: any[];
}

interface RecommendationGroup {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  products: Product[];
  reasoning: string;
  confidence: number;
}

interface PersonalizationEngineProps {
  className?: string;
  maxRecommendations?: number;
  showReasoningCards?: boolean;
}

const PersonalizationEngine: React.FC<PersonalizationEngineProps> = ({
  className = "",
  maxRecommendations = 12,
  showReasoningCards = true
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRecommendationType, setActiveRecommendationType] = useState<'all' | 'trending' | 'similar' | 'new'>('all');

  // Mock products for demonstration
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Kingdom Leaven Hoodie',
      description: 'Premium Christian hoodie inspired by Matthew 13:33',
      price: 89.99,
      image_url: '/Hoodie/Men/ReformHoodieMenBlackFront1.webp',
      category: 'Hoodies',
      stock_quantity: 15,
      tags: ['hoodie', 'men', 'premium', 'christian'],
      slug: 'kingdom-leaven-hoodie',
      reviews: 24,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Faith Warrior T-Shirt',
      description: 'Comfortable cotton tee with bold Christian messaging',
      price: 34.99,
      image_url: '/Tshirt/Men/ReformTshirtMenBlackFront1.webp',
      category: 'T-Shirts',
      stock_quantity: 25,
      tags: ['tshirt', 'men', 'cotton', 'faith'],
      slug: 'faith-warrior-tshirt',
      reviews: 18,
      rating: 4.6
    },
    {
      id: '3',
      name: 'Gospel Guardian Cap',
      description: 'Stylish cap for everyday faith expression',
      price: 29.99,
      image_url: '/Cap/ReformCapBlackFront1.webp',
      category: 'Caps',
      stock_quantity: 30,
      tags: ['cap', 'accessory', 'style'],
      slug: 'gospel-guardian-cap',
      reviews: 12,
      rating: 4.4
    },
    {
      id: '4',
      name: 'Kingdom Starter Bundle',
      description: 'Perfect introduction to LVN premium Christian streetwear',
      price: 149.99,
      image_url: '/starterbundle.png',
      category: 'Bundles',
      stock_quantity: 10,
      tags: ['bundle', 'starter', 'value'],
      slug: 'kingdom-starter-bundle',
      reviews: 8,
      rating: 4.9
    },
    {
      id: '5',
      name: 'Psalm 91 Protection Hoodie',
      description: 'Heavyweight hoodie with powerful scripture verse',
      price: 94.99,
      image_url: '/Hoodie/Women/ReformHoodieWomenBlackFront1.webp',
      category: 'Hoodies',
      stock_quantity: 12,
      tags: ['hoodie', 'women', 'scripture', 'protection'],
      slug: 'psalm-91-protection-hoodie',
      reviews: 16,
      rating: 4.7
    },
    {
      id: '6',
      name: 'Grace & Truth Tote Bag',
      description: 'Sustainable tote bag for carrying your faith',
      price: 24.99,
      image_url: '/StickerToteWater/ReformToteBagBlack1.webp',
      category: 'Accessories',
      stock_quantity: 20,
      tags: ['tote', 'sustainable', 'accessory'],
      slug: 'grace-truth-tote-bag',
      reviews: 9,
      rating: 4.3
    }
  ];

  useEffect(() => {
    if (user) {
      loadUserBehavior();
      generateRecommendations();
    } else {
      generateGuestRecommendations();
    }
  }, [user]);

  const loadUserBehavior = async () => {
    if (!user) return;

    try {
      // Load browsing history
      const { data: browsingData } = await supabase
        .from('user_browsing_history')
        .select('*, products(*)')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10);

      // Load user preferences
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      // Simulate user behavior analysis
      const behavior: UserBehavior = {
        recently_viewed: browsingData?.map(item => item.products).filter(Boolean) || [],
        browsing_categories: ['Hoodies', 'T-Shirts'],
        price_preferences: {
          min: 25,
          max: 100,
          average: 65
        },
        style_preferences: profileData?.preferences?.style_preferences || ['streetwear', 'minimalist'],
        purchase_history: []
      };

      setUserBehavior(behavior);
    } catch (error) {
      console.error('Error loading user behavior:', error);
    }
  };

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      // Simulate AI-powered recommendation generation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const recommendationGroups: RecommendationGroup[] = [
        {
          title: "Because you viewed hoodies",
          subtitle: "Similar premium Christian streetwear",
          icon: Eye,
          products: mockProducts.filter(p => p.category === 'Hoodies').slice(0, 3),
          reasoning: "Based on your recent browsing of hoodie products, these items match your style preferences and price range.",
          confidence: 0.92
        },
        {
          title: "Trending in your community",
          subtitle: "Popular with other Kingdom members",
          icon: TrendingUp,
          products: mockProducts.filter(p => p.rating && p.rating > 4.5).slice(0, 3),
          reasoning: "These products are currently popular among users with similar faith-based style preferences.",
          confidence: 0.85
        },
        {
          title: "Complete your faith wardrobe",
          subtitle: "Curated for your style",
          icon: Target,
          products: mockProducts.filter(p => p.category !== 'Hoodies').slice(0, 3),
          reasoning: "Add variety to your Christian streetwear collection with these complementary pieces.",
          confidence: 0.78
        },
        {
          title: "New Kingdom arrivals",
          subtitle: "Fresh designs you'll love",
          icon: Zap,
          products: mockProducts.slice(0, 3),
          reasoning: "Latest additions to our collection, matching your preferences for premium Christian fashion.",
          confidence: 0.71
        }
      ];

      setRecommendations(recommendationGroups);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateGuestRecommendations = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const guestRecommendations: RecommendationGroup[] = [
        {
          title: "Start your Kingdom journey",
          subtitle: "Popular first purchases",
          icon: Star,
          products: mockProducts.filter(p => p.category === 'Bundles' || p.rating && p.rating > 4.7).slice(0, 4),
          reasoning: "Perfect introduction to premium Christian streetwear - these are our most popular items among new customers.",
          confidence: 0.88
        },
        {
          title: "Trending now",
          subtitle: "What everyone's talking about",
          icon: TrendingUp,
          products: mockProducts.filter(p => p.reviews && p.reviews > 15).slice(0, 4),
          reasoning: "Most popular items this month among our community of faith-driven customers.",
          confidence: 0.82
        }
      ];

      setRecommendations(guestRecommendations);
    } catch (error) {
      console.error('Error generating guest recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackProductView = async (productId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('user_browsing_history')
        .upsert({
          user_id: user.id,
          product_id: productId,
          viewed_at: new Date().toISOString(),
          duration_seconds: Math.floor(Math.random() * 120) + 30
        });
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  const handleProductClick = (product: Product) => {
    trackProductView(product.id);
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      quantity: 1
    });
  };

  const filteredRecommendations = recommendations.filter(group => {
    if (activeRecommendationType === 'all') return true;
    if (activeRecommendationType === 'trending') return group.title.toLowerCase().includes('trending');
    if (activeRecommendationType === 'similar') return group.title.toLowerCase().includes('viewed') || group.title.toLowerCase().includes('similar');
    if (activeRecommendationType === 'new') return group.title.toLowerCase().includes('new');
    return true;
  });

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="w-6 h-6 text-lvn-maroon mr-3" />
            {user ? 'Recommended for You' : 'Discover LVN Clothing'}
          </h2>
          <p className="text-gray-600 mt-1">
            {user 
              ? 'Curated based on your preferences and Kingdom style'
              : 'Premium Christian streetwear inspired by Matthew 13:33'
            }
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'trending', label: 'Trending' },
            { id: 'similar', label: 'Similar' },
            { id: 'new', label: 'New' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRecommendationType(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeRecommendationType === tab.id
                  ? 'bg-white text-lvn-maroon shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Groups */}
      <div className="space-y-12">
        {filteredRecommendations.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Group Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-lvn-maroon/10 p-2 rounded-lg">
                  <group.icon className="w-5 h-5 text-lvn-maroon" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                  <p className="text-sm text-gray-600">{group.subtitle}</p>
                </div>
              </div>

              {showReasoningCards && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>{Math.round(group.confidence * 100)}% match</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reasoning Card */}
            {showReasoningCards && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Why we recommend these</h4>
                    <p className="text-sm text-blue-800">{group.reasoning}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {group.products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist functionality would go here
                        }}
                        className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        title="Add to Wishlist"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>

                    {/* AI Badge */}
                    <div className="absolute top-3 left-3 bg-lvn-maroon text-white text-xs px-2 py-1 rounded font-medium">
                      AI Pick
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {product.name}
                    </h4>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-lvn-maroon">
                        £{product.price.toFixed(2)}
                      </span>
                      
                      {product.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      {user && userBehavior && (
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Your Style Profile</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Favorite Categories</h4>
              <div className="flex flex-wrap gap-2">
                {userBehavior.browsing_categories.map((category) => (
                  <span key={category} className="bg-white/20 px-3 py-1 rounded text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Price Preference</h4>
              <p className="text-sm opacity-90">
                Typically shops £{userBehavior.price_preferences.min} - £{userBehavior.price_preferences.max}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Style Preferences</h4>
              <div className="flex flex-wrap gap-2">
                {userBehavior.style_preferences.map((style) => (
                  <span key={style} className="bg-white/20 px-3 py-1 rounded text-sm capitalize">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scripture */}
      <div className="mt-12 bg-gradient-to-r from-lvn-maroon to-red-800 text-white p-6 rounded-lg text-center">
        <p className="italic text-lg mb-2">
          "The kingdom of heaven is like leaven that a woman took and hid in three measures of flour, till it was all leavened."
        </p>
        <p className="text-sm text-white/80">Matthew 13:33</p>
      </div>
    </div>
  );
};

export default PersonalizationEngine;
