-- Create user profiles table with comprehensive user data
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  profile_image TEXT,
  bio TEXT,
  
  -- User preferences as JSONB for flexibility
  preferences JSONB DEFAULT '{
    "newsletter_subscribed": true,
    "size_preferences": [],
    "favorite_colors": [],
    "style_preferences": [],
    "communication_preferences": {
      "email_marketing": true,
      "sms_notifications": false,
      "order_updates": true
    }
  }'::JSONB,
  
  -- Address information
  address JSONB DEFAULT '{
    "street_line1": null,
    "street_line2": null,
    "city": null,
    "postal_code": null,
    "country": "GB"
  }'::JSONB,
  
  -- Loyalty program data
  loyalty JSONB DEFAULT '{
    "points": 0,
    "tier": "Kingdom Seeker",
    "total_spent": 0,
    "orders_count": 0,
    "referrals_count": 0
  }'::JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at);
CREATE INDEX idx_user_profiles_loyalty_tier ON user_profiles((loyalty->>'tier'));
CREATE INDEX idx_user_profiles_loyalty_points ON user_profiles(((loyalty->>'points')::INTEGER));

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create user_browsing_history table for personalization
CREATE TABLE user_browsing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  
  UNIQUE(user_id, product_id, DATE(viewed_at))
);

-- Indexes for browsing history
CREATE INDEX idx_browsing_history_user_id ON user_browsing_history(user_id);
CREATE INDEX idx_browsing_history_product_id ON user_browsing_history(product_id);
CREATE INDEX idx_browsing_history_viewed_at ON user_browsing_history(viewed_at);

-- Enable RLS for browsing history
ALTER TABLE user_browsing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own browsing history" ON user_browsing_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own browsing history" ON user_browsing_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_wishlist table
CREATE TABLE user_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  
  UNIQUE(user_id, product_id)
);

-- Indexes for wishlist
CREATE INDEX idx_wishlist_user_id ON user_wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON user_wishlist(product_id);
CREATE INDEX idx_wishlist_added_at ON user_wishlist(added_at);

-- Enable RLS for wishlist
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist" ON user_wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Create product_reviews table
CREATE TABLE product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID, -- Optional reference to orders table
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  review_text TEXT,
  
  -- Review metadata
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_votes INTEGER DEFAULT 0,
  photos TEXT[], -- Array of photo URLs
  
  -- Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, product_id, order_id)
);

-- Indexes for reviews
CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_reviews_status ON product_reviews(status);
CREATE INDEX idx_reviews_created_at ON product_reviews(created_at);

-- Enable RLS for reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON product_reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own reviews" ON product_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Create loyalty_transactions table for tracking points
CREATE TABLE loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID, -- Optional reference to orders
  
  transaction_type TEXT CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus')) NOT NULL,
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  
  -- Expiration for earned points
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for loyalty transactions
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);
CREATE INDEX idx_loyalty_transactions_expires_at ON loyalty_transactions(expires_at);

-- Enable RLS for loyalty transactions
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create function to update user profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create trigger for product_reviews
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Create view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  up.id,
  up.email,
  COALESCE(order_stats.total_orders, 0) as total_orders,
  COALESCE(order_stats.total_spent, 0) as total_spent,
  COALESCE(review_stats.reviews_count, 0) as reviews_count,
  COALESCE(review_stats.average_rating_given, 0) as average_rating_given,
  COALESCE(wishlist_stats.wishlist_items, 0) as wishlist_items,
  order_stats.last_order_date,
  order_stats.favorite_category,
  (up.loyalty->>'points')::INTEGER as loyalty_points
FROM user_profiles up
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_spent,
    MAX(created_at) as last_order_date,
    MODE() WITHIN GROUP (ORDER BY (items->>0->>'category')) as favorite_category
  FROM orders 
  WHERE status = 'confirmed'
  GROUP BY user_id
) order_stats ON up.id = order_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as reviews_count,
    AVG(rating) as average_rating_given
  FROM product_reviews 
  WHERE status = 'approved'
  GROUP BY user_id
) review_stats ON up.id = review_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as wishlist_items
  FROM user_wishlist
  GROUP BY user_id
) wishlist_stats ON up.id = wishlist_stats.user_id;

-- Grant permissions for the view
GRANT SELECT ON user_stats TO authenticated;

-- Add RLS to the view
ALTER VIEW user_stats SET (security_invoker = on);

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'Comprehensive user profile data including preferences and loyalty information';
COMMENT ON TABLE user_browsing_history IS 'Track user product viewing for personalization';
COMMENT ON TABLE user_wishlist IS 'User saved/favorite products';
COMMENT ON TABLE product_reviews IS 'Product reviews and ratings with moderation';
COMMENT ON TABLE loyalty_transactions IS 'Track loyalty points earned, redeemed, and expired';
COMMENT ON VIEW user_stats IS 'Aggregated user statistics for dashboard display';
