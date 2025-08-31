-- Fix Variant JSONB Fields - Run this in Supabase SQL Editor
-- This script converts JSONB color, color_hex, and size fields to proper string fields

-- 1. Add new string columns for the extracted values
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS color_name text,
ADD COLUMN IF NOT EXISTS color_hex_code text,
ADD COLUMN IF NOT EXISTS size_name text;

-- 2. Extract values from JSONB fields and populate new columns
UPDATE public.product_variants 
SET 
    color_name = CASE 
        WHEN color IS NULL THEN NULL
        WHEN pg_typeof(color) = 'jsonb'::regtype AND jsonb_typeof(color::jsonb) = 'object' THEN
            COALESCE((color::jsonb)->>'name', (color::jsonb)->>'value')
        ELSE
            color::text
    END,
    color_hex_code = CASE 
        WHEN color_hex IS NULL THEN NULL
        WHEN pg_typeof(color_hex) = 'jsonb'::regtype AND jsonb_typeof(color_hex::jsonb) = 'object' THEN
            COALESCE((color_hex::jsonb)->>'name', (color_hex::jsonb)->>'value')
        ELSE
            color_hex::text
    END,
    size_name = CASE 
        WHEN size IS NULL THEN NULL
        WHEN pg_typeof(size) = 'jsonb'::regtype AND jsonb_typeof(size::jsonb) = 'object' THEN
            COALESCE((size::jsonb)->>'name', (size::jsonb)->>'value')
        ELSE
            size::text
    END;

-- 3. Update the existing columns with the extracted string values
UPDATE public.product_variants 
SET 
    color = color_name,
    color_hex = color_hex_code,
    size = size_name
WHERE color_name IS NOT NULL OR color_hex_code IS NOT NULL OR size_name IS NOT NULL;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_color_name ON public.product_variants(color_name);
CREATE INDEX IF NOT EXISTS idx_product_variants_size_name ON public.product_variants(size_name);

-- 5. Verify the results
SELECT 
    COUNT(*) as total_variants,
    COUNT(CASE WHEN color IS NOT NULL AND color != 'null' THEN 1 END) as variants_with_color,
    COUNT(CASE WHEN size IS NOT NULL AND size != 'null' THEN 1 END) as variants_with_size
FROM public.product_variants;

-- 6. Show sample of fixed data
SELECT 
    id,
    name,
    value,
    color,
    size,
    color_name,
    size_name
FROM public.product_variants 
WHERE color IS NOT NULL OR size IS NOT NULL 
LIMIT 5;

-- 7. Optional: Clean up temporary columns (uncomment if you want to remove them)
-- ALTER TABLE public.product_variants DROP COLUMN IF EXISTS color_name;
-- ALTER TABLE public.product_variants DROP COLUMN IF EXISTS color_hex_code;
-- ALTER TABLE public.product_variants DROP COLUMN IF EXISTS size_name;
