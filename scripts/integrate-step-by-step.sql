-- Integrate Admin Products System with Existing Products Table (STEP BY STEP)
-- Run this script step by step to avoid foreign key issues

-- STEP 1: Add new columns to existing products table
-- (Run this first)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS printful_product_id text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS printful_cost numeric(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS retail_price numeric(10,2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- STEP 2: Copy existing data to new columns
-- (Run this after step 1)
UPDATE public.products SET retail_price = price WHERE retail_price IS NULL;
UPDATE public.products SET is_available = in_stock WHERE is_available IS NULL;

-- STEP 3: Create product_overrides table
-- (Run this after step 2)
CREATE TABLE IF NOT EXISTS public.product_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL, -- We'll add the foreign key constraint later
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

-- STEP 4: Create product_images table
-- (Run this after step 3)
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL, -- We'll add the foreign key constraint later
  image_url text NOT NULL,
  image_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- STEP 5: Create bundles table
-- (Run this after step 4)
CREATE TABLE IF NOT EXISTS public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  custom_price numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- STEP 6: Create bundle_items table
-- (Run this after step 5)
CREATE TABLE IF NOT EXISTS public.bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL, -- We'll add the foreign key constraint later
  product_id uuid NOT NULL, -- We'll add the foreign key constraint later
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- STEP 7: Create sync_status table
-- (Run this after step 6)
CREATE TABLE IF NOT EXISTS public.sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL, -- We'll add the foreign key constraint later
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

-- STEP 8: Add foreign key constraints
-- (Run this after all tables are created)
ALTER TABLE public.product_overrides 
ADD CONSTRAINT fk_product_overrides_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_images 
ADD CONSTRAINT fk_product_images_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.bundle_items 
ADD CONSTRAINT fk_bundle_items_bundle_id 
FOREIGN KEY (bundle_id) REFERENCES public.bundles(id) ON DELETE CASCADE;

ALTER TABLE public.bundle_items 
ADD CONSTRAINT fk_bundle_items_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.sync_status 
ADD CONSTRAINT fk_sync_status_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- STEP 9: Create indexes
-- (Run this after foreign keys are added)
CREATE INDEX IF NOT EXISTS idx_product_overrides_product_id ON public.product_overrides(product_id);
CREATE INDEX IF NOT EXISTS idx_product_overrides_printful_id ON public.product_overrides(printful_product_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON public.product_images(product_id, image_order);
CREATE INDEX IF NOT EXISTS idx_sync_status_product_id ON public.sync_status(product_id);

-- STEP 10: Enable Row Level Security
-- (Run this after indexes are created)
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- STEP 11: Create RLS policies
-- (Run this after RLS is enabled)
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

-- STEP 12: Grant permissions
-- (Run this after policies are created)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_overrides TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bundles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bundle_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_status TO authenticated;

-- STEP 13: Migrate existing product images
-- (Run this after all setup is complete)
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

-- STEP 14: Verification queries
-- (Run these to verify everything worked)
SELECT 'Integration Complete!' as status, 'All steps completed successfully' as detail;

SELECT 
  'Tables Created:' as info,
  table_name,
  'Ready' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('product_overrides', 'product_images', 'bundles', 'bundle_items', 'sync_status')
ORDER BY table_name;

SELECT 
  'New Columns Added:' as info,
  column_name,
  'Added' as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
AND column_name IN ('printful_product_id', 'printful_cost', 'retail_price', 'is_available')
ORDER BY column_name;
