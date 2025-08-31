-- Cleanup Database Script for Phase 1: Clean Slate
-- This script will remove all existing products and related data

-- Step 1: Check what exists
SELECT 'Current Products:' as info;
SELECT id, name, printful_product_id FROM products;

SELECT 'Current Variants:' as info;
SELECT id, name, value, product_id FROM product_variants;

SELECT 'Current Bundles:' as info;
SELECT id, name FROM bundles;

-- Step 2: Delete variants first (due to foreign key constraints)
-- Uncomment the following lines when you're ready to actually delete data
/*
DELETE FROM product_variants;
*/

-- Step 3: Delete bundles
-- Uncomment the following lines when you're ready to actually delete data
/*
DELETE FROM bundles;
*/

-- Step 4: Delete products
-- Uncomment the following lines when you're ready to actually delete data
/*
DELETE FROM products;
*/

-- Step 5: Verify cleanup
SELECT 'After Cleanup - Products:' as info;
SELECT COUNT(*) as product_count FROM products;

SELECT 'After Cleanup - Variants:' as info;
SELECT COUNT(*) as variant_count FROM product_variants;

SELECT 'After Cleanup - Bundles:' as info;
SELECT COUNT(*) as bundle_count FROM bundles;
