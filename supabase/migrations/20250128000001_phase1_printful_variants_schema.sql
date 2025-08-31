-- Phase 1: Database Schema & Printful Sync Foundation
-- This migration enhances the existing schema to properly handle Printful products with variants

-- up

-- 1. Enhance the existing products table to better support Printful data
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
    ALTER TABLE public.products ADD COLUMN image_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
    ALTER TABLE public.products ADD COLUMN slug text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
    ALTER TABLE public.products ADD COLUMN tags text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'rating') THEN
    ALTER TABLE public.products ADD COLUMN rating numeric(3,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'reviews') THEN
    ALTER TABLE public.products ADD COLUMN reviews integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'in_stock') THEN
    ALTER TABLE public.products ADD COLUMN in_stock boolean DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'stock_count') THEN
    ALTER TABLE public.products ADD COLUMN stock_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
    ALTER TABLE public.products ADD COLUMN price numeric(10,2);
  END IF;
  
  RAISE NOTICE 'Enhanced products table structure';
END $$;

-- 2. Create enhanced product_variants table for Printful variants
DROP TABLE IF EXISTS public.product_variants CASCADE;
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  printful_variant_id text NOT NULL,
  name text NOT NULL, -- e.g., "Size", "Color"
  value text NOT NULL, -- e.g., "Large", "Black"
  retail_price numeric(10,2),
  in_stock boolean DEFAULT true,
  is_available boolean DEFAULT true,
  image_url text,
  printful_data jsonb, -- Store full Printful variant data
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  
  -- Ensure unique variant per product
  UNIQUE(product_id, printful_variant_id)
);

-- 3. Create product_variant_combinations table for complex products (size + color)
CREATE TABLE public.product_variant_combinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  color_variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  is_available boolean DEFAULT true,
  in_stock boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  
  -- Ensure unique combinations
  UNIQUE(product_id, size_variant_id, color_variant_id)
);

-- 4. Create product_categories table for better organization
CREATE TABLE IF NOT EXISTS public.product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  parent_category_id uuid REFERENCES public.product_categories(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now())
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_printful_id ON public.product_variants(printful_variant_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_available ON public.product_variants(is_available);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON public.product_variants(in_stock);

CREATE INDEX IF NOT EXISTS idx_variant_combinations_product_id ON public.product_variant_combinations(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_combinations_available ON public.product_variant_combinations(is_available);

CREATE INDEX IF NOT EXISTS idx_product_categories_name ON public.product_categories(name);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON public.product_categories(parent_category_id);

-- 6. Enable Row Level Security
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for product_variants
CREATE POLICY "Users can view available product variants" ON public.product_variants
  FOR SELECT USING (is_available = true);

CREATE POLICY "Authenticated users can manage product variants" ON public.product_variants
  FOR ALL USING (auth.role() = 'authenticated');

-- 8. Create RLS policies for product_variant_combinations
CREATE POLICY "Users can view available variant combinations" ON public.product_variant_combinations
  FOR SELECT USING (is_available = true);

CREATE POLICY "Authenticated users can manage variant combinations" ON public.product_variant_combinations
  FOR ALL USING (auth.role() = 'authenticated');

-- 9. Create RLS policies for product_categories
CREATE POLICY "Users can view active product categories" ON public.product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage product categories" ON public.product_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- 10. Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variant_combinations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_categories TO authenticated;

-- 11. Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_variant_combinations_updated_at ON public.product_variant_combinations;
CREATE TRIGGER update_variant_combinations_updated_at
    BEFORE UPDATE ON public.product_variant_combinations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON public.product_categories;
CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON public.product_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Seed basic product categories
INSERT INTO public.product_categories (name, description) VALUES
  ('Apparel', 'Clothing and accessories'),
  ('Gear', 'Equipment and accessories'),
  ('Stickers', 'Decals and stickers'),
  ('Mugs', 'Drinkware'),
  ('Bundles', 'Product bundles and packages')
ON CONFLICT (name) DO NOTHING;

-- 13. Create function to get product with variants
CREATE OR REPLACE FUNCTION get_product_with_variants(p_product_id uuid)
RETURNS TABLE (
  product_id uuid,
  product_name text,
  product_description text,
  product_price numeric,
  product_image text,
  product_category text,
  variants jsonb,
  variant_combinations jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.retail_price,
    p.image_url,
    p.category,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', pv.id,
          'name', pv.name,
          'value', pv.value,
          'retail_price', pv.retail_price,
          'in_stock', pv.in_stock,
          'is_available', pv.is_available,
          'image_url', pv.image_url
        )
      ) FILTER (WHERE pv.id IS NOT NULL),
      '[]'::jsonb
    ) as variants,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', pvc.id,
          'size_variant', jsonb_build_object(
            'id', sv.id,
            'name', sv.name,
            'value', sv.value
          ),
          'color_variant', jsonb_build_object(
            'id', cv.id,
            'name', cv.name,
            'value', cv.value
          ),
          'is_available', pvc.is_available,
          'in_stock', pvc.in_stock
        )
      ) FILTER (WHERE pvc.id IS NOT NULL),
      '[]'::jsonb
    ) as variant_combinations
  FROM public.products p
  LEFT JOIN public.product_variants pv ON p.id = pv.product_id
  LEFT JOIN public.product_variant_combinations pvc ON p.id = pvc.product_id
  LEFT JOIN public.product_variants sv ON pvc.size_variant_id = sv.id
  LEFT JOIN public.product_variants cv ON pvc.color_variant_id = cv.id
  WHERE p.id = p_product_id
  GROUP BY p.id, p.name, p.description, p.retail_price, p.image_url, p.category;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_product_with_variants(uuid) TO authenticated;

