-- ================================================
-- BULK UPDATE: Set All Variants to Available & In Stock
-- ================================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor

-- Step 1: Show current status
SELECT 
    'BEFORE UPDATE' as status,
    COUNT(*) as total_variants,
    COUNT(*) FILTER (WHERE is_available = true) as currently_available,
    COUNT(*) FILTER (WHERE in_stock = true) as currently_in_stock,
    COUNT(*) FILTER (WHERE is_available = false OR is_available IS NULL) as unavailable,
    COUNT(*) FILTER (WHERE in_stock = false OR in_stock IS NULL) as out_of_stock
FROM public.product_variants;

-- Step 2: Update ALL variants to available and in stock
UPDATE public.product_variants 
SET 
    is_available = true,
    in_stock = true,
    updated_at = NOW()
WHERE 
    is_available = false 
    OR is_available IS NULL 
    OR in_stock = false 
    OR in_stock IS NULL;

-- Step 3: Show results
SELECT 
    'AFTER UPDATE' as status,
    COUNT(*) as total_variants,
    COUNT(*) FILTER (WHERE is_available = true) as now_available,
    COUNT(*) FILTER (WHERE in_stock = true) as now_in_stock,
    COUNT(*) FILTER (WHERE is_available = false OR is_available IS NULL) as still_unavailable,
    COUNT(*) FILTER (WHERE in_stock = false OR in_stock IS NULL) as still_out_of_stock
FROM public.product_variants;

-- Step 4: Show sample of updated variants
SELECT 
    p.name as product_name,
    pv.name as variant_name,
    pv.value,
    pv.color,
    pv.size,
    pv.is_available,
    pv.in_stock,
    pv.updated_at
FROM public.product_variants pv
JOIN public.products p ON p.id = pv.product_id
ORDER BY pv.updated_at DESC
LIMIT 10;
