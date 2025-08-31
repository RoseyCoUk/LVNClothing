-- Fix Variants - Ultra Simple Approach
-- Just convert JSONB to strings, no complex logic

-- 1. Show what we're starting with
SELECT 'BEFORE - Current JSONB data:' as info, color, size FROM public.product_variants WHERE color::text LIKE '{%' OR size::text LIKE '{%' LIMIT 3;

-- 2. Convert color field - extract name or value from JSONB
UPDATE public.product_variants 
SET color = (color::jsonb)->>'name'
WHERE color::text LIKE '{%';

-- 3. Convert size field - extract name or value from JSONB  
UPDATE public.product_variants 
SET size = (size::jsonb)->>'name'
WHERE size::text LIKE '{%';

-- 4. Show what we ended up with
SELECT 'AFTER - Should now be clean strings:' as info, color, size FROM public.product_variants WHERE color IS NOT NULL OR size IS NOT NULL LIMIT 10;

-- 5. Verify no more JSONB objects
SELECT 
    'Verification - Count of remaining JSONB objects:' as info,
    COUNT(CASE WHEN color::text LIKE '{%' THEN 1 END) as color_jsonb_count,
    COUNT(CASE WHEN size::text LIKE '{%' THEN 1 END) as size_jsonb_count
FROM public.product_variants;

-- 6. Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Ultra-simple conversion completed!';
    RAISE NOTICE '🎯 Check the results above - should see clean strings like "Black", "XL" instead of JSONB objects.';
END $$;
