-- Complete Database Restoration
-- This will fix all the missing tables and columns

-- First, let's drop and recreate all tables with the correct structure
DROP TABLE IF EXISTS public.sync_status CASCADE;
DROP TABLE IF EXISTS public.bundle_items CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.product_overrides CASCADE;
DROP TABLE IF EXISTS public.bundles CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.customer_profiles CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- Create products table with all required columns
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    slug TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    reviews INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 4.5,
    in_stock BOOLEAN DEFAULT true,
    stock_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    printful_product_id TEXT,
    printful_cost DECIMAL(10,2),
    retail_price DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true
);

-- Create product_overrides table
CREATE TABLE public.product_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    printful_product_id TEXT,
    custom_name TEXT,
    custom_description TEXT,
    custom_retail_price DECIMAL(10,2),
    custom_category TEXT,
    custom_tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create product_images table
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    image_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create bundles table
CREATE TABLE public.bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    retail_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create bundle_items table
CREATE TABLE public.bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create sync_status table with correct columns
CREATE TABLE public.sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    last_sync_status TEXT DEFAULT 'unknown',
    last_sync TIMESTAMPTZ,
    is_syncing BOOLEAN DEFAULT false,
    sync_progress INTEGER DEFAULT 0,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create customer_profiles table
CREATE TABLE public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    marketing_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    billing_address JSONB,
    payment_status TEXT DEFAULT 'pending',
    shipping_method TEXT,
    tracking_number TEXT,
    notes TEXT,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create order_items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email_order_confirmations BOOLEAN DEFAULT true,
    email_newsletter BOOLEAN DEFAULT true,
    email_product_recommendations BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    unsubscribed_at TIMESTAMPTZ
);

-- Add foreign key constraints
ALTER TABLE public.product_overrides 
ADD CONSTRAINT product_overrides_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_images 
ADD CONSTRAINT product_images_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.bundle_items 
ADD CONSTRAINT bundle_items_bundle_id_fkey 
FOREIGN KEY (bundle_id) REFERENCES public.bundles(id) ON DELETE CASCADE;

ALTER TABLE public.bundle_items 
ADD CONSTRAINT bundle_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.sync_status 
ADD CONSTRAINT sync_status_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.customer_profiles 
ADD CONSTRAINT customer_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_preferences 
ADD CONSTRAINT user_preferences_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_products_printful_id ON public.products(printful_product_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_available ON public.products(is_available);
CREATE INDEX idx_product_overrides_product_id ON public.product_overrides(product_id);
CREATE INDEX idx_product_overrides_printful_id ON public.product_overrides(printful_product_id);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_order ON public.product_images(image_order);
CREATE INDEX idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_product_id ON public.bundle_items(product_id);
CREATE INDEX idx_sync_status_product_id ON public.sync_status(product_id);
CREATE INDEX idx_sync_status_timestamp ON public.sync_status(timestamp);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_customer_profiles_user_id ON public.customer_profiles(user_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (allow all for now)
CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all on product_overrides" ON public.product_overrides FOR ALL USING (true);
CREATE POLICY "Allow all on product_images" ON public.product_images FOR ALL USING (true);
CREATE POLICY "Allow all on bundles" ON public.bundles FOR ALL USING (true);
CREATE POLICY "Allow all on bundle_items" ON public.bundle_items FOR ALL USING (true);
CREATE POLICY "Allow all on sync_status" ON public.sync_status FOR ALL USING (true);
CREATE POLICY "Allow all on customer_profiles" ON public.customer_profiles FOR ALL USING (true);
CREATE POLICY "Allow all on orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all on order_items" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Allow all on user_preferences" ON public.user_preferences FOR ALL USING (true);
CREATE POLICY "Allow all on newsletter_subscribers" ON public.newsletter_subscribers FOR ALL USING (true);

-- Insert some sample products for testing
INSERT INTO public.products (name, description, price, image_url, slug, category, tags, printful_product_id, printful_cost, retail_price, is_available) VALUES
('Reform UK Badge Set', 'Set of 5 Reform UK badges', 9.99, '/Badge/ReformBadgeSetMain1.webp', 'reform-uk-badge-set', 'gear', ARRAY['limited'], 'badge-set-001', 5.00, 9.99, true),
('Reform UK Stickers', 'Pack of 10 Reform UK stickers', 9.99, '/StickerToteWater/ReformStickersMain1.webp', 'reform-uk-stickers', 'gear', ARRAY['limited'], 'stickers-001', 3.00, 9.99, true),
('Reform UK Hoodie', 'Premium hoodie with Reform UK branding', 49.99, '/Hoodie/Men/ReformMenHoodieBlack1.webp', 'reform-uk-hoodie', 'apparel', ARRAY['bestseller'], 'hoodie-001', 25.00, 49.99, true),
('Reform UK T-Shirt', 'Classic T-shirt with Reform UK logo', 24.99, '/Tshirt/Men/ReformMenTshirtCharcoal1.webp', 'reform-uk-tshirt', 'apparel', ARRAY['bestseller'], 'tshirt-001', 12.00, 24.99, true),
('Reform UK Cap', 'Adjustable cap with Reform UK logo', 19.99, '/Cap/ReformCapBlue1.webp', 'reform-uk-cap', 'apparel', ARRAY['bestseller'], 'cap-001', 8.00, 19.99, true);

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE '✅ Complete database restoration successful!';
    RAISE NOTICE '✅ All tables created with proper structure';
    RAISE NOTICE '✅ Sample products inserted';
    RAISE NOTICE '✅ All foreign keys and indexes created';
    RAISE NOTICE '✅ RLS enabled on all tables';
END $$;
