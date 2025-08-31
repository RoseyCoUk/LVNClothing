-- Fix availability data inconsistencies
-- This script will reset all variants to be available and in stock

-- First, let's see the current state
SELECT 
  'Current Variant Status' as info,
  COUNT(*) as total_variants,
  COUNT(CASE WHEN is_available = true THEN 1 END) as available,
  COUNT(CASE WHEN is_available = false THEN 1 END) as unavailable,
  COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock,
  COUNT(CASE WHEN in_stock = false THEN 1 END) as out_of_stock
FROM product_variants;

-- Update all variants to be available and in stock
UPDATE product_variants 
SET 
  is_available = true,
  in_stock = true,
  last_sync = NOW()
WHERE is_available = false OR in_stock = false;

-- Show the updated state
SELECT 
  'Updated Variant Status' as info,
  COUNT(*) as total_variants,
  COUNT(CASE WHEN is_available = true THEN 1 END) as available,
  COUNT(CASE WHEN is_available = false THEN 1 END) as unavailable,
  COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock,
  COUNT(CASE WHEN in_stock = false THEN 1 END) as out_of_stock
FROM product_variants;

-- Show any remaining inconsistencies
SELECT 
  'Remaining Inconsistencies' as info,
  pv.id,
  pv.name,
  pv.value,
  pv.is_available,
  pv.in_stock,
  p.name as product_name
FROM product_variants pv
JOIN products p ON pv.product_id = p.id
WHERE pv.is_available = false OR pv.in_stock = false;
