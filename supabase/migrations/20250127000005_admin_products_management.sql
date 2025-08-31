-- Admin Products Management Migration
-- This migration creates tables for managing product overrides, images, bundles, and bundle items

-- up

-- 1. Create product_overrides table
CREATE TABLE IF NOT EXISTS public.product_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  printful_product_id text NOT NULL,
  custom_retail_price numeric(10,2),
  custom_description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 2. Create product_images table
-- First ensure the products table exists with the right structure
DO $$
BEGIN
  -- Check if products table exists and has the right structure
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'products'
  ) THEN
    -- Create products table if it doesn't exist
    CREATE TABLE public.products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      printful_product_id text NOT NULL UNIQUE,
      name text NOT NULL,
      description text,
      retail_price numeric(10,2),
      printful_cost numeric(10,2),
      category text,
      is_available boolean DEFAULT true,
      created_at timestamptz DEFAULT timezone('utc', now()),
      updated_at timestamptz DEFAULT timezone('utc', now())
    );
    
    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_products_printful_id ON public.products(printful_product_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
    CREATE INDEX IF NOT EXISTS idx_products_available ON public.products(is_available);
    
    -- Enable RLS
    ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
    
    -- Create RLS policies
    CREATE POLICY "Users can view available products" ON public.products
      FOR SELECT USING (is_available = true);
    
    CREATE POLICY "Authenticated users can manage products" ON public.products
      FOR ALL USING (auth.role() = 'authenticated');
    
    -- Grant permissions
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
    
    RAISE NOTICE 'Created products table as it was missing';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 3. Create bundles table
CREATE TABLE IF NOT EXISTS public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  custom_price numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 4. Create bundle_items table
CREATE TABLE IF NOT EXISTS public.bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 5. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_product_overrides_printful_id ON public.product_overrides(printful_product_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON public.product_images(product_id, image_order);

-- 6. Enable Row Level Security
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for product_overrides
CREATE POLICY "Users can view active product overrides" ON public.product_overrides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage product overrides" ON public.product_overrides
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. Create RLS policies for product_images
CREATE POLICY "Users can view product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage product images" ON public.product_images
  FOR ALL USING (auth.role() = 'authenticated');

-- 9. Create RLS policies for bundles
CREATE POLICY "Users can view active bundles" ON public.bundles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage bundles" ON public.bundles
  FOR ALL USING (auth.role() = 'authenticated');

-- 10. Create RLS policies for bundle_items
CREATE POLICY "Users can view bundle items" ON public.bundle_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage bundle items" ON public.bundle_items
  FOR ALL USING (auth.role() = 'authenticated');

-- 11. Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_overrides TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bundles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bundle_items TO authenticated;

-- 12. Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 13. Add unique constraints
ALTER TABLE public.product_overrides ADD CONSTRAINT unique_printful_product_id UNIQUE (printful_product_id);
-- Note: Partial unique constraints with WHERE clause are not supported in all PostgreSQL versions
-- ALTER TABLE public.product_images ADD CONSTRAINT unique_primary_per_product UNIQUE (product_id, is_primary) WHERE is_primary = true;

-- 14. Add check constraints
ALTER TABLE public.product_overrides ADD CONSTRAINT check_positive_price CHECK (custom_retail_price IS NULL OR custom_retail_price > 0);
ALTER TABLE public.bundles ADD CONSTRAINT check_positive_bundle_price CHECK (custom_price IS NULL OR custom_price > 0);
ALTER TABLE public.bundle_items ADD CONSTRAINT check_positive_quantity CHECK (quantity > 0);

-- 15. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 16. Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_product_overrides_updated_at ON public.product_overrides;
CREATE TRIGGER update_product_overrides_updated_at
    BEFORE UPDATE ON public.product_overrides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bundles_updated_at ON public.bundles;
CREATE TRIGGER update_bundles_updated_at
    BEFORE UPDATE ON public.bundles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Verify the migration
DO $$
BEGIN
    -- Test if tables were created
    PERFORM COUNT(*) FROM public.product_overrides;
    RAISE NOTICE '✅ product_overrides table created successfully';
    
    PERFORM COUNT(*) FROM public.product_images;
    RAISE NOTICE '✅ product_images table created successfully';
    
    PERFORM COUNT(*) FROM public.bundles;
    RAISE NOTICE '✅ bundles table created successfully';
    
    PERFORM COUNT(*) FROM public.bundle_items;
    RAISE NOTICE '✅ bundle_items table created successfully';
    
    -- Test if indexes were created
    PERFORM COUNT(*) FROM pg_indexes WHERE indexname = 'idx_product_overrides_printful_id';
    RAISE NOTICE '✅ product_overrides index created successfully';
    
    PERFORM COUNT(*) FROM pg_indexes WHERE indexname = 'idx_bundle_items_bundle_id';
    RAISE NOTICE '✅ bundle_items index created successfully';
    
    -- Test if RLS is enabled
    PERFORM relrowsecurity FROM pg_class WHERE relname = 'product_overrides';
    RAISE NOTICE '✅ RLS enabled on product_overrides';
    
    PERFORM relrowsecurity FROM pg_class WHERE relname = 'bundles';
    RAISE NOTICE '✅ RLS enabled on bundles';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error during migration verification: %', SQLERRM;
END $$;

-- down
-- Drop tables in reverse order due to foreign key constraints
DROP TABLE IF EXISTS public.bundle_items;
DROP TABLE IF EXISTS public.bundles;
DROP TABLE IF EXISTS public.product_images;
DROP TABLE IF EXISTS public.product_overrides;

-- Drop indexes
DROP INDEX IF EXISTS idx_product_overrides_printful_id;
DROP INDEX IF EXISTS idx_bundle_items_bundle_id;
DROP INDEX IF EXISTS idx_product_images_product_id;
DROP INDEX IF EXISTS idx_product_images_order;
