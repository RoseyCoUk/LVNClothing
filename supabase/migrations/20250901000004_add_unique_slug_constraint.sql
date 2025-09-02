-- Add unique constraint on products.slug to prevent duplicate slugs
-- This will prevent "product not found" errors caused by .single() queries returning multiple rows

-- First, clean up any existing duplicate slugs
DO $$
DECLARE
    duplicate_record RECORD;
BEGIN
    -- Find and fix duplicate slugs
    FOR duplicate_record IN
        SELECT slug, array_agg(id ORDER BY created_at) as ids
        FROM public.products
        WHERE slug IS NOT NULL
        GROUP BY slug
        HAVING count(*) > 1
    LOOP
        -- Keep the first (oldest) record with the original slug
        -- Update subsequent records to have unique slugs
        FOR i IN 2..array_length(duplicate_record.ids, 1) LOOP
            UPDATE public.products
            SET slug = duplicate_record.slug || '-' || i::text
            WHERE id = duplicate_record.ids[i];
        END LOOP;
        
        RAISE NOTICE 'Fixed duplicate slug: %', duplicate_record.slug;
    END LOOP;
END $$;

-- Add unique constraint on slug column
ALTER TABLE public.products 
ADD CONSTRAINT unique_product_slug UNIQUE (slug);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug) WHERE slug IS NOT NULL;

-- Add comment
COMMENT ON CONSTRAINT unique_product_slug ON public.products IS 'Ensures each product has a unique slug for URL routing';