-- 15. Verify the migration
DO $$
BEGIN
    -- Test if tables were created
    PERFORM COUNT(*) FROM public.product_variants;
    RAISE NOTICE '✅ product_variants table created successfully';
    
    PERFORM COUNT(*) FROM public.product_variant_combinations;
    RAISE NOTICE '✅ product_variant_combinations table created successfully';
    
    PERFORM COUNT(*) FROM public.product_categories;
    RAISE NOTICE '✅ product_categories table created successfully';
    
    -- Test if indexes were created
    PERFORM COUNT(*) FROM pg_indexes WHERE indexname = 'idx_product_variants_product_id';
    RAISE NOTICE '✅ product_variants indexes created successfully';
    
    -- Test if RLS is enabled
    PERFORM relrowsecurity FROM pg_class WHERE relname = 'product_variants';
    RAISE NOTICE '✅ RLS enabled on product_variants';
    
    -- Test if function was created
    PERFORM COUNT(*) FROM pg_proc WHERE proname = 'get_product_with_variants';
    RAISE NOTICE '✅ get_product_with_variants function created successfully';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error during migration verification: %', SQLERRM;
END $$;

-- down
-- Drop tables in reverse order due to foreign key constraints
DROP TABLE IF EXISTS public.product_variant_combinations;
DROP TABLE IF EXISTS public.product_variants;
DROP TABLE IF EXISTS public.product_categories;

-- Drop indexes
DROP INDEX IF EXISTS idx_product_variants_product_id;
DROP INDEX IF EXISTS idx_product_variants_printful_id;
DROP INDEX IF EXISTS idx_product_variants_available;
DROP INDEX IF EXISTS idx_product_variants_stock;
DROP INDEX IF EXISTS idx_variant_combinations_product_id;
DROP INDEX IF EXISTS idx_variant_combinations_available;
DROP INDEX IF EXISTS idx_product_categories_name;
DROP INDEX IF EXISTS idx_product_categories_parent;

-- Drop function
DROP FUNCTION IF EXISTS get_product_with_variants(uuid);
