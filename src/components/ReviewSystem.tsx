import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  Camera, 
  Send, 
  Filter,
  ChevronDown,
  ShieldCheck,
  Calendar,
  User,
  Heart,
  Flag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title: string;
  review_text: string;
  verified_purchase: boolean;
  helpful_votes: number;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  user_profile?: {
    first_name?: string;
    last_name?: string;
  };
}

interface ReviewFormData {
  rating: number;
  title: string;
  review_text: string;
  photos: File[];
}

interface ReviewSystemProps {
  productId: string;
  productName: string;
  averageRating?: number;
  totalReviews?: number;
  onRatingUpdate?: (newRating: number, totalReviews: number) => void;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({
  productId,
  productName,
  averageRating = 0,
  totalReviews = 0,
  onRatingUpdate
}) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Review form state
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    review_text: '',
    photos: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    loadReviews();
    if (user) {
      checkUserReview();
    }
  }, [productId, user]);

  const loadReviews = async () => {
    try {
      let query = supabase
        .from('product_reviews')
        .select(`
          *,
          user_profiles:user_id (
            first_name,
            last_name
          )
        `)
        .eq('product_id', productId)
        .eq('status', 'approved');

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        case 'helpful':
          query = query.order('helpful_votes', { ascending: false });
          break;
      }

      // Apply rating filter
      if (filterRating) {
        query = query.eq('rating', filterRating);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserReview(data);
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const submitReview = async () => {
    if (!user || !formData.rating || !formData.title.trim() || !formData.review_text.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload photos if any
      const photoUrls: string[] = [];
      if (formData.photos.length > 0) {
        for (const photo of formData.photos) {
          const fileName = `${user.id}/${productId}/${Date.now()}-${photo.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('review-photos')
            .upload(fileName, photo);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('review-photos')
            .getPublicUrl(fileName);

          photoUrls.push(urlData.publicUrl);
        }
      }

      const reviewData = {
        user_id: user.id,
        product_id: productId,
        rating: formData.rating,
        title: formData.title.trim(),
        review_text: formData.review_text.trim(),
        photos: photoUrls,
        verified_purchase: false, // Would check against orders in production
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('product_reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) throw error;

      setUserReview(data);
      setShowWriteReview(false);
      setFormData({
        rating: 0,
        title: '',
        review_text: '',
        photos: []
      });

      // Reload reviews
      loadReviews();

    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markHelpful = async (reviewId: string) => {
    if (!user) return;

    try {
      // In a real app, you'd track which reviews a user has marked helpful
      const { error } = await supabase
        .from('product_reviews')
        .update({
          helpful_votes: reviews.find(r => r.id === reviewId)!.helpful_votes + 1
        })
        .eq('id', reviewId);

      if (error) throw error;
      loadReviews();
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const renderStars = (rating: number, interactive = false, onHover?: (rating: number) => void, onClick?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && onHover?.(star)}
            onMouseLeave={() => interactive && onHover?.(0)}
            onClick={() => interactive && onClick?.(star)}
            className={`${interactive ? 'hover:scale-110 transition-transform cursor-pointer' : 'cursor-default'}`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= (interactive ? (hoveredRating || formData.rating) : rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const distribution = getRatingDistribution();
  const calculatedAverage = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : averageRating;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Reviews Header */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          {user && !userReview && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="btn-lvn-primary flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Write Review</span>
            </button>
          )}
        </div>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {calculatedAverage.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(calculatedAverage)}
            </div>
            <p className="text-gray-600">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 w-8">{rating}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${reviews.length > 0 ? (distribution[rating as keyof typeof distribution] / reviews.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {distribution[rating as keyof typeof distribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Form */}
      {showWriteReview && user && (
        <div className="border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h4>
          
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center space-x-2">
                {renderStars(formData.rating, true, setHoveredRating, (rating) => setFormData({...formData, rating}))}
                <span className="text-sm text-gray-600 ml-2">
                  {formData.rating > 0 && (
                    ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][formData.rating - 1]
                  )}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Summarize your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                maxLength={100}
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={formData.review_text}
                onChange={(e) => setFormData({...formData, review_text: e.target.value})}
                placeholder="Share details about your experience with this product..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.review_text.length}/1000 characters
              </p>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos (Optional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFormData({...formData, photos: Array.from(e.target.files || [])})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload up to 5 photos (max 5MB each)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                onClick={submitReview}
                disabled={isSubmitting || !formData.rating || !formData.title.trim() || !formData.review_text.trim()}
                className="btn-lvn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
              
              <button
                onClick={() => setShowWriteReview(false)}
                className="btn-lvn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User's Existing Review */}
      {userReview && (
        <div className="border border-lvn-maroon/20 bg-lvn-maroon/5 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-lvn-maroon" />
            <span className="text-sm font-medium text-lvn-maroon">Your Review</span>
            {userReview.status === 'pending' && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Pending Approval
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 mb-2">
            {renderStars(userReview.rating)}
            <span className="font-medium">{userReview.title}</span>
          </div>
          <p className="text-gray-700 text-sm">{userReview.review_text}</p>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="helpful">Most Helpful</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="relative">
            <select
              value={filterRating || ''}
              onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-lvn-maroon"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <span className="text-sm text-gray-600">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border-b border-gray-200 pb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
          <p className="text-gray-600 mb-6">Be the first to share your experience with this product!</p>
          {user && !userReview && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="btn-lvn-primary"
            >
              Write the First Review
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-lvn-maroon/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-lvn-maroon" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {review.user_profile?.first_name || 'Anonymous'}
                      </span>
                      {review.verified_purchase && (
                        <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="text-gray-400 hover:text-gray-600">
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
              </div>

              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  {review.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => markHelpful(review.id)}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful_votes})</span>
                </button>

                <span className="text-gray-300">|</span>

                <button className="text-sm text-gray-600 hover:text-gray-800">
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Reviews */}
      {reviews.length >= 10 && (
        <div className="text-center mt-8">
          <button className="btn-lvn-outline">
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;
