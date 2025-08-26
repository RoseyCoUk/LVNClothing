-- LVN Clothing Database Setup Script
-- Run this in your Supabase SQL Editor to set up the complete database

-- 1. Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  category text,
  tags text[],
  image_url text,
  slug text UNIQUE,
  rating numeric(3,2) DEFAULT 4.5,
  reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 2. Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  value text NOT NULL,
  price numeric(10,2),
  image_url text,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 3. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text,
  customer_email text,
  items jsonb,
  customer_details jsonb,
  created_at timestamptz DEFAULT timezone('utc', now()),
  readable_order_id text,
  amount_total integer,
  user_id uuid,
  status text,
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 4. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  product_name text,
  quantity integer,
  price numeric(10,2),
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 5. Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_order_confirmations boolean DEFAULT true,
  email_newsletter boolean DEFAULT true,
  email_product_recommendations boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  UNIQUE(user_id)
);

-- 6. Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 7. Insert LVN Clothing products
INSERT INTO public.products (id, name, description, price, category, tags, image_url, slug, rating, reviews, created_at, updated_at) VALUES
  (gen_random_uuid(), 'LVN Wings Hoodie', 'Premium hoodie featuring "Under His Wings" design inspired by Psalm 91. Comfortable fit with faith-based messaging.', 44.99, 'apparel', ARRAY['bestseller', 'new'], '/Hoodie/Men/ReformMenHoodieBlack1.webp', 'lvn-wings-hoodie', 4.9, 15, now(), now()),
  (gen_random_uuid(), 'LVN Shelter T-Shirt', 'Classic T-shirt with "Shelter. Strength. Style." design. Psalm 91 inspired messaging on premium cotton.', 29.99, 'apparel', ARRAY['bestseller', 'new'], '/Tshirt/Men/ReformMenTshirtCharcoal1.webp', 'lvn-shelter-tshirt', 4.8, 12, now(), now()),
  (gen_random_uuid(), 'LVN Refuge Cap', 'Adjustable cap with "Psalm 91" design. Perfect for daily wear with faith-based styling.', 24.99, 'apparel', ARRAY['bestseller'], '/Cap/ReformCapBlue1.webp', 'lvn-refuge-cap', 4.7, 10, now(), now()),
  (gen_random_uuid(), 'LVN Abide Tote Bag', 'Eco-friendly tote bag with "Dwell. Abide. LVN." design. Perfect for shopping with faith-inspired messaging.', 19.99, 'gear', ARRAY['bestseller'], '/StickerToteWater/ReformToteBagBlack1.webp', 'lvn-abide-tote', 4.6, 8, now(), now()),
  (gen_random_uuid(), 'LVN Living Water Bottle', 'Reusable water bottle with "Psalm 91" design. Stay hydrated while carrying your faith.', 19.99, 'gear', ARRAY['bestseller'], '/StickerToteWater/ReformWaterBottleWhite1.webp', 'lvn-living-water-bottle', 4.5, 7, now(), now()),
  (gen_random_uuid(), 'LVN Faith Badge Set', 'Set of 5 LVN badges with faith-inspired designs. Wear your beliefs with pride.', 12.99, 'gear', ARRAY['limited'], '/Badge/ReformBadgeSetMain1.webp', 'lvn-faith-badge-set', 4.4, 5, now(), now()),
  (gen_random_uuid(), 'LVN Devotion Mouse Pad', 'Mouse pad with "Under His Wings" design. Keep your faith close while working.', 16.99, 'gear', ARRAY['bestseller'], '/MugMouse/ReformMousePadWhite1.webp', 'lvn-devotion-mouse-pad', 4.3, 4, now(), now()),
  (gen_random_uuid(), 'LVN Scripture Stickers', 'Pack of 10 LVN stickers with Psalm 91 verses. Share your faith wherever you go.', 8.99, 'gear', ARRAY['limited'], '/StickerToteWater/ReformStickersMain1.webp', 'lvn-scripture-stickers', 4.2, 3, now(), now()),
  (gen_random_uuid(), 'LVN Morning Devotion Mug', 'Ceramic mug with "Psalm 91" design. Start your day with His promises.', 14.99, 'gear', ARRAY['bestseller'], '/MugMouse/ReformMug1.webp', 'lvn-morning-devotion-mug', 4.1, 2, now(), now()),
  (gen_random_uuid(), 'LVN Starter Collection', 'Perfect introduction to LVN Clothing. Includes T-shirt, cap, and mug with faith-inspired designs.', 59.99, 'bundle', ARRAY['bundle', 'bestseller'], '/Tshirt/Men/ReformMenTshirtCharcoal1.webp', 'lvn-starter-collection', 5.0, 10, now(), now()),
  (gen_random_uuid(), 'LVN Champion Collection', 'Complete LVN look with hoodie, cap, and tote bag. Premium faith-inspired streetwear.', 94.99, 'bundle', ARRAY['bundle', 'bestseller'], '/Hoodie/Men/ReformMenHoodieBlack1.webp', 'lvn-champion-collection', 5.0, 8, now(), now()),
  (gen_random_uuid(), 'LVN Faith Warrior Collection', 'Complete LVN collection with hoodie, T-shirt, cap, tote bag, and more. Ultimate faith-inspired wardrobe.', 134.99, 'bundle', ARRAY['bundle', 'limited'], '/Hoodie/Men/ReformMenHoodieBlack1.webp', 'lvn-faith-warrior-collection', 5.0, 6, now(), now());

-- 8. Enable Row Level Security (RLS) on tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for public read access to products
CREATE POLICY "Public read access to products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Public read access to product variants" ON public.product_variants
  FOR SELECT USING (true);

-- 10. Create RLS policies for authenticated users
CREATE POLICY "Users can manage their own orders" ON public.orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own order items" ON public.order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 12. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 13. Create triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'LVN Clothing database setup completed successfully!' as status;
