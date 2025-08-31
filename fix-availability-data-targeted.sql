-- Targeted Fix for Availability Data Issues
-- This script only fixes variants that are incorrectly marked during testing

-- Step 1: Show current problematic variants
SELECT 
    'BEFORE FIX' as status,
    COUNT(*) as total_variants,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available_variants,
    COUNT(CASE WHEN is_available = false THEN 1 END) as unavailable_variants,
    COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock_variants,
    COUNT(CASE WHEN in_stock = false THEN 1 END) as out_of_stock_variants
FROM product_variants;

-- Step 2: Show variants that need fixing
SELECT 
    id,
    name,
    value,
    is_available,
    in_stock,
    CASE 
        WHEN is_available = false AND in_stock = true THEN 'NEEDS FIX: Available but marked unavailable'
        WHEN is_available = true AND in_stock = false THEN 'NEEDS FIX: Unavailable but marked available'
        ELSE 'CORRECT'
    END as issue_description
FROM product_variants 
WHERE (is_available = false AND in_stock = true) 
   OR (is_available = true AND in_stock = false)
ORDER BY name, value;

-- Step 3: Fix variants that are incorrectly marked as unavailable but are in stock
-- These are the ones we incorrectly set to false during testing
UPDATE product_variants 
SET 
    is_available = true,
    updated_at = NOW()
WHERE is_available = false AND in_stock = true;

-- Step 4: Fix variants that are incorrectly marked as out of stock but are available
-- These are also from our testing phase
UPDATE product_variants 
SET 
    in_stock = true,
    updated_at = NOW()
WHERE in_stock = false AND is_available = true;

-- Step 5: Verify the fixes
SELECT 
    'AFTER FIX' as status,
    COUNT(*) as total_variants,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available_variants,
    COUNT(CASE WHEN is_available = false THEN 1 END) as unavailable_variants,
    COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock_variants,
    COUNT(CASE WHEN in_stock = false THEN 1 END) as out_of_stock_variants
FROM product_variants;

-- Step 6: Show remaining issues (should be 0)
SELECT 
    'REMAINING ISSUES' as status,
    COUNT(*) as problematic_variants
FROM product_variants 
WHERE (is_available = false AND in_stock = true) 
   OR (is_available = true AND in_stock = false);

-- Step 7: Show sample of corrected variants
SELECT 
    id,
    name,
    value,
    is_available,
    in_stock,
    updated_at
FROM product_variants 
ORDER BY name, value
LIMIT 10;
