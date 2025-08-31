-- Cleanup and Fix Variants - Run this to fix the current state
-- This script cleans up the failed extraction and properly converts JSONB to strings

-- 1. First, let's see the current state
SELECT 
    'Current state (problematic):' as info,
    id,
    name,
    value,
    color,
    size,
    color_name,
    size_name
FROM public.product_variants 
WHERE color_name IS NOT NULL OR size_name IS NOT NULL 
LIMIT 5;

-- 2. Clear the temporary columns that contain JSONB objects instead of strings
UPDATE public.product_variants 
SET 
    color_name = NULL,
    color_hex_code = NULL,
    size_name = NULL;

-- 3. Now properly extract string values from JSONB fields
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

-- 4. Show what was properly extracted (should show string values now)
SELECT 
    'Properly extracted string values:' as info,
    id,
    name,
    value,
    color_name,
    size_name
FROM public.product_variants 
WHERE color_name IS NOT NULL OR size_name IS NOT NULL 
LIMIT 5;

-- 5. Update the main columns with the extracted string values
UPDATE public.product_variants 
SET 
    color = color_name,
    size = size_name
WHERE (color_name IS NOT NULL AND color_name != 'null') 
   OR (size_name IS NOT NULL AND size_name != 'null');

-- 6. Verify the final results
SELECT 
    'Final results:' as info,
    COUNT(*) as total_variants,
    COUNT(CASE WHEN color IS NOT NULL AND color != 'null' THEN 1 END) as variants_with_color,
    COUNT(CASE WHEN size IS NOT NULL AND size != 'null' THEN 1 END) as variants_with_size
FROM public.product_variants;

-- 7. Show sample of final data (should show clean string values)
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

-- 8. Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Cleanup and fix completed successfully!';
    RAISE NOTICE '📊 Variants now have clean string values instead of JSONB objects.';
    RAISE NOTICE '🚀 Your frontend code can now work with simple string values.';
END $$;
