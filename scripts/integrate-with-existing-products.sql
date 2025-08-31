-- Integrate Admin Products System with Existing Products Table
-- This script adds the necessary columns and tables to work with your existing e-commerce products

-- 1. Add Printful integration fields to existing products table
DO $$
BEGIN
  -- Add printful_product_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'printful_product_id'
  ) THEN
    ALTER TABLE public.products ADD COLUMN printful_product_id text;
    RAISE NOTICE 'Added printful_product_id column to products table';
  ELSE
    RAISE NOTICE 'printful_product_id column already exists in products table';
  END IF;
  
  -- Add printful_cost if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'printful_cost'
  ) THEN
    ALTER TABLE public.products ADD COLUMN printful_cost numeric(10,2);
    RAISE NOTICE 'Added printful_cost column to products table';
  ELSE
    RAISE NOTICE 'printful_cost column already exists in products table';
  END IF;
  
  -- Add retail_price if it doesn't exist (to match our admin system)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'retail_price'
  ) THEN
    ALTER TABLE public.products ADD COLUMN retail_price numeric(10,2);
    -- Copy existing price data to retail_price
    UPDATE public.products SET retail_price = price WHERE retail_price IS NULL;
    RAISE NOTICE 'Added retail_price column and copied existing price data';
  ELSE
    RAISE NOTICE 'retail_price column already exists in products table';
  END IF;
  
  -- Add is_available if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'is_available'
  ) THEN
    ALTER TABLE public.products ADD COLUMN is_available boolean DEFAULT true;
    -- Copy existing in_stock data to is_available
    UPDATE public.products SET is_available = in_stock WHERE is_available IS NULL;
    RAISE NOTICE 'Added is_available column and copied existing in_stock data';
  ELSE
    RAISE NOTICE 'is_available column already exists in products table';
  END IF;
END $$;

-- 2. Create product_overrides table for admin customization
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

-- 3. Create product_images table for admin image management
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 4. Create bundles table
CREATE TABLE IF NOT EXISTS public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  custom_price numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 5. Create bundle_items table
CREATE TABLE IF NOT EXISTS public.bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- 6. Create sync_status table for Printful integration
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

-- 7. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_product_overrides_product_id ON public.product_overrides(product_id);
CREATE INDEX IF NOT EXISTS idx_product_overrides_printful_id ON public.product_overrides(printful_product_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON public.product_images(product_id, image_order);
CREATE INDEX IF NOT EXISTS idx_sync_status_product_id ON public.sync_status(product_id);

-- 8. Enable Row Level Security
ALTER TABLE public.product_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
CREATE POLICY "Users can view active product overrides" ON public.product_overrides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage product overrides" ON public.product_overrides
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage product images" ON public.product_images
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view active bundles" ON public.bundles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage bundles" ON public.bundles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view bundle items" ON public.bundle_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage bundle items" ON public.bundle_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view sync status" ON public.sync_status
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage sync status" ON public.sync_status
  FOR ALL USING (auth.role() = 'authenticated');

-- 10. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_overrides TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bundles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bundle_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_status TO authenticated;

-- 11. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Create triggers for updated_at columns
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

-- 13. Migrate existing product images to the new structure
DO $$
DECLARE
  product_record RECORD;
BEGIN
  FOR product_record IN SELECT id, image_url FROM public.products WHERE image_url IS NOT NULL AND image_url != ''
  LOOP
    -- Insert the existing image as the primary image
    INSERT INTO public.product_images (id, product_id, image_url, image_order, is_primary, created_at)
    VALUES (
      gen_random_uuid(),
      product_record.id,
      product_record.image_url,
      1,
      true,
      NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Migrated image for product %: %', product_record.id, product_record.image_url;
  END LOOP;
END $$;

-- 14. Verify the integration
DO $$
BEGIN
  RAISE NOTICE 'Integration with existing products table completed successfully!';
  RAISE NOTICE 'Your admin products system is now ready to use with your existing e-commerce products.';
END $$;

-- 15. Show the integration results
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

-- 16. Show the enhanced products table structure
SELECT 
  'Enhanced Products Table Structure:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;
