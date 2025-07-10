-- Add slug field to products table for better URL routing
-- This migration adds slugs for product detail pages

-- up

-- Add slug column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create a function to generate slugs from product names
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update products with slugs based on their names
UPDATE public.products 
SET slug = generate_slug(name)
WHERE slug IS NULL;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_slug_lookup ON public.products(slug);

-- down

-- Remove indexes
DROP INDEX IF EXISTS public.idx_products_slug;
DROP INDEX IF EXISTS public.idx_products_slug_lookup;

-- Remove function
DROP FUNCTION IF EXISTS public.generate_slug(TEXT);

-- Remove slug column (be careful with this in production)
-- ALTER TABLE public.products DROP COLUMN IF EXISTS slug; 