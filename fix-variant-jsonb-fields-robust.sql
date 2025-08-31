-- Fix Variant JSONB Fields - Robust Version
-- This script safely converts JSONB color, color_hex, and size fields to proper string fields
-- Handles cases where fields might already be strings, JSONB objects, or missing

-- 1. First, let's see what we're working with
SELECT 
    'Current table structure:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'product_variants' 
AND table_schema = 'public'
AND column_name IN ('color', 'color_hex', 'size')
ORDER BY column_name;

-- 2. Show sample of current data to understand the structure
SELECT 
    'Sample current data:' as info,
    id,
    name,
    value,
    pg_typeof(color) as color_type,
    color,
    pg_typeof(color_hex) as color_hex_type,
    color_hex,
    pg_typeof(size) as size_type,
    size
FROM public.product_variants 
WHERE color IS NOT NULL OR color_hex IS NOT NULL OR size IS NOT NULL 
LIMIT 5;

-- 3. Add new string columns for the extracted values
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS color_name text,
ADD COLUMN IF NOT EXISTS color_hex_code text,
ADD COLUMN IF NOT EXISTS size_name text;

-- 4. Extract values safely, handling all data types
UPDATE public.product_variants 
SET 
    color_name = CASE 
        WHEN color IS NULL THEN NULL
        WHEN pg_typeof(color) = 'jsonb'::regtype THEN
            CASE 
                WHEN jsonb_typeof(color) = 'object' THEN
                    COALESCE(color->>'name', color->>'value', color::text)
                ELSE
                    color::text
            END
        ELSE
            color::text
    END,
    color_hex_code = CASE 
        WHEN color_hex IS NULL THEN NULL
        WHEN pg_typeof(color_hex) = 'jsonb'::regtype THEN
            CASE 
                WHEN jsonb_typeof(color_hex) = 'object' THEN
                    COALESCE(color_hex->>'name', color_hex->>'value', color_hex::text)
                ELSE
                    color_hex::text
            END
        ELSE
            color_hex::text
    END,
    size_name = CASE 
        WHEN size IS NULL THEN NULL
        WHEN pg_typeof(size) = 'jsonb'::regtype THEN
            CASE 
                WHEN jsonb_typeof(size) = 'object' THEN
                    COALESCE(size->>'name', size->>'value', size::text)
                ELSE
                    size::text
            END
        ELSE
            size::text
    END;

-- 5. Show what was extracted
SELECT 
    'Extracted values:' as info,
    id,
    name,
    value,
    color_name,
    color_hex_code,
    size_name
FROM public.product_variants 
WHERE color_name IS NOT NULL OR color_hex_code IS NOT NULL OR size_name IS NOT NULL 
LIMIT 5;

-- 6. Update the existing columns with the extracted string values
-- Only update where we actually have extracted values
UPDATE public.product_variants 
SET 
    color = color_name,
    color_hex = color_hex_code,
    size = size_name
WHERE (color_name IS NOT NULL AND color_name != 'null') 
   OR (color_hex_code IS NOT NULL AND color_hex_code != 'null')
   OR (size_name IS NOT NULL AND size_name != 'null');

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_variants_color_name ON public.product_variants(color_name);
CREATE INDEX IF NOT EXISTS idx_product_variants_size_name ON public.product_variants(size_name);

-- 8. Verify the results
SELECT 
    'Final results:' as info,
    COUNT(*) as total_variants,
    COUNT(CASE WHEN color IS NOT NULL AND color != 'null' THEN 1 END) as variants_with_color,
    COUNT(CASE WHEN size IS NOT NULL AND size != 'null' THEN 1 END) as variants_with_size,
    COUNT(CASE WHEN color IS NULL AND size IS NULL THEN 1 END) as variants_without_color_or_size
FROM public.product_variants;

-- 9. Show sample of final data
SELECT 
    'Final data sample:' as info,
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

-- 10. Show variants that still have no color or size (these are fine to ignore)
SELECT 
    'Variants without color/size (these are fine):' as info,
    id,
    name,
    value,
    color,
    size
FROM public.product_variants 
WHERE (color IS NULL OR color = 'null') 
  AND (size IS NULL OR size = 'null')
LIMIT 5;

-- 11. Optional: Clean up temporary columns (uncomment if you want to remove them)
-- ALTER TABLE public.product_variants DROP COLUMN IF EXISTS color_name;
-- ALTER TABLE public.product_variants DROP COLUMN IF EXISTS color_hex_code;
-- ALTER TABLE public.product_variants DROP COLUMN IF EXISTS size_name;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '✅ Variant JSONB fields fix completed successfully!';
    RAISE NOTICE '📊 Check the results above to verify the conversion worked correctly.';
    RAISE NOTICE '🔍 Variants without color/size are normal and will be ignored.';
    RAISE NOTICE '🚀 Your frontend code can now work with simple string values.';
END $$;
