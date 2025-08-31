-- Fix Variants - Simple and Direct Approach
-- This script will definitely convert JSONB to strings

-- 1. Show current state
SELECT 
    'Current problematic state:' as info,
    id,
    name,
    value,
    color,
    size
FROM public.product_variants 
WHERE color IS NOT NULL OR size IS NOT NULL 
LIMIT 5;

-- 2. Direct approach: Convert JSONB to strings in one step
-- For color field
UPDATE public.product_variants 
SET color = CASE 
    WHEN color IS NULL THEN NULL
    WHEN color::text LIKE '{%' THEN  -- This is a JSONB object
        COALESCE(
            (color::jsonb)->>'name',
            (color::jsonb)->>'value',
            color::text
        )
    ELSE color::text  -- Already a string
END
WHERE color IS NOT NULL;

-- For size field
UPDATE public.product_variants 
SET size = CASE 
    WHEN size IS NULL THEN NULL
    WHEN size::text LIKE '{%' THEN  -- This is a JSONB object
        COALESCE(
            (size::jsonb)->>'name',
            (size::jsonb)->>'value',
            size::text
        )
    ELSE size::text  -- Already a string
END
WHERE size IS NOT NULL;

-- 3. Show the results
SELECT 
    'After fix - should show clean strings:' as info,
    id,
    name,
    value,
    color,
    size
FROM public.product_variants 
WHERE color IS NOT NULL OR size IS NOT NULL 
LIMIT 10;

-- 4. Count the results
SELECT 
    'Summary:' as info,
    COUNT(*) as total_variants,
    COUNT(CASE WHEN color IS NOT NULL AND color != 'null' THEN 1 END) as variants_with_color,
    COUNT(CASE WHEN size IS NOT NULL AND size != 'null' THEN 1 END) as variants_with_size,
    COUNT(CASE WHEN color IS NULL AND size IS NULL THEN 1 END) as variants_without_color_or_size
FROM public.product_variants;

-- 5. Show some examples of what should now be clean strings
SELECT 
    'Examples of clean string values:' as info,
    id,
    name,
    value,
    CASE 
        WHEN color IS NULL THEN 'No color'
        WHEN color::text LIKE '{%' THEN 'Still JSONB - fix failed'
        ELSE 'Clean string: ' || color
    END as color_status,
    CASE 
        WHEN size IS NULL THEN 'No size'
        WHEN size::text LIKE '{%' THEN 'Still JSONB - fix failed'
        ELSE 'Clean string: ' || size
    END as size_status
FROM public.product_variants 
WHERE color IS NOT NULL OR size IS NOT NULL 
LIMIT 10;

-- 6. Success check
DO $$
DECLARE
    jsonb_count integer;
BEGIN
    -- Count how many still have JSONB format
    SELECT COUNT(*) INTO jsonb_count
    FROM public.product_variants 
    WHERE (color::text LIKE '{%' AND color IS NOT NULL)
       OR (size::text LIKE '{%' AND size IS NOT NULL);
    
    IF jsonb_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: All JSONB fields converted to clean strings!';
    ELSE
        RAISE NOTICE '❌ FAILED: % fields still contain JSONB objects', jsonb_count;
    END IF;
END $$;
