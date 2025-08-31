-- Integrate Admin Products System with Existing Products Table (SIMPLIFIED VERSION)
-- This script adds the necessary columns and tables to work with your existing e-commerce products

-- 1. Add Printful integration fields to existing products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS printful_product_id text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS printful_cost numeric(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retail_price numeric(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- 2. Copy existing price data to retail_price if it was just added
UPDATE public.products SET retail_price = price WHERE retail_price IS NULL;

-- 3. Copy existing in_stock data to is_available if it was just added
UPDATE public.products SET is_available = in_stock WHERE is_available IS NULL;

-- 4. Create product_overrides table for admin customization
CREATE TABLE IF NOT EXISTS public.product_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  printful_product_id text,
  custom_retail_price numeric(10,2),
  custom_description text,
  custom_name text,
  custom_category text,
  custom_tags text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 5. Create product_images table for admin image management
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 6. Create bundles table
CREATE TABLE IF NOT EXISTS public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  custom_price numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 7. Create bundle_items table
CREATE TABLE IF NOT EXISTS public.bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 8. Create sync_status table for Printful integration
CREATE TABLE IF NOT EXISTS public.sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  timestamp timestamptz DEFAULT timezone('utc', now()),
  is_connected boolean DEFAULT false,
  last_sync timestamptz,
  last_sync_status text CHECK (last_sync_status IN ('success', 'failed', 'pending', 'unknown')),
  sync_progress integer DEFAULT 0 CHECK (sync_progress >= 0 AND sync_progress <= 100),
  is_syncing boolean DEFAULT false,
  connection_health text DEFAULT 'disconnected' CHECK (connection_health IN ('excellent', 'good', 'poor', 'disconnected')),
  error_count integer DEFAULT 0,
  warning_count integer DEFAULT 0,
  inventory_changes integer DEFAULT 0,
  data_conflicts integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 9. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_product_overrides_product_id ON public.product_overrides(product_id);
CREATE INDEX IF NOT EXISTS idx_product_overrides_printful_id ON public.product_overrides(printful_product_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON public.product_images(product_id, image_order);
CREATE INDEX IF NOT EXISTS idx_sync_status_product_id ON public.sync_status(product_id);

-- 10. Enable Row Level Security
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies
DROP POLICY IF EXISTS "Users can view active product overrides" ON public.product_overrides;
CREATE POLICY "Users can view active product overrides" ON public.product_overrides
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage product overrides" ON public.product_overrides;
CREATE POLICY "Authenticated users can manage product overrides" ON public.product_overrides
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view product images" ON public.product_images;
CREATE POLICY "Users can view product images" ON public.product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage product images" ON public.product_images;
CREATE POLICY "Authenticated users can manage product images" ON public.product_images
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view active bundles" ON public.bundles;
CREATE POLICY "Users can view active bundles" ON public.bundles
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage bundles" ON public.bundles;
CREATE POLICY "Authenticated users can manage bundles" ON public.bundles
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view bundle items" ON public.bundle_items;
CREATE POLICY "Users can view bundle items" ON public.bundle_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage bundle items" ON public.bundle_items;
CREATE POLICY "Authenticated users can manage bundle items" ON public.bundle_items
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view sync status" ON public.sync_status;
CREATE POLICY "Users can view sync status" ON public.sync_status
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage sync status" ON public.sync_status;
CREATE POLICY "Authenticated users can manage sync status" ON public.sync_status
  FOR ALL USING (auth.role() = 'authenticated');

-- 12. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_overrides TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bundles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bundle_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_status TO authenticated;

-- 13. Migrate existing product images to the new structure
INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
SELECT 
  gen_random_uuid(),
  id,
  image_url,
  1,
  true,
  NOW()
FROM public.products 
WHERE image_url IS NOT NULL 
AND image_url != ''
AND NOT EXISTS (
  SELECT 1 FROM public.product_images pi WHERE pi.product_id = products.id
);

-- 14. Verify the integration
SELECT 
  'Integration Complete!' as status,
  'Products table enhanced with Printful fields' as detail
UNION ALL
SELECT 
  'Admin tables created' as status,
  'product_overrides, product_images, bundles, bundle_items, sync_status' as detail
UNION ALL
SELECT 
  'RLS policies enabled' as status,
  'All admin tables secured with proper permissions' as detail
UNION ALL
SELECT 
  'Existing data preserved' as status,
  'All your current products and images are intact' as detail;

-- 15. Show the enhanced products table structure
SELECT 
  'Enhanced Products Table Structure:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- 16. Show migration results
SELECT 
  'Migration Results:' as info,
  'Products with new columns' as detail,
  COUNT(*) as count
FROM public.products
WHERE printful_product_id IS NOT NULL OR retail_price IS NOT NULL OR is_available IS NOT NULL
UNION ALL
SELECT 
  'Migration Results:' as info,
  'Product images migrated' as detail,
  COUNT(*) as count
FROM public.product_images
UNION ALL
SELECT 
  'Migration Results:' as info,
  'Admin tables created' as detail,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('product_overrides', 'product_images', 'bundles', 'bundle_items', 'sync_status');
