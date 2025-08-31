-- ================================================
-- BULK UPDATE: Set All Variants to Available & In Stock
-- ================================================
-- This script updates ALL product variants to be:
-- - is_available = true (customers can order)
-- - in_stock = true (shown as available)
-- 
-- Run this to fix all stock/availability issues at once

-- First, let's see what we're working with
DO $$
DECLARE
    total_variants integer;
    unavailable_variants integer;
    out_of_stock_variants integer;
BEGIN
    -- Count total variants
    SELECT COUNT(*) INTO total_variants FROM public.product_variants;
    
    -- Count unavailable variants
    SELECT COUNT(*) INTO unavailable_variants 
    FROM public.product_variants 
    WHERE is_available = false OR is_available IS NULL;
    
    -- Count out of stock variants
    SELECT COUNT(*) INTO out_of_stock_variants 
    FROM public.product_variants 
    WHERE in_stock = false OR in_stock IS NULL;
    
    RAISE NOTICE '📊 CURRENT STATUS:';
    RAISE NOTICE '  Total variants: %', total_variants;
    RAISE NOTICE '  Unavailable variants: %', unavailable_variants;
    RAISE NOTICE '  Out of stock variants: %', out_of_stock_variants;
    RAISE NOTICE '';
END $$;

-- Update ALL variants to be available and in stock
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

-- Show results
DO $$
DECLARE
    updated_count integer;
    total_variants integer;
    unavailable_variants integer;
    out_of_stock_variants integer;
BEGIN
    -- Get the update count from the previous operation
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Count current status
    SELECT COUNT(*) INTO total_variants FROM public.product_variants;
    
    SELECT COUNT(*) INTO unavailable_variants 
    FROM public.product_variants 
    WHERE is_available = false OR is_available IS NULL;
    
    SELECT COUNT(*) INTO out_of_stock_variants 
    FROM public.product_variants 
    WHERE in_stock = false OR in_stock IS NULL;
    
    RAISE NOTICE '✅ UPDATE COMPLETED!';
    RAISE NOTICE '  Updated variants: %', updated_count;
    RAISE NOTICE '';
    RAISE NOTICE '📊 NEW STATUS:';
    RAISE NOTICE '  Total variants: %', total_variants;
    RAISE NOTICE '  Unavailable variants: %', unavailable_variants;
    RAISE NOTICE '  Out of stock variants: %', out_of_stock_variants;
    
    IF unavailable_variants = 0 AND out_of_stock_variants = 0 THEN
        RAISE NOTICE '🎉 ALL VARIANTS ARE NOW AVAILABLE AND IN STOCK!';
    ELSE
        RAISE NOTICE '⚠️  Some variants may still need attention.';
    END IF;
END $$;

-- Show sample of updated variants
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

RAISE NOTICE '';
RAISE NOTICE '🔧 NEXT STEPS:';
RAISE NOTICE '1. Check if cron job is running: crontab -l';
RAISE NOTICE '2. Disable auto-sync temporarily if needed';
RAISE NOTICE '3. Verify Printful actually has items in stock';
RAISE NOTICE '4. Monitor for reverts (15-min intervals)';
