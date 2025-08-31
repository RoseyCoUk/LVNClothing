-- Diagnose Current Database State
-- Run this first to see what we're working with

-- 1. Check what tables exist
SELECT 
  'Existing Tables:' as info,
  table_name,
  'Table exists' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check products table structure
SELECT 
  'Products Table Columns:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'products'
ORDER BY ordinal_position;

-- 3. Check if any admin tables already exist
SELECT 
  'Admin Tables Status:' as info,
  t.table_name,
  CASE 
    WHEN existing.table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END as status
FROM (
  SELECT 'product_overrides' as table_name
  UNION ALL SELECT 'product_images'
  UNION ALL SELECT 'bundles'
  UNION ALL SELECT 'bundle_items'
  UNION ALL SELECT 'sync_status'
) t
LEFT JOIN information_schema.tables existing 
  ON existing.table_name = t.table_name 
  AND existing.table_schema = 'public';

-- 4. Check if any columns were already added
SELECT 
  'New Columns Status:' as info,
  c.column_name,
  CASE 
    WHEN existing.column_name IS NOT NULL THEN 'EXISTS'
    ELSE 'DOES NOT EXIST'
  END as status
FROM (
  SELECT 'printful_product_id' as column_name
  UNION ALL SELECT 'printful_cost'
  UNION ALL SELECT 'retail_price'
  UNION ALL SELECT 'is_available'
) c
LEFT JOIN information_schema.columns existing 
  ON existing.column_name = c.column_name 
  AND existing.table_schema = 'public'
  AND existing.table_name = 'products';

-- 5. Show sample product data
SELECT 
  'Sample Product Data:' as info,
  id,
  name,
  price,
  image_url,
  in_stock
FROM public.products 
LIMIT 3;
