-- Fix Variant JSONB Fields - CORRECTED VERSION
-- This script properly converts JSONB color, color_hex, and size fields to string values

-- 1. First, let's see what we're working with
SELECT 
    'Current data types:' as info,
    pg_typeof(color) as color_type,
    pg_typeof(size) as size_type
FROM public.product_variants 
WHERE color IS NOT NULL OR size IS NOT NULL 
LIMIT 1;

-- 2. Add new string columns for the extracted values
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS color_name text,
ADD COLUMN IF NOT EXISTS color_hex_code text,
ADD COLUMN IF NOT EXISTS size_name text;

-- 3. Clear any existing data in temporary columns
UPDATE public.product_variants 
SET 
    color_name = NULL,
    color_hex_code = NULL,
    size_name = NULL;

-- 4. Extract string values from JSONB fields (this is the key fix)
UPDATE public.product_variants 
SET 
    color_name = CASE 
        WHEN color IS NULL THEN NULL
        WHEN pg_typeof(color) = 'jsonb'::regtype THEN
            CASE 
                WHEN jsonb_typeof(color::jsonb) = 'object' THEN
                    COALESCE((color::jsonb)->>'name', (color::jsonb)->>'value')
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
                WHEN jsonb_typeof(color_hex::jsonb) = 'object' THEN
                    COALESCE((color_hex::jsonb)->>'name', (color_hex::jsonb)->>'value')
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
                WHEN jsonb_typeof(size::jsonb) = 'object' THEN
                    COALESCE((size::jsonb)->>'name', (size::jsonb)->>'value')
                ELSE
                    size::text
            END
        ELSE
            size::text
    END;

-- 5. Show what was extracted (should show string values, not JSONB objects)
SELECT 
    'Extracted string values:' as info,
    id,
    name,
    value,
    color_name,
    size_name
FROM public.product_variants 
WHERE color_name IS NOT NULL OR size_name IS NOT NULL 
LIMIT 5;

-- 6. Update the existing columns with the extracted string values
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

-- 8. Verify the final results
SELECT 
    'Final results:' as info,
    COUNT(*) as total_variants,
    COUNT(CASE WHEN color IS NOT NULL AND color != 'null' THEN 1 END) as variants_with_color,
    COUNT(CASE WHEN size IS NOT NULL AND size != 'null' THEN 1 END) as variants_with_size
FROM public.product_variants;

-- 9. Show sample of final data (should show clean string values)
SELECT 
    'Final data sample:' as info,
    id,
    name,
    value,
    color,
    size
FROM public.product_variants 
WHERE color IS NOT NULL OR size IS NOT NULL 
LIMIT 5;

-- 10. Show variants that still have no color or size (these are fine to ignore)
SELECT 
    'Variants without color/size (these are normal):' as info,
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
