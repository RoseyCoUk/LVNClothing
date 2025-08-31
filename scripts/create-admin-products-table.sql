-- Create Admin Products Management System (FRESH APPROACH)
-- Instead of modifying your existing products table, we'll create a new admin table that links to it

-- STEP 1: Create admin_products table that links to your existing products
CREATE TABLE IF NOT EXISTS public.admin_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_product_id uuid NOT NULL, -- This links to your existing products table
  printful_product_id text,
  printful_cost numeric(10,2),
  retail_price numeric(10,2),
  is_available boolean DEFAULT true,
  custom_name text,
  custom_description text,
  custom_category text,
  custom_tags text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- STEP 2: Create product_images table for admin image management
CREATE TABLE IF NOT EXISTS public.admin_product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_product_id uuid NOT NULL,
  image_url text NOT NULL,
  image_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- STEP 3: Create bundles table
CREATE TABLE IF NOT EXISTS public.admin_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  custom_price numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- STEP 4: Create bundle_items table
CREATE TABLE IF NOT EXISTS public.admin_bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL,
  admin_product_id uuid NOT NULL,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- STEP 5: Create sync_status table
CREATE TABLE IF NOT EXISTS public.admin_sync_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_product_id uuid NOT NULL,
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

-- STEP 6: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_admin_products_original_id ON public.admin_products(original_product_id);
CREATE INDEX IF NOT EXISTS idx_admin_products_printful_id ON public.admin_products(printful_product_id);
CREATE INDEX IF NOT EXISTS idx_admin_bundle_items_bundle_id ON public.admin_bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_admin_product_images_admin_id ON public.admin_product_images(admin_product_id);
CREATE INDEX IF NOT EXISTS idx_admin_sync_status_admin_id ON public.admin_sync_status(admin_product_id);

-- STEP 7: Enable Row Level Security
ALTER TABLE public.admin_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sync_status ENABLE ROW LEVEL SECURITY;

-- STEP 8: Create RLS policies
DROP POLICY IF EXISTS "Users can view active admin products" ON public.admin_products;
CREATE POLICY "Users can view active admin products" ON public.admin_products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage admin products" ON public.admin_products;
CREATE POLICY "Authenticated users can manage admin products" ON public.admin_products
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view admin product images" ON public.admin_product_images;
CREATE POLICY "Users can view admin product images" ON public.admin_product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage admin product images" ON public.admin_product_images;
CREATE POLICY "Authenticated users can manage admin product images" ON public.admin_product_images
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view active admin bundles" ON public.admin_bundles;
CREATE POLICY "Users can view active admin bundles" ON public.admin_bundles
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage admin bundles" ON public.admin_bundles;
CREATE POLICY "Authenticated users can manage admin bundles" ON public.admin_bundles
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view admin bundle items" ON public.admin_bundle_items;
CREATE POLICY "Users can view admin bundle items" ON public.admin_bundle_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage admin bundle items" ON public.admin_bundle_items;
CREATE POLICY "Authenticated users can manage admin bundle items" ON public.admin_bundle_items
  FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can view admin sync status" ON public.admin_sync_status;
CREATE POLICY "Users can view admin sync status" ON public.admin_sync_status
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage admin sync status" ON public.admin_sync_status;
CREATE POLICY "Authenticated users can manage admin sync status" ON public.admin_sync_status
  FOR ALL USING (auth.role() = 'authenticated');

-- STEP 9: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_bundles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_bundle_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_sync_status TO authenticated;

-- STEP 10: Populate admin_products with your existing products
INSERT INTO public.admin_products (
  original_product_id, 
  retail_price, 
  is_available, 
  custom_name, 
  custom_description, 
  custom_category, 
  custom_tags
)
SELECT 
  id,           -- This is the ID from your existing products table
  price,        -- Use existing price
  in_stock,     -- Use existing in_stock
  name,         -- Use existing name
  description,  -- Use existing description
  category,     -- Use existing category
  tags          -- Use existing tags
FROM public.products
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_products ap WHERE ap.original_product_id = products.id
);

-- STEP 11: Verification
SELECT 'Admin Products System Created!' as status, 'All tables created successfully' as detail;

SELECT 
  'Tables Created:' as info,
  table_name,
  'Ready' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_products', 'admin_product_images', 'admin_bundles', 'admin_bundle_items', 'admin_sync_status')
ORDER BY table_name;

SELECT 
  'Products Linked:' as info,
  COUNT(*) as count,
  'Existing products linked to admin system' as detail
FROM public.admin_products;
